// 應用程式常數配置

// 應用程式資訊
export const APP_INFO = {
  name: '理財抽考遊戲',
  version: '1.0.0',
  description: '透過有趣的抽考遊戲，提升你的理財知識！',
  author: 'Finance Quiz Team',
};

// 題目相關常數
export const QUIZ_CONSTANTS = {
  DEFAULT_QUESTION_COUNT: 10,
  MIN_QUESTION_COUNT: 5,
  MAX_QUESTION_COUNT: 50,
  QUESTION_TIME_LIMIT: 60, // 秒
  PASS_SCORE_PERCENTAGE: 60,
};

// 題目分類
export const QUESTION_CATEGORIES = [
  { id: 1, name: '基礎理財', color: '#2E8B57', icon: 'wallet' },
  { id: 2, name: '投資概念', color: '#32CD32', icon: 'trending-up' },
  { id: 3, name: '保險規劃', color: '#90EE90', icon: 'shield' },
  { id: 4, name: '稅務知識', color: '#708090', icon: 'document-text' },
  { id: 5, name: '退休規劃', color: '#2F4F4F', icon: 'time' },
];

// 題目難度
export const DIFFICULTY_LEVELS = [
  { id: 1, name: '初級', color: '#28a745' },
  { id: 2, name: '中級', color: '#ffc107' },
  { id: 3, name: '高級', color: '#dc3545' },
];

// 成就系統
export const ACHIEVEMENTS = [
  {
    id: 1,
    name: '學習新手',
    description: '完成第一次理財測驗',
    icon: 'school',
    condition: { type: 'quiz_completed', value: 1 },
  },
  {
    id: 2,
    name: '知識探索者',
    description: '完成10次測驗',
    icon: 'library',
    condition: { type: 'quiz_completed', value: 10 },
  },
  {
    id: 3,
    name: '理財達人',
    description: '正確率達到80%以上',
    icon: 'trophy',
    condition: { type: 'accuracy', value: 80 },
  },
  {
    id: 4,
    name: '連續學習',
    description: '連續7天進行學習',
    icon: 'flame',
    condition: { type: 'streak', value: 7 },
  },
  {
    id: 5,
    name: '專家級',
    description: '在所有分類中正確率都超過75%',
    icon: 'medal',
    condition: { type: 'category_master', value: 75 },
  },
];

// 統計期間
export const STATISTICS_PERIODS = [
  { key: 'today', label: '今日', days: 1 },
  { key: 'week', label: '本週', days: 7 },
  { key: 'month', label: '本月', days: 30 },
  { key: 'all', label: '全部', days: null },
];

// 學習提醒時間
export const REMINDER_TIMES = [
  { id: 1, time: '09:00', label: '早上 9:00' },
  { id: 2, time: '12:00', label: '中午 12:00' },
  { id: 3, time: '18:00', label: '下午 6:00' },
  { id: 4, time: '21:00', label: '晚上 9:00' },
];

// 應用程式設定鍵值
export const SETTINGS_KEYS = {
  NOTIFICATIONS: 'notifications',
  SOUND_EFFECTS: 'soundEffects',
  VIBRATION: 'vibration',
  DARK_MODE: 'darkMode',
  AUTO_SAVE: 'autoSave',
  DAILY_REMINDER: 'dailyReminder',
  REMINDER_TIME: 'reminderTime',
  QUESTION_COUNT: 'questionCount',
  SHOW_EXPLANATION: 'showExplanation',
};

// 錯誤訊息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '網路連線異常，請檢查網路設定',
  DATABASE_ERROR: '資料庫錯誤，請重新啟動應用程式',
  QUESTION_LOAD_ERROR: '題目載入失敗，請稍後再試',
  SAVE_ERROR: '儲存失敗，請重試',
  PERMISSION_ERROR: '權限不足，請檢查應用程式權限設定',
};

// 成功訊息
export const SUCCESS_MESSAGES = {
  QUIZ_COMPLETED: '測驗完成！',
  DATA_SAVED: '資料已儲存',
  SETTINGS_UPDATED: '設定已更新',
  DATA_EXPORTED: '資料匯出成功',
  DATA_CLEARED: '資料清除成功',
};

// API 相關（如果需要）
export const API_CONFIG = {
  BASE_URL: 'https://api.financequiz.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// 儲存鍵值
export const STORAGE_KEYS = {
  USER_PREFERENCES: '@FinanceQuiz:userPreferences',
  QUIZ_PROGRESS: '@FinanceQuiz:quizProgress',
  STATISTICS: '@FinanceQuiz:statistics',
  ACHIEVEMENTS: '@FinanceQuiz:achievements',
};

export default {
  APP_INFO,
  QUIZ_CONSTANTS,
  QUESTION_CATEGORIES,
  DIFFICULTY_LEVELS,
  ACHIEVEMENTS,
  STATISTICS_PERIODS,
  REMINDER_TIMES,
  SETTINGS_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_CONFIG,
  STORAGE_KEYS,
};