import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { analyzeHand, generateTrainingQuestions, generateErrorReport } from '../services/aiAnalysis.js';

const router = Router();

/**
 * POST /api/ai/analyze
 * Analyze a hand with AI
 */
router.post('/analyze', [
  body('hand').isObject().withMessage('Hand data is required'),
  body('userLevel').optional().isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hand, userLevel = 'intermediate' } = req.body;
    
    const analysis = await analyzeHand(hand, userLevel);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze hand',
      message: error.message 
    });
  }
});

/**
 * POST /api/ai/generate-questions
 * Generate training questions
 */
router.post('/generate-questions', [
  body('weakAreas').isArray().withMessage('Weak areas array is required'),
  body('count').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { weakAreas, count = 10 } = req.body;
    
    const questions = await generateTrainingQuestions(weakAreas, count);
    
    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('AI generate questions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      message: error.message 
    });
  }
});

/**
 * POST /api/ai/error-report
 * Generate error report
 */
router.post('/error-report', [
  body('handResults').isArray().withMessage('Hand results array is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { handResults } = req.body;
    
    const report = await generateErrorReport(handResults);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('AI error report error:', error);
    res.status(500).json({ 
      error: 'Failed to generate error report',
      message: error.message 
    });
  }
});

/**
 * GET /api/ai/usage
 * Get AI usage statistics
 */
router.get('/usage', (req, res) => {
  // Mock usage data
  res.json({
    success: true,
    usage: {
      totalTokens: 125000,
      tokensThisMonth: 45000,
      averageTokensPerHand: 85,
      averageTokensPerQuestion: 42,
      costEstimate: {
        thisMonth: '$4.50',
        projected: '$13.50'
      }
    },
    limits: {
      handReview: 10000,
      trainingQuestion: 50,
      dailyTraining: 5000
    }
  });
});

export default router;
