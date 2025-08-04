# 理財抽考遊戲 - React Native APP

一款使用React Native + Expo開發的理財知識學習應用程式，透過抽考遊戲的方式幫助用戶學習理財相關知識。

## 功能特色

- 🎯 **隨機抽考**：隨機抽取理財知識題目進行測驗
- 📊 **統計分析**：詳細的答題統計和進度追蹤
- 💾 **本地儲存**：使用SQLite本地資料庫，保護用戶隱私
- 🎨 **現代化UI**：採用綠色系主題，符合理財概念
- 📱 **跨平台**：支援iOS和Android雙平台

## 技術架構

- **框架**：React Native + Expo
- **導航**：React Navigation (Tab Navigator)
- **UI組件**：React Native Paper
- **資料庫**：SQLite (expo-sqlite)
- **圖標**：Material Icons
- **主題**：綠色系色彩設計

## 專案結構

```
/
├── App.js                    # 主應用程式檔案
├── app.json                  # Expo配置檔案
├── babel.config.js           # Babel配置
├── package.json              # 專案依賴
├── src/
│   ├── screens/              # 頁面組件
│   │   ├── HomeScreen.js     # 首頁
│   │   ├── QuizScreen.js     # 抽考頁面
│   │   ├── StatisticsScreen.js # 統計頁面
│   │   └── SettingsScreen.js # 設定頁面
│   ├── navigation/           # 導航配置
│   │   └── TabNavigator.js   # Tab導航器
│   ├── database/             # 資料庫相關
│   │   └── database.js       # SQLite資料庫操作
│   ├── constants/            # 常數定義
│   │   └── theme.js          # 主題色彩設定
│   ├── components/           # 共用組件
│   └── utils/                # 工具函數
└── assets/                   # 靜態資源
```

## 安裝與執行

### 環境需求

- Node.js (建議版本 16+)
- npm 或 yarn
- Expo CLI
- iOS模擬器或Android模擬器 (或實體裝置)

### 安裝步驟

1. **安裝依賴套件**
   ```bash
   npm install
   ```

2. **安裝Expo CLI** (如果尚未安裝)
   ```bash
   npm install -g expo-cli
   ```

3. **啟動開發伺服器**
   ```bash
   npm start
   # 或
   expo start
   ```

4. **在裝置上執行**
   - **iOS**：`npm run ios` 或在Expo開發工具中選擇iOS模擬器
   - **Android**：`npm run android` 或在Expo開發工具中選擇Android模擬器
   - **實體裝置**：使用Expo Go APP掃描QR碼

## 主要頁面說明

### 1. 首頁 (HomeScreen)
- 顯示歡迎資訊和APP概要
- 呈現答題統計摘要
- 提供快速開始按鈕
- 功能特色介紹

### 2. 抽考頁面 (QuizScreen)
- 隨機抽取理財知識題目
- 四選一的選擇題形式
- 即時答題結果反饋
- 顯示題目分類和難度
- 答題時間計算

### 3. 統計頁面 (StatisticsScreen)
- 總體統計數據顯示
- 答題正確率分析
- 平均答題時間統計
- 最近答題記錄列表
- 支援下拉重新整理

### 4. 設定頁面 (SettingsScreen)
- APP基本資訊
- 通知和音效設定
- 資料管理功能
- 關於和支援資訊

## 資料庫設計

### 資料表結構

1. **questions** - 題目表
   - id: 題目ID
   - question: 題目內容
   - options: 選項 (JSON格式)
   - correct_answer: 正確答案索引
   - category: 題目分類
   - difficulty: 難度等級
   - explanation: 解釋說明

2. **quiz_records** - 答題記錄表
   - id: 記錄ID
   - question_id: 題目ID
   - user_answer: 用戶答案
   - is_correct: 是否正確
   - time_spent: 答題時間
   - quiz_date: 答題日期

3. **user_stats** - 用戶統計表
   - total_questions: 總答題數
   - correct_answers: 答對數量
   - total_time: 總答題時間
   - streak: 目前連續答對
   - best_streak: 最佳連續記錄

## 自訂與擴展

### 新增題目
編輯 `src/database/database.js` 中的 `insertSampleQuestions` 函數，新增更多題目：

```javascript
const newQuestion = {
  question: '您的新題目',
  options: JSON.stringify(['選項1', '選項2', '選項3', '選項4']),
  correct_answer: 0, // 正確答案的索引 (0-3)
  category: '題目分類',
  difficulty: '初級', // 初級/中級/高級
  explanation: '題目解釋說明'
};
```

### 修改主題色彩
編輯 `src/constants/theme.js` 檔案，自訂APP的色彩主題。

### 新增功能頁面
1. 在 `src/screens/` 目錄建立新的頁面組件
2. 在 `src/navigation/TabNavigator.js` 中新增導航項目

## 建置與發布

### 建置APK (Android)
```bash
expo build:android
```

### 建置IPA (iOS)
```bash
expo build:ios
```

### 發布到Expo
```bash
expo publish
```

## 常見問題

**Q: 如何重置資料庫？**
A: 卸載APP重新安裝，或在設定頁面使用清除資料功能。

**Q: 題目不夠怎麼辦？**
A: 可以編輯資料庫檔案新增更多題目，或未來版本將支援線上題庫。

**Q: 支援哪些平台？**
A: 支援iOS和Android，也可以在Web上執行 (使用 `npm run web`)。

## 授權

MIT License

## 聯絡資訊

如有問題或建議，請透過APP內的意見反饋功能聯絡我們。

---

感謝使用理財抽考遊戲！祝您學習愉快！ 💚