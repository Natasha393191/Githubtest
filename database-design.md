# 理財抽考遊戲 - SQLite 資料庫設計文檔

## 📊 資料庫總覽

本文檔描述理財抽考遊戲APP的SQLite資料庫結構，包含7個主要資料表：

1. **users** - 用戶基本資料
2. **daily_records** - 每日記帳記錄  
3. **quiz_sessions** - 抽考遊戲會話
4. **achievements** - 成就系統
5. **questions** - 題目庫
6. **quiz_records** - 詳細答題記錄
7. **user_stats** - 用戶統計資料

## 🗃️ 資料表詳細設計

### 1. users - 用戶表

儲存用戶的基本資料和等級資訊。

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                           -- 用戶姓名
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 註冊時間
  level INTEGER DEFAULT 1,                      -- 用戶等級
  total_points INTEGER DEFAULT 0,               -- 總積分
  avatar_url TEXT,                              -- 頭像URL
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP -- 最後登入時間
);
```

**欄位說明：**
- `id`: 主鍵，自動遞增
- `name`: 用戶顯示名稱
- `created_at`: 帳號建立時間
- `level`: 用戶等級 (基於積分或成就計算)
- `total_points`: 累積總積分
- `avatar_url`: 用戶頭像圖片URL (可選)
- `last_login`: 最後一次登入時間

### 2. daily_records - 每日記帳記錄表

儲存用戶的收支記錄。

```sql
CREATE TABLE daily_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,                    -- 用戶ID
  date DATE NOT NULL,                           -- 記錄日期
  amount DECIMAL(10,2) NOT NULL,                -- 金額
  category TEXT NOT NULL,                       -- 分類
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')), -- 類型：收入/支出
  description TEXT,                             -- 描述
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 建立時間
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

**欄位說明：**
- `id`: 主鍵，自動遞增
- `user_id`: 關聯用戶ID
- `date`: 交易發生日期
- `amount`: 金額 (正數)
- `category`: 分類 (如：餐飲、交通、薪資等)
- `type`: 收入(income)或支出(expense)
- `description`: 詳細描述
- `created_at`: 記錄建立時間

**常見分類：**
- 收入：薪資、獎金、投資收益、兼職、其他收入
- 支出：餐飲、交通、娛樂、購物、水電費、房租、醫療、教育

### 3. quiz_sessions - 抽考遊戲會話表

儲存每次完整的抽考遊戲會話資訊。

```sql
CREATE TABLE quiz_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,                    -- 用戶ID
  date DATE NOT NULL,                           -- 遊戲日期
  questions_asked INTEGER NOT NULL,             -- 總題數
  correct_answers INTEGER NOT NULL,             -- 答對題數
  points_earned INTEGER NOT NULL,               -- 獲得積分
  duration_seconds INTEGER,                     -- 遊戲時長(秒)
  difficulty_level TEXT DEFAULT 'mixed',        -- 難度等級
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 建立時間
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

**欄位說明：**
- `id`: 主鍵，自動遞增
- `user_id`: 關聯用戶ID
- `date`: 遊戲進行日期
- `questions_asked`: 本次遊戲總題數
- `correct_answers`: 答對的題目數量
- `points_earned`: 本次遊戲獲得的積分
- `duration_seconds`: 遊戲總時長
- `difficulty_level`: 難度設定 (初級/中級/高級/混合)
- `created_at`: 會話建立時間

### 4. achievements - 成就系統表

儲存用戶解鎖的各種成就。

```sql
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,                    -- 用戶ID
  achievement_type TEXT NOT NULL,               -- 成就類型
  achievement_name TEXT NOT NULL,               -- 成就名稱
  achievement_description TEXT,                 -- 成就描述
  points_reward INTEGER DEFAULT 0,              -- 獎勵積分
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 解鎖時間
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

**欄位說明：**
- `id`: 主鍵，自動遞增
- `user_id`: 關聯用戶ID
- `achievement_type`: 成就類型代碼
- `achievement_name`: 成就顯示名稱
- `achievement_description`: 成就詳細說明
- `points_reward`: 解鎖成就獲得的獎勵積分
- `unlocked_at`: 成就解鎖時間

**預設成就類型：**
- `first_quiz`: 初試啼聲 (完成第一次抽考)
- `quiz_streak_5`: 連勝高手 (連續答對5題)
- `quiz_streak_10`: 答題達人 (連續答對10題)
- `first_record`: 記帳新手 (新增第一筆記帳記錄)
- `record_week`: 持續記帳 (連續記帳7天)
- `points_100`: 積分收集者 (累積100積分)
- `points_500`: 積分大師 (累積500積分)
- `level_5`: 初級理財師 (達到等級5)
- `perfect_session`: 完美表現 (單次遊戲全對)

### 5. questions - 題目庫表

儲存抽考遊戲的所有題目。

```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,                       -- 題目內容
  options TEXT NOT NULL,                        -- 選項 (JSON格式)
  correct_answer INTEGER NOT NULL,              -- 正確答案索引
  category TEXT NOT NULL,                       -- 題目分類
  difficulty TEXT NOT NULL,                     -- 難度等級
  explanation TEXT,                             -- 解釋說明
  points_value INTEGER DEFAULT 10,              -- 題目分數
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 建立時間
);
```

**欄位說明：**
- `id`: 主鍵，自動遞增
- `question`: 題目內容
- `options`: 四個選項，JSON格式儲存
- `correct_answer`: 正確答案的索引 (0-3)
- `category`: 題目分類
- `difficulty`: 難度等級 (初級/中級/高級)
- `explanation`: 答案解釋
- `points_value`: 答對可獲得的積分
- `created_at`: 題目建立時間

**題目分類：**
- 投資理財
- 財務規劃
- 股票投資
- 投資策略
- 保險規劃
- 稅務知識

### 6. quiz_records - 答題記錄表

儲存每一題的詳細答題記錄。

```sql
CREATE TABLE quiz_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,                    -- 用戶ID
  session_id INTEGER,                           -- 會話ID
  question_id INTEGER NOT NULL,                 -- 題目ID
  user_answer INTEGER NOT NULL,                 -- 用戶答案
  is_correct BOOLEAN NOT NULL,                  -- 是否正確
  time_spent INTEGER NOT NULL,                  -- 答題時間(秒)
  points_earned INTEGER DEFAULT 0,              -- 獲得積分
  quiz_date DATETIME DEFAULT CURRENT_TIMESTAMP, -- 答題時間
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (session_id) REFERENCES quiz_sessions (id),
  FOREIGN KEY (question_id) REFERENCES questions (id)
);
```

**欄位說明：**
- `id`: 主鍵，自動遞增
- `user_id`: 關聯用戶ID
- `session_id`: 關聯遊戲會話ID
- `question_id`: 關聯題目ID
- `user_answer`: 用戶選擇的答案索引
- `is_correct`: 答案是否正確
- `time_spent`: 此題花費時間
- `points_earned`: 此題獲得積分
- `quiz_date`: 答題時間

### 7. user_stats - 用戶統計表

儲存用戶的各項統計資料。

```sql
CREATE TABLE user_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,                    -- 用戶ID
  total_questions INTEGER DEFAULT 0,            -- 總答題數
  correct_answers INTEGER DEFAULT 0,            -- 總答對數
  total_time INTEGER DEFAULT 0,                 -- 總答題時間
  streak INTEGER DEFAULT 0,                     -- 目前連續答對
  best_streak INTEGER DEFAULT 0,                -- 最佳連續記錄
  total_sessions INTEGER DEFAULT 0,             -- 總遊戲會話數
  total_records INTEGER DEFAULT 0,              -- 總記帳記錄數
  last_quiz_date DATETIME,                      -- 最後抽考日期
  last_record_date DATETIME,                    -- 最後記帳日期
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 更新時間
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

**欄位說明：**
- `id`: 主鍵，自動遞增
- `user_id`: 關聯用戶ID
- `total_questions`: 累計答題總數
- `correct_answers`: 累計答對總數
- `total_time`: 累計答題時間
- `streak`: 目前連續答對次數
- `best_streak`: 歷史最佳連續答對記錄
- `total_sessions`: 累計遊戲會話數
- `total_records`: 累計記帳記錄數
- `last_quiz_date`: 最後一次抽考日期
- `last_record_date`: 最後一次記帳日期
- `updated_at`: 統計資料更新時間

## 🔗 資料表關聯

### 主要關聯關係

```
users (1) ──────── (N) daily_records
  │
  ├──────────────── (N) quiz_sessions
  │
  ├──────────────── (N) achievements  
  │
  ├──────────────── (N) quiz_records
  │
  └──────────────── (1) user_stats

quiz_sessions (1) ── (N) quiz_records

questions (1) ─────── (N) quiz_records
```

### 關聯說明

1. **users → daily_records**: 一對多，一個用戶可以有多筆記帳記錄
2. **users → quiz_sessions**: 一對多，一個用戶可以有多次遊戲會話
3. **users → achievements**: 一對多，一個用戶可以解鎖多個成就
4. **users → quiz_records**: 一對多，一個用戶可以有多筆答題記錄
5. **users → user_stats**: 一對一，每個用戶有一個統計記錄
6. **quiz_sessions → quiz_records**: 一對多，一次會話包含多題記錄
7. **questions → quiz_records**: 一對多，一個題目可以被多次回答

## 📈 索引設計

為了提升查詢效能，建議在以下欄位建立索引：

```sql
-- 日期相關查詢索引
CREATE INDEX idx_daily_records_date ON daily_records(date);
CREATE INDEX idx_quiz_sessions_date ON quiz_sessions(date);

-- 用戶相關查詢索引  
CREATE INDEX idx_daily_records_user_id ON daily_records(user_id);
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- 成就類型查詢索引
CREATE INDEX idx_achievements_type ON achievements(achievement_type);

-- 題目分類查詢索引
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
```

## 🔍 常用查詢範例

### 1. 獲取用戶月度收支統計

```sql
SELECT 
  type,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as count
FROM daily_records 
WHERE user_id = 1 
  AND date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY type, category
ORDER BY total_amount DESC;
```

### 2. 獲取用戶遊戲表現趨勢

```sql
SELECT 
  date,
  questions_asked,
  correct_answers,
  ROUND(correct_answers * 100.0 / questions_asked, 2) as accuracy_rate,
  points_earned
FROM quiz_sessions 
WHERE user_id = 1 
ORDER BY date DESC 
LIMIT 30;
```

### 3. 獲取用戶最近解鎖的成就

```sql
SELECT 
  achievement_name,
  achievement_description,
  points_reward,
  unlocked_at
FROM achievements 
WHERE user_id = 1 
ORDER BY unlocked_at DESC 
LIMIT 5;
```

### 4. 獲取題目答錯率統計

```sql
SELECT 
  q.question,
  q.category,
  q.difficulty,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN qr.is_correct = 0 THEN 1 ELSE 0 END) as wrong_attempts,
  ROUND(SUM(CASE WHEN qr.is_correct = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate
FROM questions q
JOIN quiz_records qr ON q.id = qr.question_id
GROUP BY q.id
HAVING total_attempts >= 5
ORDER BY error_rate DESC;
```

## 💾 資料備份與遷移

### 備份策略

1. **定期備份**: 每日自動備份資料庫檔案
2. **匯出功能**: 提供CSV格式匯出用戶資料
3. **雲端同步**: 可選的雲端備份功能

### 資料遷移

```sql
-- 匯出用戶記帳資料
SELECT 
  date,
  amount,
  category,
  type,
  description
FROM daily_records 
WHERE user_id = 1
ORDER BY date DESC;

-- 匯出用戶遊戲統計
SELECT 
  date,
  questions_asked,
  correct_answers,
  points_earned,
  duration_seconds
FROM quiz_sessions 
WHERE user_id = 1
ORDER BY date DESC;
```

## 🔧 維護與優化

### 定期維護

1. **清理舊資料**: 清理超過一年的詳細記錄
2. **重建索引**: 定期重建索引提升效能
3. **資料壓縮**: 使用SQLite的VACUUM指令壓縮資料庫

### 效能優化

1. **分頁查詢**: 使用LIMIT和OFFSET進行分頁
2. **適當索引**: 針對常用查詢建立索引
3. **批次操作**: 大量資料操作使用事務

---

這個資料庫設計提供了完整的理財抽考遊戲所需的資料結構，包含用戶管理、記帳功能、遊戲系統和成就機制，能夠支援APP的所有核心功能。