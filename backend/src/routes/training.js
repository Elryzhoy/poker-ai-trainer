import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getTrainingQuestions, getTrainingTypes, QUESTION_TYPES } from '../services/trainingQuestions.js';

const router = Router();

/**
 * GET /api/training/types
 * 获取所有训练类型
 */
router.get('/types', (req, res) => {
  try {
    const types = getTrainingTypes();
    res.json({
      success: true,
      types
    });
  } catch (error) {
    console.error('Training types error:', error);
    res.status(500).json({ error: '获取训练类型失败' });
  }
});

/**
 * POST /api/training/generate
 * 生成训练题
 */
router.post('/generate', [
  body('type').optional().isString(),
  body('weakAreas').optional().isArray(),
  body('count').optional().isInt({ min: 1, max: 50 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, weakAreas, count = 10 } = req.body;
    
    // 确定训练类型
    let trainingType = type;
    if (!trainingType && weakAreas && weakAreas.length > 0) {
      trainingType = weakAreas[0]; // 使用第一个弱项作为类型
    }
    
    // 获取训练题
    const questions = getTrainingQuestions(trainingType, count);
    
    res.json({
      success: true,
      type: trainingType || 'mixed',
      questionCount: questions.length,
      questions
    });
  } catch (error) {
    console.error('Training generation error:', error);
    res.status(500).json({ error: '生成训练题失败' });
  }
});

/**
 * POST /api/training/submit
 * 提交答案
 */
router.post('/submit', [
  body('questionId').notEmpty().withMessage('问题ID不能为空'),
  body('answer').notEmpty().withMessage('答案不能为空'),
  body('correctAnswer').notEmpty().withMessage('正确答案不能为空')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questionId, answer, correctAnswer, explanation } = req.body;
    
    // 检查答案（模糊匹配）
    const isCorrect = checkAnswer(answer, correctAnswer);
    
    res.json({
      success: true,
      isCorrect,
      correctAnswer,
      explanation: explanation || '暂无解释'
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: '提交答案失败' });
  }
});

/**
 * GET /api/training/stats
 * 获取训练统计
 */
router.get('/stats', (req, res) => {
  try {
    // 返回模拟统计（实际应该从数据库获取）
    res.json({
      success: true,
      stats: {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        streak: 0,
        weakAreas: [],
        strongAreas: []
      }
    });
  } catch (error) {
    console.error('Training stats error:', error);
    res.status(500).json({ error: '获取训练统计失败' });
  }
});

/**
 * POST /api/training/daily
 * 获取每日训练
 */
router.post('/daily', [
  body('count').optional().isInt({ min: 1, max: 100 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { count = 10 } = req.body;
    
    // 混合各种类型的题目
    const questions = getTrainingQuestions(null, count);
    
    res.json({
      success: true,
      date: new Date().toISOString().split('T')[0],
      questionCount: questions.length,
      questions
    });
  } catch (error) {
    console.error('Daily training error:', error);
    res.status(500).json({ error: '获取每日训练失败' });
  }
});

/**
 * 检查答案是否正确
 */
function checkAnswer(userAnswer, correctAnswer) {
  // 标准化答案
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '').trim();
  
  const normalizedUser = normalize(userAnswer);
  const normalizedCorrect = normalize(correctAnswer);
  
  // 完全匹配
  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // 包含匹配
  if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
    return true;
  }
  
  // 关键词匹配
  const userKeywords = normalizedUser.split(/\s+/);
  const correctKeywords = normalizedCorrect.split(/\s+/);
  
  const matchCount = userKeywords.filter(kw => 
    correctKeywords.some(ck => ck.includes(kw) || kw.includes(ck))
  ).length;
  
  return matchCount >= correctKeywords.length * 0.5;
}

export default router;
