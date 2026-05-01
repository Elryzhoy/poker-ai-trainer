import { Router } from 'express';
import { body, validationResult } from 'express-validator';

const router = Router();

// Preflop range data based on position and action
const RANGES = {
  // Opening ranges by position
  open: {
    utg: {
      '20bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs'],
      '50bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'KQs', 'KQo'],
      '100bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KQo', 'KJs', 'QJs'],
      '200bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'KQs', 'KQo', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs']
    },
    mp: {
      '20bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'KQs'],
      '50bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KQo', 'KJs'],
      '100bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'KQs', 'KQo', 'KJs', 'KTs', 'QJs'],
      '200bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'JTs']
    },
    co: {
      '20bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KQo', 'KJs', 'QJs'],
      '50bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'KQs', 'KQo', 'KJs', 'KTs', 'QJs', 'QTs'],
      '100bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'JTs', 'T9s'],
      '200bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s']
    },
    btn: {
      '20bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s'],
      '50bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s'],
      '100bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'JTs', 'J9s', 'J8s', 'J7s', 'T9s', 'T8s', 'T7s', '98s', '97s', '96s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s'],
      '200bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'T9s', 'T8s', 'T7s', 'T6s', '98s', '97s', '96s', '95s', '87s', '86s', '85s', '76s', '75s', '74s', '65s', '64s', '54s', '53s', '43s']
    },
    sb: {
      '20bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s', '65s'],
      '50bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s', '54s'],
      '100bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'JTs', 'J9s', 'J8s', 'J7s', 'T9s', 'T8s', 'T7s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s'],
      '200bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'T9s', 'T8s', 'T7s', 'T6s', '98s', '97s', '96s', '87s', '86s', '85s', '76s', '75s', '74s', '65s', '64s', '63s', '54s', '53s', '43s']
    },
    bb: {
      '20bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s', '43s'],
      '50bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'JTs', 'J9s', 'J8s', 'J7s', 'T9s', 'T8s', 'T7s', '98s', '97s', '96s', '87s', '86s', '85s', '76s', '75s', '74s', '65s', '64s', '63s', '54s', '53s', '52s', '43s', '42s', '32s'],
      '100bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'T9s', 'T8s', 'T7s', 'T6s', '98s', '97s', '96s', '95s', '87s', '86s', '85s', '84s', '76s', '75s', '74s', '65s', '64s', '63s', '54s', '53s', '52s', '43s', '42s', '32s'],
      '200bb': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', '98s', '97s', '96s', '95s', '94s', '87s', '86s', '85s', '84s', '76s', '75s', '74s', '73s', '65s', '64s', '63s', '54s', '53s', '52s', '43s', '42s', '32s']
    }
  },
  // 3-bet ranges
  '3bet': {
    utg: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'],
    mp: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs'],
    co: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs'],
    btn: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'KQs'],
    sb: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'KQs', 'KJs'],
    bb: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs']
  },
  // 4-bet ranges
  '4bet': {
    utg: ['AA', 'KK', 'QQ', 'AKs'],
    mp: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    co: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'],
    btn: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
    sb: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
    bb: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs']
  }
};

/**
 * GET /api/range/:position/:stackDepth
 * Get opening range for position and stack depth
 */
router.get('/:position/:stackDepth', (req, res) => {
  try {
    const { position, stackDepth } = req.params;
    const action = req.query.action || 'open';
    
    // Validate position
    const validPositions = ['utg', 'mp', 'co', 'btn', 'sb', 'bb'];
    if (!validPositions.includes(position.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid position',
        validPositions 
      });
    }

    // Validate stack depth
    const validDepths = ['20bb', '50bb', '100bb', '200bb'];
    if (!validDepths.includes(stackDepth)) {
      return res.status(400).json({ 
        error: 'Invalid stack depth',
        validDepths 
      });
    }

    // Get range
    let range;
    if (action === 'open') {
      range = RANGES.open[position.toLowerCase()]?.[stackDepth] || [];
    } else if (action === '3bet') {
      range = RANGES['3bet'][position.toLowerCase()] || [];
    } else if (action === '4bet') {
      range = RANGES['4bet'][position.toLowerCase()] || [];
    } else {
      return res.status(400).json({ 
        error: 'Invalid action',
        validActions: ['open', '3bet', '4bet'] 
      });
    }

    res.json({
      success: true,
      position: position.toUpperCase(),
      stackDepth,
      action,
      range,
      handCount: range.length
    });
  } catch (error) {
    console.error('Range error:', error);
    res.status(500).json({ error: 'Failed to get range' });
  }
});

/**
 * GET /api/range/quiz
 * Generate a range quiz question
 */
router.get('/quiz', (req, res) => {
  try {
    const positions = ['utg', 'mp', 'co', 'btn', 'sb', 'bb'];
    const stackDepths = ['20bb', '50bb', '100bb', '200bb'];
    const actions = ['open', '3bet', '4bet'];
    
    // Random selection
    const position = positions[Math.floor(Math.random() * positions.length)];
    const stackDepth = stackDepths[Math.floor(Math.random() * stackDepths.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    // Get the correct range
    let correctRange;
    if (action === 'open') {
      correctRange = RANGES.open[position]?.[stackDepth] || [];
    } else if (action === '3bet') {
      correctRange = RANGES['3bet'][position] || [];
    } else {
      correctRange = RANGES['4bet'][position] || [];
    }

    // Generate a random hand
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    const suits = ['s', 'o'];
    
    let hand;
    let isIncluded;
    
    // 50% chance to pick a hand that's in the range
    if (Math.random() > 0.5 && correctRange.length > 0) {
      hand = correctRange[Math.floor(Math.random() * correctRange.length)];
      isIncluded = true;
    } else {
      // Generate a random hand
      const rank1 = ranks[Math.floor(Math.random() * ranks.length)];
      const rank2 = ranks[Math.floor(Math.random() * ranks.length)];
      const suit = suits[Math.floor(Math.random() * suits.length)];
      hand = rank1 + rank2 + suit;
      
      // Check if it's actually in the range
      isIncluded = correctRange.includes(hand);
    }

    res.json({
      success: true,
      question: {
        position: position.toUpperCase(),
        stackDepth,
        action,
        hand,
        isIncluded
      },
      hint: `Should you ${action} with ${hand} from ${position.toUpperCase()} with ${stackDepth}?`
    });
  } catch (error) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

/**
 * POST /api/range/check
 * Check if a hand is in a specific range
 */
router.post('/check', [
  body('hand').notEmpty().withMessage('Hand is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('stackDepth').notEmpty().withMessage('Stack depth is required'),
  body('action').optional().isIn(['open', '3bet', '4bet'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hand, position, stackDepth, action = 'open' } = req.body;
    
    // Get the range
    let range;
    if (action === 'open') {
      range = RANGES.open[position.toLowerCase()]?.[stackDepth] || [];
    } else if (action === '3bet') {
      range = RANGES['3bet'][position.toLowerCase()] || [];
    } else {
      range = RANGES['4bet'][position.toLowerCase()] || [];
    }

    // Normalize the hand (remove spaces, convert to uppercase)
    const normalizedHand = hand.toUpperCase().replace(/\s/g, '');
    
    // Check if hand is in range
    const isIncluded = range.includes(normalizedHand);

    res.json({
      success: true,
      hand: normalizedHand,
      position: position.toUpperCase(),
      stackDepth,
      action,
      isIncluded,
      rangeSize: range.length
    });
  } catch (error) {
    console.error('Range check error:', error);
    res.status(500).json({ error: 'Failed to check range' });
  }
});

/**
 * GET /api/range/positions
 * Get all available positions
 */
router.get('/positions', (req, res) => {
  res.json({
    success: true,
    positions: [
      { id: 'utg', name: 'UTG', description: 'Under the Gun' },
      { id: 'mp', name: 'MP', description: 'Middle Position' },
      { id: 'co', name: 'CO', description: 'Cutoff' },
      { id: 'btn', name: 'BTN', description: 'Button' },
      { id: 'sb', name: 'SB', description: 'Small Blind' },
      { id: 'bb', name: 'BB', description: 'Big Blind' }
    ]
  });
});

/**
 * GET /api/range/stack-depths
 * Get all available stack depths
 */
router.get('/stack-depths', (req, res) => {
  res.json({
    success: true,
    stackDepths: [
      { id: '20bb', name: '20 BB', description: 'Short Stack' },
      { id: '50bb', name: '50 BB', description: 'Medium Stack' },
      { id: '100bb', name: '100 BB', description: 'Standard Stack' },
      { id: '200bb', name: '200 BB', description: 'Deep Stack' }
    ]
  });
});

export default router;
