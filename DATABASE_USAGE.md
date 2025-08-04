# 資料庫使用指南

## 🚀 快速開始

### 1. 導入資料庫函數

```javascript
// 導入需要的資料庫函數
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
  getRandomQuestion,
  recordQuizResult,
  
  // 成就操作
  unlockAchievement,
  getUserAchievements,
  
  // 統計操作
  getUserStats,
  getRecentQuizRecords,
  
  // 測試資料
  generateTestData
} from '../database/database';
```

### 2. 在React Native組件中使用

## 📱 實際使用範例

### 用戶資料管理

```javascript
// UserProfile.js
import React, { useState, useEffect } from 'react';
import { getUser, updateUser } from '../database/database';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 載入用戶資料
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUser(1);
      setUser(userData);
    } catch (error) {
      console.error('載入用戶資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新用戶名稱
  const handleUpdateName = async (newName) => {
    try {
      await updateUser(1, { name: newName });
      await loadUserData(); // 重新載入資料
    } catch (error) {
      console.error('更新失敗:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <Text>用戶名稱: {user?.name}</Text>
      <Text>等級: {user?.level}</Text>
      <Text>總積分: {user?.total_points}</Text>
      {/* 更新按鈕等UI組件 */}
    </View>
  );
};
```

### 記帳功能

```javascript
// RecordManager.js
import React, { useState, useEffect } from 'react';
import { addDailyRecord, getDailyRecords, getRecordStatistics } from '../database/database';

const RecordManager = () => {
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState([]);

  // 載入記帳記錄
  useEffect(() => {
    loadRecords();
    loadStatistics();
  }, []);

  const loadRecords = async () => {
    try {
      const recordList = await getDailyRecords(1, 50);
      setRecords(recordList);
    } catch (error) {
      console.error('載入記錄失敗:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      
      const stats = await getRecordStatistics(
        1,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setStatistics(stats);
    } catch (error) {
      console.error('載入統計失敗:', error);
    }
  };

  // 新增記帳記錄
  const handleAddRecord = async (recordData) => {
    try {
      await addDailyRecord({
        date: new Date().toISOString().split('T')[0],
        amount: recordData.amount,
        category: recordData.category,
        type: recordData.type, // 'income' 或 'expense'
        description: recordData.description
      });
      
      // 重新載入資料
      await loadRecords();
      await loadStatistics();
      
      Alert.alert('成功', '記帳記錄已新增');
    } catch (error) {
      console.error('新增記錄失敗:', error);
      Alert.alert('錯誤', '新增記錄失敗');
    }
  };

  return (
    <View>
      {/* 新增記錄表單 */}
      <RecordForm onSubmit={handleAddRecord} />
      
      {/* 記錄列表 */}
      <FlatList
        data={records}
        renderItem={({ item }) => (
          <RecordItem record={item} />
        )}
        keyExtractor={item => item.id.toString()}
      />
      
      {/* 統計圖表 */}
      <StatisticsChart data={statistics} />
    </View>
  );
};
```

### 抽考遊戲

```javascript
// QuizGame.js
import React, { useState, useEffect } from 'react';
import { 
  startQuizSession, 
  completeQuizSession, 
  getRandomQuestion, 
  recordQuizResult 
} from '../database/database';

const QuizGame = () => {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameStats, setGameStats] = useState({
    questionsAsked: 0,
    correctAnswers: 0,
    startTime: null
  });

  // 開始遊戲
  const startGame = async () => {
    try {
      const newSessionId = await startQuizSession(1);
      setSessionId(newSessionId);
      setGameStats({
        questionsAsked: 0,
        correctAnswers: 0,
        startTime: Date.now()
      });
      await loadNextQuestion();
    } catch (error) {
      console.error('開始遊戲失敗:', error);
    }
  };

  // 載入下一題
  const loadNextQuestion = async () => {
    try {
      const question = await getRandomQuestion();
      setCurrentQuestion(question);
    } catch (error) {
      console.error('載入題目失敗:', error);
    }
  };

  // 提交答案
  const submitAnswer = async (userAnswer) => {
    try {
      const timeSpent = 30; // 假設答題時間
      const isCorrect = userAnswer === currentQuestion.correct_answer;
      
      // 記錄答題結果
      await recordQuizResult(
        currentQuestion.id,
        userAnswer,
        isCorrect,
        timeSpent,
        sessionId
      );

      // 更新遊戲統計
      const newStats = {
        ...gameStats,
        questionsAsked: gameStats.questionsAsked + 1,
        correctAnswers: gameStats.correctAnswers + (isCorrect ? 1 : 0)
      };
      setGameStats(newStats);

      // 檢查是否結束遊戲
      if (newStats.questionsAsked >= 10) {
        await endGame(newStats);
      } else {
        await loadNextQuestion();
      }
    } catch (error) {
      console.error('提交答案失敗:', error);
    }
  };

  // 結束遊戲
  const endGame = async (stats) => {
    try {
      const durationSeconds = Math.round((Date.now() - stats.startTime) / 1000);
      const pointsEarned = stats.correctAnswers * 10;

      await completeQuizSession(sessionId, {
        questions_asked: stats.questionsAsked,
        correct_answers: stats.correctAnswers,
        points_earned: pointsEarned,
        duration_seconds: durationSeconds
      });

      // 顯示結果
      Alert.alert(
        '遊戲結束',
        `答對 ${stats.correctAnswers}/${stats.questionsAsked} 題\n獲得 ${pointsEarned} 積分`
      );
    } catch (error) {
      console.error('結束遊戲失敗:', error);
    }
  };

  return (
    <View>
      {!sessionId ? (
        <Button title="開始遊戲" onPress={startGame} />
      ) : currentQuestion ? (
        <QuestionDisplay 
          question={currentQuestion}
          onAnswer={submitAnswer}
        />
      ) : (
        <LoadingSpinner />
      )}
      
      <GameStats stats={gameStats} />
    </View>
  );
};
```

### 成就系統

```javascript
// AchievementSystem.js
import React, { useState, useEffect } from 'react';
import { getUserAchievements, unlockAchievement } from '../database/database';

const AchievementSystem = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const userAchievements = await getUserAchievements(1);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('載入成就失敗:', error);
    }
  };

  // 手動觸發成就解鎖 (通常在其他操作中自動觸發)
  const triggerAchievement = async (type, data) => {
    try {
      const isNew = await unlockAchievement(1, type, data);
      if (isNew) {
        Alert.alert('🎉 成就解鎖!', `${data.achievement_name}\n${data.achievement_description}`);
        await loadAchievements(); // 重新載入
      }
    } catch (error) {
      console.error('解鎖成就失敗:', error);
    }
  };

  return (
    <View>
      <Text style={styles.title}>我的成就</Text>
      <FlatList
        data={achievements}
        renderItem={({ item }) => (
          <AchievementCard achievement={item} />
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};
```

### 統計資料

```javascript
// StatsOverview.js
import React, { useState, useEffect } from 'react';
import { getUserStats, getQuizSessions } from '../database/database';

const StatsOverview = () => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      const [userStats, recentSessions] = await Promise.all([
        getUserStats(1),
        getQuizSessions(1, 10)
      ]);
      
      setStats(userStats);
      setSessions(recentSessions);
    } catch (error) {
      console.error('載入統計失敗:', error);
    }
  };

  const getAccuracyRate = () => {
    if (!stats || stats.total_questions === 0) return 0;
    return Math.round((stats.correct_answers / stats.total_questions) * 100);
  };

  return (
    <ScrollView>
      <StatCard 
        title="總答題數" 
        value={stats?.total_questions || 0} 
      />
      <StatCard 
        title="正確率" 
        value={`${getAccuracyRate()}%`} 
      />
      <StatCard 
        title="記帳記錄" 
        value={stats?.total_records || 0} 
      />
      
      <Text style={styles.sectionTitle}>最近遊戲記錄</Text>
      {sessions.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </ScrollView>
  );
};
```

## 🔧 常用工具函數

### 日期格式化

```javascript
// utils/dateUtils.js
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};
```

### 錯誤處理

```javascript
// utils/errorHandler.js
export const handleDatabaseError = (error, operation) => {
  console.error(`資料庫操作失敗 [${operation}]:`, error);
  
  // 可以根據錯誤類型顯示不同的用戶友好訊息
  let userMessage = '操作失敗，請稍後再試';
  
  if (error.message.includes('UNIQUE constraint')) {
    userMessage = '資料已存在';
  } else if (error.message.includes('NOT NULL constraint')) {
    userMessage = '請填寫必要資訊';
  }
  
  Alert.alert('錯誤', userMessage);
};
```

### 資料驗證

```javascript
// utils/validation.js
export const validateRecordData = (data) => {
  const errors = [];
  
  if (!data.amount || data.amount <= 0) {
    errors.push('金額必須大於0');
  }
  
  if (!data.category?.trim()) {
    errors.push('請選擇分類');
  }
  
  if (!['income', 'expense'].includes(data.type)) {
    errors.push('請選擇收入或支出');
  }
  
  return errors;
};
```

## 🎯 最佳實踐

### 1. 錯誤處理

```javascript
const safeAsyncCall = async (asyncFunction, errorContext) => {
  try {
    return await asyncFunction();
  } catch (error) {
    handleDatabaseError(error, errorContext);
    return null;
  }
};

// 使用範例
const loadData = () => safeAsyncCall(
  () => getUserStats(1),
  'loadUserStats'
);
```

### 2. 載入狀態管理

```javascript
const useAsyncData = (asyncFunction, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, deps);

  return { data, loading, error, reload: () => loadData() };
};
```

### 3. 批次操作

```javascript
// 批次新增記帳記錄
const addMultipleRecords = async (recordsArray) => {
  try {
    for (const record of recordsArray) {
      await addDailyRecord(record);
    }
    console.log('批次新增完成');
  } catch (error) {
    console.error('批次新增失敗:', error);
  }
};
```

## 🧪 測試資料生成

```javascript
// 在開發環境中生成測試資料
const setupTestData = async () => {
  try {
    await generateTestData();
    console.log('測試資料生成完成');
  } catch (error) {
    console.error('生成測試資料失敗:', error);
  }
};

// 在開發模式下自動執行
if (__DEV__) {
  setupTestData();
}
```

---

這個使用指南提供了在React Native應用中使用SQLite資料庫的完整範例，涵蓋了所有主要功能的實作方式。