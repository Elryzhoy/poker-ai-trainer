/**
 * 手牌历史解析服务
 * 支持多种扑克平台的手牌格式
 */

// 支持的平台
export const PLATFORMS = {
  POKERSTARS: 'pokerstars',
  GGPOKER: 'ggpoker',
  EIGHTYEIGHT: '888poker',
  PARTYPOKER: 'partypoker',
  WINAMAX: 'winamax'
};

// 扑克牌面值映射
const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

/**
 * 检测手牌历史来自哪个平台
 */
export function detectPlatform(handHistory) {
  if (!handHistory) return null;
  
  const text = handHistory.toLowerCase();
  if (text.includes('pokerstars')) return PLATFORMS.POKERSTARS;
  if (text.includes('ggpoker') || text.includes('gg poker')) return PLATFORMS.GGPOKER;
  if (text.includes('888poker') || text.includes('888 poker')) return PLATFORMS.EIGHTYEIGHT;
  if (text.includes('partypoker') || text.includes('party poker')) return PLATFORMS.PARTYPOKER;
  if (text.includes('winamax')) return PLATFORMS.WINAMAX;
  
  return null;
}

/**
 * 解析单手牌历史
 */
export function parseHandHistory(handHistory, platform = null) {
  if (!handHistory || handHistory.trim().length === 0) {
    throw new Error('手牌历史为空');
  }

  if (!platform) {
    platform = detectPlatform(handHistory);
  }

  // 通用解析逻辑
  const lines = handHistory.split('\n').filter(line => line.trim().length > 0);
  
  // 提取基本信息
  const handId = extractHandId(lines);
  const blinds = extractBlinds(lines);
  const seats = extractSeats(lines);
  const actions = extractActions(lines);
  const board = extractBoard(lines);
  const pot = extractPot(lines);

  return {
    id: handId,
    platform: platform || 'unknown',
    smallBlind: blinds.small,
    bigBlind: blinds.big,
    seats,
    actions,
    board,
    totalPot: pot,
    raw: handHistory
  };
}

/**
 * 提取手牌ID
 */
function extractHandId(lines) {
  for (const line of lines) {
    // PokerStars: Hand #123456789
    const match = line.match(/Hand #(\d+)/);
    if (match) return match[1];
    
    // 通用: 尝试找数字ID
    const numMatch = line.match(/#(\d{6,})/);
    if (numMatch) return numMatch[1];
  }
  
  return 'hand_' + Date.now();
}

/**
 * 提取盲注
 */
function extractBlinds(lines) {
  for (const line of lines) {
    // 匹配各种盲注格式
    const match = line.match(/(?:Blinds|盲注)\s*\$?([\d.]+)\/\$?([\d.]+)/i) ||
                  line.match(/\$?([\d.]+)\/\$?([\d.]+)\s*(?:Hold'em|Holdem)/i) ||
                  line.match(/(\d+)\/(\d+)/);
    
    if (match) {
      return {
        small: parseFloat(match[1]),
        big: parseFloat(match[2])
      };
    }
  }
  
  return { small: 1, big: 2 }; // 默认盲注
}

/**
 * 提取座位信息
 */
function extractSeats(lines) {
  const seats = [];
  const seatPatterns = [
    /Seat (\d+): (\w+) \(\$?([\d.]+) in chips\)/i,
    /Seat (\d+): (\w+) \(\$?([\d.]+)\)/i,
    /(\d+) - (\w+): \$?([\d.]+)/
  ];

  for (const line of lines) {
    for (const pattern of seatPatterns) {
      const match = line.match(pattern);
      if (match) {
        seats.push({
          seatNumber: parseInt(match[1]),
          playerName: match[2],
          stackSize: parseFloat(match[3])
        });
        break;
      }
    }
  }

  return seats;
}

/**
 * 提取操作
 */
function extractActions(lines) {
  const actions = [];
  const actionPatterns = [
    /(\w+): (folds|checks|calls|bets|raises|all-in)(?: \$?([\d.]+))?/i,
    /(\w+) (fold|check|call|bet|raise|all-in)(?: \$?([\d.]+))?/i
  ];

  let currentStreet = 'preflop';
  
  for (const line of lines) {
    // 检测街道变化
    if (line.includes('*** FLOP ***') || line.includes('Flop:')) {
      currentStreet = 'flop';
      continue;
    }
    if (line.includes('*** TURN ***') || line.includes('Turn:')) {
      currentStreet = 'turn';
      continue;
    }
    if (line.includes('*** RIVER ***') || line.includes('River:')) {
      currentStreet = 'river';
      continue;
    }

    for (const pattern of actionPatterns) {
      const match = line.match(pattern);
      if (match) {
        actions.push({
          player: match[1],
          action: match[2].toLowerCase(),
          amount: match[3] ? parseFloat(match[3]) : 0,
          street: currentStreet
        });
        break;
      }
    }
  }

  return actions;
}

/**
 * 提取公共牌
 */
function extractBoard(lines) {
  const board = [];
  
  for (const line of lines) {
    // 匹配公共牌格式
    const match = line.match(/\[([2-9TJQKA][shdc] [2-9TJQKA][shdc] [2-9TJQKA][shdc](?: [2-9TJQKA][shdc])?(?: [2-9TJQKA][shdc])?)\]/);
    if (match) {
      const cards = match[1].split(' ');
      board.push(...cards);
    }
  }

  return board;
}

/**
 * 提取底池
 */
function extractPot(lines) {
  for (const line of lines) {
    const match = line.match(/Total pot \$?([\d.]+)/i) ||
                  line.match(/Pot: \$?([\d.]+)/i);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  return 0;
}

/**
 * 解析多手牌历史
 */
export function parseMultipleHands(handHistories, platform = null) {
  // 尝试用常见分隔符分割
  let hands = [];
  
  // 尝试用空行分割
  const sections = handHistories.split(/\n\s*\n/);
  
  for (const section of sections) {
    if (section.trim().length > 50) { // 至少50个字符才算一手牌
      try {
        const parsed = parseHandHistory(section.trim(), platform);
        if (parsed.id && parsed.actions.length > 0) {
          hands.push(parsed);
        }
      } catch (e) {
        // 跳过无法解析的部分
        console.warn('Failed to parse section:', e.message);
      }
    }
  }

  // 如果没有成功解析，尝试整体解析
  if (hands.length === 0) {
    try {
      const parsed = parseHandHistory(handHistories, platform);
      if (parsed.id) {
        hands.push(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse as single hand:', e.message);
    }
  }

  return hands;
}

/**
 * 分析手牌，提取关键决策点
 */
export function analyzeHandDecisions(hand) {
  const decisions = [];
  const { actions, seats, board } = hand;
  
  // 找到Hero（通常是第一个玩家或特定标记）
  const hero = seats[0]?.playerName || 'Hero';
  
  let currentStreet = 'preflop';
  let potSize = hand.smallBlind + hand.bigBlind;
  
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    
    // 更新街道
    if (action.street) {
      currentStreet = action.street;
    }
    
    // 更新底池
    if (action.amount > 0) {
      potSize += action.amount;
    }
    
    // 记录Hero的决策
    if (action.player === hero) {
      decisions.push({
        street: currentStreet,
        action: action.action,
        amount: action.amount,
        potSize,
        position: getPlayerPosition(hero, seats),
        index: i
      });
    }
  }

  return decisions;
}

/**
 * 获取玩家位置
 */
function getPlayerPosition(playerName, seats) {
  const positionMap = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  const index = seats.findIndex(s => s.playerName === playerName);
  return positionMap[index] || 'Unknown';
}

/**
 * 计算手牌强度（简化版）
 */
export function evaluateHandStrength(holeCards, board = []) {
  if (!holeCards || holeCards.length < 2) return 0;
  
  const ranks = holeCards.map(card => RANK_VALUES[card[0]] || 0);
  const suited = holeCards[0][1] === holeCards[1][1];
  
  // 对子
  if (ranks[0] === ranks[1]) {
    return ranks[0] / 14 * 100;
  }
  
  // 高牌
  const highCard = Math.max(...ranks);
  const lowCard = Math.min(...ranks);
  
  // 同花加分
  const suitedBonus = suited ? 10 : 0;
  
  // 连牌加分
  const connectedBonus = Math.abs(ranks[0] - ranks[1]) <= 2 ? 5 : 0;
  
  return (highCard / 14 * 60) + (lowCard / 14 * 20) + suitedBonus + connectedBonus;
}

/**
 * 生成手牌摘要
 */
export function generateHandSummary(hand) {
  const { seats, actions, board, totalPot } = hand;
  
  // 统计操作
  const actionCounts = {};
  actions.forEach(a => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
  });
  
  // 找到赢家（简化：假设最后跟注的人赢）
  const winner = actions.length > 0 ? actions[actions.length - 1].player : 'Unknown';
  
  return {
    handId: hand.id,
    playerCount: seats.length,
    totalActions: actions.length,
    actionCounts,
    boardLength: board.length,
    totalPot,
    winner,
    duration: 'Unknown' // 可以从时间戳计算
  };
}

export default {
  detectPlatform,
  parseHandHistory,
  parseMultipleHands,
  analyzeHandDecisions,
  evaluateHandStrength,
  generateHandSummary,
  PLATFORMS
};
