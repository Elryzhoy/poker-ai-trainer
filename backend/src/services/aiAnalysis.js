/**
 * AI Analysis Service
 * Analyzes poker hands using OpenAI GPT-4o
 */

import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Token limits for cost control
const TOKEN_LIMITS = {
  HAND_REVIEW: 10000, // Max tokens for 100 hand review
  TRAINING_QUESTION: 50, // Max tokens per training question
  DAILY_TRAINING: 5000, // Max tokens for 100 daily questions
};

/**
 * Analyze a single hand and provide feedback
 */
export async function analyzeHand(handData, userLevel = 'intermediate') {
  if (!openai) {
    return getMockAnalysis(handData);
  }

  const prompt = buildAnalysisPrompt(handData, userLevel);
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert poker coach specializing in Texas Hold'em. 
          Analyze the following hand and provide detailed feedback.
          Focus on:
          1. EV (Expected Value) losses
          2. Position errors
          3. Range errors
          4. Bet sizing issues
          5. Overall strategy assessment
          
          Provide explanations based on GTO (Game Theory Optimal) principles.
          Reference concepts from "The Theory of Poker" by David Sklansky and 
          "Modern Poker Theory" by Michael Acevedo when applicable.
          
          Keep your response concise and actionable.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500, // Limit tokens per hand
      temperature: 0.7
    });

    return {
      analysis: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens,
      model: 'gpt-4o'
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return getMockAnalysis(handData);
  }
}

/**
 * Build analysis prompt from hand data
 */
function buildAnalysisPrompt(handData, userLevel) {
  const { seats, actions, board, totalPot, smallBlind, bigBlind } = handData;
  
  // Format the hand history for the AI
  const handDescription = `
    Blinds: $${smallBlind}/$${bigBlind}
    Players: ${seats.map(s => `${s.playerName} ($${s.stackSize})`).join(', ')}
    Board: ${board.join(' ') || 'Not shown'}
    Total pot: $${totalPot}
    
    Actions:
    ${actions.map(a => `${a.player}: ${a.action}${a.amount ? ' $' + a.amount : ''}`).join('\n')}
  `;

  return `
    Analyze this poker hand for a ${userLevel} player:
    
    ${handDescription}
    
    Please provide:
    1. Key mistakes made (if any)
    2. EV analysis for critical decisions
    3. GTO-optimal play suggestions
    4. Learning points
    
    Format your response with clear sections and bullet points.
  `;
}

/**
 * Generate training questions based on user's weak areas
 */
export async function generateTrainingQuestions(weakAreas, count = 10) {
  if (!openai) {
    return getMockTrainingQuestions(weakAreas, count);
  }

  const prompt = `
    Generate ${count} poker training questions focusing on these weak areas:
    ${weakAreas.join(', ')}
    
    For each question:
    1. Present a scenario
    2. Ask what the optimal play is
    3. Provide the correct answer with explanation
    
    Format as JSON array with fields: scenario, question, correctAnswer, explanation
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a poker training content generator. Create educational poker scenarios.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.8
    });

    const content = response.choices[0].message.content;
    // Try to parse JSON from the response
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse JSON from AI response');
    }
    
    return getMockTrainingQuestions(weakAreas, count);
  } catch (error) {
    console.error('Training question generation failed:', error);
    return getMockTrainingQuestions(weakAreas, count);
  }
}

/**
 * Analyze user's error patterns and generate report
 */
export async function generateErrorReport(handHistoryResults) {
  if (!openai) {
    return getMockErrorReport();
  }

  const errorSummary = handHistoryResults.map(r => ({
    handId: r.id,
    errors: r.errors || []
  }));

  const prompt = `
    Analyze these poker errors and create a comprehensive error report:
    
    ${JSON.stringify(errorSummary, null, 2)}
    
    Provide:
    1. Top 5 most common errors
    2. Error frequency by position
    3. Error frequency by street (preflop/flop/turn/river)
    4. Specific improvement recommendations
    5. Suggested training focus areas
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a poker statistics analyst. Create detailed error reports for poker players.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.6
    });

    return {
      report: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens
    };
  } catch (error) {
    console.error('Error report generation failed:', error);
    return getMockErrorReport();
  }
}

/**
 * Mock analysis for development/testing
 */
function getMockAnalysis(handData) {
  return {
    analysis: `
      **Hand Analysis**
      
      **Key Observations:**
      • This hand shows a standard preflop play
      • Post-flop decisions could be improved
      
      **EV Analysis:**
      • Preflop: +0.5 BB expected value
      • Flop: -0.2 BB due to over-betting
      
      **GTO Suggestions:**
      • Consider smaller bet sizing on the flop
      • Range analysis suggests tighter play in early position
      
      **Learning Points:**
      1. Position is crucial in poker
      2. Bet sizing affects long-term profitability
      3. Range awareness improves decision making
    `,
    tokensUsed: 0,
    model: 'mock'
  };
}

/**
 * Mock training questions for development/testing
 */
function getMockTrainingQuestions(weakAreas, count) {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    questions.push({
      scenario: `Scenario ${i + 1}: You're in ${weakAreas[i % weakAreas.length]} position with AKs.`,
      question: 'What is the optimal play?',
      correctAnswer: 'Raise 3x BB',
      explanation: `In ${weakAreas[i % weakAreas.length]} position, AKs is a strong hand that should be raised for value. The 3x BB sizing is standard and builds the pot while potentially isolating weaker hands.`
    });
  }
  
  return questions;
}

/**
 * Mock error report for development/testing
 */
function getMockErrorReport() {
  return {
    report: `
      **Error Report Summary**
      
      **Top 5 Common Errors:**
      1. Over-betting on dry boards (35% of errors)
      2. Calling too wide in early position (28%)
      3. Not value betting thin enough (22%)
      4. Folding too much to 3-bets (15%)
      5. Poor river decisions (10%)
      
      **Error by Position:**
      • UTG: 25% of errors
      • MP: 20% of errors
      • CO: 15% of errors
      • BTN: 20% of errors
      • SB/BB: 20% of errors
      
      **Recommendations:**
      1. Study bet sizing on different board textures
      2. Review early position opening ranges
      3. Practice thin value betting spots
    `,
    tokensUsed: 0
  };
}

export default {
  analyzeHand,
  generateTrainingQuestions,
  generateErrorReport,
  TOKEN_LIMITS
};
