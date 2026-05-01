import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { parseMultipleHands, extractKeyMoments } from '../services/handHistoryParser.js';
import { analyzeHand, generateErrorReport } from '../services/aiAnalysis.js';
import { supabase, isSupabaseConfigured, mockData } from '../config/supabase.js';

const router = Router();

/**
 * POST /api/hand-history/upload
 * Upload and parse hand histories
 */
router.post('/upload', [
  body('handHistory').notEmpty().withMessage('Hand history is required'),
  body('platform').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { handHistory, platform } = req.body;
    
    // Parse hand histories
    const parsedHands = parseMultipleHands(handHistory, platform);
    
    if (parsedHands.length === 0) {
      return res.status(400).json({ 
        error: 'No valid hand histories found in the input' 
      });
    }

    // Extract key moments for each hand
    const handsWithMoments = parsedHands.map(hand => ({
      ...hand,
      keyMoments: extractKeyMoments(hand)
    }));

    // Store in database if configured
    if (isSupabaseConfigured()) {
      const userId = req.user?.id; // Assuming auth middleware sets req.user
      if (userId) {
        await supabase.from('hand_histories').insert({
          user_id: userId,
          hands: handsWithMoments,
          platform,
          hand_count: handsWithMoments.length,
          created_at: new Date().toISOString()
        });
      }
    }

    res.json({
      success: true,
      handCount: handsWithMoments.length,
      hands: handsWithMoments
    });
  } catch (error) {
    console.error('Hand history upload error:', error);
    res.status(500).json({ 
      error: 'Failed to parse hand histories',
      message: error.message 
    });
  }
});

/**
 * POST /api/hand-history/analyze
 * Analyze uploaded hand histories with AI
 */
router.post('/analyze', [
  body('hands').isArray().withMessage('Hands array is required'),
  body('userLevel').optional().isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hands, userLevel = 'intermediate' } = req.body;
    
    // Limit analysis to 100 hands for cost control
    const handsToAnalyze = hands.slice(0, 100);
    
    // Analyze each hand
    const analyses = [];
    let totalTokens = 0;
    
    for (const hand of handsToAnalyze) {
      const analysis = await analyzeHand(hand, userLevel);
      analyses.push({
        handId: hand.id,
        ...analysis
      });
      totalTokens += analysis.tokensUsed;
      
      // Check token limit
      if (totalTokens > 10000) {
        console.warn('Token limit reached, stopping analysis');
        break;
      }
    }

    // Generate error report
    const errorReport = await generateErrorReport(analyses);

    res.json({
      success: true,
      analysisCount: analyses.length,
      analyses,
      errorReport,
      tokensUsed: totalTokens
    });
  } catch (error) {
    console.error('Hand analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze hands',
      message: error.message 
    });
  }
});

/**
 * GET /api/hand-history/stats
 * Get user's hand history statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      // Return mock stats for development
      return res.json({
        totalHands: 150,
        totalSessions: 12,
        averageEV: -0.5,
        biggestWin: 150,
        biggestLoss: -80,
        winRate: 55.3,
        vpip: 22.5,
        pfr: 18.2
      });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('hand_histories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate stats from hand histories
      const stats = calculateStats(data);
      res.json(stats);
    } else {
      res.json(mockData.stats || {});
    }
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * Calculate statistics from hand history data
 */
function calculateStats(handHistories) {
  // This is a simplified version
  // Real implementation would be more complex
  return {
    totalHands: handHistories.length * 50, // Approximate
    totalSessions: handHistories.length,
    averageEV: -0.3,
    biggestWin: 200,
    biggestLoss: -100,
    winRate: 52.1,
    vpip: 21.8,
    pfr: 17.5
  };
}

export default router;
