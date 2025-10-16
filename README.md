# YouTube影片自動化處理工具 🎬

一個功能強大的YouTube頻道影片自動化處理工具，能夠自動抓取YouTube頻道影片、下載字幕、翻譯成中文逐字稿、生成重點整理，並整合到Notion資料庫中。

## ✨ 主要功能

- 🎯 **YouTube頻道影片抓取** - 自動獲取頻道內所有影片資訊
- 📝 **智能字幕下載** - 支援多語言字幕下載，優先選擇中文字幕
- 🌐 **自動翻譯** - 使用OpenAI API將外語字幕翻譯成繁體中文
- 📋 **重點整理生成** - AI自動生成結構化的影片重點摘要
- 💬 **重要引言提取** - 提取影片中的關鍵金句和洞察
- 📚 **Notion整合** - 自動創建結構化的Notion頁面保存所有內容
- 🖥️ **圖形介面** - 提供友善的GUI介面，操作簡單直觀
- ⚡ **批量處理** - 支援批量處理多個影片，提高效率

## 🚀 快速開始

### 1. 環境準備

確保您的系統已安裝Python 3.7或更高版本：

```bash
python --version
```

### 2. 安裝依賴

```bash
pip install -r requirements.txt
```

### 3. API設定

您需要獲取以下API金鑰：

#### YouTube Data API v3
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用YouTube Data API v3
4. 創建API金鑰

#### OpenAI API
1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 註冊帳號並獲取API金鑰
3. 確保帳戶有足夠的額度

#### Notion API
1. 前往 [Notion Developers](https://developers.notion.com/)
2. 創建新的Integration
3. 獲取Integration Token
4. 創建資料庫並獲取Database ID
5. 將Integration添加到資料庫中

### 4. 配置設定

複製環境變數範本：

```bash
cp .env.example .env
```

編輯 `.env` 文件，填入您的API金鑰：

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
NOTION_TOKEN=your_notion_integration_token_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

## 📖 使用方式

### 方式一：圖形介面（推薦）

啟動GUI介面：

```bash
python gui.py
```

1. 在URL欄位輸入YouTube頻道或影片連結
2. 選擇處理類型（頻道或單個影片）
3. 設定處理參數
4. 點擊「開始處理」按鈕
5. 在日誌區域查看處理進度
6. 處理完成後在結果區域查看摘要

### 方式二：命令列介面

#### 處理整個頻道

```bash
# 處理頻道（最多10個影片）
python main.py --channel "https://www.youtube.com/@channelname" --max-videos 10

# 處理頻道並包含已存在的影片
python main.py --channel "https://www.youtube.com/@channelname" --no-skip-existing
```

#### 處理單個影片

```bash
python main.py --video "https://www.youtube.com/watch?v=VIDEO_ID"
```

#### 查看所有選項

```bash
python main.py --help
```

## 🏗️ 專案結構

```
├── main.py              # 主程式入口
├── gui.py              # 圖形使用者介面
├── config.py           # 配置管理
├── youtube_handler.py  # YouTube API處理
├── subtitle_handler.py # 字幕下載處理
├── translator.py       # 翻譯和摘要生成
├── notion_handler.py   # Notion API整合
├── requirements.txt    # Python依賴包
├── .env.example       # 環境變數範本
└── downloads/         # 下載檔案目錄
```

## 📋 Notion資料庫設定

為了最佳體驗，建議在Notion中創建包含以下欄位的資料庫：

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| 標題 | Title | 影片標題 |
| 影片連結 | URL | YouTube影片連結 |
| 發布日期 | Date | 影片發布日期 |
| 影片長度 | Text | 影片時長 |
| 觀看次數 | Number | 影片觀看次數 |
| 標籤 | Multi-select | 分類標籤 |
| 處理日期 | Date | 處理完成日期 |

## 🔧 進階設定

### 自訂下載路徑

在 `config.py` 中修改 `DOWNLOAD_PATH` 變數：

```python
DOWNLOAD_PATH = './my_custom_downloads'
```

### 調整翻譯模型

在 `translator.py` 中可以調整OpenAI模型：

```python
# 使用更強大的模型（需要更多額度）
model="gpt-4"

# 使用經濟型模型
model="gpt-3.5-turbo"
```

### 字幕語言偏好

在 `config.py` 中設定語言偏好：

```python
SUBTITLE_LANGUAGE = 'zh-TW'  # 繁體中文
FALLBACK_LANGUAGE = 'en'     # 英文備用
```

## 🐛 常見問題

### Q: 無法獲取字幕怎麼辦？
A: 確保影片有字幕（手動或自動生成）。某些私人或受限制的影片可能無法獲取字幕。

### Q: OpenAI API額度不足
A: 檢查您的OpenAI帳戶餘額，或考慮使用更經濟的模型如 `gpt-3.5-turbo`。

### Q: Notion頁面創建失敗
A: 確認Integration Token正確，且已將Integration添加到目標資料庫中。

### Q: YouTube API配額超限
A: YouTube API有每日配額限制。如果超限，請等待24小時後重試。

## 📝 更新日誌

### v1.0.0 (2024-01-01)
- 初始版本發布
- 支援YouTube頻道和單影片處理
- 整合OpenAI翻譯和摘要功能
- Notion自動化整合
- GUI和CLI雙重介面

## 🤝 貢獻

歡迎提交Issue和Pull Request來改進這個專案！

## 📄 授權

本專案採用MIT授權條款。

## ⚠️ 注意事項

- 請遵守YouTube、OpenAI和Notion的服務條款
- API使用可能產生費用，請注意用量控制
- 建議在處理大量影片前先測試少量影片
- 請勿用於商業用途未經授權的內容處理

## 🆘 技術支援

如有問題或建議，請：

1. 查看常見問題部分
2. 檢查日誌文件 `youtube_processor.log`
3. 提交Issue到專案倉庫

---

**享受自動化處理YouTube內容的便利！** 🎉