/**
 * 德州扑克游戏引擎
 * 支持单挑（Heads-Up）对战
 */

// 牌面值
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['h', 'd', 'c', 's']; // 红心、方块、梅花、黑桃

// 牌面值映射
const RANK_VALUES: { [key: string]: number } = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// 位置
export const POSITIONS = {
  HERO: 'hero',
  VILLAIN: 'villain'
};

// 游戏状态
export const GAME_STATES = {
  WAITING: 'waiting',
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown',
  FOLDED: 'folded'
};

// 动作
export const ACTIONS = {
  FOLD: 'fold',
  CHECK: 'check',
  CALL: 'call',
  BET: 'bet',
  RAISE: 'raise',
  ALL_IN: 'all_in'
};

interface Player {
  name: string;
  position: string;
  cards: string[];
  stack: number;
  bet: number;
  totalBet: number;
  folded: boolean;
  isAllIn: boolean;
}

interface Game {
  id: string;
  blinds: { small: number; big: number };
  deck: string[];
  pot: number;
  communityCards: string[];
  street: string;
  hero: Player;
  villain: Player;
  currentActor: string;
  history: Array<{
    street: string;
    actor: string;
    action: string;
    amount: number;
    description: string;
    timestamp: string;
  }>;
  lastAction: string | null;
  isFinished: boolean;
  winner: string | null;
}

/**
 * 创建一副牌
 */
export function createDeck(): string[] {
  const deck: string[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(rank + suit);
    }
  }
  return shuffleDeck(deck);
}

/**
 * 洗牌
 */
export function shuffleDeck(deck: string[]): string[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

/**
 * 发牌
 */
export function dealCards(deck: string[], numCards = 2): string[] {
  return deck.splice(0, numCards);
}

/**
 * 创建新游戏
 */
export function createGame(blinds = { small: 1, big: 2 }, stackSize = 200): Game {
  const deck = createDeck();
  
  return {
    id: 'game_' + Date.now(),
    blinds,
    deck,
    pot: blinds.small + blinds.big,
    communityCards: [],
    street: GAME_STATES.PREFLOP,
    
    // Hero (玩家) - SB位置
    hero: {
      name: '你',
      position: POSITIONS.HERO,
      cards: dealCards(deck),
      stack: stackSize - blinds.small,
      bet: blinds.small,
      totalBet: blinds.small,
      folded: false,
      isAllIn: false
    },
    
    // Villain (AI) - BB位置
    villain: {
      name: 'AI对手',
      position: POSITIONS.VILLAIN,
      cards: dealCards(deck),
      stack: stackSize - blinds.big,
      bet: blinds.big,
      totalBet: blinds.big,
      folded: false,
      isAllIn: false
    },
    
    // SB先行动
    currentActor: POSITIONS.HERO,
    
    history: [],
    lastAction: null,
    isFinished: false,
    winner: null
  };
}

/**
 * 获取可用动作
 */
export function getAvailableActions(game: Game): string[] {
  const { hero, villain, currentActor } = game;
  const actor = currentActor === POSITIONS.HERO ? hero : villain;
  const opponent = currentActor === POSITIONS.HERO ? villain : hero;
  
  const actions: string[] = [];
  
  // 弃牌（如果对手下注）
  if (opponent.bet > actor.bet) {
    actions.push(ACTIONS.FOLD);
  }
  
  // 过牌（如果没有下注或已经跟注）
  if (opponent.bet === actor.bet) {
    actions.push(ACTIONS.CHECK);
  }
  
  // 跟注（如果对手下注）
  if (opponent.bet > actor.bet) {
    actions.push(ACTIONS.CALL);
  }
  
  // 下注（如果没有下注）
  if (opponent.bet === 0 && game.street !== GAME_STATES.PREFLOP) {
    actions.push(ACTIONS.BET);
  }
  
  // 加注（如果有下注）
  if (opponent.bet > 0) {
    actions.push(ACTIONS.RAISE);
  }
  
  // 全下
  actions.push(ACTIONS.ALL_IN);
  
  return actions;
}

/**
 * 执行动作
 */
export function executeAction(game: Game, action: string, amount = 0): Game {
  const newGame: Game = JSON.parse(JSON.stringify(game));
  const { hero, villain, currentActor, blinds, street } = newGame;
  const actor = currentActor === POSITIONS.HERO ? hero : villain;
  const opponent = currentActor === POSITIONS.HERO ? villain : hero;
  
  let actionDescription = '';
  
  switch (action) {
    case ACTIONS.FOLD:
      actor.folded = true;
      newGame.isFinished = true;
      newGame.winner = currentActor === POSITIONS.HERO ? POSITIONS.VILLAIN : POSITIONS.HERO;
      actionDescription = `${actor.name} 弃牌`;
      break;
      
    case ACTIONS.CHECK:
      actionDescription = `${actor.name} 过牌`;
      break;
      
    case ACTIONS.CALL:
      const callAmount = Math.min(opponent.bet - actor.bet, actor.stack);
      actor.stack -= callAmount;
      actor.bet += callAmount;
      actor.totalBet += callAmount;
      newGame.pot += callAmount;
      actionDescription = `${actor.name} 跟注 ${callAmount}`;
      
      if (actor.stack === 0) {
        actor.isAllIn = true;
      }
      break;
      
    case ACTIONS.BET:
      const betAmount = Math.min(amount || blinds.big * 2, actor.stack);
      actor.stack -= betAmount;
      actor.bet += betAmount;
      actor.totalBet += betAmount;
      newGame.pot += betAmount;
      actionDescription = `${actor.name} 下注 ${betAmount}`;
      
      if (actor.stack === 0) {
        actor.isAllIn = true;
      }
      break;
      
    case ACTIONS.RAISE:
      const raiseAmount = Math.min(amount || opponent.bet * 3, actor.stack);
      const raiseDelta = raiseAmount - actor.bet;
      actor.stack -= raiseDelta;
      actor.bet = raiseAmount;
      actor.totalBet += raiseDelta;
      newGame.pot += raiseDelta;
      actionDescription = `${actor.name} 加注到 ${raiseAmount}`;
      
      if (actor.stack === 0) {
        actor.isAllIn = true;
      }
      break;
      
    case ACTIONS.ALL_IN:
      const allInAmount = actor.stack;
      actor.bet += allInAmount;
      actor.totalBet += allInAmount;
      newGame.pot += allInAmount;
      actor.stack = 0;
      actor.isAllIn = true;
      actionDescription = `${actor.name} 全下 ${allInAmount}`;
      break;
  }
  
  // 记录历史
  newGame.history.push({
    street,
    actor: currentActor,
    action,
    amount: actor.bet,
    description: actionDescription,
    timestamp: new Date().toISOString()
  });
  
  newGame.lastAction = actionDescription;
  
  // 检查是否结束
  if (newGame.isFinished) {
    return newGame;
  }
  
  // 检查是否双方都行动过（下注相等）
  const isRoundComplete = hero.bet === villain.bet && 
                          (action === ACTIONS.CHECK || action === ACTIONS.CALL || action === ACTIONS.ALL_IN);
  
  if (isRoundComplete || (hero.isAllIn && villain.isAllIn)) {
    // 进入下一条街
    return advanceStreet(newGame);
  }
  
  // 切换行动者
  newGame.currentActor = currentActor === POSITIONS.HERO ? POSITIONS.VILLAIN : POSITIONS.HERO;
  
  return newGame;
}

/**
 * 进入下一条街
 */
function advanceStreet(game: Game): Game {
  const newGame: Game = JSON.parse(JSON.stringify(game));
  const { hero, villain } = newGame;
  
  // 重置下注
  hero.bet = 0;
  villain.bet = 0;
  
  switch (newGame.street) {
    case GAME_STATES.PREFLOP:
      newGame.street = GAME_STATES.FLOP;
      newGame.communityCards = dealCards(newGame.deck, 3);
      newGame.currentActor = POSITIONS.VILLAIN; // 翻后BB先行动
      break;
      
    case GAME_STATES.FLOP:
      newGame.street = GAME_STATES.TURN;
      newGame.communityCards.push(...dealCards(newGame.deck, 1));
      newGame.currentActor = POSITIONS.VILLAIN;
      break;
      
    case GAME_STATES.TURN:
      newGame.street = GAME_STATES.RIVER;
      newGame.communityCards.push(...dealCards(newGame.deck, 1));
      newGame.currentActor = POSITIONS.VILLAIN;
      break;
      
    case GAME_STATES.RIVER:
      // 摊牌
      newGame.street = GAME_STATES.SHOWDOWN;
      newGame.isFinished = true;
      newGame.winner = determineWinner(newGame);
      break;
  }
  
  // 检查是否全下（自动发完剩余牌）
  if (hero.isAllIn || villain.isAllIn) {
    while (newGame.communityCards.length < 5) {
      newGame.communityCards.push(...dealCards(newGame.deck, 1));
    }
    newGame.street = GAME_STATES.SHOWDOWN;
    newGame.isFinished = true;
    newGame.winner = determineWinner(newGame);
  }
  
  return newGame;
}

/**
 * 判断赢家（简化版）
 */
function determineWinner(game: Game): string {
  const { hero, villain, communityCards } = game;
  
  const heroStrength = evaluateHand(hero.cards, communityCards);
  const villainStrength = evaluateHand(villain.cards, communityCards);
  
  if (heroStrength > villainStrength) {
    return POSITIONS.HERO;
  } else if (villainStrength > heroStrength) {
    return POSITIONS.VILLAIN;
  } else {
    return 'tie';
  }
}

/**
 * 评估手牌强度（简化版）
 */
function evaluateHand(holeCards: string[], communityCards: string[]): number {
  const allCards = [...holeCards, ...communityCards];
  
  let strength = 0;
  for (const card of allCards) {
    strength += RANK_VALUES[card[0]] || 0;
  }
  
  // 检查对子
  const ranks = allCards.map(c => c[0]);
  const rankCounts: { [key: string]: number } = {};
  for (const rank of ranks) {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  }
  
  // 对子加分
  for (const count of Object.values(rankCounts)) {
    if (count === 2) strength += 10;
    if (count === 3) strength += 20;
    if (count === 4) strength += 40;
  }
  
  // 检查同花
  const suits = allCards.map(c => c[1]);
  const suitCounts: { [key: string]: number } = {};
  for (const suit of suits) {
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
  }
  
  for (const count of Object.values(suitCounts)) {
    if (count >= 5) strength += 30;
  }
  
  return strength;
}

/**
 * AI决策
 */
export function aiDecision(game: Game): { action: string; amount: number } {
  const { villain, hero, communityCards, blinds } = game;
  
  const handStrength = evaluateHand(villain.cards, communityCards);
  const random = Math.random();
  
  // 如果手牌很强
  if (handStrength > 50) {
    if (hero.bet === 0) {
      return { action: ACTIONS.BET, amount: blinds.big * 2 };
    } else {
      return { action: ACTIONS.RAISE, amount: hero.bet * 3 };
    }
  }
  
  // 如果手牌中等
  if (handStrength > 30) {
    if (hero.bet === 0) {
      return { action: ACTIONS.CHECK, amount: 0 };
    } else {
      return random > 0.5 ? { action: ACTIONS.CALL, amount: 0 } : { action: ACTIONS.FOLD, amount: 0 };
    }
  }
  
  // 如果手牌弱
  if (hero.bet === 0) {
    if (random > 0.7) {
      return { action: ACTIONS.BET, amount: blinds.big * 2 };
    }
    return { action: ACTIONS.CHECK, amount: 0 };
  } else {
    return random > 0.8 ? { action: ACTIONS.CALL, amount: 0 } : { action: ACTIONS.FOLD, amount: 0 };
  }
}

/**
 * 获取牌面显示
 */
export function formatCard(card: string): { rank: string; suit: string; color: string; display: string } {
  const rank = card[0];
  const suit = card[1];
  
  const suitSymbols: { [key: string]: string } = {
    'h': '♥',
    'd': '♦',
    'c': '♣',
    's': '♠'
  };
  
  return {
    rank,
    suit: suitSymbols[suit] || suit,
    color: suit === 'h' || suit === 'd' ? 'red' : 'black',
    display: `${rank}${suitSymbols[suit] || suit}`
  };
}

/**
 * 获取游戏状态描述
 */
export function getGameStatus(game: Game): string {
  if (game.isFinished) {
    if (game.winner === POSITIONS.HERO) {
      return '你赢了！';
    } else if (game.winner === POSITIONS.VILLAIN) {
      return 'AI赢了！';
    } else {
      return '平局！';
    }
  }
  
  const streetNames: { [key: string]: string } = {
    [GAME_STATES.PREFLOP]: '翻前',
    [GAME_STATES.FLOP]: '翻牌',
    [GAME_STATES.TURN]: '转牌',
    [GAME_STATES.RIVER]: '河牌',
    [GAME_STATES.SHOWDOWN]: '摊牌'
  };
  
  return `${streetNames[game.street] || '未知'} - ${game.currentActor === POSITIONS.HERO ? '你的回合' : 'AI思考中...'}`;
}

export default {
  createDeck,
  shuffleDeck,
  dealCards,
  createGame,
  getAvailableActions,
  executeAction,
  aiDecision,
  formatCard,
  getGameStatus,
  POSITIONS,
  GAME_STATES,
  ACTIONS
};
