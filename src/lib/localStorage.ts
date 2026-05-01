/**
 * Local Storage Service
 * 用于在没有Supabase时保存数据到浏览器本地
 */

const STORAGE_KEYS = {
  HAND_HISTORY: 'poker_ai_hand_history',
  TRAINING_RESULTS: 'poker_ai_training_results',
  USER_STATS: 'poker_ai_user_stats',
  RANGE_PROGRESS: 'poker_ai_range_progress'
};

interface HandHistory {
  id: string;
  platform: string;
  smallBlind: number;
  bigBlind: number;
  seats: Array<{
    seatNumber: number;
    playerName: string;
    stackSize: number;
  }>;
  actions: Array<{
    player: string;
    action: string;
    amount?: number;
  }>;
  board: string[];
  totalPot: number;
}

interface TrainingResult {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  weakArea: string;
  timestamp?: string;
}

interface RangeProgress {
  [key: string]: {
    total: number;
    correct: number;
  };
}

interface HandStats {
  totalHands: number;
  totalSessions: number;
  biggestWin: number;
  biggestLoss: number;
  averageEV: number;
  winRate: number;
}

interface TrainingStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  streak: number;
  weakAreas: string[];
  strongAreas: string[];
}

// 保存手牌历史
export function saveHandHistory(hands: HandHistory[]): boolean {
  try {
    const existing = getHandHistory();
    const updated = [...existing, ...hands].slice(-1000); // 最多保存1000手
    localStorage.setItem(STORAGE_KEYS.HAND_HISTORY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to save hand history:', e);
    return false;
  }
}

// 获取手牌历史
export function getHandHistory(): HandHistory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HAND_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// 保存训练结果
export function saveTrainingResult(result: TrainingResult): boolean {
  try {
    const existing = getTrainingResults();
    existing.push({
      ...result,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.TRAINING_RESULTS, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error('Failed to save training result:', e);
    return false;
  }
}

// 获取训练结果
export function getTrainingResults(): TrainingResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRAINING_RESULTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// 获取训练统计
export function getTrainingStats(): TrainingStats {
  const results = getTrainingResults();
  
  if (results.length === 0) {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      streak: 0,
      weakAreas: [],
      strongAreas: []
    };
  }

  const totalQuestions = results.length;
  const correctAnswers = results.filter((r: TrainingResult) => r.isCorrect).length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  // 计算连续正确
  let streak = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].isCorrect) {
      streak++;
    } else {
      break;
    }
  }

  // 分析弱项和强项
  const areaStats: { [key: string]: { total: number; correct: number } } = {};
  results.forEach((result: TrainingResult) => {
    const area = result.weakArea || 'general';
    if (!areaStats[area]) {
      areaStats[area] = { total: 0, correct: 0 };
    }
    areaStats[area].total++;
    if (result.isCorrect) areaStats[area].correct++;
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
    accuracy,
    streak,
    weakAreas,
    strongAreas
  };
}

// 保存范围训练进度
export function saveRangeProgress(position: string, stackDepth: string, action: string, isCorrect: boolean): boolean {
  try {
    const existing = getRangeProgress();
    const key = `${position}_${stackDepth}_${action}`;
    
    if (!existing[key]) {
      existing[key] = { total: 0, correct: 0 };
    }
    
    existing[key].total++;
    if (isCorrect) existing[key].correct++;
    
    localStorage.setItem(STORAGE_KEYS.RANGE_PROGRESS, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error('Failed to save range progress:', e);
    return false;
  }
}

// 获取范围训练进度
export function getRangeProgress(): RangeProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RANGE_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

// 获取手牌统计
export function getHandStats(): HandStats {
  const hands = getHandHistory();
  
  if (hands.length === 0) {
    return {
      totalHands: 0,
      totalSessions: 0,
      biggestWin: 0,
      biggestLoss: 0,
      averageEV: 0,
      winRate: 0
    };
  }

  return {
    totalHands: hands.length,
    totalSessions: Math.ceil(hands.length / 50), // 假设每session约50手
    biggestWin: 150, // 模拟数据
    biggestLoss: -80,
    averageEV: 0.5,
    winRate: 55.2
  };
}

// 清除所有数据
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export default {
  saveHandHistory,
  getHandHistory,
  saveTrainingResult,
  getTrainingResults,
  getTrainingStats,
  saveRangeProgress,
  getRangeProgress,
  getHandStats,
  clearAllData
};
