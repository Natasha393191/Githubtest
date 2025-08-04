// =============================================
// 理財抽考遊戲 - 狀態管理 (React Context)
// =============================================

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { gameEngine, GAME_STATES } from './gameLogic';

// 初始狀態
const initialState = {
  // 遊戲狀態
  gameState: GAME_STATES.IDLE,
  sessionId: null,
  userId: 1,
  
  // 問題和答案
  questions: [],
  currentQuestionIndex: 0,
  currentQuestion: null,
  answers: [],
  
  // 分數和進度
  totalScore: 0,
  combo: 0,
  maxCombo: 0,
  scores: [],
  
  // 時間和遊戲資訊
  startTime: null,
  endTime: null,
  isFirstGameToday: false,
  
  // UI狀態
  loading: false,
  error: null,
  showResult: false,
  timeRestriction: null,
  
  // 遊戲結果
  gameResult: null,
  achievements: []
};

// Action 類型
export const GAME_ACTIONS = {
  // 遊戲控制
  INIT_GAME_START: 'INIT_GAME_START',
  INIT_GAME_SUCCESS: 'INIT_GAME_SUCCESS',
  INIT_GAME_ERROR: 'INIT_GAME_ERROR',
  
  START_GAME: 'START_GAME',
  RESET_GAME: 'RESET_GAME',
  
  // 答題相關
  SUBMIT_ANSWER_START: 'SUBMIT_ANSWER_START',
  SUBMIT_ANSWER_SUCCESS: 'SUBMIT_ANSWER_SUCCESS',
  SUBMIT_ANSWER_ERROR: 'SUBMIT_ANSWER_ERROR',
  
  PROCEED_NEXT_QUESTION: 'PROCEED_NEXT_QUESTION',
  SHOW_QUESTION_RESULT: 'SHOW_QUESTION_RESULT',
  HIDE_QUESTION_RESULT: 'HIDE_QUESTION_RESULT',
  
  // 遊戲完成
  COMPLETE_GAME: 'COMPLETE_GAME',
  
  // 狀態更新
  UPDATE_GAME_STATE: 'UPDATE_GAME_STATE',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SET_TIME_RESTRICTION: 'SET_TIME_RESTRICTION',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.INIT_GAME_START:
      return {
        ...state,
        loading: true,
        error: null,
        gameState: GAME_STATES.LOADING
      };

    case GAME_ACTIONS.INIT_GAME_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        gameState: GAME_STATES.READY,
        questions: action.payload.questions,
        sessionId: action.payload.sessionId,
        isFirstGameToday: action.payload.isFirstGame,
        currentQuestionIndex: 0,
        currentQuestion: action.payload.questions[0] || null,
        totalScore: 0,
        combo: 0,
        maxCombo: 0,
        answers: [],
        scores: []
      };

    case GAME_ACTIONS.INIT_GAME_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        gameState: action.payload.gameState || GAME_STATES.ERROR
      };

    case GAME_ACTIONS.START_GAME:
      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        startTime: Date.now(),
        showResult: false
      };

    case GAME_ACTIONS.SUBMIT_ANSWER_START:
      return {
        ...state,
        loading: true
      };

    case GAME_ACTIONS.SUBMIT_ANSWER_SUCCESS:
      const { isCorrect, score, combo, explanation, nextQuestionIndex } = action.payload;
      const newAnswers = [...state.answers, {
        questionIndex: state.currentQuestionIndex,
        userAnswer: action.payload.userAnswer,
        isCorrect,
        score: score.totalScore,
        answerTime: action.payload.answerTime
      }];
      
      return {
        ...state,
        loading: false,
        answers: newAnswers,
        scores: [...state.scores, score.totalScore],
        totalScore: state.totalScore + score.totalScore,
        combo,
        maxCombo: Math.max(state.maxCombo, combo),
        gameState: GAME_STATES.QUESTION_RESULT,
        showResult: true,
        currentQuestionIndex: nextQuestionIndex,
        currentQuestion: state.questions[nextQuestionIndex] || null,
        lastResult: {
          isCorrect,
          explanation,
          score
        }
      };

    case GAME_ACTIONS.SUBMIT_ANSWER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case GAME_ACTIONS.PROCEED_NEXT_QUESTION:
      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        showResult: false,
        lastResult: null
      };

    case GAME_ACTIONS.SHOW_QUESTION_RESULT:
      return {
        ...state,
        showResult: true
      };

    case GAME_ACTIONS.HIDE_QUESTION_RESULT:
      return {
        ...state,
        showResult: false
      };

    case GAME_ACTIONS.COMPLETE_GAME:
      return {
        ...state,
        gameState: GAME_STATES.COMPLETED,
        endTime: Date.now(),
        gameResult: action.payload.gameResult,
        achievements: action.payload.achievements || [],
        showResult: false
      };

    case GAME_ACTIONS.UPDATE_GAME_STATE:
      return {
        ...state,
        gameState: action.payload.gameState
      };

    case GAME_ACTIONS.UPDATE_PROGRESS:
      return {
        ...state,
        ...action.payload
      };

    case GAME_ACTIONS.SET_TIME_RESTRICTION:
      return {
        ...state,
        timeRestriction: action.payload,
        gameState: GAME_STATES.TIME_RESTRICTED
      };

    case GAME_ACTIONS.RESET_GAME:
      return {
        ...initialState,
        userId: state.userId
      };

    case GAME_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Context
const GameContext = createContext();

// Provider 組件
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // 遊戲操作函數
  const gameActions = {
    // 初始化遊戲
    async initGame(userId = 1) {
      dispatch({ type: GAME_ACTIONS.INIT_GAME_START });
      
      try {
        const result = await gameEngine.initializeGame(userId);
        
        if (result.success) {
          dispatch({
            type: GAME_ACTIONS.INIT_GAME_SUCCESS,
            payload: {
              questions: result.questions,
              sessionId: gameEngine.getGameState().sessionId,
              isFirstGame: result.isFirstGame
            }
          });
          return { success: true };
        } else {
          // 處理不同類型的錯誤
          if (result.error === 'TIME_RESTRICTED') {
            const timeInfo = gameEngine.getTimeRestrictionInfo();
            dispatch({
              type: GAME_ACTIONS.SET_TIME_RESTRICTION,
              payload: timeInfo
            });
          } else {
            dispatch({
              type: GAME_ACTIONS.INIT_GAME_ERROR,
              payload: {
                error: result.message,
                gameState: result.error === 'TIME_RESTRICTED' ? GAME_STATES.TIME_RESTRICTED : GAME_STATES.ERROR
              }
            });
          }
          return { success: false, error: result.message };
        }
      } catch (error) {
        dispatch({
          type: GAME_ACTIONS.INIT_GAME_ERROR,
          payload: { error: error.message }
        });
        return { success: false, error: error.message };
      }
    },

    // 開始遊戲
    startGame() {
      const result = gameEngine.startGame();
      if (result.success) {
        dispatch({ type: GAME_ACTIONS.START_GAME });
        return { success: true };
      } else {
        dispatch({
          type: GAME_ACTIONS.INIT_GAME_ERROR,
          payload: { error: result.message }
        });
        return { success: false, error: result.message };
      }
    },

    // 提交答案
    async submitAnswer(userAnswer, answerTime = 0) {
      dispatch({ type: GAME_ACTIONS.SUBMIT_ANSWER_START });
      
      try {
        const result = await gameEngine.submitAnswer(userAnswer, answerTime);
        
        if (result.success) {
          const nextQuestionIndex = result.currentQuestionIndex + 1;
          
          dispatch({
            type: GAME_ACTIONS.SUBMIT_ANSWER_SUCCESS,
            payload: {
              userAnswer,
              answerTime,
              isCorrect: result.isCorrect,
              score: result.score,
              combo: result.combo,
              explanation: result.explanation,
              nextQuestionIndex
            }
          });

          // 檢查遊戲是否完成
          if (nextQuestionIndex >= state.questions.length) {
            setTimeout(() => {
              gameActions.completeGame();
            }, 2000); // 2秒後自動完成遊戲
          }

          return { success: true, result };
        } else {
          dispatch({
            type: GAME_ACTIONS.SUBMIT_ANSWER_ERROR,
            payload: { error: result.message }
          });
          return { success: false, error: result.message };
        }
      } catch (error) {
        dispatch({
          type: GAME_ACTIONS.SUBMIT_ANSWER_ERROR,
          payload: { error: error.message }
        });
        return { success: false, error: error.message };
      }
    },

    // 繼續下一題
    proceedToNextQuestion() {
      const result = gameEngine.proceedToNextQuestion();
      if (result.success) {
        dispatch({ type: GAME_ACTIONS.PROCEED_NEXT_QUESTION });
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    },

    // 完成遊戲
    async completeGame() {
      try {
        const result = await gameEngine.completeGame();
        
        if (result.success) {
          dispatch({
            type: GAME_ACTIONS.COMPLETE_GAME,
            payload: {
              gameResult: result.gameResult,
              achievements: [] // 這裡可以加入成就處理
            }
          });
          return { success: true, result: result.gameResult };
        } else {
          dispatch({
            type: GAME_ACTIONS.INIT_GAME_ERROR,
            payload: { error: result.message }
          });
          return { success: false, error: result.message };
        }
      } catch (error) {
        dispatch({
          type: GAME_ACTIONS.INIT_GAME_ERROR,
          payload: { error: error.message }
        });
        return { success: false, error: error.message };
      }
    },

    // 重置遊戲
    resetGame() {
      gameEngine.resetGame();
      dispatch({ type: GAME_ACTIONS.RESET_GAME });
    },

    // 清除錯誤
    clearError() {
      dispatch({ type: GAME_ACTIONS.CLEAR_ERROR });
    },

    // 顯示/隱藏結果
    showResult() {
      dispatch({ type: GAME_ACTIONS.SHOW_QUESTION_RESULT });
    },

    hideResult() {
      dispatch({ type: GAME_ACTIONS.HIDE_QUESTION_RESULT });
    },

    // 獲取時間限制資訊
    getTimeRestriction() {
      return gameEngine.getTimeRestrictionInfo();
    }
  };

  // 計算遊戲進度
  const gameProgress = {
    currentQuestion: state.currentQuestionIndex + 1,
    totalQuestions: state.questions.length,
    percentage: state.questions.length > 0 ? 
      Math.round(((state.currentQuestionIndex + 1) / state.questions.length) * 100) : 0,
    isLastQuestion: state.currentQuestionIndex >= state.questions.length - 1
  };

  // 遊戲統計
  const gameStats = {
    accuracy: state.answers.length > 0 ? 
      Math.round((state.answers.filter(a => a.isCorrect).length / state.answers.length) * 100) : 0,
    correctAnswers: state.answers.filter(a => a.isCorrect).length,
    totalAnswered: state.answers.length,
    averageTime: state.answers.length > 0 ?
      Math.round(state.answers.reduce((sum, a) => sum + a.answerTime, 0) / state.answers.length / 1000) : 0
  };

  // Context 值
  const contextValue = {
    // 狀態
    ...state,
    
    // 計算屬性
    gameProgress,
    gameStats,
    
    // 操作函數
    ...gameActions,
    
    // 便捷狀態檢查
    isGameIdle: state.gameState === GAME_STATES.IDLE,
    isGameLoading: state.gameState === GAME_STATES.LOADING,
    isGameReady: state.gameState === GAME_STATES.READY,
    isGamePlaying: state.gameState === GAME_STATES.PLAYING,
    isGameCompleted: state.gameState === GAME_STATES.COMPLETED,
    isTimeRestricted: state.gameState === GAME_STATES.TIME_RESTRICTED,
    hasError: !!state.error,
    canStartGame: state.gameState === GAME_STATES.READY,
    canSubmitAnswer: state.gameState === GAME_STATES.PLAYING && !state.loading,
    canProceedNext: state.gameState === GAME_STATES.QUESTION_RESULT && !gameProgress.isLastQuestion
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Hook
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// 選擇器 Hooks (優化性能)
export const useGameState = () => {
  const { gameState } = useGame();
  return gameState;
};

export const useGameProgress = () => {
  const { gameProgress } = useGame();
  return gameProgress;
};

export const useCurrentQuestion = () => {
  const { currentQuestion } = useGame();
  return currentQuestion;
};

export const useGameResult = () => {
  const { gameResult, achievements } = useGame();
  return { gameResult, achievements };
};

export const useGameActions = () => {
  const context = useGame();
  return {
    initGame: context.initGame,
    startGame: context.startGame,
    submitAnswer: context.submitAnswer,
    proceedToNextQuestion: context.proceedToNextQuestion,
    resetGame: context.resetGame,
    clearError: context.clearError
  };
};

// 導出 Context (如果需要在其他地方使用)
export { GameContext };