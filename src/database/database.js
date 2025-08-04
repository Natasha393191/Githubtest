import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('financeQuiz.db');

// 初始化資料庫
export const initializeDatabase = () => {
  db.transaction(tx => {
    // 創建題目表
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer INTEGER NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        explanation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // 創建答題記錄表
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS quiz_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        user_answer INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        time_spent INTEGER NOT NULL,
        quiz_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions (id)
      );`
    );

    // 創建用戶統計表
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_questions INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        total_time INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        last_quiz_date DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // 插入初始統計記錄
    tx.executeSql(
      `INSERT OR IGNORE INTO user_stats (id, total_questions, correct_answers) 
       VALUES (1, 0, 0);`
    );

    // 插入一些示例題目
    insertSampleQuestions(tx);
  });
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
      explanation: '複利效應是指利息會再產生利息，讓財富呈指數成長。'
    },
    {
      question: '什麼是緊急備用金？',
      options: JSON.stringify([
        '用來投資股票的錢',
        '應對突發狀況的資金',
        '買保險的錢',
        '娛樂支出'
      ]),
      correct_answer: 1,
      category: '財務規劃',
      difficulty: '初級',
      explanation: '緊急備用金是為了應對失業、疾病等突發狀況而預留的資金。'
    },
    {
      question: '股票的本益比(P/E)表示什麼？',
      options: JSON.stringify([
        '股價除以每股盈餘',
        '每股盈餘除以股價',
        '股息除以股價',
        '股價的漲幅'
      ]),
      correct_answer: 0,
      category: '股票投資',
      difficulty: '中級',
      explanation: '本益比 = 股價 ÷ 每股盈餘，用來評估股票是否昂貴。'
    }
  ];

  sampleQuestions.forEach(q => {
    tx.executeSql(
      `INSERT OR IGNORE INTO questions (question, options, correct_answer, category, difficulty, explanation) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [q.question, q.options, q.correct_answer, q.category, q.difficulty, q.explanation]
    );
  });
};

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
export const recordQuizResult = (questionId, userAnswer, isCorrect, timeSpent) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 插入答題記錄
      tx.executeSql(
        `INSERT INTO quiz_records (question_id, user_answer, is_correct, time_spent) 
         VALUES (?, ?, ?, ?);`,
        [questionId, userAnswer, isCorrect, timeSpent],
        () => {
          // 更新用戶統計
          tx.executeSql(
            `UPDATE user_stats SET 
             total_questions = total_questions + 1,
             correct_answers = correct_answers + ?,
             total_time = total_time + ?,
             last_quiz_date = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = 1;`,
            [isCorrect ? 1 : 0, timeSpent],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 獲取用戶統計
export const getUserStats = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM user_stats WHERE id = 1;',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve({
              total_questions: 0,
              correct_answers: 0,
              total_time: 0,
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
export const getRecentQuizRecords = (limit = 10) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT qr.*, q.question, q.category 
         FROM quiz_records qr 
         JOIN questions q ON qr.question_id = q.id 
         ORDER BY qr.quiz_date DESC 
         LIMIT ?;`,
        [limit],
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