import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('financeQuiz.db');

// =============================================
// 資料庫初始化
// =============================================

export const initializeDatabase = () => {
  db.transaction(tx => {
    // 1. 用戶表
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        level INTEGER DEFAULT 1,
        total_points INTEGER DEFAULT 0,
        avatar_url TEXT,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // 2. 每日記帳記錄表
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS daily_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );

    // 3. 抽考遊戲記錄表
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS quiz_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        date DATE NOT NULL,
        questions_asked INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        points_earned INTEGER NOT NULL,
        duration_seconds INTEGER,
        difficulty_level TEXT DEFAULT 'mixed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );

    // 4. 成就系統表
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        achievement_type TEXT NOT NULL,
        achievement_name TEXT NOT NULL,
        achievement_description TEXT,
        points_reward INTEGER DEFAULT 0,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );

    // 5. 題目表 (原有的，稍作調整)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer INTEGER NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        explanation TEXT,
        points_value INTEGER DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // 6. 答題記錄表 (原有的，增加與session的關聯)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS quiz_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        session_id INTEGER,
        question_id INTEGER NOT NULL,
        user_answer INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        time_spent INTEGER NOT NULL,
        points_earned INTEGER DEFAULT 0,
        quiz_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (session_id) REFERENCES quiz_sessions (id),
        FOREIGN KEY (question_id) REFERENCES questions (id)
      );`
    );

    // 7. 用戶統計表 (原有的，增加更多統計)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER DEFAULT 1,
        total_questions INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        total_time INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        total_sessions INTEGER DEFAULT 0,
        total_records INTEGER DEFAULT 0,
        last_quiz_date DATETIME,
        last_record_date DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );

    // 插入預設用戶和初始資料
    insertDefaultData(tx);
  });
};

// =============================================
// 插入預設資料
// =============================================

const insertDefaultData = (tx) => {
  // 插入預設用戶
  tx.executeSql(
    `INSERT OR IGNORE INTO users (id, name, level, total_points) 
     VALUES (1, '預設用戶', 1, 0);`
  );

  // 插入初始統計記錄
  tx.executeSql(
    `INSERT OR IGNORE INTO user_stats (id, user_id) 
     VALUES (1, 1);`
  );

  // 插入示例題目
  insertSampleQuestions(tx);
  
  // 插入成就類型定義
  insertAchievementTypes(tx);
};

// 插入示例題目
const insertSampleQuestions = (tx) => {
  const sampleQuestions = [
    {
      question: '什麼是複利效應？',
      options: JSON.stringify([
        '每年獲得固定利息',
        '利息再投資產生的利息',
        '銀行的手續費',
        '通膨的影響'
      ]),
      correct_answer: 1,
      category: '投資理財',
      difficulty: '初級',
      explanation: '複利效應是指利息會再產生利息，讓財富呈指數成長。',
      points_value: 10
    },
    {
      question: '緊急備用金通常建議準備幾個月的生活費？',
      options: JSON.stringify([
        '1-2個月',
        '3-6個月',
        '6-12個月',
        '12個月以上'
      ]),
      correct_answer: 1,
      category: '財務規劃',
      difficulty: '初級',
      explanation: '一般建議準備3-6個月的生活費作為緊急備用金。',
      points_value: 10
    },
    {
      question: '股票的本益比(P/E)計算公式是？',
      options: JSON.stringify([
        '股價 ÷ 每股盈餘',
        '每股盈餘 ÷ 股價',
        '股息 ÷ 股價',
        '股價 × 每股盈餘'
      ]),
      correct_answer: 0,
      category: '股票投資',
      difficulty: '中級',
      explanation: '本益比 = 股價 ÷ 每股盈餘，用來評估股票的價值。',
      points_value: 15
    },
    {
      question: '定期定額投資的主要優勢是？',
      options: JSON.stringify([
        '保證獲利',
        '降低平均成本',
        '完全無風險',
        '短期內快速致富'
      ]),
      correct_answer: 1,
      category: '投資策略',
      difficulty: '中級',
      explanation: '定期定額投資可以平攤成本，降低市場波動的影響。',
      points_value: 15
    },
    {
      question: '什麼是資產配置？',
      options: JSON.stringify([
        '把所有錢投資同一標的',
        '將資金分散投資不同類型資產',
        '只投資高風險商品',
        '將錢全部存在銀行'
      ]),
      correct_answer: 1,
      category: '投資策略',
      difficulty: '高級',
      explanation: '資產配置是將投資資金分散到不同風險和報酬特性的資產類別。',
      points_value: 20
    }
  ];

  sampleQuestions.forEach(q => {
    tx.executeSql(
      `INSERT OR IGNORE INTO questions (question, options, correct_answer, category, difficulty, explanation, points_value) 
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [q.question, q.options, q.correct_answer, q.category, q.difficulty, q.explanation, q.points_value]
    );
  });
};

// 插入成就類型
const insertAchievementTypes = (tx) => {
  const achievements = [
    { type: 'first_quiz', name: '初試啼聲', description: '完成第一次抽考', points: 50 },
    { type: 'quiz_streak_5', name: '連勝高手', description: '連續答對5題', points: 100 },
    { type: 'quiz_streak_10', name: '答題達人', description: '連續答對10題', points: 200 },
    { type: 'first_record', name: '記帳新手', description: '新增第一筆記帳記錄', points: 30 },
    { type: 'record_week', name: '持續記帳', description: '連續記帳7天', points: 150 },
    { type: 'points_100', name: '積分收集者', description: '累積100積分', points: 0 },
    { type: 'points_500', name: '積分大師', description: '累積500積分', points: 0 },
    { type: 'level_5', name: '初級理財師', description: '達到等級5', points: 0 },
    { type: 'perfect_session', name: '完美表現', description: '單次遊戲全對', points: 100 }
  ];

  // 這裡不直接插入成就，而是在達成條件時動態插入
};

// =============================================
// 用戶相關操作
// =============================================

// 獲取用戶資料
export const getUser = (userId = 1) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE id = ?;',
        [userId],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 更新用戶資料
export const updateUser = (userId = 1, userData) => {
  return new Promise((resolve, reject) => {
    const { name, level, total_points, avatar_url } = userData;
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE users SET 
         name = COALESCE(?, name),
         level = COALESCE(?, level),
         total_points = COALESCE(?, total_points),
         avatar_url = COALESCE(?, avatar_url),
         last_login = CURRENT_TIMESTAMP
         WHERE id = ?;`,
        [name, level, total_points, avatar_url, userId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

// 增加用戶積分
export const addUserPoints = (userId = 1, points) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE users SET total_points = total_points + ? WHERE id = ?;',
        [points, userId],
        () => {
          // 檢查是否達成積分成就
          checkPointsAchievements(userId, tx);
          resolve();
        },
        (_, error) => reject(error)
      );
    });
  });
};

// =============================================
// 記帳記錄操作
// =============================================

// 新增記帳記錄
export const addDailyRecord = (recordData) => {
  return new Promise((resolve, reject) => {
    const { user_id = 1, date, amount, category, type, description } = recordData;
    
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO daily_records (user_id, date, amount, category, type, description) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [user_id, date, amount, category, type, description],
        (_, result) => {
          // 更新統計
          updateUserStats(user_id, { total_records: 1, last_record_date: new Date().toISOString() }, tx);
          // 檢查成就
          checkRecordAchievements(user_id, tx);
          resolve(result.insertId);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 獲取記帳記錄
export const getDailyRecords = (userId = 1, limit = 50, offset = 0) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM daily_records 
         WHERE user_id = ? 
         ORDER BY date DESC, created_at DESC 
         LIMIT ? OFFSET ?;`,
        [userId, limit, offset],
        (_, result) => {
          const records = [];
          for (let i = 0; i < result.rows.length; i++) {
            records.push(result.rows.item(i));
          }
          resolve(records);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 獲取記帳統計
export const getRecordStatistics = (userId = 1, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT 
           type,
           category,
           SUM(amount) as total_amount,
           COUNT(*) as count
         FROM daily_records 
         WHERE user_id = ? 
         AND date BETWEEN ? AND ?
         GROUP BY type, category
         ORDER BY total_amount DESC;`,
        [userId, startDate, endDate],
        (_, result) => {
          const stats = [];
          for (let i = 0; i < result.rows.length; i++) {
            stats.push(result.rows.item(i));
          }
          resolve(stats);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 刪除記帳記錄
export const deleteDailyRecord = (recordId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM daily_records WHERE id = ?;',
        [recordId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

// =============================================
// 抽考遊戲操作
// =============================================

// 開始遊戲會話
export const startQuizSession = (userId = 1) => {
  return new Promise((resolve, reject) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO quiz_sessions (user_id, date, questions_asked, correct_answers, points_earned, duration_seconds) 
         VALUES (?, ?, 0, 0, 0, 0);`,
        [userId, currentDate],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

// 完成遊戲會話
export const completeQuizSession = (sessionId, sessionData) => {
  return new Promise((resolve, reject) => {
    const { questions_asked, correct_answers, points_earned, duration_seconds } = sessionData;
    
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE quiz_sessions SET 
         questions_asked = ?,
         correct_answers = ?,
         points_earned = ?,
         duration_seconds = ?
         WHERE id = ?;`,
        [questions_asked, correct_answers, points_earned, duration_seconds, sessionId],
        () => {
          // 更新用戶積分
          addUserPoints(1, points_earned);
          // 檢查遊戲成就
          checkQuizAchievements(1, sessionData, tx);
          resolve();
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 獲取遊戲會話記錄
export const getQuizSessions = (userId = 1, limit = 20) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM quiz_sessions 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?;`,
        [userId, limit],
        (_, result) => {
          const sessions = [];
          for (let i = 0; i < result.rows.length; i++) {
            sessions.push(result.rows.item(i));
          }
          resolve(sessions);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// =============================================
// 成就系統操作
// =============================================

// 解鎖成就
export const unlockAchievement = (userId = 1, achievementType, achievementData) => {
  return new Promise((resolve, reject) => {
    const { achievement_name, achievement_description, points_reward } = achievementData;
    
    db.transaction(tx => {
      // 檢查是否已經解鎖
      tx.executeSql(
        'SELECT id FROM achievements WHERE user_id = ? AND achievement_type = ?;',
        [userId, achievementType],
        (_, result) => {
          if (result.rows.length === 0) {
            // 解鎖新成就
            tx.executeSql(
              `INSERT INTO achievements (user_id, achievement_type, achievement_name, achievement_description, points_reward) 
               VALUES (?, ?, ?, ?, ?);`,
              [userId, achievementType, achievement_name, achievement_description, points_reward],
              () => {
                // 給予成就獎勵積分
                if (points_reward > 0) {
                  addUserPoints(userId, points_reward);
                }
                resolve(true); // 新解鎖
              },
              (_, error) => reject(error)
            );
          } else {
            resolve(false); // 已經解鎖
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 獲取用戶成就
export const getUserAchievements = (userId = 1) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM achievements 
         WHERE user_id = ? 
         ORDER BY unlocked_at DESC;`,
        [userId],
        (_, result) => {
          const achievements = [];
          for (let i = 0; i < result.rows.length; i++) {
            achievements.push(result.rows.item(i));
          }
          resolve(achievements);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// =============================================
// 成就檢查函數
// =============================================

const checkQuizAchievements = (userId, sessionData, tx) => {
  const { questions_asked, correct_answers } = sessionData;
  
  // 第一次抽考
  tx.executeSql(
    'SELECT COUNT(*) as count FROM quiz_sessions WHERE user_id = ?;',
    [userId],
    (_, result) => {
      if (result.rows.item(0).count === 1) {
        unlockAchievement(userId, 'first_quiz', {
          achievement_name: '初試啼聲',
          achievement_description: '完成第一次抽考',
          points_reward: 50
        });
      }
    }
  );
  
  // 完美表現 (全對)
  if (questions_asked > 0 && correct_answers === questions_asked) {
    unlockAchievement(userId, 'perfect_session', {
      achievement_name: '完美表現',
      achievement_description: '單次遊戲全對',
      points_reward: 100
    });
  }
};

const checkRecordAchievements = (userId, tx) => {
  // 第一筆記帳
  tx.executeSql(
    'SELECT COUNT(*) as count FROM daily_records WHERE user_id = ?;',
    [userId],
    (_, result) => {
      if (result.rows.item(0).count === 1) {
        unlockAchievement(userId, 'first_record', {
          achievement_name: '記帳新手',
          achievement_description: '新增第一筆記帳記錄',
          points_reward: 30
        });
      }
    }
  );
};

const checkPointsAchievements = (userId, tx) => {
  tx.executeSql(
    'SELECT total_points FROM users WHERE id = ?;',
    [userId],
    (_, result) => {
      const points = result.rows.item(0).total_points;
      
      if (points >= 100) {
        unlockAchievement(userId, 'points_100', {
          achievement_name: '積分收集者',
          achievement_description: '累積100積分',
          points_reward: 0
        });
      }
      
      if (points >= 500) {
        unlockAchievement(userId, 'points_500', {
          achievement_name: '積分大師',
          achievement_description: '累積500積分',
          points_reward: 0
        });
      }
    }
  );
};

// =============================================
// 原有函數 (稍作調整)
// =============================================

// 獲取隨機題目
export const getRandomQuestion = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM questions ORDER BY RANDOM() LIMIT 1;',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            const question = result.rows.item(0);
            question.options = JSON.parse(question.options);
            resolve(question);
          } else {
            reject(new Error('沒有可用的題目'));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 記錄答題結果
export const recordQuizResult = (questionId, userAnswer, isCorrect, timeSpent, sessionId = null) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 獲取題目分數
      tx.executeSql(
        'SELECT points_value FROM questions WHERE id = ?;',
        [questionId],
        (_, result) => {
          const points = isCorrect ? result.rows.item(0).points_value : 0;
          
          // 插入答題記錄
          tx.executeSql(
            `INSERT INTO quiz_records (user_id, session_id, question_id, user_answer, is_correct, time_spent, points_earned) 
             VALUES (1, ?, ?, ?, ?, ?, ?);`,
            [sessionId, questionId, userAnswer, isCorrect, timeSpent, points],
            () => {
              // 更新用戶統計
              updateUserStats(1, {
                total_questions: 1,
                correct_answers: isCorrect ? 1 : 0,
                total_time: timeSpent,
                last_quiz_date: new Date().toISOString()
              }, tx);
              
              resolve();
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 更新用戶統計
const updateUserStats = (userId, stats, tx) => {
  const {
    total_questions = 0,
    correct_answers = 0,
    total_time = 0,
    total_records = 0,
    last_quiz_date,
    last_record_date
  } = stats;

  tx.executeSql(
    `UPDATE user_stats SET 
     total_questions = total_questions + ?,
     correct_answers = correct_answers + ?,
     total_time = total_time + ?,
     total_records = total_records + ?,
     last_quiz_date = COALESCE(?, last_quiz_date),
     last_record_date = COALESCE(?, last_record_date),
     updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ?;`,
    [total_questions, correct_answers, total_time, total_records, last_quiz_date, last_record_date, userId]
  );
};

// 獲取用戶統計
export const getUserStats = (userId = 1) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM user_stats WHERE user_id = ?;',
        [userId],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve({
              total_questions: 0,
              correct_answers: 0,
              total_time: 0,
              total_records: 0,
              streak: 0,
              best_streak: 0
            });
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 獲取最近的答題記錄
export const getRecentQuizRecords = (userId = 1, limit = 10) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT qr.*, q.question, q.category 
         FROM quiz_records qr 
         JOIN questions q ON qr.question_id = q.id 
         WHERE qr.user_id = ?
         ORDER BY qr.quiz_date DESC 
         LIMIT ?;`,
        [userId, limit],
        (_, result) => {
          const records = [];
          for (let i = 0; i < result.rows.length; i++) {
            records.push(result.rows.item(i));
          }
          resolve(records);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// =============================================
// 測試用假資料生成函數
// =============================================

export const generateTestData = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      try {
        // 生成測試記帳記錄
        generateTestRecords(tx);
        
        // 生成測試遊戲記錄
        generateTestQuizSessions(tx);
        
        // 生成測試成就
        generateTestAchievements(tx);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

const generateTestRecords = (tx) => {
  const categories = {
    income: ['薪資', '獎金', '投資收益', '兼職', '其他收入'],
    expense: ['餐飲', '交通', '娛樂', '購物', '水電費', '房租', '醫療', '教育']
  };
  
  const amounts = {
    income: [30000, 5000, 2000, 8000, 1500],
    expense: [300, 150, 500, 800, 1200, 12000, 2000, 3000]
  };
  
  // 生成過去30天的記錄
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 隨機生成1-3筆記錄
    const recordCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < recordCount; j++) {
      const type = Math.random() > 0.7 ? 'income' : 'expense'; // 70%支出，30%收入
      const categoryList = categories[type];
      const amountList = amounts[type];
      
      const category = categoryList[Math.floor(Math.random() * categoryList.length)];
      const amount = amountList[Math.floor(Math.random() * amountList.length)];
      const description = `測試${category}記錄`;
      
      tx.executeSql(
        `INSERT INTO daily_records (user_id, date, amount, category, type, description) 
         VALUES (1, ?, ?, ?, ?, ?);`,
        [dateStr, amount, category, type, description]
      );
    }
  }
};

const generateTestQuizSessions = (tx) => {
  // 生成過去15天的遊戲記錄
  for (let i = 0; i < 15; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const questions_asked = Math.floor(Math.random() * 10) + 5; // 5-14題
    const correct_answers = Math.floor(Math.random() * questions_asked);
    const points_earned = correct_answers * 10;
    const duration_seconds = Math.floor(Math.random() * 300) + 60; // 1-6分鐘
    
    tx.executeSql(
      `INSERT INTO quiz_sessions (user_id, date, questions_asked, correct_answers, points_earned, duration_seconds) 
       VALUES (1, ?, ?, ?, ?, ?);`,
      [dateStr, questions_asked, correct_answers, points_earned, duration_seconds]
    );
  }
};

const generateTestAchievements = (tx) => {
  const testAchievements = [
    { type: 'first_quiz', name: '初試啼聲', description: '完成第一次抽考', points: 50 },
    { type: 'first_record', name: '記帳新手', description: '新增第一筆記帳記錄', points: 30 },
    { type: 'points_100', name: '積分收集者', description: '累積100積分', points: 0 }
  ];
  
  testAchievements.forEach(achievement => {
    tx.executeSql(
      `INSERT INTO achievements (user_id, achievement_type, achievement_name, achievement_description, points_reward) 
       VALUES (1, ?, ?, ?, ?);`,
      [achievement.type, achievement.name, achievement.description, achievement.points]
    );
  });
};