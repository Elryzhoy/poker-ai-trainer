/**
 * 训练题库服务
 * 提供多样化的扑克训练题
 */

// 训练题类型
export const QUESTION_TYPES = {
  PREFLOP: 'preflop',
  POSTFLOP: 'postflop',
  BET_SIZING: 'bet_sizing',
  POSITION: 'position',
  RANGE: 'range',
  ODDS: 'odds',
  BLUFFING: 'bluffing',
  VALUE_BETTING: 'value_betting'
};

// 翻前训练题库
const PREFLOP_QUESTIONS = [
  {
    scenario: '你在UTG位拿到AKs，前面没人加注',
    question: '最优打法是什么？',
    correctAnswer: '加注3BB',
    explanation: 'AKs是超强牌，在枪口位应该标准加注。3BB是标准大小，可以建立底池并隔离较弱的手牌。如果被3bet，可以考虑4bet或跟注取决于对手范围。'
  },
  {
    scenario: '你在BTN位拿到72o，前面没人加注',
    question: '最优打法是什么？',
    correctAnswer: '弃牌',
    explanation: '72o是最差的起手牌，即使在按钮位也应该弃牌。虽然位置很好，但牌力太弱，翻后很难玩。'
  },
  {
    scenario: '你在CO位拿到QQ，UTG加注3BB',
    question: '最优打法是什么？',
    correctAnswer: '3bet到9BB',
    explanation: 'QQ是强牌，面对UTG的加注应该3bet。9BB的大小可以建立底池并测试对手的牌力。如果对手4bet，需要根据对手范围决定是否全下。'
  },
  {
    scenario: '你在SB位拿到A5s，BTN加注2.5BB',
    question: '最优打法是什么？',
    correctAnswer: '跟注',
    explanation: 'A5s在小盲位面对按钮的加注可以跟注。有不错的隐含赔率，翻后如果击中同花或顺子可以赢大底池。'
  },
  {
    scenario: '你在MP位拿到KQo，前面没人加注',
    question: '最优打法是什么？',
    correctAnswer: '加注2.5BB',
    explanation: 'KQo在中间位是不错的牌，可以加注。如果后面有人3bet，需要根据对手范围决定是否跟注。'
  },
  {
    scenario: '你在BB位拿到98s，CO加注3BB',
    question: '最优打法是什么？',
    correctAnswer: '跟注',
    explanation: '98s在大盲位面对CO的加注可以跟注。有不错的同花和顺子潜力，而且位置在翻后会改善。'
  },
  {
    scenario: '你在BTN位拿到AKo，前面两人limp',
    question: '最优打法是什么？',
    correctAnswer: '加注到5BB',
    explanation: 'AKo是强牌，面对limp应该加注建立底池。5BB的大小可以隔离limper并获得主动权。'
  },
  {
    scenario: '你在UTG位拿到22，前面没人加注',
    question: '最优打法是什么？',
    correctAnswer: '加注2.5BB',
    explanation: '小对子在枪口位可以加注，主要目的是击中三条。如果被3bet，可以跟注看翻牌。'
  },
  {
    scenario: '你在CO位拿到AJo，UTG加注3BB',
    question: '最优打法是什么？',
    correctAnswer: '弃牌',
    explanation: 'AJo面对UTG的加注应该弃牌。UTG的加注范围很强，AJo在这个位置处于劣势。'
  },
  {
    scenario: '你在BTN位拿到KJs，前面没人加注',
    question: '最优打法是什么？',
    correctAnswer: '加注2.5BB',
    explanation: 'KJs在按钮位是很好的牌，可以加注。有很好的翻后可玩性，同花和顺子潜力都很强。'
  }
];

// 翻后训练题库
const POSTFLOP_QUESTIONS = [
  {
    scenario: '你拿着AK，翻牌A-7-2彩虹面，你是翻前加注者',
    question: '应该怎么下注？',
    correctAnswer: '下注底池的1/3到1/2',
    explanation: '干燥牌面，你有顶对顶踢脚。小到中等下注可以获取价值，同时让对手用更差的牌跟注。'
  },
  {
    scenario: '你拿着QQ，翻牌A-K-7彩虹面，你是翻前加注者',
    question: '应该怎么打？',
    correctAnswer: '过牌',
    explanation: '这个牌面有A和K，对你的QQ很不利。对手范围里有很多A和K，过牌控制底池是更好的选择。'
  },
  {
    scenario: '你拿着8♠9♠，翻牌6♠7♠2♥，你是翻前跟注者',
    question: '应该怎么打？',
    correctAnswer: '下注或过牌加注',
    explanation: '你有两头顺听花，这是超强听牌。可以下注建立底池，或者过牌加注给对手施压。'
  },
  {
    scenario: '你拿着AA，翻牌J-8-3彩虹面，你是翻前加注者',
    question: '应该怎么下注？',
    correctAnswer: '下注底池的2/3',
    explanation: '干燥牌面，你有超对。较大的下注可以保护你的牌，同时从更弱的牌获取价值。'
  },
  {
    scenario: '你拿着KQ，翻牌K-9-4两梅花，你是翻前加注者',
    question: '应该怎么下注？',
    correctAnswer: '下注底池的1/2',
    explanation: '你有顶对，牌面有同花听牌。中等下注可以获取价值，同时保护你的牌免受听牌的威胁。'
  }
];

// 下注大小训练题库
const BET_SIZING_QUESTIONS = [
  {
    scenario: '你在翻牌圈有顶对，牌面很干燥（A-7-2彩虹）',
    question: '最佳下注大小是多少？',
    correctAnswer: '底池的1/3',
    explanation: '干燥牌面，对手很难击中。小下注可以让对手用更宽的范围跟注，最大化价值。'
  },
  {
    scenario: '你在翻牌圈有听花，牌面很湿润（J♠T♠5♥）',
    question: '最佳下注大小是多少？',
    correctAnswer: '底池的2/3',
    explanation: '湿润牌面有很多听牌。较大的下注可以保护你的牌，同时让听牌付出代价。'
  },
  {
    scenario: '你在河牌圈有坚果牌，对手示弱',
    question: '最佳下注大小是多少？',
    correctAnswer: '底池的2/3到满池',
    explanation: '对手示弱表明牌力不强。较大的下注可以最大化价值，因为对手可能会用抓诈唬的牌跟注。'
  },
  {
    scenario: '你在翻牌圈有中等牌力（中对），牌面有听牌',
    question: '最佳下注大小是多少？',
    correctAnswer: '底池的1/2',
    explanation: '中等牌力需要保护。中等下注可以让听牌付出代价，同时从更弱的牌获取价值。'
  },
  {
    scenario: '你在河牌圈完全没击中，对手过牌',
    question: '应该怎么打？',
    correctAnswer: '过牌',
    explanation: '你没有牌力，诈唬成功率很低。过牌放弃是更好的选择，避免损失更多筹码。'
  }
];

// 位置训练题库
const POSITION_QUESTIONS = [
  {
    scenario: '你在UTG位拿到KJo',
    question: '应该怎么打？',
    correctAnswer: '弃牌',
    explanation: 'KJo在枪口位太弱。UTG位需要很强的范围，因为后面还有很多玩家可能加注。'
  },
  {
    scenario: '你在BTN位拿到KJo',
    question: '应该怎么打？',
    correctAnswer: '加注',
    explanation: 'KJo在按钮位是很好的牌。位置优势很大，可以加注并利用位置在翻后获取价值。'
  },
  {
    scenario: '你在SB位拿到QTo，前面没人加注',
    question: '应该怎么打？',
    correctAnswer: '弃牌或加注',
    explanation: 'QTo在小盲位很尴尬。如果后面玩家较紧可以加注，否则弃牌更安全。'
  },
  {
    scenario: '你在CO位拿到A9s，前面没人加注',
    question: '应该怎么打？',
    correctAnswer: '加注',
    explanation: 'A9s在关煞位是不错的牌。位置很好，可以加注并利用位置在翻后玩得更激进。'
  },
  {
    scenario: '你在BB位拿到K9s，BTN加注',
    question: '应该怎么打？',
    correctAnswer: '跟注',
    explanation: 'K9s在大盲位面对按钮的加注可以跟注。有不错的同花潜力，而且价格合适。'
  }
];

// 范围训练题库
const RANGE_QUESTIONS = [
  {
    scenario: 'UTG加注范围（100BB）',
    question: '以下哪手牌应该在UTG加注？',
    correctAnswer: 'AKs',
    explanation: 'AKs是超强牌，在UTG位必须加注。K9o则太弱，应该弃牌。'
  },
  {
    scenario: 'BTN加注范围（100BB）',
    question: '以下哪手牌应该在BTN加注？',
    correctAnswer: 'K9o',
    explanation: 'K9o在按钮位是可以加注的牌。位置优势很大，可以玩得更宽。'
  },
  {
    scenario: '3bet范围（CO vs UTG）',
    question: '面对UTG加注，CO应该3bet哪手牌？',
    correctAnswer: 'QQ',
    explanation: 'QQ是强牌，面对UTG加注应该3bet。AJs则可以跟注或弃牌。'
  },
  {
    scenario: '4bet范围（BTN vs CO）',
    question: '面对CO的3bet，BTN应该4bet哪手牌？',
    correctAnswer: 'AA',
    explanation: 'AA是坚果牌，必须4bet。AKo可以跟注或弃牌取决于对手。'
  },
  {
    scenario: '防守范围（BB vs BTN）',
    question: '面对BTN加注，BB应该防守哪手牌？',
    correctAnswer: 'JTs',
    explanation: 'JTs在大盲位面对按钮加注应该防守。有很好的翻后可玩性和隐含赔率。'
  }
];

// 赔率训练题库
const ODDS_QUESTIONS = [
  {
    scenario: '你有同花听牌，底池100，对手下注50',
    question: '你应该跟注吗？',
    correctAnswer: '跟注',
    explanation: '你需要跟注50去赢取150，赔率是3:1。同花听牌的胜率约36%，有足够的赔率跟注。'
  },
  {
    scenario: '你有两头顺听牌，底池100，对手下注100',
    question: '你应该跟注吗？',
    correctAnswer: '弃牌',
    explanation: '你需要跟注100去赢取200，赔率是2:1。两头顺听牌的胜率约32%，赔率不够。'
  },
  {
    scenario: '你有卡顺听牌，底池200，对手下注50',
    question: '你应该跟注吗？',
    correctAnswer: '跟注',
    explanation: '你需要跟注50去赢取250，赔率是5:1。卡顺听牌的胜率约17%，有足够的赔率跟注。'
  },
  {
    scenario: '你有同花听牌加两头顺听牌，底池100，对手下注100',
    question: '你应该跟注吗？',
    correctAnswer: '跟注',
    explanation: '你需要跟注100去赢取200，赔率是2:1。组合听牌的胜率约50%，有很好的赔率。'
  },
  {
    scenario: '你有内听顺子，底池100，对手下注200',
    question: '你应该跟注吗？',
    correctAnswer: '弃牌',
    explanation: '你需要跟注200去赢取300，赔率是1.5:1。内听顺子的胜率约17%，赔率远远不够。'
  }
];

// 诈唬训练题库
const BLUFFING_QUESTIONS = [
  {
    scenario: '你在河牌圈完全没击中，牌面很干燥，对手过牌',
    question: '应该诈唬吗？',
    correctAnswer: '可以诈唬',
    explanation: '干燥牌面，对手可能也没击中。小到中等下注的诈唬成功率较高。'
  },
  {
    scenario: '你在河牌圈有听牌没中，牌面很湿润',
    question: '应该诈唬吗？',
    correctAnswer: '不应该诈唬',
    explanation: '湿润牌面，对手很可能击中了什么。诈唬成功率很低，应该放弃。'
  },
  {
    scenario: '你在转牌圈有听牌，对手示弱',
    question: '应该继续诈唬吗？',
    correctAnswer: '可以半诈唬',
    explanation: '你有听牌作为后备，半诈唬可以给对手施压。如果被跟注，还有机会击中听牌。'
  },
  {
    scenario: '你在河牌圈有中等牌力，对手示强',
    question: '应该诈唬加注吗？',
    correctAnswer: '不应该',
    explanation: '对手示强表明有强牌。用中等牌力诈唬加注风险太大，跟注是更好的选择。'
  },
  {
    scenario: '你在翻牌圈有后门听牌，对手过牌',
    question: '应该诈唬吗？',
    correctAnswer: '可以小额诈唬',
    explanation: '后门听牌提供了一些后备 equity。小额诈唬可以测试对手并建立底池潜力。'
  }
];

// 价值下注训练题库
const VALUE_BETTING_QUESTIONS = [
  {
    scenario: '你在河牌圈有顶对顶踢脚，对手过牌',
    question: '应该怎么下注？',
    correctAnswer: '下注底池的1/2到2/3',
    explanation: '你有强牌，应该价值下注。中等大小可以让更弱的牌跟注，最大化价值。'
  },
  {
    scenario: '你在河牌圈有两对，牌面有同花可能',
    question: '应该怎么下注？',
    correctAnswer: '下注底池的1/3',
    explanation: '两对是强牌，但牌面有同花威胁。小下注可以让更弱的牌跟注，同时控制风险。'
  },
  {
    scenario: '你在河牌圈有三条，对手示弱',
    question: '应该怎么下注？',
    correctAnswer: '下注底池的2/3',
    explanation: '三条是强牌，对手示弱表明牌力不强。较大的下注可以最大化价值。'
  },
  {
    scenario: '你在河牌圈有顺子，牌面很干燥',
    question: '应该怎么下注？',
    correctAnswer: '下注底池的2/3到满池',
    explanation: '顺子是强牌，干燥牌面很难有更大的牌。较大的下注可以最大化价值。'
  },
  {
    scenario: '你在河牌圈有同花，对手示强',
    question: '应该怎么下注？',
    correctAnswer: '过牌或小额下注',
    explanation: '对手示强可能有更大的同花或葫芦。过牌控制底池或小额下注试探是更安全的选择。'
  }
];

/**
 * 获取训练题
 */
export function getTrainingQuestions(type, count = 10) {
  let questions = [];
  
  switch (type) {
    case QUESTION_TYPES.PREFLOP:
      questions = PREFLOP_QUESTIONS;
      break;
    case QUESTION_TYPES.POSTFLOP:
      questions = POSTFLOP_QUESTIONS;
      break;
    case QUESTION_TYPES.BET_SIZING:
      questions = BET_SIZING_QUESTIONS;
      break;
    case QUESTION_TYPES.POSITION:
      questions = POSITION_QUESTIONS;
      break;
    case QUESTION_TYPES.RANGE:
      questions = RANGE_QUESTIONS;
      break;
    case QUESTION_TYPES.ODDS:
      questions = ODDS_QUESTIONS;
      break;
    case QUESTION_TYPES.BLUFFING:
      questions = BLUFFING_QUESTIONS;
      break;
    case QUESTION_TYPES.VALUE_BETTING:
      questions = VALUE_BETTING_QUESTIONS;
      break;
    default:
      // 返回混合题目
      questions = [
        ...PREFLOP_QUESTIONS,
        ...POSTFLOP_QUESTIONS,
        ...BET_SIZING_QUESTIONS,
        ...POSITION_QUESTIONS,
        ...RANGE_QUESTIONS,
        ...ODDS_QUESTIONS,
        ...BLUFFING_QUESTIONS,
        ...VALUE_BETTING_QUESTIONS
      ];
  }
  
  // 随机选择指定数量的题目
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q, index) => ({
    id: `q_${type}_${Date.now()}_${index}`,
    ...q,
    type,
    difficulty: 'medium',
    createdAt: new Date().toISOString()
  }));
}

/**
 * 获取所有训练类型
 */
export function getTrainingTypes() {
  return [
    { id: QUESTION_TYPES.PREFLOP, name: '翻前', description: '翻前决策训练' },
    { id: QUESTION_TYPES.POSTFLOP, name: '翻后', description: '翻后打法训练' },
    { id: QUESTION_TYPES.BET_SIZING, name: '下注大小', description: '下注大小优化' },
    { id: QUESTION_TYPES.POSITION, name: '位置', description: '位置意识训练' },
    { id: QUESTION_TYPES.RANGE, name: '范围', description: '范围理解训练' },
    { id: QUESTION_TYPES.ODDS, name: '赔率', description: '底池赔率计算' },
    { id: QUESTION_TYPES.BLUFFING, name: '诈唬', description: '诈唬时机把握' },
    { id: QUESTION_TYPES.VALUE_BETTING, name: '价值下注', description: '价值下注优化' }
  ];
}

export default {
  QUESTION_TYPES,
  getTrainingQuestions,
  getTrainingTypes
};
