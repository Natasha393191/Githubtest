# 🛠️ 詳細設定指南

本指南將詳細說明如何設定YouTube影片自動化處理工具所需的各項API服務。

## 📋 目錄

1. [YouTube Data API v3 設定](#youtube-data-api-v3-設定)
2. [OpenAI API 設定](#openai-api-設定)
3. [Notion API 設定](#notion-api-設定)
4. [環境變數配置](#環境變數配置)
5. [測試設定](#測試設定)
6. [故障排除](#故障排除)

## 🎯 YouTube Data API v3 設定

### 步驟 1: 創建 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊頂部的專案選擇器
3. 點擊「新增專案」
4. 輸入專案名稱（例如：YouTube Processor）
5. 點擊「建立」

### 步驟 2: 啟用 YouTube Data API v3

1. 在 Google Cloud Console 中，確保選擇了正確的專案
2. 前往「API 和服務」→「程式庫」
3. 搜尋「YouTube Data API v3」
4. 點擊搜尋結果中的「YouTube Data API v3」
5. 點擊「啟用」

### 步驟 3: 創建 API 金鑰

1. 前往「API 和服務」→「憑證」
2. 點擊「+ 建立憑證」→「API 金鑰」
3. 複製生成的 API 金鑰
4. （建議）點擊「限制金鑰」來設定使用限制：
   - 選擇「限制金鑰」
   - 在「API 限制」中選擇「限制金鑰」
   - 選擇「YouTube Data API v3」
   - 點擊「儲存」

### 配額限制

- YouTube Data API v3 每日有配額限制（通常為 10,000 單位）
- 每個影片查詢約消耗 1-5 單位
- 建議合理控制處理的影片數量

## 🤖 OpenAI API 設定

### 步驟 1: 註冊 OpenAI 帳戶

1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 點擊「Sign up」註冊新帳戶
3. 驗證您的電子郵件地址
4. 完成帳戶設定

### 步驟 2: 獲取 API 金鑰

1. 登入 OpenAI Platform
2. 點擊右上角的個人資料圖標
3. 選擇「View API keys」
4. 點擊「Create new secret key」
5. 輸入金鑰名稱（例如：YouTube Processor）
6. 複製生成的 API 金鑰（**注意：此金鑰只會顯示一次**）

### 步驟 3: 設定付費方式

1. 前往「Settings」→「Billing」
2. 添加付費方式（信用卡）
3. 設定使用限額以控制費用

### 費用估算

- GPT-3.5-turbo: 約 $0.002 / 1K tokens
- GPT-4: 約 $0.03 / 1K tokens
- 一個10分鐘影片的處理成本約 $0.1-0.5（取決於模型選擇）

## 📚 Notion API 設定

### 步驟 1: 創建 Notion Integration

1. 前往 [Notion Developers](https://developers.notion.com/)
2. 點擊「My integrations」
3. 點擊「New integration」
4. 填寫以下資訊：
   - Name: YouTube Processor
   - Associated workspace: 選擇您的工作區
   - Type: Internal
5. 點擊「Submit」
6. 複製「Internal Integration Token」

### 步驟 2: 創建 Notion 資料庫

1. 在 Notion 中創建新頁面
2. 添加資料庫（Database）
3. 設定以下欄位：

| 欄位名稱 | 類型 | 必要 |
|---------|------|------|
| 標題 | Title | ✅ |
| 影片連結 | URL | ✅ |
| 發布日期 | Date | ⭕ |
| 影片長度 | Text | ⭕ |
| 觀看次數 | Number | ⭕ |
| 標籤 | Multi-select | ⭕ |
| 處理日期 | Date | ⭕ |

### 步驟 3: 獲取資料庫 ID

1. 開啟您創建的資料庫頁面
2. 複製頁面 URL
3. 資料庫 ID 是 URL 中的 32 位字符串
   ```
   https://notion.so/workspace/DATABASE_ID?v=...
   ```
4. 複製這個 DATABASE_ID

### 步驟 4: 授權 Integration 訪問資料庫

1. 在資料庫頁面中，點擊右上角的「...」
2. 選擇「Add connections」
3. 搜尋並選擇您創建的 Integration（YouTube Processor）
4. 點擊「Confirm」

## ⚙️ 環境變數配置

### 創建 .env 文件

1. 複製範本文件：
   ```bash
   cp .env.example .env
   ```

2. 編輯 `.env` 文件，填入您的 API 金鑰：
   ```env
   # YouTube Data API 設定
   YOUTUBE_API_KEY=AIzaSyD...your_youtube_api_key_here
   
   # OpenAI API 設定
   OPENAI_API_KEY=sk-...your_openai_api_key_here
   
   # Notion API 設定
   NOTION_TOKEN=secret_...your_notion_integration_token_here
   NOTION_DATABASE_ID=your_32_character_database_id_here
   ```

### 安全性注意事項

- **絕對不要**將 `.env` 文件提交到版本控制系統
- 定期更換 API 金鑰
- 設定適當的使用限額
- 監控 API 使用情況

## 🧪 測試設定

### 測試 YouTube API

```bash
python -c "
from youtube_handler import YouTubeHandler
handler = YouTubeHandler()
print('YouTube API 連接成功！')
"
```

### 測試 OpenAI API

```bash
python -c "
from translator import Translator
translator = Translator()
result = translator.translate_text('Hello World', 'en')
print('OpenAI API 連接成功！')
print('翻譯結果:', result)
"
```

### 測試 Notion API

```bash
python -c "
from notion_handler import NotionHandler
handler = NotionHandler()
props = handler.get_database_properties()
print('Notion API 連接成功！')
print('資料庫欄位:', list(props.keys()))
"
```

### 完整測試

使用 GUI 介面進行完整測試：

```bash
python gui.py
```

1. 點擊「設定API」按鈕
2. 輸入所有 API 金鑰
3. 點擊「保存」
4. 嘗試處理一個短影片進行測試

## 🔧 故障排除

### 常見錯誤及解決方案

#### YouTube API 錯誤

**錯誤**: `HttpError 403: The request cannot be completed because you have exceeded your quota.`
**解決**: 等待24小時配額重置，或申請更高配額

**錯誤**: `HttpError 400: Bad Request`
**解決**: 檢查 YouTube URL 格式是否正確

#### OpenAI API 錯誤

**錯誤**: `AuthenticationError`
**解決**: 檢查 API 金鑰是否正確，確保帳戶有足夠餘額

**錯誤**: `RateLimitError`
**解決**: 降低請求頻率，或升級到更高等級的方案

#### Notion API 錯誤

**錯誤**: `Unauthorized`
**解決**: 
1. 檢查 Integration Token 是否正確
2. 確認已將 Integration 添加到資料庫

**錯誤**: `Object not found`
**解決**: 檢查資料庫 ID 是否正確

### 日誌檢查

查看詳細錯誤日誌：

```bash
tail -f youtube_processor.log
```

### 網路連接問題

如果遇到網路連接問題：

1. 檢查防火牆設定
2. 確認代理設定（如果使用）
3. 測試基本網路連接：
   ```bash
   ping google.com
   ping api.openai.com
   ping api.notion.com
   ```

## 📞 獲得幫助

如果您在設定過程中遇到問題：

1. 檢查本指南的故障排除部分
2. 查看 `youtube_processor.log` 日誌文件
3. 確認所有 API 金鑰都正確設定
4. 嘗試使用測試腳本驗證各個 API 連接

---

**設定完成後，您就可以開始享受自動化處理 YouTube 內容的便利了！** 🎉