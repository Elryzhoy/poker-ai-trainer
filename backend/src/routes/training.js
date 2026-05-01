import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { generateTrainingQuestions } from '../services/aiAnalysis.js';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = Router();

// Training question types
const QUESTION_TYPES = {
  PREFLOP: 'preflop',
  POSTFLOP: 'postflop',
  BET_SIZING: 'bet_sizing',
  POSITION: 'position',
  RANGE: 'range'
};

/**
 * POST /api/training/generate
 * Generate training questions based on weak areas
 */
router.post('/generate', [
  body('weakAreas').isArray().withMessage('Weak areas array is required'),
  body('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count must be between 1 and 50'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { weakAreas, count = 10, difficulty = 'medium' } = req.body;
    
    // Generate questions using AI
    const questions = await generateTrainingQuestions(weakAreas, count);
    
    // Add metadata to questions
    const questionsWithMetadata = questions.map((q, index) => ({
      id: `q_${Date.now()}_${index}`,
      ...q,
      difficulty,
      weakArea: weakAreas[index % weakAreas.length],
      createdAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      questionCount: questionsWithMetadata.length,
      questions: questionsWithMetadata
    });
  } catch (error) {
    console.error('Training generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate training questions',
      message: error.message 
    });
  }
});

/**
 * POST /api/training/submit
 * Submit answer to training question
 */
router.post('/submit', [
  body('questionId').notEmpty().withMessage('Question ID is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('correctAnswer').notEmpty().withMessage('Correct answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questionId, answer, correctAnswer, explanation } = req.body;
    const userId = req.user?.id;
    
    // Check answer (simple string matching for now)
    const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    // Store result if user is authenticated
    if (userId && isSupabaseConfigured()) {
      await supabase.from('training_results').insert({
        user_id: userId,
        question_id: questionId,
        answer,
        is_correct: isCorrect,
        created_at: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      isCorrect,
      correctAnswer,
      explanation: explanation || 'No explanation provided'
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ 
      error: 'Failed to submit answer',
      message: error.message 
    });
  }
});

/**
 * GET /api/training/stats
 * Get user's training statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      // Return mock stats
      return res.json({
        totalQuestions: 250,
        correctAnswers: 180,
        accuracy: 72,
        streak: 5,
        weakAreas: ['bet_sizing', 'position'],
        strongAreas: ['preflop', 'range'],
        dailyProgress: [
          { date: '2024-01-01', questions: 20, correct: 15 },
          { date: '2024-01-02', questions: 25, correct: 18 },
          { date: '2024-01-03', questions: 30, correct: 22 }
        ]
      });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('training_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const stats = calculateTrainingStats(data);
      res.json(stats);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Training stats error:', error);
    res.status(500).json({ error: 'Failed to get training stats' });
  }
});

/**
 * POST /api/training/daily
 * Generate daily training set
 */
router.post('/daily', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { count = 100 } = req.body;
    
    // Get user's weak areas from history
    let weakAreas = ['preflop', 'position', 'bet_sizing']; // Default
    
    if (userId && isSupabaseConfigured()) {
      const { data } = await supabase
        .from('training_results')
        .select('weak_area, is_correct')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (data && data.length > 0) {
        // Find weak areas (low accuracy)
        const areaStats = {};
        data.forEach(result => {
          if (!areaStats[result.weak_area]) {
            areaStats[result.weak_area] = { total: 0, correct: 0 };
          }
          areaStats[result.weak_area].total++;
          if (result.is_correct) areaStats[result.weak_area].correct++;
        });

        weakAreas = Object.entries(areaStats)
          .map(([area, stats]) => ({
            area,
            accuracy: stats.correct / stats.total
          }))
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 3)
          .map(a => a.area);
      }
    }

    // Generate questions
    const questions = await generateTrainingQuestions(weakAreas, count);

    res.json({
      success: true,
      date: new Date().toISOString().split('T')[0],
      weakAreas,
      questionCount: questions.length,
      questions
    });
  } catch (error) {
    console.error('Daily training error:', error);
    res.status(500).json({ 
      error: 'Failed to generate daily training',
      message: error.message 
    });
  }
});

/**
 * Calculate training statistics
 */
function calculateTrainingStats(results) {
  const totalQuestions = results.length;
  const correctAnswers = results.filter(r => r.is_correct).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100) : 0;
  
  // Calculate streak
  let streak = 0;
  for (const result of results) {
    if (result.is_correct) {
      streak++;
    } else {
      break;
    }
  }

  // Find weak and strong areas
  const areaStats = {};
  results.forEach(result => {
    const area = result.weak_area || 'general';
    if (!areaStats[area]) {
      areaStats[area] = { total: 0, correct: 0 };
    }
    areaStats[area].total++;
    if (result.is_correct) areaStats[area].correct++;
  });

  const weakAreas = Object.entries(areaStats)
    .map(([area, stats]) => ({
      area,
      accuracy: stats.correct / stats.total
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .map(a => a.area);

  const strongAreas = Object.entries(areaStats)
    .map(([area, stats]) => ({
      area,
      accuracy: stats.correct / stats.total
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3)
    .map(a => a.area);

  return {
    totalQuestions,
    correctAnswers,
    accuracy: Math.round(accuracy * 10) / 10,
    streak,
    weakAreas,
    strongAreas
  };
}

export default router;
