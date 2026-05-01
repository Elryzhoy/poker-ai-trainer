import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/user/profile
 * Get user profile
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      // Return mock profile for development
      return res.json({
        id: 'dev-user',
        email: 'dev@example.com',
        name: 'Developer',
        subscription: 'pro',
        createdAt: new Date().toISOString(),
        stats: {
          totalHands: 1500,
          trainingSessions: 45,
          accuracy: 72.5,
          streak: 7
        }
      });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      res.json(data);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', [
  body('name').optional().isString(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, email } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    updates.updated_at = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } else {
      res.json({ id: userId, ...updates });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/user/stats
 * Get user statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      // Return mock stats
      return res.json({
        handHistory: {
          totalHands: 1500,
          totalSessions: 45,
          biggestWin: 250,
          biggestLoss: -120,
          averageEV: 0.8,
          winRate: 55.2
        },
        training: {
          totalQuestions: 500,
          correctAnswers: 362,
          accuracy: 72.4,
          streak: 7,
          weakAreas: ['bet_sizing', 'river_play'],
          strongAreas: ['preflop', 'position']
        },
        range: {
          positionsStudied: 6,
          stackDepthsStudied: 4,
          averageAccuracy: 78.5
        }
      });
    }

    // In production, this would fetch from database
    res.json({
      handHistory: {
        totalHands: 0,
        totalSessions: 0,
        biggestWin: 0,
        biggestLoss: 0,
        averageEV: 0,
        winRate: 0
      },
      training: {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        streak: 0,
        weakAreas: [],
        strongAreas: []
      },
      range: {
        positionsStudied: 0,
        stackDepthsStudied: 0,
        averageAccuracy: 0
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * POST /api/user/subscription
 * Update subscription
 */
router.post('/subscription', [
  body('plan').isIn(['free', 'basic', 'pro', 'enterprise']).withMessage('Invalid plan')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { plan } = req.body;
    
    // In production, this would integrate with Stripe
    res.json({
      success: true,
      plan,
      message: `Subscription updated to ${plan}`,
      // Mock Stripe integration
      stripeCustomerId: 'cus_mock_' + userId,
      subscriptionId: 'sub_mock_' + Date.now()
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

export default router;
