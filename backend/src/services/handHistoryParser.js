/**
 * Hand History Parser Service
 * Parses hand histories from various poker platforms
 */

// Supported platforms
export const PLATFORMS = {
  POKERSTARS: 'pokerstars',
  GGPOKER: 'ggpoker',
  EIGHTYEIGHT: '888poker',
  PARTYPOKER: 'partypoker',
  WINAMAX: 'winamax'
};

// Hand history patterns for each platform
const PATTERNS = {
  [PLATFORMS.POKERSTARS]: {
    header: /PokerStars Hand #(\d+)/,
    game: /Hold'em No Limit/,
    blinds: /Blinds \$?([\d.]+)\/\$?([\d.]+)/,
    seat: /Seat (\d+): (\w+) \(\$?([\d.]+) in chips\)/,
    action: /(\w+): (folds|checks|calls|bets|raises|all-in)(?: \$?([\d.]+))?/,
    board: /\[(\w\w \w\w \w\w \w\w \w\w)\]/,
    pot: /Total pot \$?([\d.]+)/
  },
  [PLATFORMS.GGPOKER]: {
    header: /GGPoker Hand #(\d+)/,
    game: /Hold'em/,
    blinds: /Blinds \$?([\d.]+)\/\$?([\d.]+)/,
    seat: /Seat (\d+): (\w+) \(\$?([\d.]+)\)/,
    action: /(\w+): (fold|check|call|bet|raise|all-in)(?: \$?([\d.]+))?/,
    board: /\[(\w\w \w\w \w\w \w\w \w\w)\]/,
    pot: /Total pot \$?([\d.]+)/
  }
};

/**
 * Detect which platform a hand history is from
 */
export function detectPlatform(handHistory) {
  if (handHistory.includes('PokerStars')) return PLATFORMS.POKERSTARS;
  if (handHistory.includes('GGPoker')) return PLATFORMS.GGPOKER;
  if (handHistory.includes('888poker')) return PLATFORMS.EIGHTYEIGHT;
  if (handHistory.includes('PartyPoker')) return PLATFORMS.PARTYPOKER;
  if (handHistory.includes('Winamax')) return PLATFORMS.WINAMAX;
  return null;
}

/**
 * Parse a single hand history
 */
export function parseHandHistory(handHistory, platform = null) {
  if (!platform) {
    platform = detectPlatform(handHistory);
  }
  
  if (!platform) {
    throw new Error('Unable to detect platform from hand history');
  }

  const patterns = PATTERNS[platform];
  if (!patterns) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  // Parse basic info
  const handId = handHistory.match(patterns.header)?.[1] || 'unknown';
  const blindsMatch = handHistory.match(patterns.blinds);
  const smallBlind = blindsMatch ? parseFloat(blindsMatch[1]) : 0;
  const bigBlind = blindsMatch ? parseFloat(blindsMatch[2]) : 0;

  // Parse seats
  const seats = [];
  const seatRegex = new RegExp(patterns.seat, 'g');
  let seatMatch;
  while ((seatMatch = seatRegex.exec(handHistory)) !== null) {
    seats.push({
      seatNumber: parseInt(seatMatch[1]),
      playerName: seatMatch[2],
      stackSize: parseFloat(seatMatch[3])
    });
  }

  // Parse actions
  const actions = [];
  const actionRegex = new RegExp(patterns.action, 'g');
  let actionMatch;
  while ((actionMatch = actionRegex.exec(handHistory)) !== null) {
    actions.push({
      player: actionMatch[1],
      action: actionMatch[2],
      amount: actionMatch[3] ? parseFloat(actionMatch[3]) : 0
    });
  }

  // Parse board
  const boardMatch = handHistory.match(patterns.board);
  const board = boardMatch ? boardMatch[1].split(' ') : [];

  // Parse pot
  const potMatch = handHistory.match(patterns.pot);
  const totalPot = potMatch ? parseFloat(potMatch[1]) : 0;

  return {
    id: handId,
    platform,
    smallBlind,
    bigBlind,
    seats,
    actions,
    board,
    totalPot,
    raw: handHistory
  };
}

/**
 * Parse multiple hand histories
 */
export function parseMultipleHands(handHistories, platform = null) {
  // Split by common delimiters
  const hands = handHistories.split(/\n\n(?=PokerStars|GGPoker|888poker|PartyPoker|Winamax)/);
  
  return hands
    .filter(hand => hand.trim().length > 0)
    .map(hand => {
      try {
        return parseHandHistory(hand.trim(), platform);
      } catch (error) {
        console.error('Failed to parse hand:', error.message);
        return null;
      }
    })
    .filter(hand => hand !== null);
}

/**
 * Extract key moments from a hand for analysis
 */
export function extractKeyMoments(parsedHand) {
  const keyMoments = [];
  const { actions, seats } = parsedHand;
  
  // Track pot size and player stacks
  let currentPot = parsedHand.smallBlind + parsedHand.bigBlind;
  const playerStacks = {};
  seats.forEach(seat => {
    playerStacks[seat.playerName] = seat.stackSize;
  });

  // Analyze each action
  actions.forEach((action, index) => {
    const { player, action: actionType, amount } = action;
    
    // Track significant actions
    if (['bets', 'raises', 'all-in'].includes(actionType)) {
      keyMoments.push({
        type: 'aggressive',
        player,
        action: actionType,
        amount,
        potSize: currentPot,
        street: getStreet(index, actions),
        index
      });
    }
    
    // Track calls
    if (actionType === 'calls') {
      keyMoments.push({
        type: 'call',
        player,
        amount,
        potSize: currentPot,
        street: getStreet(index, actions),
        index
      });
    }
    
    // Update pot
    if (amount) {
      currentPot += amount;
    }
  });

  return keyMoments;
}

/**
 * Determine which street an action is on
 */
function getStreet(actionIndex, actions) {
  // Simple heuristic: count board cards
  // This is a simplified version - real implementation would be more complex
  const preflopActions = actions.slice(0, 4); // First few actions are preflop
  if (actionIndex < preflopActions.length) return 'preflop';
  if (actionIndex < preflopActions.length + 3) return 'flop';
  if (actionIndex < preflopActions.length + 4) return 'turn';
  return 'river';
}

export default {
  detectPlatform,
  parseHandHistory,
  parseMultipleHands,
  extractKeyMoments,
  PLATFORMS
};
