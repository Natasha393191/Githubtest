// =============================================
// 理財抽考遊戲 - 動態問題題庫
// =============================================

import { getDailyRecords, getRecordStatistics } from '../database/database';

// 問題類型定義
export const QUESTION_TYPES = {
  MAX_EXPENSE: 'max_expense',
  TOTAL_EXPENSE: 'total_expense',
  TOP_CATEGORY: 'top_category',
  IMPULSE_BUYING: 'impulse_buying',
  INCOME_VS_EXPENSE: 'income_vs_expense',
  TRANSACTION_COUNT: 'transaction_count',
  AVERAGE_EXPENSE: 'average_expense',
  CATEGORY_PERCENTAGE: 'category_percentage'
};

// 支出分類定義
export const EXPENSE_CATEGORIES = {
  food: '餐飲',
  transport: '交通',
  entertainment: '娛樂',
  shopping: '購物',
  utilities: '水電費',
  rent: '房租',
  medical: '醫療',
  education: '教育',
  other: '其他'
};

// 問題模板類別
export class QuestionGenerator {
  constructor() {
    this.questionTemplates = {
      [QUESTION_TYPES.MAX_EXPENSE]: {
        template: "今天最大筆支出是多少？",
        type: "multiple_choice",
        difficulty: "easy",
        points: 10
      },
      [QUESTION_TYPES.TOTAL_EXPENSE]: {
        template: "今天總共花了多少錢？",
        type: "multiple_choice", 
        difficulty: "easy",
        points: 10
      },
      [QUESTION_TYPES.TOP_CATEGORY]: {
        template: "今天在哪個類別花最多錢？",
        type: "multiple_choice",
        difficulty: "medium",
        points: 15
      },
      [QUESTION_TYPES.IMPULSE_BUYING]: {
        template: "今天有沒有衝動購物？",
        type: "yes_no",
        difficulty: "medium",
        points: 15
      },
      [QUESTION_TYPES.INCOME_VS_EXPENSE]: {
        template: "今天收入和支出相比如何？",
        type: "multiple_choice",
        difficulty: "medium",
        points: 15
      },
      [QUESTION_TYPES.TRANSACTION_COUNT]: {
        template: "今天總共記了幾筆帳？",
        type: "multiple_choice",
        difficulty: "easy",
        points: 10
      },
      [QUESTION_TYPES.AVERAGE_EXPENSE]: {
        template: "今天平均每筆支出金額是多少？",
        type: "multiple_choice",
        difficulty: "hard",
        points: 20
      },
      [QUESTION_TYPES.CATEGORY_PERCENTAGE]: {
        template: "餐飲支出佔今天總支出的比例是？",
        type: "multiple_choice",
        difficulty: "hard",
        points: 20
      }
    };
  }

  // 獲取今日記帳資料
  async getTodayRecords(userId = 1) {
    const today = new Date().toISOString().split('T')[0];
    const records = await getDailyRecords(userId, 100);
    return records.filter(record => record.date === today);
  }

  // 分析今日記帳資料
  analyzeTodayData(records) {
    const expenses = records.filter(r => r.type === 'expense');
    const incomes = records.filter(r => r.type === 'income');
    
    const totalExpense = expenses.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    const totalIncome = incomes.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    
    // 按分類統計支出
    const categoryStats = {};
    expenses.forEach(record => {
      const category = record.category;
      categoryStats[category] = (categoryStats[category] || 0) + parseFloat(record.amount);
    });

    // 找出最大支出
    const maxExpense = expenses.length > 0 ? 
      Math.max(...expenses.map(r => parseFloat(r.amount))) : 0;

    // 找出花費最多的分類
    const topCategory = Object.keys(categoryStats).reduce((a, b) => 
      categoryStats[a] > categoryStats[b] ? a : b, null);

    // 計算平均支出
    const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;

    // 計算餐飲比例
    const foodExpense = categoryStats['餐飲'] || 0;
    const foodPercentage = totalExpense > 0 ? (foodExpense / totalExpense) * 100 : 0;

    return {
      totalExpense,
      totalIncome,
      maxExpense,
      topCategory,
      categoryStats,
      transactionCount: records.length,
      expenseCount: expenses.length,
      averageExpense,
      foodPercentage,
      records: records
    };
  }

  // 生成最大支出問題
  generateMaxExpenseQuestion(data) {
    const { maxExpense } = data;
    
    if (maxExpense === 0) return null;

    const correctAnswer = Math.round(maxExpense);
    const options = this.generateAmountOptions(correctAnswer);

    return {
      id: `max_expense_${Date.now()}`,
      type: QUESTION_TYPES.MAX_EXPENSE,
      question: "今天最大筆支出是多少？",
      options: options,
      correctAnswer: options.indexOf(correctAnswer.toString()),
      explanation: `您今天最大筆支出是 ${correctAnswer} 元`,
      points: 10,
      difficulty: "easy"
    };
  }

  // 生成總支出問題
  generateTotalExpenseQuestion(data) {
    const { totalExpense } = data;
    
    if (totalExpense === 0) return null;

    const correctAnswer = Math.round(totalExpense);
    const options = this.generateAmountOptions(correctAnswer);

    return {
      id: `total_expense_${Date.now()}`,
      type: QUESTION_TYPES.TOTAL_EXPENSE,
      question: "今天總共花了多少錢？",
      options: options,
      correctAnswer: options.indexOf(correctAnswer.toString()),
      explanation: `您今天總共花了 ${correctAnswer} 元`,
      points: 10,
      difficulty: "easy"
    };
  }

  // 生成分類問題
  generateTopCategoryQuestion(data) {
    const { topCategory, categoryStats } = data;
    
    if (!topCategory || Object.keys(categoryStats).length < 2) return null;

    const categories = Object.keys(categoryStats);
    const otherCategories = categories.filter(c => c !== topCategory);
    
    // 隨機選擇3個其他分類作為錯誤選項
    const wrongOptions = otherCategories
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const options = [topCategory, ...wrongOptions].sort(() => 0.5 - Math.random());

    return {
      id: `top_category_${Date.now()}`,
      type: QUESTION_TYPES.TOP_CATEGORY,
      question: "今天在哪個類別花最多錢？",
      options: options,
      correctAnswer: options.indexOf(topCategory),
      explanation: `您今天在「${topCategory}」類別花最多錢，共 ${Math.round(categoryStats[topCategory])} 元`,
      points: 15,
      difficulty: "medium"
    };
  }

  // 生成衝動購物問題
  generateImpulseBuyingQuestion(data) {
    const { records } = data;
    
    // 簡單邏輯：檢查是否有「娛樂」或「購物」分類的支出
    const hasImpulseBuying = records.some(r => 
      r.type === 'expense' && 
      (r.category === '娛樂' || r.category === '購物') &&
      parseFloat(r.amount) > 200 // 假設超過200元可能是衝動購物
    );

    return {
      id: `impulse_buying_${Date.now()}`,
      type: QUESTION_TYPES.IMPULSE_BUYING,
      question: "今天有沒有衝動購物？",
      options: ["有", "沒有"],
      correctAnswer: hasImpulseBuying ? 0 : 1,
      explanation: hasImpulseBuying ? 
        "根據您的消費記錄，今天可能有衝動購物行為" : 
        "今天沒有明顯的衝動購物",
      points: 15,
      difficulty: "medium"
    };
  }

  // 生成收支比較問題
  generateIncomeVsExpenseQuestion(data) {
    const { totalIncome, totalExpense } = data;
    
    if (totalIncome === 0 && totalExpense === 0) return null;

    let correctOption;
    if (totalIncome > totalExpense) {
      correctOption = "收入大於支出";
    } else if (totalIncome < totalExpense) {
      correctOption = "支出大於收入";
    } else {
      correctOption = "收支平衡";
    }

    const options = ["收入大於支出", "支出大於收入", "收支平衡", "沒有記錄"];

    return {
      id: `income_vs_expense_${Date.now()}`,
      type: QUESTION_TYPES.INCOME_VS_EXPENSE,
      question: "今天收入和支出相比如何？",
      options: options,
      correctAnswer: options.indexOf(correctOption),
      explanation: `今天收入 ${Math.round(totalIncome)} 元，支出 ${Math.round(totalExpense)} 元`,
      points: 15,
      difficulty: "medium"
    };
  }

  // 生成交易筆數問題
  generateTransactionCountQuestion(data) {
    const { transactionCount } = data;
    
    if (transactionCount === 0) return null;

    const correctAnswer = transactionCount;
    const options = this.generateCountOptions(correctAnswer);

    return {
      id: `transaction_count_${Date.now()}`,
      type: QUESTION_TYPES.TRANSACTION_COUNT,
      question: "今天總共記了幾筆帳？",
      options: options.map(String),
      correctAnswer: options.indexOf(correctAnswer),
      explanation: `您今天總共記了 ${correctAnswer} 筆帳`,
      points: 10,
      difficulty: "easy"
    };
  }

  // 生成平均支出問題
  generateAverageExpenseQuestion(data) {
    const { averageExpense, expenseCount } = data;
    
    if (expenseCount === 0) return null;

    const correctAnswer = Math.round(averageExpense);
    const options = this.generateAmountOptions(correctAnswer);

    return {
      id: `average_expense_${Date.now()}`,
      type: QUESTION_TYPES.AVERAGE_EXPENSE,
      question: "今天平均每筆支出金額是多少？",
      options: options,
      correctAnswer: options.indexOf(correctAnswer.toString()),
      explanation: `您今天平均每筆支出 ${correctAnswer} 元`,
      points: 20,
      difficulty: "hard"
    };
  }

  // 生成分類比例問題
  generateCategoryPercentageQuestion(data) {
    const { foodPercentage, totalExpense } = data;
    
    if (totalExpense === 0) return null;

    const correctAnswer = Math.round(foodPercentage);
    const options = this.generatePercentageOptions(correctAnswer);

    return {
      id: `category_percentage_${Date.now()}`,
      type: QUESTION_TYPES.CATEGORY_PERCENTAGE,
      question: "餐飲支出佔今天總支出的比例是？",
      options: options.map(p => `${p}%`),
      correctAnswer: options.indexOf(correctAnswer),
      explanation: `餐飲支出佔今天總支出的 ${correctAnswer}%`,
      points: 20,
      difficulty: "hard"
    };
  }

  // 生成金額選項 (用於金額相關問題)
  generateAmountOptions(correctAmount) {
    const options = [correctAmount];
    
    // 生成接近的錯誤選項
    const variations = [0.5, 0.8, 1.2, 1.5, 2.0];
    
    while (options.length < 4) {
      const variation = variations[Math.floor(Math.random() * variations.length)];
      const wrongAmount = Math.round(correctAmount * variation);
      
      if (!options.includes(wrongAmount) && wrongAmount > 0) {
        options.push(wrongAmount);
      }
    }
    
    return options.sort(() => 0.5 - Math.random()).map(String);
  }

  // 生成數量選項 (用於筆數相關問題)
  generateCountOptions(correctCount) {
    const options = [correctCount];
    const possibleOptions = [
      correctCount - 2,
      correctCount - 1,
      correctCount + 1,
      correctCount + 2,
      correctCount + 3
    ].filter(n => n > 0);

    while (options.length < 4 && possibleOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleOptions.length);
      const option = possibleOptions.splice(randomIndex, 1)[0];
      options.push(option);
    }

    return options.sort(() => 0.5 - Math.random());
  }

  // 生成百分比選項 (用於比例相關問題)
  generatePercentageOptions(correctPercentage) {
    const options = [correctPercentage];
    const variations = [-20, -10, +10, +20, +30];
    
    while (options.length < 4) {
      const variation = variations[Math.floor(Math.random() * variations.length)];
      const percentage = Math.max(0, Math.min(100, correctPercentage + variation));
      
      if (!options.includes(percentage)) {
        options.push(percentage);
      }
    }
    
    return options.sort(() => 0.5 - Math.random());
  }

  // 主要方法：生成今日問題
  async generateTodayQuestions(userId = 1, questionCount = 4) {
    try {
      const records = await this.getTodayRecords(userId);
      
      if (records.length === 0) {
        // 如果沒有記帳記錄，返回提醒問題
        return [{
          id: `no_records_${Date.now()}`,
          type: 'reminder',
          question: "您今天還沒有記帳記錄，是否要先記帳再來抽考？",
          options: ["馬上去記帳", "隨便玩玩"],
          correctAnswer: 0,
          explanation: "建議先記帳再來玩遊戲，這樣才能檢視您的理財狀況！",
          points: 0,
          difficulty: "reminder"
        }];
      }

      const data = this.analyzeTodayData(records);
      const availableQuestions = [];

      // 生成各種類型的問題
      const generators = [
        () => this.generateMaxExpenseQuestion(data),
        () => this.generateTotalExpenseQuestion(data),
        () => this.generateTopCategoryQuestion(data),
        () => this.generateImpulseBuyingQuestion(data),
        () => this.generateIncomeVsExpenseQuestion(data),
        () => this.generateTransactionCountQuestion(data),
        () => this.generateAverageExpenseQuestion(data),
        () => this.generateCategoryPercentageQuestion(data)
      ];

      // 執行問題生成
      for (const generator of generators) {
        const question = generator();
        if (question) {
          availableQuestions.push(question);
        }
      }

      // 隨機選擇指定數量的問題
      const selectedQuestions = availableQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(questionCount, availableQuestions.length));

      return selectedQuestions;

    } catch (error) {
      console.error('生成問題失敗:', error);
      return [];
    }
  }

  // 驗證答案
  validateAnswer(question, userAnswer) {
    return userAnswer === question.correctAnswer;
  }

  // 獲取問題說明
  getQuestionExplanation(question) {
    return question.explanation || "感謝您的回答！";
  }
}

// 導出實例
export const questionGenerator = new QuestionGenerator();

// 導出便捷函數
export const generateDailyQuestions = (userId, count) => 
  questionGenerator.generateTodayQuestions(userId, count);

export const validateQuestionAnswer = (question, answer) =>
  questionGenerator.validateAnswer(question, answer);

// 問題難度權重 (用於積分計算)
export const DIFFICULTY_WEIGHTS = {
  easy: 1.0,
  medium: 1.2,
  hard: 1.5,
  reminder: 0.0
};

// 預設問題設定
export const GAME_CONFIG = {
  DAILY_QUESTION_COUNT: 4,
  MIN_QUESTION_COUNT: 3,
  MAX_QUESTION_COUNT: 5,
  GAME_TIME_START: 21, // 晚上9點
  GAME_TIME_END: 23,   // 晚上11點
};