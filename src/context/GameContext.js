// 理財抽考遊戲狀態管理 Context
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  checkGameAvailability, 
  initializeGame, 
  submitAnswer, 
  getCurrentQuestion,
  checkGameTime,
  getGameSummary,
  GAME_STATUS,
  loadGameState,
  saveGameState
} from '../game/gameLogic';
import { generateScoreReport } from '../game/scoringSystem';

// 初始狀態
const initialState = {
  // 遊戲可用性
  availability: {
    status: GAME_STATUS.NOT_AVAILABLE,
    message: '',
    nextAvailableTime: null
  },
  
  // 當前遊戲狀態
  currentGame: null,
  currentQuestion: null,
  
  // 遊戲歷史
  gameHistory: [],
  
  // 載入狀態
  loading: false,
  error: null,
  
  // 設定
  settings: {
    soundEnabled: true,
    vibrationEnabled: false,
    showHints: true,
    autoSave: true
  }
};

// Action 類型
export const GAME_ACTIONS = {
  // 檢查遊戲可用性
  CHECK_AVAILABILITY: 'CHECK_AVAILABILITY',
  SET_AVAILABILITY: 'SET_AVAILABILITY',
  
  // 遊戲流程
  START_GAME: 'START_GAME',
  GAME_STARTED: 'GAME_STARTED',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  ANSWER_SUBMITTED: 'ANSWER_SUBMITTED',
  UPDATE_GAME_TIME: 'UPDATE_GAME_TIME',
  END_GAME: 'END_GAME',
  GAME_ENDED: 'GAME_ENDED',
  
  // 載入狀態
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // 遊戲歷史
  LOAD_GAME_HISTORY: 'LOAD_GAME_HISTORY',
  ADD_GAME_RESULT: 'ADD_GAME_RESULT',
  
  // 設定
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // 恢復遊戲狀態
  RESTORE_GAME_STATE: 'RESTORE_GAME_STATE'
};

// Reducer 函數
const gameReducer = (state, action) => {
  switch (action.type) {
    case GAME_ACTIONS.SET_AVAILABILITY:
      return {
        ...state,
        availability: action.payload
      };
    
    case GAME_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case GAME_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case GAME_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case GAME_ACTIONS.GAME_STARTED:
      return {
        ...state,
        currentGame: action.payload.gameState,
        currentQuestion: action.payload.currentQuestion,
        loading: false,
        error: null
      };
    
    case GAME_ACTIONS.ANSWER_SUBMITTED:
      return {
        ...state,
        currentGame: action.payload.gameState,
        currentQuestion: action.payload.currentQuestion
      };
    
    case GAME_ACTIONS.UPDATE_GAME_TIME:
      return {
        ...state,
        currentGame: action.payload
      };
    
    case GAME_ACTIONS.GAME_ENDED:
      return {
        ...state,
        currentGame: action.payload,
        currentQuestion: null
      };
    
    case GAME_ACTIONS.LOAD_GAME_HISTORY:
      return {
        ...state,
        gameHistory: action.payload
      };
    
    case GAME_ACTIONS.ADD_GAME_RESULT:
      return {
        ...state,
        gameHistory: [action.payload, ...state.gameHistory.slice(0, 29)] // 保留最近30條記錄
      };
    
    case GAME_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    
    case GAME_ACTIONS.RESTORE_GAME_STATE:
      return {
        ...state,
        currentGame: action.payload.gameState,
        currentQuestion: action.payload.currentQuestion
      };
    
    default:
      return state;
  }
};

// 創建 Context
const GameContext = createContext();

// Context Provider 組件
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // 檢查遊戲可用性
  const checkAvailability = () => {
    dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const availability = checkGameAvailability();
      dispatch({ 
        type: GAME_ACTIONS.SET_AVAILABILITY, 
        payload: availability 
      });
    } catch (error) {
      dispatch({ 
        type: GAME_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
    } finally {
      dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // 開始遊戲
  const startGame = async (userExpenses = null) => {
    dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: GAME_ACTIONS.CLEAR_ERROR });
    
    try {
      const gameState = await initializeGame(userExpenses);
      const currentQuestion = getCurrentQuestion(gameState);
      
      dispatch({ 
        type: GAME_ACTIONS.GAME_STARTED, 
        payload: { gameState, currentQuestion } 
      });
      
      return gameState;
    } catch (error) {
      dispatch({ 
        type: GAME_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  // 提交答案
  const submitGameAnswer = (selectedAnswer, timeTaken) => {
    if (!state.currentGame) {
      throw new Error('沒有進行中的遊戲');
    }
    
    try {
      const result = submitAnswer(
        state.currentGame,
        state.currentGame.currentQuestionIndex,
        selectedAnswer,
        timeTaken
      );
      
      const currentQuestion = getCurrentQuestion(result);
      
      dispatch({ 
        type: GAME_ACTIONS.ANSWER_SUBMITTED, 
        payload: { 
          gameState: result, 
          currentQuestion 
        } 
      });
      
      // 如果遊戲結束，添加到歷史記錄
      if (result.status === GAME_STATUS.COMPLETED || result.status === GAME_STATUS.TIME_UP) {
        const gameResult = {
          id: result.id,
          date: new Date().toISOString(),
          summary: getGameSummary(result),
          scoreReport: generateScoreReport(result)
        };
        
        dispatch({ 
          type: GAME_ACTIONS.ADD_GAME_RESULT, 
          payload: gameResult 
        });
        
        dispatch({ 
          type: GAME_ACTIONS.GAME_ENDED, 
          payload: result 
        });
      }
      
      return result;
    } catch (error) {
      dispatch({ 
        type: GAME_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  // 更新遊戲時間
  const updateGameTime = () => {
    if (state.currentGame && state.currentGame.status === GAME_STATUS.IN_PROGRESS) {
      const updatedGame = checkGameTime(state.currentGame);
      
      if (updatedGame.status === GAME_STATUS.TIME_UP) {
        // 時間到，結束遊戲
        const gameResult = {
          id: updatedGame.id,
          date: new Date().toISOString(),
          summary: getGameSummary(updatedGame),
          scoreReport: generateScoreReport(updatedGame)
        };
        
        dispatch({ 
          type: GAME_ACTIONS.ADD_GAME_RESULT, 
          payload: gameResult 
        });
        
        dispatch({ 
          type: GAME_ACTIONS.GAME_ENDED, 
          payload: updatedGame 
        });
      } else {
        dispatch({ 
          type: GAME_ACTIONS.UPDATE_GAME_TIME, 
          payload: updatedGame 
        });
      }
    }
  };

  // 載入遊戲歷史
  const loadGameHistory = () => {
    try {
      // 從本地存儲載入歷史記錄
      if (typeof localStorage !== 'undefined') {
        const history = localStorage.getItem('@FinanceQuiz:gameHistory');
        if (history) {
          const parsedHistory = JSON.parse(history);
          dispatch({ 
            type: GAME_ACTIONS.LOAD_GAME_HISTORY, 
            payload: parsedHistory 
          });
        }
      }
    } catch (error) {
      console.error('載入遊戲歷史失敗:', error);
    }
  };

  // 更新設定
  const updateSettings = (newSettings) => {
    dispatch({ 
      type: GAME_ACTIONS.UPDATE_SETTINGS, 
      payload: newSettings 
    });
    
    // 保存設定到本地存儲
    try {
      if (typeof localStorage !== 'undefined') {
        const updatedSettings = { ...state.settings, ...newSettings };
        localStorage.setItem('@FinanceQuiz:gameSettings', JSON.stringify(updatedSettings));
      }
    } catch (error) {
      console.error('保存設定失敗:', error);
    }
  };

  // 恢復遊戲狀態
  const restoreGameState = () => {
    try {
      const savedState = loadGameState();
      if (savedState && savedState.status === GAME_STATUS.IN_PROGRESS) {
        const currentQuestion = getCurrentQuestion(savedState);
        dispatch({ 
          type: GAME_ACTIONS.RESTORE_GAME_STATE, 
          payload: { gameState: savedState, currentQuestion } 
        });
      }
    } catch (error) {
      console.error('恢復遊戲狀態失敗:', error);
    }
  };

  // 清除當前遊戲
  const clearCurrentGame = () => {
    dispatch({ 
      type: GAME_ACTIONS.GAME_ENDED, 
      payload: null 
    });
  };

  // 獲取遊戲統計
  const getGameStatistics = () => {
    const history = state.gameHistory;
    if (history.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        averageAccuracy: 0,
        bestScore: 0,
        totalPlayTime: 0,
        perfectGames: 0
      };
    }

    const totalGames = history.length;
    const totalScore = history.reduce((sum, game) => sum + (game.summary?.totalScore || 0), 0);
    const totalAccuracy = history.reduce((sum, game) => sum + (game.summary?.accuracy || 0), 0);
    const bestScore = Math.max(...history.map(game => game.summary?.totalScore || 0));
    const perfectGames = history.filter(game => game.summary?.accuracy === 100).length;

    return {
      totalGames,
      averageScore: Math.round(totalScore / totalGames),
      averageAccuracy: Math.round(totalAccuracy / totalGames),
      bestScore,
      totalPlayTime: history.reduce((sum, game) => sum + (game.summary?.gameTime || 0), 0),
      perfectGames
    };
  };

  // 初始化時載入數據
  useEffect(() => {
    checkAvailability();
    loadGameHistory();
    restoreGameState();
    
    // 載入設定
    try {
      if (typeof localStorage !== 'undefined') {
        const savedSettings = localStorage.getItem('@FinanceQuiz:gameSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          updateSettings(parsedSettings);
        }
      }
    } catch (error) {
      console.error('載入設定失敗:', error);
    }
  }, []);

  // 定時更新遊戲時間
  useEffect(() => {
    if (state.currentGame && state.currentGame.status === GAME_STATUS.IN_PROGRESS) {
      const timer = setInterval(updateGameTime, 1000);
      return () => clearInterval(timer);
    }
  }, [state.currentGame?.status]);

  const value = {
    // 狀態
    ...state,
    
    // 方法
    checkAvailability,
    startGame,
    submitGameAnswer,
    updateGameTime,
    loadGameHistory,
    updateSettings,
    restoreGameState,
    clearCurrentGame,
    getGameStatistics,
    
    // 計算屬性
    isGameAvailable: state.availability.status === GAME_STATUS.AVAILABLE,
    isGameInProgress: state.currentGame?.status === GAME_STATUS.IN_PROGRESS,
    isGameCompleted: state.currentGame?.status === GAME_STATUS.COMPLETED || 
                     state.currentGame?.status === GAME_STATUS.TIME_UP,
    gameProgress: state.currentGame ? 
      ((state.currentGame.currentQuestionIndex) / state.currentGame.questions.length) * 100 : 0
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Hook 用於使用 Context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;