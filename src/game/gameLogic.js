// 理財抽考遊戲核心邏輯
import { generateDailyQuestions } from '../data/questionBank';
import { calculateScore, SCORE_CONFIG } from './scoringSystem';

// 遊戲常數配置
export const GAME_CONFIG = {
  ALLOWED_TIME_START: 21, // 晚上9點
  ALLOWED_TIME_END: 23,   // 晚上11點
  MIN_QUESTIONS: 3,
  MAX_QUESTIONS: 5,
  QUESTION_TIME_LIMIT: 30, // 每題30秒
  TOTAL_TIME_LIMIT: 300,   // 總時間5分鐘
};

export const GAME_STATUS = {
  NOT_AVAILABLE: 'not_available',    // 不在遊戲時間
  AVAILABLE: 'available',            // 可以開始遊戲
  IN_PROGRESS: 'in_progress',        // 遊戲進行中
  COMPLETED: 'completed',            // 今日已完成
  TIME_UP: 'time_up',               // 時間到
};

// 檢查遊戲可用性
export const checkGameAvailability = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const today = now.toDateString();
  
  // 檢查時間是否在允許範圍內（晚上9-11點）
  const isTimeAllowed = currentHour >= GAME_CONFIG.ALLOWED_TIME_START && 
                       currentHour < GAME_CONFIG.ALLOWED_TIME_END;
  
  // 檢查今天是否已經玩過（從本地存儲讀取）
  const lastPlayDate = getLastPlayDate();
  const hasPlayedToday = lastPlayDate === today;
  
  if (hasPlayedToday) {
    return {
      status: GAME_STATUS.COMPLETED,
      message: '今天已經完成抽考遊戲了！明天再來挑戰吧。',
      nextAvailableTime: getNextAvailableTime()
    };
  }
  
  if (!isTimeAllowed) {
    return {
      status: GAME_STATUS.NOT_AVAILABLE,
      message: `抽考遊戲時間為每日晚上${GAME_CONFIG.ALLOWED_TIME_START}:00-${GAME_CONFIG.ALLOWED_TIME_END}:00`,
      nextAvailableTime: getNextAvailableTime()
    };
  }
  
  return {
    status: GAME_STATUS.AVAILABLE,
    message: '可以開始今日抽考遊戲！',
    nextAvailableTime: null
  };
};

// 獲取下次可遊戲時間
const getNextAvailableTime = () => {
  const now = new Date();
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // 如果當前時間早於今天的開始時間，返回今天的開始時間
  if (now.getHours() < GAME_CONFIG.ALLOWED_TIME_START) {
    today.setHours(GAME_CONFIG.ALLOWED_TIME_START, 0, 0, 0);
    return today;
  }
  
  // 否則返回明天的開始時間
  tomorrow.setHours(GAME_CONFIG.ALLOWED_TIME_START, 0, 0, 0);
  return tomorrow;
};

// 初始化遊戲
export const initializeGame = async (userExpenses = null) => {
  const availability = checkGameAvailability();
  
  if (availability.status !== GAME_STATUS.AVAILABLE) {
    throw new Error(availability.message);
  }
  
  // 隨機決定題目數量（3-5題）
  const questionCount = Math.floor(Math.random() * 
    (GAME_CONFIG.MAX_QUESTIONS - GAME_CONFIG.MIN_QUESTIONS + 1)) + GAME_CONFIG.MIN_QUESTIONS;
  
  // 獲取今日消費記錄
  const expenses = userExpenses || await getTodayExpenses();
  
  // 生成個人化問題
  const questions = generateDailyQuestions(expenses, {}, questionCount);
  
  // 創建遊戲狀態
  const gameState = {
    id: `game_${Date.now()}`,
    status: GAME_STATUS.IN_PROGRESS,
    questions: questions,
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    startTime: Date.now(),
    endTime: null,
    timeRemaining: GAME_CONFIG.TOTAL_TIME_LIMIT,
    expenses: expenses
  };
  
  // 保存遊戲狀態
  saveGameState(gameState);
  
  return gameState;
};

// 提交答案
export const submitAnswer = (gameState, questionIndex, selectedAnswer, timeTaken) => {
  if (gameState.status !== GAME_STATUS.IN_PROGRESS) {
    throw new Error('遊戲不在進行狀態');
  }
  
  if (questionIndex !== gameState.currentQuestionIndex) {
    throw new Error('題目索引不匹配');
  }
  
  const question = gameState.questions[questionIndex];
  const isCorrect = selectedAnswer === question.correctAnswer;
  
  // 記錄答案
  const answerRecord = {
    questionId: question.id,
    questionIndex: questionIndex,
    selectedAnswer: selectedAnswer,
    correctAnswer: question.correctAnswer,
    isCorrect: isCorrect,
    timeTaken: timeTaken,
    timestamp: Date.now()
  };
  
  gameState.answers.push(answerRecord);
  
  // 更新combo
  if (isCorrect) {
    gameState.combo += 1;
    gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
  } else {
    gameState.combo = 0;
  }
  
  // 計算當前分數
  const scoreData = calculateScore(gameState.answers, gameState.combo);
  gameState.score = scoreData.totalScore;
  
  // 移到下一題或結束遊戲
  if (questionIndex + 1 < gameState.questions.length) {
    gameState.currentQuestionIndex += 1;
  } else {
    // 遊戲結束
    gameState.status = GAME_STATUS.COMPLETED;
    gameState.endTime = Date.now();
    
    // 記錄今日完成
    setLastPlayDate(new Date().toDateString());
    
    // 保存最終結果
    saveFinalResult(gameState);
  }
  
  // 更新遊戲狀態
  saveGameState(gameState);
  
  return {
    ...gameState,
    lastAnswer: answerRecord,
    scoreData: scoreData
  };
};

// 獲取當前問題
export const getCurrentQuestion = (gameState) => {
  if (gameState.currentQuestionIndex >= gameState.questions.length) {
    return null;
  }
  
  return gameState.questions[gameState.currentQuestionIndex];
};

// 檢查遊戲時間
export const checkGameTime = (gameState) => {
  if (gameState.status !== GAME_STATUS.IN_PROGRESS) {
    return gameState;
  }
  
  const elapsed = Date.now() - gameState.startTime;
  const remaining = Math.max(0, GAME_CONFIG.TOTAL_TIME_LIMIT * 1000 - elapsed);
  
  gameState.timeRemaining = Math.floor(remaining / 1000);
  
  // 時間到了
  if (remaining <= 0) {
    gameState.status = GAME_STATUS.TIME_UP;
    gameState.endTime = Date.now();
    
    // 計算最終分數
    const scoreData = calculateScore(gameState.answers, gameState.maxCombo);
    gameState.score = scoreData.totalScore;
    
    // 記錄今日完成
    setLastPlayDate(new Date().toDateString());
    
    // 保存最終結果
    saveFinalResult(gameState);
    saveGameState(gameState);
  }
  
  return gameState;
};

// 獲取遊戲結果摘要
export const getGameSummary = (gameState) => {
  if (gameState.status !== GAME_STATUS.COMPLETED && gameState.status !== GAME_STATUS.TIME_UP) {
    return null;
  }
  
  const totalQuestions = gameState.questions.length;
  const answeredQuestions = gameState.answers.length;
  const correctAnswers = gameState.answers.filter(a => a.isCorrect).length;
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions * 100) : 0;
  const averageTime = gameState.answers.reduce((sum, a) => sum + a.timeTaken, 0) / answeredQuestions || 0;
  
  const scoreData = calculateScore(gameState.answers, gameState.maxCombo);
  
  return {
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    accuracy: Math.round(accuracy),
    maxCombo: gameState.maxCombo,
    totalScore: gameState.score,
    scoreBreakdown: scoreData,
    averageTime: Math.round(averageTime),
    gameTime: gameState.endTime - gameState.startTime,
    isTimeUp: gameState.status === GAME_STATUS.TIME_UP,
    completionRate: Math.round((answeredQuestions / totalQuestions) * 100)
  };
};

// 本地存儲相關函數
const STORAGE_KEYS = {
  GAME_STATE: '@FinanceQuiz:currentGameState',
  LAST_PLAY_DATE: '@FinanceQuiz:lastPlayDate',
  GAME_HISTORY: '@FinanceQuiz:gameHistory'
};

const saveGameState = (gameState) => {
  try {
    const serializedState = JSON.stringify(gameState);
    // 在實際應用中使用 AsyncStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, serializedState);
    }
  } catch (error) {
    console.error('保存遊戲狀態失敗:', error);
  }
};

const loadGameState = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const serializedState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      return serializedState ? JSON.parse(serializedState) : null;
    }
  } catch (error) {
    console.error('載入遊戲狀態失敗:', error);
  }
  return null;
};

const getLastPlayDate = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.LAST_PLAY_DATE);
    }
  } catch (error) {
    console.error('獲取最後遊戲日期失敗:', error);
  }
  return null;
};

const setLastPlayDate = (date) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LAST_PLAY_DATE, date);
    }
  } catch (error) {
    console.error('設置最後遊戲日期失敗:', error);
  }
};

const saveFinalResult = (gameState) => {
  try {
    const result = {
      id: gameState.id,
      date: new Date().toISOString(),
      summary: getGameSummary(gameState),
      questions: gameState.questions.length,
      correct: gameState.answers.filter(a => a.isCorrect).length,
      score: gameState.score,
      maxCombo: gameState.maxCombo
    };
    
    // 獲取歷史記錄
    let history = [];
    if (typeof localStorage !== 'undefined') {
      const existingHistory = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      if (existingHistory) {
        history = JSON.parse(existingHistory);
      }
    }
    
    // 添加新記錄
    history.push(result);
    
    // 只保留最近30天的記錄
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    history = history.filter(record => new Date(record.date) > thirtyDaysAgo);
    
    // 保存更新後的歷史
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('保存遊戲結果失敗:', error);
  }
};

// 獲取今日消費記錄（模擬函數，實際應用中會從資料庫讀取）
const getTodayExpenses = async () => {
  // 這裡應該從資料庫或API獲取真實的消費記錄
  // 暫時返回模擬數據
  return [
    { amount: 120, category: 'food', paymentMethod: '現金', description: '午餐', time: '12:30' },
    { amount: 80, category: 'transport', paymentMethod: '悠遊卡', description: '捷運', time: '08:30' },
    { amount: 350, category: 'entertainment', paymentMethod: '信用卡', description: '電影票', time: '19:00' },
    { amount: 200, category: 'food', paymentMethod: '行動支付', description: '晚餐', time: '18:30' }
  ];
};

// 導出工具函數
export {
  loadGameState,
  saveGameState,
  getLastPlayDate,
  setLastPlayDate
};