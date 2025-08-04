// 理財抽考遊戲問題題庫
export const QUESTION_TYPES = {
  MAX_EXPENSE: 'max_expense',
  TOTAL_SPENT: 'total_spent',
  TOP_CATEGORY: 'top_category',
  IMPULSE_BUYING: 'impulse_buying',
  BUDGET_STATUS: 'budget_status',
  SAVINGS_GOAL: 'savings_goal',
  EXPENSE_COMPARISON: 'expense_comparison',
  PAYMENT_METHOD: 'payment_method'
};

export const EXPENSE_CATEGORIES = {
  FOOD: 'food',
  TRANSPORT: 'transport',
  ENTERTAINMENT: 'entertainment',
  SHOPPING: 'shopping',
  UTILITIES: 'utilities',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  OTHER: 'other'
};

export const CATEGORY_LABELS = {
  [EXPENSE_CATEGORIES.FOOD]: '食物',
  [EXPENSE_CATEGORIES.TRANSPORT]: '交通',
  [EXPENSE_CATEGORIES.ENTERTAINMENT]: '娛樂',
  [EXPENSE_CATEGORIES.SHOPPING]: '購物',
  [EXPENSE_CATEGORIES.UTILITIES]: '生活費',
  [EXPENSE_CATEGORIES.HEALTHCARE]: '醫療',
  [EXPENSE_CATEGORIES.EDUCATION]: '教育',
  [EXPENSE_CATEGORIES.OTHER]: '其他'
};

// 問題模板配置
export const QUESTION_TEMPLATES = {
  [QUESTION_TYPES.MAX_EXPENSE]: {
    type: QUESTION_TYPES.MAX_EXPENSE,
    title: '今天最大筆支出是多少？',
    description: '回想一下今天的消費記錄',
    difficulty: 1,
    generateOptions: (userExpenses) => {
      const maxExpense = Math.max(...userExpenses.map(e => e.amount));
      const options = [
        maxExpense,
        maxExpense + Math.floor(Math.random() * 100) + 50,
        maxExpense - Math.floor(Math.random() * 50) - 10,
        Math.floor(maxExpense * 0.7)
      ];
      return shuffleArray(options).map(amount => `$${amount}`);
    },
    getCorrectAnswer: (userExpenses) => {
      const maxExpense = Math.max(...userExpenses.map(e => e.amount));
      return `$${maxExpense}`;
    }
  },

  [QUESTION_TYPES.TOTAL_SPENT]: {
    type: QUESTION_TYPES.TOTAL_SPENT,
    title: '今天總共花了多少錢？',
    description: '計算今天所有的支出總額',
    difficulty: 2,
    generateOptions: (userExpenses) => {
      const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
      const options = [
        totalSpent,
        totalSpent + Math.floor(Math.random() * 200) + 100,
        totalSpent - Math.floor(Math.random() * 100) - 50,
        Math.floor(totalSpent * 1.3)
      ];
      return shuffleArray(options).map(amount => `$${amount}`);
    },
    getCorrectAnswer: (userExpenses) => {
      const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
      return `$${totalSpent}`;
    }
  },

  [QUESTION_TYPES.TOP_CATEGORY]: {
    type: QUESTION_TYPES.TOP_CATEGORY,
    title: '今天在哪個類別花最多錢？',
    description: '分析今天各類別的支出分佈',
    difficulty: 2,
    generateOptions: (userExpenses) => {
      const categoryTotals = {};
      userExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });
      
      const categories = Object.keys(categoryTotals);
      const otherCategories = Object.values(EXPENSE_CATEGORIES).filter(cat => !categories.includes(cat));
      
      // 確保有4個選項
      const allOptions = [...categories, ...otherCategories.slice(0, 4 - categories.length)];
      return shuffleArray(allOptions.slice(0, 4)).map(cat => CATEGORY_LABELS[cat]);
    },
    getCorrectAnswer: (userExpenses) => {
      const categoryTotals = {};
      userExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });
      
      const topCategory = Object.entries(categoryTotals)
        .reduce((max, [cat, amount]) => amount > max.amount ? {category: cat, amount} : max, 
                {category: null, amount: 0});
      
      return CATEGORY_LABELS[topCategory.category];
    }
  },

  [QUESTION_TYPES.IMPULSE_BUYING]: {
    type: QUESTION_TYPES.IMPULSE_BUYING,
    title: '今天有沒有衝動購物？',
    description: '回想今天是否有非計劃性的消費',
    difficulty: 1,
    generateOptions: () => ['有，買了不必要的東西', '沒有，都是計劃內消費', '有一點小衝動', '完全沒有消費'],
    getCorrectAnswer: (userExpenses, userAnswers) => {
      // 這個需要用戶自己判斷，可以根據支出金額和類別做智能推測
      const impulseCategories = [EXPENSE_CATEGORIES.ENTERTAINMENT, EXPENSE_CATEGORIES.SHOPPING];
      const hasImpulseExpense = userExpenses.some(e => 
        impulseCategories.includes(e.category) && e.amount > 500
      );
      return userAnswers?.impulse_buying || (hasImpulseExpense ? '有，買了不必要的東西' : '沒有，都是計劃內消費');
    }
  },

  [QUESTION_TYPES.BUDGET_STATUS]: {
    type: QUESTION_TYPES.BUDGET_STATUS,
    title: '今天的支出是否超出預算？',
    description: '對照每日預算檢視消費狀況',
    difficulty: 2,
    generateOptions: () => ['嚴重超支(超過50%)', '輕微超支(10-50%)', '在預算內', '大幅節省(低於80%)'],
    getCorrectAnswer: (userExpenses, userAnswers, dailyBudget = 1000) => {
      const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = totalSpent / dailyBudget;
      
      if (percentage > 1.5) return '嚴重超支(超過50%)';
      if (percentage > 1.1) return '輕微超支(10-50%)';
      if (percentage < 0.8) return '大幅節省(低於80%)';
      return '在預算內';
    }
  },

  [QUESTION_TYPES.EXPENSE_COMPARISON]: {
    type: QUESTION_TYPES.EXPENSE_COMPARISON,
    title: '相比昨天，今天花錢是多了還是少了？',
    description: '比較今天和昨天的總支出',
    difficulty: 3,
    generateOptions: () => ['多了很多(超過30%)', '多了一些(10-30%)', '差不多', '少了一些(10-30%)', '少了很多(超過30%)'],
    getCorrectAnswer: (userExpenses, userAnswers, yesterdayTotal = 800) => {
      const todayTotal = userExpenses.reduce((sum, e) => sum + e.amount, 0);
      const difference = (todayTotal - yesterdayTotal) / yesterdayTotal;
      
      if (difference > 0.3) return '多了很多(超過30%)';
      if (difference > 0.1) return '多了一些(10-30%)';
      if (difference < -0.3) return '少了很多(超過30%)';
      if (difference < -0.1) return '少了一些(10-30%)';
      return '差不多';
    }
  },

  [QUESTION_TYPES.PAYMENT_METHOD]: {
    type: QUESTION_TYPES.PAYMENT_METHOD,
    title: '今天主要使用什麼付款方式？',
    description: '回想今天最常使用的付款方式',
    difficulty: 1,
    generateOptions: () => ['現金', '信用卡', '悠遊卡/電子票證', '行動支付(Apple Pay/Google Pay)', '轉帳/匯款'],
    getCorrectAnswer: (userExpenses, userAnswers) => {
      // 統計付款方式
      const paymentMethods = {};
      userExpenses.forEach(expense => {
        const method = expense.paymentMethod || '現金';
        paymentMethods[method] = (paymentMethods[method] || 0) + 1;
      });
      
      const topMethod = Object.entries(paymentMethods)
        .reduce((max, [method, count]) => count > max.count ? {method, count} : max, 
                {method: '現金', count: 0});
      
      return topMethod.method;
    }
  }
};

// 工具函數：陣列洗牌
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 根據用戶數據生成問題
export const generateDailyQuestions = (userExpenses, userAnswers = {}, questionCount = 4) => {
  // 如果沒有消費記錄，使用模擬數據
  if (!userExpenses || userExpenses.length === 0) {
    userExpenses = generateMockExpenses();
  }

  // 選擇問題類型（確保多樣性）
  const availableTypes = Object.keys(QUESTION_TEMPLATES);
  const selectedTypes = shuffleArray(availableTypes).slice(0, questionCount);

  return selectedTypes.map((type, index) => {
    const template = QUESTION_TEMPLATES[type];
    const options = template.generateOptions(userExpenses, userAnswers);
    const correctAnswer = template.getCorrectAnswer(userExpenses, userAnswers);
    const correctIndex = options.indexOf(correctAnswer);

    return {
      id: `daily_${Date.now()}_${index}`,
      type: template.type,
      question: template.title,
      description: template.description,
      options: options,
      correctAnswer: correctIndex >= 0 ? correctIndex : 0,
      difficulty: template.difficulty,
      explanation: generateExplanation(template.type, userExpenses, correctAnswer)
    };
  });
};

// 生成問題解釋
const generateExplanation = (questionType, userExpenses, correctAnswer) => {
  switch (questionType) {
    case QUESTION_TYPES.MAX_EXPENSE:
      const maxExpense = Math.max(...userExpenses.map(e => e.amount));
      const maxExpenseItem = userExpenses.find(e => e.amount === maxExpense);
      return `今天最大筆支出是 ${correctAnswer}，花在「${CATEGORY_LABELS[maxExpenseItem?.category] || '其他'}」類別上。`;
    
    case QUESTION_TYPES.TOTAL_SPENT:
      return `今天總支出為 ${correctAnswer}。記錄每日支出有助於控制預算。`;
    
    case QUESTION_TYPES.TOP_CATEGORY:
      return `「${correctAnswer}」是今天花費最多的類別。了解支出分佈有助於調整消費習慣。`;
    
    case QUESTION_TYPES.IMPULSE_BUYING:
      return `衝動購物是理財的大敵。建議購買前先思考是否真的需要。`;
    
    default:
      return `記錄並分析消費習慣是理財的第一步！`;
  }
};

// 生成模擬消費數據（用於測試）
const generateMockExpenses = () => {
  const mockData = [
    { amount: 120, category: EXPENSE_CATEGORIES.FOOD, paymentMethod: '現金', description: '午餐' },
    { amount: 80, category: EXPENSE_CATEGORIES.TRANSPORT, paymentMethod: '悠遊卡', description: '捷運' },
    { amount: 350, category: EXPENSE_CATEGORIES.ENTERTAINMENT, paymentMethod: '信用卡', description: '電影票' },
    { amount: 200, category: EXPENSE_CATEGORIES.FOOD, paymentMethod: '行動支付', description: '晚餐' },
    { amount: 45, category: EXPENSE_CATEGORIES.OTHER, paymentMethod: '現金', description: '停車費' }
  ];
  
  return mockData;
};

export default QUESTION_TEMPLATES;