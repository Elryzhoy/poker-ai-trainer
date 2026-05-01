/**
 * AI Analysis Service
 * 使用小米MiMo API分析扑克手牌
 */

// 小米MiMo API配置
const MIMO_API_URL = 'https://api.xiaomimimo.com/v1';
const MIMO_API_KEY = process.env.MIMO_API_KEY || '';

/**
 * 调用小米MiMo API
 */
async function callMimoAPI(messages, maxTokens = 500) {
  try {
    const response = await fetch(`${MIMO_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIMO_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mimo-v2-flash',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error('MiMo API call failed:', error);
    return null;
  }
}

/**
 * 分析单手牌
 */
export async function analyzeHand(handData, userLevel = 'intermediate') {
  const { seats, actions, board, totalPot, smallBlind, bigBlind } = handData;
  
  const handDescription = `
    盲注: $${smallBlind}/$${bigBlind}
    玩家: ${seats.map(s => `${s.playerName} ($${s.stackSize})`).join(', ')}
    公共牌: ${board.join(' ') || '未显示'}
    总底池: $${totalPot}
    
    操作:
    ${actions.map(a => `${a.player}: ${a.action}${a.amount ? ' $' + a.amount : ''}`).join('\n')}
  `;

  const messages = [
    {
      role: 'system',
      content: `你是一位专业的德州扑克教练。分析以下手牌并提供详细反馈。
      重点关注：
      1. EV（期望值）损失
      2. 位置错误
      3. 范围错误
      4. 下注大小问题
      5. 整体策略评估
      
      基于GTO（博弈论最优）原则提供建议。
      引用《现代扑克理论》和《扑克理论》中的概念。
      
      保持回复简洁且可操作。使用中文回复。`
    },
    {
      role: 'user',
      content: `分析这手牌（${userLevel}水平）：\n${handDescription}`
    }
  ];

  const result = await callMimoAPI(messages, 500);
  
  if (result) {
    return {
      analysis: result.content,
      tokensUsed: result.tokensUsed,
      model: 'mimo-v2-flash'
    };
  }

  // 如果API失败，返回模拟数据
  return getMockAnalysis(handData);
}

/**
 * 生成训练题
 */
export async function generateTrainingQuestions(weakAreas, count = 10) {
  const messages = [
    {
      role: 'system',
      content: `你是一位扑克训练内容生成器。创建教育性的扑克场景。
      
      生成${count}个扑克训练题，重点关注以下弱项：
      ${weakAreas.join(', ')}
      
      对于每个问题：
      1. 呈现场景
      2. 问最优打法是什么
      3. 提供正确答案和解释
      
      返回JSON数组，每个元素包含：scenario, question, correctAnswer, explanation字段。
      使用中文回复。`
    },
    {
      role: 'user',
      content: `生成${count}个训练题，重点：${weakAreas.join(', ')}`
    }
  ];

  const result = await callMimoAPI(messages, 2000);
  
  if (result) {
    try {
      // 尝试从回复中提取JSON
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions.map((q, index) => ({
          id: `q_${Date.now()}_${index}`,
          ...q,
          difficulty: 'medium',
          weakArea: weakAreas[index % weakAreas.length],
          createdAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      console.error('Failed to parse JSON from AI response');
    }
  }

  // 如果API失败，返回模拟数据
  return getMockTrainingQuestions(weakAreas, count);
}

/**
 * 生成错误报告
 */
export async function generateErrorReport(handHistoryResults) {
  const errorSummary = handHistoryResults.map(r => ({
    handId: r.id,
    errors: r.errors || []
  }));

  const messages = [
    {
      role: 'system',
      content: `你是一位扑克统计分析师。为扑克玩家创建详细的错误报告。
      
      提供：
      1. 最常见的5个错误
      2. 按位置统计的错误频率
      3. 按街道（翻前/翻牌/转牌/河牌）统计的错误频率
      4. 具体的改进建议
      5. 建议的训练重点
      
      使用中文回复。`
    },
    {
      role: 'user',
      content: `分析这些扑克错误并创建报告：\n${JSON.stringify(errorSummary, null, 2)}`
    }
  ];

  const result = await callMimoAPI(messages, 1500);
  
  if (result) {
    return {
      report: result.content,
      tokensUsed: result.tokensUsed
    };
  }

  // 如果API失败，返回模拟数据
  return getMockErrorReport();
}

/**
 * 模拟分析数据
 */
function getMockAnalysis(handData) {
  return {
    analysis: `
      **手牌分析**
      
      **关键观察：**
      • 这手牌展示了标准的翻前打法
      • 翻后的决策可以改进
      
      **EV分析：**
      • 翻前: +0.5 BB 期望值
      • 翻牌: -0.2 BB 由于过度下注
      
      **GTO建议：**
      • 考虑在翻牌圈使用更小的下注大小
      • 范围分析表明在前位应更紧
      
      **学习要点：**
      1. 位置在扑克中至关重要
      2. 下注大小影响长期盈利能力
      3. 范围意识提高决策质量
    `,
    tokensUsed: 0,
    model: 'mock'
  };
}

/**
 * 模拟训练题
 */
function getMockTrainingQuestions(weakAreas, count) {
  const questions = [];
  
  const scenarios = [
    { hand: 'AKs', position: 'UTG', action: '加注', answer: '加注3BB', explanation: 'AKs是强牌，在枪口位应该加注。3BB是标准大小，可以建立底池并隔离较弱的手牌。' },
    { hand: '72o', position: 'BTN', action: '弃牌', answer: '弃牌', explanation: '72o是最差的手牌，即使在按钮位也应该弃牌。' },
    { hand: 'QQ', position: 'CO', action: '加注', answer: '加注3BB', explanation: 'QQ是强牌，在关煞位应该加注。如果前面有人加注，可以考虑3bet。' },
    { hand: 'A5s', position: 'SB', action: '跟注', answer: '跟注', explanation: 'A5s在小盲位面对大盲的加注可以跟注，有不错的隐含赔率。' },
    { hand: 'KQo', position: 'MP', action: '加注', answer: '加注2.5BB', explanation: 'KQo在中间位是不错的牌，可以加注。如果前面有人加注，需要根据对手范围决定。' },
    { hand: 'JTs', position: 'BTN', action: '加注', answer: '加注2.5BB', explanation: 'JTs在按钮位是很好的牌，可以加注。有很好的翻后可玩性。' },
    { hand: '88', position: 'UTG', action: '加注', answer: '加注2.5BB', explanation: '88在枪口位可以加注，但要注意翻后如果出现高牌要谨慎。' },
    { hand: 'AJo', position: 'CO', action: '3bet', answer: '3bet', explanation: 'AJo在关煞位面对前面的加注可以3bet，但如果对手4bet要考虑弃牌。' },
    { hand: '98s', position: 'BTN', action: '加注', answer: '加注2.5BB', explanation: '98s在按钮位是很好的牌，可以加注。有很好的同花和顺子潜力。' },
    { hand: 'KK', position: 'MP', action: '加注', answer: '加注3BB', explanation: 'KK是第二强的起手牌，应该加注。如果前面有人加注，应该3bet。' }
  ];
  
  for (let i = 0; i < count; i++) {
    const scenario = scenarios[i % scenarios.length];
    questions.push({
      id: `q_${Date.now()}_${i}`,
      scenario: `场景${i + 1}：你在${scenario.position}位拿到${scenario.hand}`,
      question: `最优打法是什么？`,
      correctAnswer: scenario.answer,
      explanation: scenario.explanation,
      difficulty: 'medium',
      weakArea: weakAreas[i % weakAreas.length],
      createdAt: new Date().toISOString()
    });
  }
  
  return questions;
}

/**
 * 模拟错误报告
 */
function getMockErrorReport() {
  return {
    report: `
      **错误报告摘要**
      
      **最常见5个错误：**
      1. 在干燥牌面过度下注 (35%的错误)
      2. 在前位跟注太宽 (28%)
      3. 价值下注不够薄 (22%)
      4. 面对3bet弃牌太多 (15%)
      5. 河牌决策差 (10%)
      
      **按位置统计的错误：**
      • UTG: 25%的错误
      • MP: 20%的错误
      • CO: 15%的错误
      • BTN: 20%的错误
      • SB/BB: 20%的错误
      
      **改进建议：**
      1. 学习不同牌面的下注大小
      2. 复习前位开池范围
      3. 练习薄价值下注场景
    `,
    tokensUsed: 0
  };
}

export default {
  analyzeHand,
  generateTrainingQuestions,
  generateErrorReport
};
