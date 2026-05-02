import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { parseMultipleHands, analyzeHandDecisions, generateHandSummary } from '../services/handHistoryParser.js';
import { analyzeHand } from '../services/aiAnalysis.js';

const router = Router();

/**
 * POST /api/hand-history/upload
 * 上传并解析手牌历史
 */
router.post('/upload', [
  body('handHistory').notEmpty().withMessage('手牌历史不能为空'),
  body('platform').optional().isString()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { handHistory, platform } = req.body;
    
    // 解析手牌历史
    const parsedHands = parseMultipleHands(handHistory, platform);
    
    if (parsedHands.length === 0) {
      return res.status(400).json({ 
        error: '未找到有效的手牌记录，请检查格式' 
      });
    }

    // 为每手牌添加分析
    const handsWithAnalysis = parsedHands.map(hand => ({
      ...hand,
      decisions: analyzeHandDecisions(hand),
      summary: generateHandSummary(hand)
    }));

    res.json({
      success: true,
      handCount: handsWithAnalysis.length,
      hands: handsWithAnalysis
    });
  } catch (error) {
    console.error('手牌上传错误:', error);
    res.status(500).json({ 
      error: '解析手牌失败',
      message: error.message 
    });
  }
});

/**
 * POST /api/hand-history/analyze
 * AI分析手牌
 */
router.post('/analyze', [
  body('hands').isArray().withMessage('手牌数组不能为空'),
  body('userLevel').optional().isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hands, userLevel = 'intermediate' } = req.body;
    
    // 限制分析数量以控制成本
    const handsToAnalyze = hands.slice(0, 10);
    
    // 分析每手牌
    const analyses = [];
    let totalTokens = 0;
    
    for (const hand of handsToAnalyze) {
      const analysis = await analyzeHand(hand, userLevel);
      analyses.push({
        handId: hand.id,
        ...analysis
      });
      totalTokens += analysis.tokensUsed;
      
      // 检查token限制
      if (totalTokens > 10000) {
        console.warn('Token限制达到，停止分析');
        break;
      }
    }

    res.json({
      success: true,
      analysisCount: analyses.length,
      analyses,
      tokensUsed: totalTokens
    });
  } catch (error) {
    console.error('手牌分析错误:', error);
    res.status(500).json({ 
      error: '分析手牌失败',
      message: error.message 
    });
  }
});

/**
 * GET /api/hand-history/stats
 * 获取手牌统计
 */
router.get('/stats', (req, res) => {
  try {
    // 返回模拟统计
    res.json({
      success: true,
      stats: {
        totalHands: 0,
        totalSessions: 0,
        biggestWin: 0,
        biggestLoss: 0,
        averageEV: 0,
        winRate: 0
      }
    });
  } catch (error) {
    console.error('统计错误:', error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

export default router;
