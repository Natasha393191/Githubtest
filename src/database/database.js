import * as SQLite from 'expo-sqlite';

// 開啟資料庫連線
const db = SQLite.openDatabase('financeQuiz.db');

// 初始化資料庫
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // 創建題目表
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            correct_answer INTEGER NOT NULL,
            explanation TEXT,
            category TEXT,
            difficulty INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // 創建用戶答題記錄表
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS quiz_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            user_answer INTEGER,
            is_correct BOOLEAN NOT NULL,
            answer_time INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions (id)
          );`
        );

        // 創建用戶統計表
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            total_questions INTEGER DEFAULT 0,
            correct_answers INTEGER DEFAULT 0,
            study_time INTEGER DEFAULT 0,
            category TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // 創建用戶設定表
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_key TEXT UNIQUE NOT NULL,
            setting_value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // 插入初始題目數據
        insertInitialQuestions(tx);
        
        // 插入預設設定
        insertDefaultSettings(tx);
      },
      (error) => {
        console.error('資料庫初始化失敗:', error);
        reject(error);
      },
      () => {
        console.log('資料庫初始化成功');
        resolve();
      }
    );
  });
};

// 插入初始題目數據
const insertInitialQuestions = (tx) => {
  const initialQuestions = [
    {
      question: '什麼是複利？',
      options: JSON.stringify([
        '利息加入本金再計算利息',
        '固定利率計算',
        '單純的利息計算',
        '銀行手續費'
      ]),
      correct_answer: 0,
      explanation: '複利是指將利息加入本金後，再計算下一期的利息，讓資產能夠加速成長。',
      category: '基礎理財'
    },
    {
      question: '以下哪項不是投資風險管理的原則？',
      options: JSON.stringify([
        '分散投資',
        '定期檢視',
        '集中單一投資',
        '設定停損點'
      ]),
      correct_answer: 2,
      explanation: '集中單一投資會增加風險，分散投資才是風險管理的重要原則。',
      category: '投資概念'
    },
    {
      question: '緊急備用金建議準備幾個月的生活費？',
      options: JSON.stringify([
        '1-2個月',
        '3-6個月',
        '12個月',
        '不需要準備'
      ]),
      correct_answer: 1,
      explanation: '一般建議準備3-6個月的生活費作為緊急備用金，以應對突發狀況。',
      category: '基礎理財'
    },
    {
      question: '定期定額投資的主要優點是什麼？',
      options: JSON.stringify([
        '保證獲利',
        '降低投資風險',
        '平均成本效應',
        '免手續費'
      ]),
      correct_answer: 2,
      explanation: '定期定額投資能透過平均成本效應，降低市場波動對投資的影響。',
      category: '投資概念'
    },
    {
      question: '人壽保險的主要目的是什麼？',
      options: JSON.stringify([
        '投資理財',
        '保障家人生活',
        '節稅優惠',
        '儲蓄功能'
      ]),
      correct_answer: 1,
      explanation: '人壽保險的主要目的是在被保險人身故時，提供保障金給受益人，保障家人的生活。',
      category: '保險規劃'
    }
  ];

  initialQuestions.forEach((question) => {
    tx.executeSql(
      `INSERT OR IGNORE INTO questions (question, options, correct_answer, explanation, category) 
       VALUES (?, ?, ?, ?, ?)`,
      [question.question, question.options, question.correct_answer, question.explanation, question.category]
    );
  });
};

// 插入預設設定
const insertDefaultSettings = (tx) => {
  const defaultSettings = [
    { key: 'notifications', value: 'true' },
    { key: 'soundEffects', value: 'true' },
    { key: 'vibration', value: 'false' },
    { key: 'darkMode', value: 'false' },
    { key: 'autoSave', value: 'true' },
    { key: 'dailyReminder', value: 'true' }
  ];

  defaultSettings.forEach((setting) => {
    tx.executeSql(
      `INSERT OR IGNORE INTO user_settings (setting_key, setting_value) VALUES (?, ?)`,
      [setting.key, setting.value]
    );
  });
};

// 獲取隨機題目
export const getRandomQuestions = (count = 10, category = null) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        let query = `SELECT * FROM questions`;
        let params = [];
        
        if (category) {
          query += ` WHERE category = ?`;
          params.push(category);
        }
        
        query += ` ORDER BY RANDOM() LIMIT ?`;
        params.push(count);

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const questions = rows._array.map(question => ({
              ...question,
              options: JSON.parse(question.options)
            }));
            resolve(questions);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// 記錄答題結果
export const recordQuizResult = (questionId, userAnswer, isCorrect, answerTime = 0) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO quiz_records (question_id, user_answer, is_correct, answer_time) 
           VALUES (?, ?, ?, ?)`,
          [questionId, userAnswer, isCorrect, answerTime],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// 獲取統計數據
export const getStatistics = (period = 'all') => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        let dateFilter = '';
        const params = [];

        switch (period) {
          case 'week':
            dateFilter = `WHERE DATE(created_at) >= DATE('now', '-7 days')`;
            break;
          case 'month':
            dateFilter = `WHERE DATE(created_at) >= DATE('now', '-30 days')`;
            break;
          default:
            dateFilter = '';
        }

        // 獲取總體統計
        tx.executeSql(
          `SELECT 
            COUNT(*) as totalQuestions,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correctAnswers,
            ROUND(AVG(CASE WHEN is_correct = 1 THEN 100.0 ELSE 0.0 END), 0) as accuracy,
            SUM(answer_time) as totalTime
           FROM quiz_records ${dateFilter}`,
          params,
          (_, { rows }) => {
            const stats = rows._array[0];
            
            // 獲取分類統計
            tx.executeSql(
              `SELECT 
                q.category,
                COUNT(*) as total,
                SUM(CASE WHEN qr.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                ROUND(AVG(CASE WHEN qr.is_correct = 1 THEN 100.0 ELSE 0.0 END), 0) as accuracy
               FROM quiz_records qr
               JOIN questions q ON qr.question_id = q.id
               ${dateFilter}
               GROUP BY q.category`,
              params,
              (_, { rows: categoryRows }) => {
                const categoryStats = categoryRows._array;
                resolve({
                  ...stats,
                  categoryStats
                });
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// 更新用戶設定
export const updateSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO user_settings (setting_key, setting_value, updated_at) 
           VALUES (?, ?, CURRENT_TIMESTAMP)`,
          [key, value.toString()],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// 獲取用戶設定
export const getSettings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT setting_key, setting_value FROM user_settings`,
          [],
          (_, { rows }) => {
            const settings = {};
            rows._array.forEach(row => {
              settings[row.setting_key] = row.setting_value === 'true';
            });
            resolve(settings);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// 清除所有數據
export const clearAllData = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(`DELETE FROM quiz_records`);
        tx.executeSql(`DELETE FROM user_stats`);
        // 保留題目和設定
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};

export default db;