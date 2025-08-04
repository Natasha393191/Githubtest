// 理財抽考遊戲計分系統

// 計分配置
export const SCORE_CONFIG = {
  BASE_SCORE: 10,           // 每答對一題的基礎分數
  PERFECT_BONUS: 20,        // 全部答對的額外獎勵
  TIME_BONUS_MAX: 5,        // 快速答題的最大時間獎勵
  DIFFICULTY_MULTIPLIER: {  // 題目難度倍數
    1: 1.0,    // 簡單
    2: 1.2,    // 中等  
    3: 1.5     // 困難
  },
  COMBO_MULTIPLIER: {       // 連擊倍數
    1: 1.0,    // 1連擊
    2: 1.2,    // 2連擊
    3: 1.5,    // 3連擊
    4: 2.0,    // 4連擊及以上
  },
  PERFECT_TIME_THRESHOLD: 10, // 快速答題的時間閾值（秒）
  SLOW_TIME_PENALTY: 0.8,     // 超時答題的分數懲罰倍數
  SLOW_TIME_THRESHOLD: 25,    // 慢速答題的時間閾值（秒）
};

// 計算單題分數
export const calculateQuestionScore = (isCorrect, timeTaken, difficulty = 1, combo = 0) => {
  if (!isCorrect) {
    return {
      baseScore: 0,
      timeBonus: 0,
      difficultyBonus: 0,
      comboBonus: 0,
      totalScore: 0,
      details: {
        reason: '答案錯誤',
        timeTaken: timeTaken
      }
    };
  }

  // 基礎分數
  let baseScore = SCORE_CONFIG.BASE_SCORE;
  
  // 難度加分
  const difficultyMultiplier = SCORE_CONFIG.DIFFICULTY_MULTIPLIER[difficulty] || 1.0;
  const difficultyBonus = Math.round(baseScore * (difficultyMultiplier - 1.0));
  
  // 時間獎勵/懲罰
  let timeBonus = 0;
  let timePenalty = 1.0;
  
  if (timeTaken <= SCORE_CONFIG.PERFECT_TIME_THRESHOLD) {
    // 快速答題獎勵
    const timeRatio = (SCORE_CONFIG.PERFECT_TIME_THRESHOLD - timeTaken) / SCORE_CONFIG.PERFECT_TIME_THRESHOLD;
    timeBonus = Math.round(SCORE_CONFIG.TIME_BONUS_MAX * timeRatio);
  } else if (timeTaken >= SCORE_CONFIG.SLOW_TIME_THRESHOLD) {
    // 超時答題懲罰
    timePenalty = SCORE_CONFIG.SLOW_TIME_PENALTY;
  }
  
  // 連擊加分
  const comboLevel = Math.min(combo, 4); // 最高4連擊
  const comboMultiplier = getComboMultiplier(comboLevel);
  const comboBonus = Math.round(baseScore * (comboMultiplier - 1.0));
  
  // 計算總分
  let totalScore = baseScore + difficultyBonus + timeBonus + comboBonus;
  totalScore = Math.round(totalScore * timePenalty);
  
  return {
    baseScore,
    timeBonus,
    difficultyBonus,
    comboBonus,
    timePenalty,
    totalScore,
    details: {
      difficulty,
      timeTaken,
      combo,
      comboMultiplier,
      difficultyMultiplier,
      timePenalty
    }
  };
};

// 獲取連擊倍數
const getComboMultiplier = (combo) => {
  if (combo >= 4) return SCORE_CONFIG.COMBO_MULTIPLIER[4];
  return SCORE_CONFIG.COMBO_MULTIPLIER[combo] || 1.0;
};

// 計算總分數
export const calculateScore = (answers, maxCombo = 0) => {
  if (!answers || answers.length === 0) {
    return {
      totalScore: 0,
      baseScoreSum: 0,
      bonusScoreSum: 0,
      perfectBonus: 0,
      questionScores: [],
      correctCount: 0,
      totalQuestions: 0,
      accuracy: 0,
      maxCombo: 0,
      averageTime: 0
    };
  }

  let totalScore = 0;
  let baseScoreSum = 0;
  let bonusScoreSum = 0;
  let correctCount = 0;
  let totalTime = 0;
  let currentCombo = 0;
  let calculatedMaxCombo = 0;
  
  const questionScores = [];

  // 計算每題分數
  answers.forEach((answer, index) => {
    const difficulty = answer.difficulty || 1;
    
    // 更新連擊
    if (answer.isCorrect) {
      currentCombo++;
      calculatedMaxCombo = Math.max(calculatedMaxCombo, currentCombo);
      correctCount++;
    } else {
      currentCombo = 0;
    }
    
    // 計算單題分數
    const questionScore = calculateQuestionScore(
      answer.isCorrect,
      answer.timeTaken,
      difficulty,
      currentCombo
    );
    
    questionScores.push({
      ...questionScore,
      questionIndex: index,
      questionId: answer.questionId
    });
    
    totalScore += questionScore.totalScore;
    baseScoreSum += questionScore.baseScore;
    bonusScoreSum += (questionScore.timeBonus + questionScore.difficultyBonus + questionScore.comboBonus);
    totalTime += answer.timeTaken;
  });

  // 完美完成獎勵（全部答對）
  let perfectBonus = 0;
  if (correctCount === answers.length && answers.length > 0) {
    perfectBonus = SCORE_CONFIG.PERFECT_BONUS;
    totalScore += perfectBonus;
  }

  // 計算統計數據
  const accuracy = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;
  const averageTime = answers.length > 0 ? totalTime / answers.length : 0;

  return {
    totalScore,
    baseScoreSum,
    bonusScoreSum,
    perfectBonus,
    questionScores,
    correctCount,
    totalQuestions: answers.length,
    accuracy: Math.round(accuracy),
    maxCombo: Math.max(maxCombo, calculatedMaxCombo),
    averageTime: Math.round(averageTime),
    breakdown: {
      baseScore: baseScoreSum,
      timeBonus: questionScores.reduce((sum, q) => sum + q.timeBonus, 0),
      difficultyBonus: questionScores.reduce((sum, q) => sum + q.difficultyBonus, 0),
      comboBonus: questionScores.reduce((sum, q) => sum + q.comboBonus, 0),
      perfectBonus: perfectBonus,
      totalBefore: totalScore - perfectBonus,
      finalTotal: totalScore
    }
  };
};

// 計算分數等級
export const getScoreGrade = (totalScore, maxPossibleScore) => {
  if (maxPossibleScore === 0) return { grade: 'F', description: '無法評分' };
  
  const percentage = (totalScore / maxPossibleScore) * 100;
  
  if (percentage >= 95) {
    return { grade: 'S', description: '完美表現', color: '#FFD700' }; // 金色
  } else if (percentage >= 85) {
    return { grade: 'A', description: '優秀', color: '#32CD32' }; // 綠色
  } else if (percentage >= 75) {
    return { grade: 'B', description: '良好', color: '#1E90FF' }; // 藍色
  } else if (percentage >= 60) {
    return { grade: 'C', description: '及格', color: '#FFA500' }; // 橙色
  } else {
    return { grade: 'D', description: '需要加強', color: '#DC143C' }; // 紅色
  }
};

// 計算理論最高分數
export const calculateMaxPossibleScore = (questions) => {
  if (!questions || questions.length === 0) return 0;
  
  let maxScore = 0;
  
  questions.forEach((question, index) => {
    const difficulty = question.difficulty || 1;
    const combo = index + 1; // 假設全部連擊
    
    // 計算理想情況下的分數（快速答題）
    const questionScore = calculateQuestionScore(
      true, // 答對
      SCORE_CONFIG.PERFECT_TIME_THRESHOLD - 1, // 快速答題
      difficulty,
      combo
    );
    
    maxScore += questionScore.totalScore;
  });
  
  // 加上完美獎勵
  maxScore += SCORE_CONFIG.PERFECT_BONUS;
  
  return maxScore;
};

// 分析分數表現
export const analyzePerformance = (scoreData, questions = []) => {
  const maxPossible = calculateMaxPossibleScore(questions);
  const grade = getScoreGrade(scoreData.totalScore, maxPossible);
  
  // 分析強弱項
  const strengths = [];
  const improvements = [];
  
  if (scoreData.accuracy >= 80) {
    strengths.push('答題準確率很高');
  } else if (scoreData.accuracy < 60) {
    improvements.push('需要提高答題準確率');
  }
  
  if (scoreData.maxCombo >= 3) {
    strengths.push('連續答對能力強');
  } else if (scoreData.maxCombo <= 1) {
    improvements.push('加強理財知識的穩定性');
  }
  
  if (scoreData.averageTime <= 15) {
    strengths.push('答題速度很快');
  } else if (scoreData.averageTime >= 25) {
    improvements.push('可以提高答題速度');
  }
  
  if (scoreData.perfectBonus > 0) {
    strengths.push('完美完成所有題目');
  }
  
  // 生成建議
  const suggestions = [];
  if (scoreData.accuracy < 70) {
    suggestions.push('建議多複習理財基礎知識');
  }
  if (scoreData.averageTime > 20) {
    suggestions.push('熟悉常見理財概念可以提高答題速度');
  }
  if (scoreData.maxCombo < 2) {
    suggestions.push('系統性學習理財知識，建立知識體系');
  }
  
  return {
    grade,
    maxPossibleScore: maxPossible,
    scorePercentage: Math.round((scoreData.totalScore / maxPossible) * 100),
    strengths,
    improvements,
    suggestions,
    performance: {
      accuracy: scoreData.accuracy >= 75 ? 'excellent' : scoreData.accuracy >= 60 ? 'good' : 'needs_improvement',
      speed: scoreData.averageTime <= 15 ? 'excellent' : scoreData.averageTime <= 20 ? 'good' : 'needs_improvement',
      consistency: scoreData.maxCombo >= 3 ? 'excellent' : scoreData.maxCombo >= 2 ? 'good' : 'needs_improvement'
    }
  };
};

// 生成分數報告
export const generateScoreReport = (gameState) => {
  const scoreData = calculateScore(gameState.answers, gameState.maxCombo);
  const analysis = analyzePerformance(scoreData, gameState.questions);
  
  return {
    basic: {
      totalScore: scoreData.totalScore,
      accuracy: scoreData.accuracy,
      correctCount: scoreData.correctCount,
      totalQuestions: scoreData.totalQuestions,
      maxCombo: scoreData.maxCombo,
      averageTime: scoreData.averageTime
    },
    detailed: scoreData,
    analysis: analysis,
    questions: gameState.questions.map((question, index) => ({
      question: question.question,
      userAnswer: gameState.answers[index]?.selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: gameState.answers[index]?.isCorrect,
      timeTaken: gameState.answers[index]?.timeTaken,
      score: scoreData.questionScores[index]?.totalScore || 0
    }))
  };
};

export default {
  calculateQuestionScore,
  calculateScore,
  getScoreGrade,
  calculateMaxPossibleScore,
  analyzePerformance,
  generateScoreReport,
  SCORE_CONFIG
};