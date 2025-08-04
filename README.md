# 理財抽考遊戲 📱💰

一個使用 React Native + Expo 開發的理財知識學習應用程式。透過有趣的抽考遊戲形式，幫助使用者提升理財知識和技能。

## ✨ 主要功能

### 🏠 首頁
- 歡迎界面與應用簡介
- 今日學習統計概覽
- 快速導航到各功能頁面

### 📚 抽考遊戲
- 隨機題目抽取系統
- 多選題答題介面
- 實時答案驗證與解釋
- 進度追踪顯示

### 📊 學習統計
- 多時間期間統計（本週/本月/全部）
- 正確率分析與視覺化
- 分類別學習成效統計
- 學習成就系統

### ⚙️ 個人設定
- 通知與提醒設定
- 介面個人化選項
- 資料管理功能
- 應用資訊查看

## 🎨 設計特色

- **現代化 UI 設計**：採用 Material Design 設計語言
- **綠色主題配色**：符合理財應用的專業感
- **響應式佈局**：適配不同尺寸的手機螢幕
- **友善的使用體驗**：直觀的導航和操作流程

## 🛠 技術架構

### 核心技術
- **React Native**: 跨平台行動應用開發
- **Expo**: 開發框架和工具鏈
- **SQLite**: 本地資料庫儲存
- **React Navigation**: 頁面導航管理

### 主要依賴
```json
{
  "expo": "~50.0.0",
  "react": "18.2.0",
  "react-native": "0.73.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "expo-sqlite": "~13.4.0"
}
```

## 📁 專案結構

```
finance-quiz-app/
├── App.js                 # 主應用程式檔案
├── app.json               # Expo 配置
├── package.json           # 專案依賴管理
├── babel.config.js        # Babel 編譯配置
└── src/
    ├── screens/           # 頁面元件
    │   ├── HomeScreen.js      # 首頁
    │   ├── QuizScreen.js      # 抽考頁面
    │   ├── StatisticsScreen.js # 統計頁面
    │   └── SettingsScreen.js   # 設定頁面
    ├── database/          # 資料庫管理
    │   └── database.js        # SQLite 操作
    ├── theme/             # 主題配置
    │   └── colors.js          # 顏色系統
    └── utils/             # 工具函數
        └── constants.js       # 常數定義
```

## 🚀 快速開始

### 環境需求
- Node.js 16+ 
- Expo CLI
- iOS 模擬器 或 Android 模擬器
- 實體設備（選用）

### 安裝步驟

1. **複製專案**
   ```bash
   git clone [your-repo-url]
   cd finance-quiz-app
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發伺服器**
   ```bash
   npm start
   ```

4. **運行應用**
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

### 開發說明

- 使用 `expo start` 啟動開發環境
- 可以通過 Expo Go 應用在實體設備上測試
- 支援熱重載，修改代碼即時預覽效果

## 📱 功能截圖

*（此處可以加入應用截圖）*

## 🗃️ 資料庫設計

### 主要資料表

1. **questions** - 題目資料
   - 題目內容、選項、正確答案
   - 分類、難度、解釋說明

2. **quiz_records** - 答題記錄
   - 用戶答案、正確性、答題時間
   - 關聯題目資訊

3. **user_stats** - 用戶統計
   - 每日學習數據
   - 分類別統計資訊

4. **user_settings** - 用戶設定
   - 個人化偏好設定
   - 通知與介面選項

## 🔧 自定義配置

### 修改主題顏色
編輯 `src/theme/colors.js` 檔案來自定義顏色配置：

```javascript
export const theme = {
  primary: '#2E8B57',      // 主要顏色
  secondary: '#90EE90',    // 次要顏色
  accent: '#32CD32',       // 強調顏色
  // ... 其他顏色
};
```

### 新增題目內容
在 `src/database/database.js` 的 `insertInitialQuestions` 函數中新增題目：

```javascript
const initialQuestions = [
  {
    question: '你的題目內容',
    options: JSON.stringify(['選項A', '選項B', '選項C', '選項D']),
    correct_answer: 0, // 正確答案索引
    explanation: '解釋說明',
    category: '分類名稱'
  }
];
```

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request 來協助改善這個專案！

1. Fork 這個專案
2. 建立你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

## 📝 授權條款

此專案採用 MIT 授權條款 - 查看 [LICENSE](LICENSE) 檔案了解詳情。

## 🙏 致謝

- [React Native](https://reactnative.dev/) - 跨平台框架
- [Expo](https://expo.dev/) - 開發工具
- [React Navigation](https://reactnavigation.org/) - 導航解決方案
- [Ionicons](https://ionic.io/ionicons) - 圖標庫

---

**祝您學習愉快！📈💰**