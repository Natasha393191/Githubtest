# 理財抽考遊戲 - 完整系統說明

## 🎮 遊戲概述

理財抽考遊戲是一個創新的個人化理財學習系統，根據用戶的每日記帳資料動態生成問題，透過遊戲化的方式幫助用戶檢視和反思自己的消費行為。

## 📋 功能規格

### 遊戲機制

#### 時間限制
- **遊戲時間**：每天晚上 21:00 - 23:00 (2小時)
- **每日限制**：每天只能玩一次
- **目的**：建立規律的理財檢視習慣

#### 問題生成
- **數量**：每次遊戲 3-5 個問題
- **來源**：基於當日記帳資料動態生成
- **類型**：個人化問題，反映真實消費狀況

#### 計分系統
- **基礎分數**：每答對一題 +10分
- **難度加成**：
  - 初級題目：1.0x
  - 中級題目：1.2x
  - 高級題目：1.5x
- **連續答對加成**：
  - 2題連對：1.2x
  - 3題連對：1.5x
  - 4題以上連對：2.0x
- **特殊獎勵**：
  - 完全答對：+20分
  - 快速答題(5秒內)：+5分
  - 當日首次遊戲：+10分

### 問題類型

#### 1. 支出金額相關
- "今天最大筆支出是多少？"
- "今天總共花了多少錢？"
- "今天平均每筆支出金額是多少？"

#### 2. 分類統計相關
- "今天在哪個類別花最多錢？"
- "餐飲支出佔今天總支出的比例是？"

#### 3. 行為反思相關
- "今天有沒有衝動購物？"
- "今天收入和支出相比如何？"

#### 4. 記帳習慣相關
- "今天總共記了幾筆帳？"

## 🏗️ 技術架構

### 系統組件

```
理財抽考遊戲系統
├── 問題題庫 (questionBank.js)
│   ├── QuestionGenerator 類別
│   ├── 動態問題生成
│   └── 答案驗證
├── 遊戲邏輯 (gameLogic.js)
│   ├── GameEngine 類別
│   ├── 遊戲流程控制
│   ├── 計分演算法
│   └── 成就系統
├── 狀態管理 (GameContext.js)
│   ├── React Context
│   ├── Reducer 狀態管理
│   └── Hook 介面
└── UI組件 (GameExample.js)
    ├── 遊戲界面
    ├── 結果展示
    └── 動畫效果
```

### 資料流程

```
用戶記帳資料 → 問題生成器 → 個人化問題
             ↓
遊戲引擎 ← 用戶答題 ← 遊戲界面
    ↓
計分系統 → 成就檢查 → 資料庫記錄
```

## 🔧 使用方式

### 1. 基本設置

```javascript
// App.js - 在根組件中包裝 GameProvider
import { GameProvider } from './src/game/GameContext';

export default function App() {
  return (
    <GameProvider>
      <YourAppComponents />
    </GameProvider>
  );
}
```

### 2. 在組件中使用遊戲系統

```javascript
import { useGame } from '../game/GameContext';

const GameScreen = () => {
  const {
    // 狀態
    isGameReady,
    currentQuestion,
    totalScore,
    combo,
    
    // 操作函數
    initGame,
    startGame,
    submitAnswer,
    resetGame
  } = useGame();
  
  // 遊戲邏輯...
};
```

### 3. 遊戲流程控制

```javascript
// 1. 初始化遊戲
const handleStartGame = async () => {
  const result = await initGame(userId);
  if (result.success) {
    // 遊戲準備就緒
  }
};

// 2. 開始答題
const handleBeginQuiz = () => {
  startGame();
};

// 3. 提交答案
const handleSubmitAnswer = async (answer) => {
  const answerTime = Date.now() - startTime;
  const result = await submitAnswer(answer, answerTime);
  // 處理結果...
};
```

## 🎯 遊戲狀態管理

### 狀態枚舉

```javascript
const GAME_STATES = {
  IDLE: 'idle',                    // 未開始
  LOADING: 'loading',              // 載入中
  READY: 'ready',                  // 準備開始
  PLAYING: 'playing',              // 遊戲中
  QUESTION_RESULT: 'question_result', // 顯示單題結果
  COMPLETED: 'completed',          // 遊戲完成
  TIME_RESTRICTED: 'time_restricted', // 時間限制
  ERROR: 'error'                   // 錯誤狀態
};
```

### 狀態轉換

```
IDLE → LOADING → READY → PLAYING → QUESTION_RESULT → PLAYING → ... → COMPLETED
  ↓       ↓        ↓        ↓            ↓              ↓           ↓
ERROR ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

## 📊 計分演算法詳解

### 基礎分數計算

```javascript
// 基礎分數 = 題目分數 × 難度係數
const baseScore = questionPoints * difficultyMultiplier;

// 難度係數
const DIFFICULTY_WEIGHTS = {
  easy: 1.0,     // 初級
  medium: 1.2,   // 中級
  hard: 1.5      // 高級
};
```

### Combo 加成計算

```javascript
// Combo倍數
const COMBO_MULTIPLIERS = {
  0: 1.0,   // 無combo
  1: 1.0,   // 1題連對
  2: 1.2,   // 2題連對
  3: 1.5,   // 3題連對
  4: 2.0    // 4題以上連對
};

// 最終分數 = (基礎分數 × Combo倍數) + 獎勵分數
const finalScore = (baseScore * comboMultiplier) + bonusScore;
```

### 獎勵分數

```javascript
const BONUS_SCORES = {
  PERFECT_GAME: 20,     // 全對獎勵
  FAST_ANSWER: 5,       // 快速答題獎勵 (5秒內)
  DAILY_FIRST: 10       // 當日首次遊戲
};
```

## 🏆 成就系統

### 成就類型

| 成就類型 | 成就名稱 | 解鎖條件 | 獎勵積分 |
|---------|---------|---------|---------|
| first_daily_quiz | 每日挑戰 | 完成每日理財抽考 | 10 |
| perfect_game | 完美表現 | 單次遊戲全部答對 | 50 |
| combo_master | Combo達人 | 連續答對3題以上 | 30 |
| first_record | 記帳新手 | 新增第一筆記帳記錄 | 30 |
| quiz_streak_5 | 連勝高手 | 連續答對5題 | 100 |

### 成就檢查邏輯

```javascript
// 自動檢查成就
const checkAchievements = async (gameResult) => {
  // 完美遊戲成就
  if (gameResult.correctAnswers === gameResult.totalQuestions) {
    await unlockAchievement('perfect_game', {
      achievement_name: '完美表現',
      achievement_description: '單次遊戲全部答對',
      points_reward: 50
    });
  }
  
  // Combo成就
  if (gameResult.maxCombo >= 3) {
    await unlockAchievement('combo_master', {
      achievement_name: 'Combo達人',
      achievement_description: '連續答對3題以上',
      points_reward: 30
    });
  }
};
```

## 🕒 時間限制系統

### 遊戲時間檢查

```javascript
const checkGameTimeRestriction = () => {
  const now = new Date();
  const currentHour = now.getHours();
  
  const isInGameTime = currentHour >= 21 && currentHour < 23;
  
  return {
    allowed: isInGameTime,
    currentHour,
    gameStartTime: 21,
    gameEndTime: 23
  };
};
```

### 時間限制處理

```javascript
// 檢查時間限制
const timeCheck = checkGameTimeRestriction();
if (!timeCheck.allowed) {
  // 顯示時間限制頁面
  showTimeRestrictionPage();
  return;
}
```

## 🔄 問題生成邏輯

### 資料分析

```javascript
const analyzeTodayData = (records) => {
  const expenses = records.filter(r => r.type === 'expense');
  const incomes = records.filter(r => r.type === 'income');
  
  return {
    totalExpense: expenses.reduce((sum, r) => sum + r.amount, 0),
    totalIncome: incomes.reduce((sum, r) => sum + r.amount, 0),
    maxExpense: Math.max(...expenses.map(r => r.amount)),
    topCategory: getTopCategory(expenses),
    transactionCount: records.length,
    averageExpense: calculateAverage(expenses)
  };
};
```

### 動態問題生成

```javascript
const generateQuestions = async (userId) => {
  // 1. 獲取今日記帳資料
  const todayRecords = await getTodayRecords(userId);
  
  // 2. 分析資料
  const analysis = analyzeTodayData(todayRecords);
  
  // 3. 生成各類型問題
  const questions = [
    generateMaxExpenseQuestion(analysis),
    generateTotalExpenseQuestion(analysis),
    generateTopCategoryQuestion(analysis),
    generateImpulseBuyingQuestion(analysis)
  ].filter(Boolean);
  
  // 4. 隨機選擇指定數量
  return shuffleArray(questions).slice(0, 4);
};
```

## 🎨 UI 組件設計

### 遊戲進度顯示

```javascript
const GameProgress = ({ current, total, score, combo }) => (
  <Surface style={styles.progressContainer}>
    <View style={styles.progressHeader}>
      <Text>題目 {current} / {total}</Text>
      <View style={styles.scoreContainer}>
        <Text>分數: {score}</Text>
        {combo > 0 && (
          <Chip icon="flash-on">Combo x{combo}</Chip>
        )}
      </View>
    </View>
    <ProgressBar progress={current / total} />
  </Surface>
);
```

### 問題顯示卡片

```javascript
const QuestionCard = ({ question, onAnswer }) => (
  <Card style={styles.questionCard}>
    <Card.Content>
      <Title>{question.question}</Title>
      <RadioButton.Group onValueChange={onAnswer}>
        {question.options.map((option, index) => (
          <RadioButton.Item
            key={index}
            label={option}
            value={index.toString()}
          />
        ))}
      </RadioButton.Group>
    </Card.Content>
  </Card>
);
```

## 📈 性能優化

### 狀態管理優化

```javascript
// 使用選擇器 Hook 避免不必要的重渲染
const useGameProgress = () => {
  const { gameProgress } = useGame();
  return gameProgress;
};

const useCurrentQuestion = () => {
  const { currentQuestion } = useGame();
  return currentQuestion;
};
```

### 記憶體管理

```javascript
// 組件卸載時清理定時器
useEffect(() => {
  const timer = setTimeout(() => {
    // 自動完成遊戲
  }, 300000); // 5分鐘後自動完成

  return () => clearTimeout(timer);
}, []);
```

## 🐛 錯誤處理

### 遊戲錯誤類型

```javascript
const GAME_ERRORS = {
  TIME_RESTRICTED: '時間限制',
  NO_QUESTIONS: '無法生成問題',
  DAILY_LIMIT_REACHED: '每日限制已達',
  INITIALIZATION_ERROR: '初始化失敗',
  SUBMIT_ERROR: '提交答案失敗'
};
```

### 錯誤處理策略

```javascript
const handleGameError = (error) => {
  switch (error.type) {
    case 'TIME_RESTRICTED':
      showTimeRestrictionMessage();
      break;
    case 'NO_QUESTIONS':
      showNoRecordsMessage();
      break;
    default:
      showGenericErrorMessage();
  }
};
```

## 🧪 測試與調試

### 開發模式設定

```javascript
// 開發模式下可以關閉時間限制
const GAME_CONFIG = {
  DAILY_QUESTION_COUNT: 4,
  GAME_TIME_START: __DEV__ ? 0 : 21,  // 開發模式下全天可玩
  GAME_TIME_END: __DEV__ ? 24 : 23,
  ENABLE_DEV_MODE: __DEV__
};
```

### 假資料生成

```javascript
// 生成測試用記帳資料
if (__DEV__) {
  await generateTestData();
}
```

## 📱 實際應用整合

### 整合到現有 QuizScreen

```javascript
// 更新原有的 QuizScreen.js
import { GameProvider, useGame } from '../game/GameContext';

const QuizScreen = () => {
  return (
    <GameProvider>
      <GameScreenContent />
    </GameProvider>
  );
};

const GameScreenContent = () => {
  const game = useGame();
  // 使用遊戲系統...
};
```

### 導航整合

```javascript
// 在 TabNavigator 中更新
<Tab.Screen 
  name="Quiz" 
  component={QuizScreen} 
  options={{ 
    title: '每日抽考',
    tabBarBadge: game.isGameAvailable ? '!' : null
  }} 
/>
```

---

這個遊戲系統提供了完整的理財抽考功能，包含個人化問題生成、計分系統、成就機制和完善的狀態管理，可以直接整合到您的理財APP中使用。