# 🎬 YouTube頻道影片自動化處理工具

這是一個強大的自動化工具，可以幫您：
- 📺 抓取YouTube頻道的所有影片
- 📝 自動下載影片字幕
- 🌏 翻譯成繁體中文逐字稿
- 📋 生成中文重點整理和金句摘錄
- 📄 自動整合到您的Notion資料庫

## 🚀 快速開始

### 1. 安裝依賴

```bash
pip install -r requirements.txt
```

### 2. 設定API金鑰

複製環境變數範例文件：
```bash
cp .env.example .env
```

編輯 `.env` 文件，填入您的API金鑰：
```env
# YouTube Data API 設定
YOUTUBE_API_KEY=your_youtube_api_key_here

# OpenAI API 設定
OPENAI_API_KEY=your_openai_api_key_here

# Notion API 設定
NOTION_TOKEN=your_notion_integration_token_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

### 3. 運行工具

**互動式模式（推薦）：**
```bash
python interactive.py
```

**命令列模式：**
```bash
# 處理整個頻道
python main.py --channel "https://www.youtube.com/@channelname" --max-videos 10

# 處理單個影片
python main.py --video "https://www.youtube.com/watch?v=VIDEO_ID"
```

## 🔧 詳細設定指南

### YouTube API 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用 YouTube Data API v3
4. 創建API金鑰
5. 將金鑰填入 `.env` 文件的 `YOUTUBE_API_KEY`

### OpenAI API 設定

1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 註冊帳號並登入
3. 前往 API Keys 頁面
4. 創建新的API金鑰
5. 將金鑰填入 `.env` 文件的 `OPENAI_API_KEY`

### Notion API 設定

#### 步驟1：創建Notion整合

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations)
2. 點擊「New integration」
3. 填入整合名稱（例如：YouTube Processor）
4. 選擇關聯的workspace
5. 複製生成的「Internal Integration Token」
6. 將Token填入 `.env` 文件的 `NOTION_TOKEN`

#### 步驟2：創建Notion資料庫

1. 在Notion中創建新頁面
2. 添加資料庫（Database）
3. 設定以下欄位：

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| 標題 | Title | 影片標題（必須） |
| 影片連結 | URL | YouTube影片連結 |
| 發布日期 | Date | 影片發布日期 |
| 影片長度 | Text | 影片時長 |
| 觀看次數 | Number | 觀看次數 |
| 標籤 | Multi-select | 標籤分類 |
| 處理日期 | Date | 處理完成日期 |

#### 步驟3：分享資料庫給整合

1. 在資料庫頁面點擊右上角的「Share」
2. 點擊「Invite」
3. 搜索並選擇您創建的整合
4. 點擊「Invite」

#### 步驟4：獲取資料庫ID

1. 複製資料庫頁面的URL
2. URL格式：`https://www.notion.so/workspace/DATABASE_ID?v=...`
3. 提取其中的 `DATABASE_ID`（32位字符串）
4. 將ID填入 `.env` 文件的 `NOTION_DATABASE_ID`

## 📋 使用方式

### 互動式模式

運行 `python interactive.py`，程式會引導您：

1. 選擇處理模式（頻道 or 單個影片）
2. 貼上YouTube連結
3. 設定處理參數
4. 自動開始處理

### 命令列模式

```bash
# 基本用法
python main.py --channel "頻道URL"

# 進階選項
python main.py --channel "頻道URL" \
    --max-videos 20 \
    --no-skip-existing \
    --verbose

# 處理單個影片
python main.py --video "影片URL"
```

#### 參數說明

- `--channel, -c`: YouTube頻道URL
- `--video, -v`: 單個YouTube影片URL
- `--max-videos, -m`: 最大處理影片數量（預設：10）
- `--no-skip-existing`: 不跳過已存在於Notion的影片
- `--verbose, -V`: 顯示詳細日誌

## 🎯 功能特色

### 智能字幕處理
- 優先下載繁體中文字幕
- 自動回退到簡體中文或英文字幕
- 支援自動生成字幕
- 使用多種方法確保字幕獲取成功

### 高品質翻譯
- 使用OpenAI GPT模型進行翻譯
- 保持原文格式和結構
- 自動檢測中文內容跳過翻譯
- 分段處理長文本避免限制

### 智能摘要生成
- 生成結構化重點整理
- 提取核心主題和關鍵洞察
- 整理實用建議和延伸思考
- 摘錄重要引言和金句

### Notion完美整合
- 自動創建結構化頁面
- 支援折疊式逐字稿顯示
- 智能去重避免重複處理
- 豐富的元數據記錄

## 📁 專案結構

```
youtube-processor/
├── main.py              # 主程式（命令列模式）
├── interactive.py       # 互動式程式
├── config.py           # 配置管理
├── youtube_handler.py  # YouTube API處理
├── subtitle_handler.py # 字幕下載處理
├── translator.py       # 翻譯和摘要生成
├── notion_handler.py   # Notion API處理
├── requirements.txt    # 依賴清單
├── .env.example       # 環境變數範例
└── README_YOUTUBE_TOOL.md # 使用說明
```

## 🔍 故障排除

### 常見問題

**1. YouTube API配額不足**
- 解決方案：等待配額重置或申請更高配額
- 每日免費配額：10,000 units

**2. 無法獲取字幕**
- 檢查影片是否有字幕
- 嘗試不同的語言設定
- 確認影片不是私人或受限制

**3. OpenAI API錯誤**
- 檢查API金鑰是否正確
- 確認帳戶有足夠餘額
- 注意API使用限制

**4. Notion連接失敗**
- 確認整合Token正確
- 檢查資料庫是否已分享給整合
- 驗證資料庫ID格式

### 日誌檢查

程式會生成 `youtube_processor.log` 日誌文件，包含詳細的執行資訊和錯誤訊息。

## 💡 使用技巧

1. **批量處理**：建議一次處理5-10個影片，避免API限制
2. **定期備份**：定期備份Notion資料庫
3. **成本控制**：監控OpenAI API使用量
4. **品質檢查**：處理完成後檢查翻譯和摘要品質

## 🤝 支援與回饋

如果您在使用過程中遇到問題或有改進建議，歡迎：
- 檢查日誌文件獲取詳細錯誤資訊
- 確認所有API金鑰設定正確
- 驗證網路連接正常

## 📄 授權

本專案僅供學習和個人使用。請遵守相關API的使用條款。