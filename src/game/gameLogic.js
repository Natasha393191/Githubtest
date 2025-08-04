// =============================================
// 理財抽考遊戲 - 核心邏輯
// =============================================

import { 
  generateDailyQuestions, 
  validateQuestionAnswer,
  DIFFICULTY_WEIGHTS,
  GAME_CONFIG 
} from './questionBank';

import {
  startQuizSession,
  completeQuizSession,
  recordQuizResult,
  addUserPoints,
  unlockAchievement
} from '../database/database';

// 遊戲狀態枚舉
export const GAME_STATES = {
  IDLE: 'idle',                    // 未開始
  LOADING: 'loading',              // 載入中
  READY: 'ready',                  // 準備開始
  PLAYING: 'playing',              // 遊戲中
  QUESTION_RESULT: 'question_result', // 顯示單題結果
  COMPLETED: 'completed',          // 遊戲完成
  TIME_RESTRICTED: 'time_restricted', // 時間限制
  ERROR: 'error'                   // 錯誤狀態
};

// Combo倍數設定
export const COMBO_MULTIPLIERS = {
  0: 1.0,   // 無combo
  1: 1.0,   // 1題連對
  2: 1.2,   // 2題連對
  3: 1.5,   // 3題連對  
  4: 2.0,   // 4題連對以上
};

// 獎勵分數設定
export const BONUS_SCORES = {
  PERFECT_GAME: 20,     // 全對獎勵
  FAST_ANSWER: 5,       // 快速答題獎勵 (5秒內)
  DAILY_FIRST: 10,      // 當日首次遊戲
};

// 遊戲核心邏輯類別
export class GameEngine {
  constructor() {
    this.gameState = {
      sessionId: null,
      userId: 1,
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      scores: [],
      combo: 0,
      maxCombo: 0,
      totalScore: 0,
      startTime: null,
      endTime: null,
      gameState: GAME_STATES.IDLE,
      isFirstGameToday: false
    };
  }

  // 重置遊戲狀態
  resetGame() {
    this.gameState = {
      ...this.gameState,
      sessionId: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      scores: [],
      combo: 0,
      maxCombo: 0,
      totalScore: 0,
      startTime: null,
      endTime: null,
      gameState: GAME_STATES.IDLE,
      isFirstGameToday: false
    };
  }

  // 檢查遊戲時間限制
  checkGameTimeRestriction() {
    const now = new Date();
    const currentHour = now.getHours();
    
    const isInGameTime = currentHour >= GAME_CONFIG.GAME_TIME_START && 
                        currentHour < GAME_CONFIG.GAME_TIME_END;
    
    return {
      allowed: isInGameTime,
      currentHour,
      gameStartTime: GAME_CONFIG.GAME_TIME_START,
      gameEndTime: GAME_CONFIG.GAME_TIME_END
    };
  }

  // 檢查今日是否已遊戲
  async checkDailyGameStatus(userId = 1) {
    try {
      // 這裡可以查詢資料庫檢查今日是否已經玩過
      // 目前簡化為總是允許
      return {
        hasPlayedToday: false,
        remainingGames: 1
      };
    } catch (error) {
      console.error('檢查遊戲狀態失敗:', error);
      return {
        hasPlayedToday: false,
        remainingGames: 1
      };
    }
  }

  // 初始化遊戲
  async initializeGame(userId = 1) {
    try {
      this.updateGameState(GAME_STATES.LOADING);

      // 檢查時間限制
      const timeCheck = this.checkGameTimeRestriction();
      if (!timeCheck.allowed) {
        this.updateGameState(GAME_STATES.TIME_RESTRICTED);
        return {
          success: false,
          error: 'TIME_RESTRICTED',
          message: `遊戲時間為每天 ${timeCheck.gameStartTime}:00 - ${timeCheck.gameEndTime}:00`,
          currentHour: timeCheck.currentHour
        };
      }

      // 檢查每日遊戲次數
      const dailyStatus = await this.checkDailyGameStatus(userId);
      if (dailyStatus.hasPlayedToday && dailyStatus.remainingGames <= 0) {
        return {
          success: false,
          error: 'DAILY_LIMIT_REACHED',
          message: '今天已經完成遊戲了，明天再來吧！'
        };
      }

      // 生成問題
      const questions = await generateDailyQuestions(
        userId, 
        GAME_CONFIG.DAILY_QUESTION_COUNT
      );

      if (questions.length === 0) {
        this.updateGameState(GAME_STATES.ERROR);
        return {
          success: false,
          error: 'NO_QUESTIONS',
          message: '無法生成問題，請確認今日是否有記帳記錄'
        };
      }

      // 建立遊戲會話
      const sessionId = await startQuizSession(userId);

      // 更新遊戲狀態
      this.gameState = {
        ...this.gameState,
        sessionId,
        userId,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        scores: [],
        combo: 0,
        maxCombo: 0,
        totalScore: 0,
        startTime: Date.now(),
        isFirstGameToday: !dailyStatus.hasPlayedToday
      };

      this.updateGameState(GAME_STATES.READY);

      return {
        success: true,
        questions: questions,
        questionCount: questions.length,
        isFirstGame: this.gameState.isFirstGameToday
      };

    } catch (error) {
      console.error('遊戲初始化失敗:', error);
      this.updateGameState(GAME_STATES.ERROR);
      return {
        success: false,
        error: 'INITIALIZATION_ERROR',
        message: '遊戲初始化失敗，請稍後再試'
      };
    }
  }

  // 開始遊戲
  startGame() {
    if (this.gameState.gameState !== GAME_STATES.READY) {
      return {
        success: false,
        error: 'INVALID_STATE',
        message: '遊戲狀態錯誤'
      };
    }

    this.updateGameState(GAME_STATES.PLAYING);
    return {
      success: true,
      currentQuestion: this.getCurrentQuestion(),
      questionIndex: this.gameState.currentQuestionIndex,
      totalQuestions: this.gameState.questions.length
    };
  }

  // 獲取當前問題
  getCurrentQuestion() {
    const index = this.gameState.currentQuestionIndex;
    if (index >= 0 && index < this.gameState.questions.length) {
      return this.gameState.questions[index];
    }
    return null;
  }

  // 提交答案
  async submitAnswer(userAnswer, answerTime = 0) {
    try {
      if (this.gameState.gameState !== GAME_STATES.PLAYING) {
        return {
          success: false,
          error: 'INVALID_STATE',
          message: '當前無法提交答案'
        };
      }

      const currentQuestion = this.getCurrentQuestion();
      if (!currentQuestion) {
        return {
          success: false,
          error: 'NO_QUESTION',
          message: '沒有有效的問題'
        };
      }

      // 驗證答案
      const isCorrect = validateQuestionAnswer(currentQuestion, userAnswer);
      
      // 計算分數
      const scoreResult = this.calculateScore(currentQuestion, isCorrect, answerTime);
      
      // 更新combo
      if (isCorrect) {
        this.gameState.combo += 1;
        this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);
      } else {
        this.gameState.combo = 0;
      }

      // 記錄答案和分數
      this.gameState.answers.push({
        questionId: currentQuestion.id,
        userAnswer,
        isCorrect,
        answerTime,
        score: scoreResult.totalScore
      });
      
      this.gameState.scores.push(scoreResult.totalScore);
      this.gameState.totalScore += scoreResult.totalScore;

      // 記錄到資料庫
      await recordQuizResult(
        currentQuestion.id, 
        userAnswer, 
        isCorrect, 
        Math.round(answerTime / 1000), // 轉換為秒
        this.gameState.sessionId
      );

      // 更新狀態為顯示結果
      this.updateGameState(GAME_STATES.QUESTION_RESULT);

      const result = {
        success: true,
        isCorrect,
        explanation: currentQuestion.explanation,
        score: scoreResult,
        combo: this.gameState.combo,
        currentQuestionIndex: this.gameState.currentQuestionIndex,
        totalQuestions: this.gameState.questions.length
      };

      // 檢查是否為最後一題
      if (this.gameState.currentQuestionIndex >= this.gameState.questions.length - 1) {
        // 遊戲結束
        setTimeout(() => this.completeGame(), 100);
      } else {
        // 下一題
        this.gameState.currentQuestionIndex += 1;
      }

      return result;

    } catch (error) {
      console.error('提交答案失敗:', error);
      return {
        success: false,
        error: 'SUBMIT_ERROR',
        message: '提交答案失敗'
      };
    }
  }

  // 計算分數
  calculateScore(question, isCorrect, answerTime) {
    let baseScore = 0;
    let bonusScore = 0;
    let comboMultiplier = 1.0;
    let totalScore = 0;

    if (isCorrect) {
      // 基礎分數 (根據問題難度)
      baseScore = question.points || 10;
      const difficultyMultiplier = DIFFICULTY_WEIGHTS[question.difficulty] || 1.0;
      baseScore = Math.round(baseScore * difficultyMultiplier);

      // Combo倍數
      const comboLevel = Math.min(this.gameState.combo, 4);
      comboMultiplier = COMBO_MULTIPLIERS[comboLevel] || 1.0;

      // 快速答題獎勵 (5秒內答題)
      if (answerTime <= 5000) {
        bonusScore += BONUS_SCORES.FAST_ANSWER;
      }

      // 計算總分
      totalScore = Math.round((baseScore * comboMultiplier) + bonusScore);
    }

    return {
      baseScore,
      bonusScore,
      comboMultiplier,
      totalScore,
      breakdown: {
        base: baseScore,
        combo: `x${comboMultiplier}`,
        bonus: bonusScore,
        fast: answerTime <= 5000 && isCorrect
      }
    };
  }

  // 完成遊戲
  async completeGame() {
    try {
      this.gameState.endTime = Date.now();
      const duration = Math.round((this.gameState.endTime - this.gameState.startTime) / 1000);

      // 計算統計資料
      const correctAnswers = this.gameState.answers.filter(a => a.isCorrect).length;
      const totalQuestions = this.gameState.questions.length;
      const accuracyRate = Math.round((correctAnswers / totalQuestions) * 100);

      // 完全答對獎勵
      let finalBonus = 0;
      if (correctAnswers === totalQuestions) {
        finalBonus = BONUS_SCORES.PERFECT_GAME;
        this.gameState.totalScore += finalBonus;
      }

      // 首次遊戲獎勵
      if (this.gameState.isFirstGameToday) {
        const firstGameBonus = BONUS_SCORES.DAILY_FIRST;
        finalBonus += firstGameBonus;
        this.gameState.totalScore += firstGameBonus;
      }

      // 完成資料庫記錄
      await completeQuizSession(this.gameState.sessionId, {
        questions_asked: totalQuestions,
        correct_answers: correctAnswers,
        points_earned: this.gameState.totalScore,
        duration_seconds: duration
      });

      // 增加用戶積分
      await addUserPoints(this.gameState.userId, this.gameState.totalScore);

      // 檢查並解鎖成就
      await this.checkAndUnlockAchievements(correctAnswers, totalQuestions);

      // 更新狀態
      this.updateGameState(GAME_STATES.COMPLETED);

      return {
        success: true,
        gameResult: {
          totalScore: this.gameState.totalScore,
          correctAnswers,
          totalQuestions,
          accuracyRate,
          maxCombo: this.gameState.maxCombo,
          duration,
          finalBonus,
          answers: this.gameState.answers,
          isPerfectGame: correctAnswers === totalQuestions
        }
      };

    } catch (error) {
      console.error('完成遊戲失敗:', error);
      this.updateGameState(GAME_STATES.ERROR);
      return {
        success: false,
        error: 'COMPLETION_ERROR',
        message: '遊戲完成處理失敗'
      };
    }
  }

  // 檢查並解鎖成就
  async checkAndUnlockAchievements(correctAnswers, totalQuestions) {
    try {
      const achievements = [];

      // 首次遊戲成就
      if (this.gameState.isFirstGameToday) {
        const achievement = await unlockAchievement(this.gameState.userId, 'first_daily_quiz', {
          achievement_name: '每日挑戰',
          achievement_description: '完成每日理財抽考',
          points_reward: 10
        });
        if (achievement) achievements.push('每日挑戰');
      }

      // 完美遊戲成就
      if (correctAnswers === totalQuestions) {
        const achievement = await unlockAchievement(this.gameState.userId, 'perfect_game', {
          achievement_name: '完美表現',
          achievement_description: '單次遊戲全部答對',
          points_reward: 50
        });
        if (achievement) achievements.push('完美表現');
      }

      // Combo成就
      if (this.gameState.maxCombo >= 3) {
        const achievement = await unlockAchievement(this.gameState.userId, 'combo_master', {
          achievement_name: 'Combo達人',
          achievement_description: '連續答對3題以上',
          points_reward: 30
        });
        if (achievement) achievements.push('Combo達人');
      }

      return achievements;

    } catch (error) {
      console.error('檢查成就失敗:', error);
      return [];
    }
  }

  // 更新遊戲狀態
  updateGameState(newState) {
    this.gameState.gameState = newState;
  }

  // 獲取遊戲狀態
  getGameState() {
    return { ...this.gameState };
  }

  // 獲取遊戲進度
  getGameProgress() {
    return {
      currentQuestion: this.gameState.currentQuestionIndex + 1,
      totalQuestions: this.gameState.questions.length,
      percentage: Math.round(((this.gameState.currentQuestionIndex + 1) / this.gameState.questions.length) * 100),
      score: this.gameState.totalScore,
      combo: this.gameState.combo
    };
  }

  // 繼續到下一題
  proceedToNextQuestion() {
    if (this.gameState.gameState === GAME_STATES.QUESTION_RESULT) {
      if (this.gameState.currentQuestionIndex < this.gameState.questions.length) {
        this.updateGameState(GAME_STATES.PLAYING);
        return {
          success: true,
          currentQuestion: this.getCurrentQuestion(),
          progress: this.getGameProgress()
        };
      } else {
        // 已經是最後一題，遊戲應該已經完成
        return {
          success: false,
          error: 'GAME_COMPLETED',
          message: '遊戲已完成'
        };
      }
    }
    
    return {
      success: false,
      error: 'INVALID_STATE',
      message: '當前狀態無法繼續'
    };
  }

  // 獲取時間限制資訊
  getTimeRestrictionInfo() {
    const timeCheck = this.checkGameTimeRestriction();
    const now = new Date();
    
    if (!timeCheck.allowed) {
      const nextGameTime = new Date();
      if (timeCheck.currentHour < timeCheck.gameStartTime) {
        // 今天還沒到遊戲時間
        nextGameTime.setHours(timeCheck.gameStartTime, 0, 0, 0);
      } else {
        // 今天遊戲時間已過，明天再來
        nextGameTime.setDate(nextGameTime.getDate() + 1);
        nextGameTime.setHours(timeCheck.gameStartTime, 0, 0, 0);
      }
      
      return {
        allowed: false,
        currentTime: now,
        nextGameTime,
        gameWindow: `${timeCheck.gameStartTime}:00 - ${timeCheck.gameEndTime}:00`
      };
    }
    
    return {
      allowed: true,
      currentTime: now,
      remainingTime: null,
      gameWindow: `${timeCheck.gameStartTime}:00 - ${timeCheck.gameEndTime}:00`
    };
  }
}

// 導出遊戲引擎單例
export const gameEngine = new GameEngine();

// 便捷函數
export const initGame = (userId) => gameEngine.initializeGame(userId);
export const startGame = () => gameEngine.startGame();
export const submitAnswer = (answer, time) => gameEngine.submitAnswer(answer, time);
export const getGameState = () => gameEngine.getGameState();
export const getGameProgress = () => gameEngine.getGameProgress();
export const proceedNext = () => gameEngine.proceedToNextQuestion();