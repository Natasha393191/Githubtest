// =============================================
// 資料庫操作示例與測試
// =============================================

import {
  // 用戶操作
  getUser,
  updateUser,
  addUserPoints,
  
  // 記帳操作
  addDailyRecord,
  getDailyRecords,
  getRecordStatistics,
  deleteDailyRecord,
  
  // 遊戲操作
  startQuizSession,
  completeQuizSession,
  getQuizSessions,
  
  // 成就操作
  unlockAchievement,
  getUserAchievements,
  
  // 原有操作
  getRandomQuestion,
  recordQuizResult,
  getUserStats,
  getRecentQuizRecords,
  
  // 測試資料
  generateTestData
} from './database';

// =============================================
// 用戶操作示例
// =============================================

export const userExamples = {
  // 獲取用戶資料
  async getUserExample() {
    try {
      const user = await getUser(1);
      console.log('用戶資料:', user);
      return user;
    } catch (error) {
      console.error('獲取用戶失敗:', error);
    }
  },

  // 更新用戶資料
  async updateUserExample() {
    try {
      await updateUser(1, {
        name: '理財達人',
        level: 3,
        total_points: 250
      });
      console.log('用戶資料更新成功');
    } catch (error) {
      console.error('更新用戶失敗:', error);
    }
  },

  // 增加用戶積分
  async addPointsExample() {
    try {
      await addUserPoints(1, 50);
      console.log('積分增加成功');
    } catch (error) {
      console.error('增加積分失敗:', error);
    }
  }
};

// =============================================
// 記帳操作示例
// =============================================

export const recordExamples = {
  // 新增收入記錄
  async addIncomeRecord() {
    try {
      const recordId = await addDailyRecord({
        date: '2024-01-15',
        amount: 50000,
        category: '薪資',
        type: 'income',
        description: '月薪收入'
      });
      console.log('收入記錄新增成功，ID:', recordId);
      return recordId;
    } catch (error) {
      console.error('新增收入記錄失敗:', error);
    }
  },

  // 新增支出記錄
  async addExpenseRecord() {
    try {
      const recordId = await addDailyRecord({
        date: '2024-01-15',
        amount: 450,
        category: '餐飲',
        type: 'expense',
        description: '午餐費用'
      });
      console.log('支出記錄新增成功，ID:', recordId);
      return recordId;
    } catch (error) {
      console.error('新增支出記錄失敗:', error);
    }
  },

  // 獲取記帳記錄
  async getRecordsExample() {
    try {
      const records = await getDailyRecords(1, 20);
      console.log('記帳記錄:', records);
      return records;
    } catch (error) {
      console.error('獲取記帳記錄失敗:', error);
    }
  },

  // 獲取統計資料
  async getStatisticsExample() {
    try {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const stats = await getRecordStatistics(1, startDate, endDate);
      console.log('統計資料:', stats);
      return stats;
    } catch (error) {
      console.error('獲取統計失敗:', error);
    }
  },

  // 刪除記錄
  async deleteRecordExample(recordId) {
    try {
      await deleteDailyRecord(recordId);
      console.log('記錄刪除成功');
    } catch (error) {
      console.error('刪除記錄失敗:', error);
    }
  }
};

// =============================================
// 遊戲操作示例
// =============================================

export const gameExamples = {
  // 完整遊戲流程示例
  async completeGameSession() {
    try {
      // 1. 開始遊戲會話
      const sessionId = await startQuizSession(1);
      console.log('遊戲會話開始，ID:', sessionId);

      // 2. 模擬答題過程
      let correctAnswers = 0;
      const questionsAsked = 5;
      
      for (let i = 0; i < questionsAsked; i++) {
        // 獲取隨機題目
        const question = await getRandomQuestion();
        console.log(`題目 ${i + 1}:`, question.question);
        
        // 模擬用戶答題（隨機答案）
        const userAnswer = Math.floor(Math.random() * 4);
        const isCorrect = userAnswer === question.correct_answer;
        const timeSpent = Math.floor(Math.random() * 30) + 10; // 10-40秒
        
        if (isCorrect) correctAnswers++;
        
        // 記錄答題結果
        await recordQuizResult(question.id, userAnswer, isCorrect, timeSpent, sessionId);
        console.log(`答案: ${isCorrect ? '正確' : '錯誤'}, 用時: ${timeSpent}秒`);
      }

      // 3. 完成遊戲會話
      const pointsEarned = correctAnswers * 10;
      const durationSeconds = 180; // 3分鐘
      
      await completeQuizSession(sessionId, {
        questions_asked: questionsAsked,
        correct_answers: correctAnswers,
        points_earned: pointsEarned,
        duration_seconds: durationSeconds
      });

      console.log(`遊戲完成! 答對 ${correctAnswers}/${questionsAsked} 題，獲得 ${pointsEarned} 積分`);
      return sessionId;
    } catch (error) {
      console.error('遊戲流程失敗:', error);
    }
  },

  // 獲取遊戲記錄
  async getGameHistory() {
    try {
      const sessions = await getQuizSessions(1, 10);
      console.log('遊戲記錄:', sessions);
      return sessions;
    } catch (error) {
      console.error('獲取遊戲記錄失敗:', error);
    }
  }
};

// =============================================
// 成就操作示例
// =============================================

export const achievementExamples = {
  // 手動解鎖成就
  async unlockAchievementExample() {
    try {
      const isNewAchievement = await unlockAchievement(1, 'quiz_master', {
        achievement_name: '抽考大師',
        achievement_description: '完成100次抽考',
        points_reward: 500
      });
      
      if (isNewAchievement) {
        console.log('新成就解鎖成功!');
      } else {
        console.log('該成就已經解鎖過了');
      }
    } catch (error) {
      console.error('解鎖成就失敗:', error);
    }
  },

  // 獲取用戶成就
  async getUserAchievementsExample() {
    try {
      const achievements = await getUserAchievements(1);
      console.log('用戶成就:', achievements);
      return achievements;
    } catch (error) {
      console.error('獲取成就失敗:', error);
    }
  }
};

// =============================================
// 綜合示例
// =============================================

export const comprehensiveExamples = {
  // 新用戶完整體驗流程
  async newUserJourney() {
    console.log('=== 新用戶體驗流程開始 ===');

    try {
      // 1. 獲取初始用戶資料
      const user = await getUser(1);
      console.log('1. 初始用戶資料:', user);

      // 2. 新增第一筆記帳記錄 (會觸發成就)
      await addDailyRecord({
        date: new Date().toISOString().split('T')[0],
        amount: 100,
        category: '零用錢',
        type: 'income',
        description: '我的第一筆記帳'
      });
      console.log('2. 第一筆記帳記錄新增完成');

      // 3. 進行第一次抽考 (會觸發成就)
      await gameExamples.completeGameSession();
      console.log('3. 第一次抽考完成');

      // 4. 查看解鎖的成就
      const achievements = await getUserAchievements(1);
      console.log('4. 已解鎖成就:', achievements);

      // 5. 查看更新後的用戶統計
      const stats = await getUserStats(1);
      console.log('5. 用戶統計:', stats);

      // 6. 查看最新的用戶資料
      const updatedUser = await getUser(1);
      console.log('6. 更新後用戶資料:', updatedUser);

      console.log('=== 新用戶體驗流程完成 ===');
    } catch (error) {
      console.error('新用戶流程失敗:', error);
    }
  },

  // 生成測試資料並分析
  async generateAndAnalyzeTestData() {
    console.log('=== 生成測試資料並分析 ===');

    try {
      // 1. 生成測試資料
      await generateTestData();
      console.log('1. 測試資料生成完成');

      // 2. 分析記帳資料
      const records = await getDailyRecords(1, 50);
      console.log(`2. 記帳記錄數量: ${records.length}`);

      // 3. 分析遊戲資料
      const sessions = await getQuizSessions(1, 20);
      console.log(`3. 遊戲會話數量: ${sessions.length}`);

      // 4. 計算收支統計
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      
      const stats = await getRecordStatistics(
        1, 
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      console.log('4. 收支統計:', stats);

      // 5. 顯示用戶統計
      const userStats = await getUserStats(1);
      console.log('5. 用戶統計:', userStats);

      console.log('=== 測試資料分析完成 ===');
    } catch (error) {
      console.error('測試資料分析失敗:', error);
    }
  }
};

// =============================================
// 使用說明
// =============================================

export const usageGuide = {
  // 在React Native組件中的使用示例
  async useInComponent() {
    /*
    使用方式：

    1. 在組件中導入需要的函數：
    import { addDailyRecord, getUserStats } from '../database/database';

    2. 在組件函數中調用：
    const handleAddRecord = async () => {
      try {
        const recordId = await addDailyRecord({
          date: '2024-01-15',
          amount: 500,
          category: '餐飲',
          type: 'expense',
          description: '午餐'
        });
        console.log('記錄新增成功，ID:', recordId);
      } catch (error) {
        console.error('新增失敗:', error);
      }
    };

    3. 在useEffect中載入資料：
    useEffect(() => {
      const loadStats = async () => {
        try {
          const stats = await getUserStats(1);
          setStats(stats);
        } catch (error) {
          console.error('載入統計失敗:', error);
        }
      };
      loadStats();
    }, []);
    */
  }
};

// 導出所有示例
export default {
  userExamples,
  recordExamples,
  gameExamples,
  achievementExamples,
  comprehensiveExamples,
  usageGuide
};