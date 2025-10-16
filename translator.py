import openai
from config import Config
from typing import Optional
import logging
import time
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Translator:
    """處理文本翻譯和摘要的類別"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        self.target_language = Config.TARGET_LANGUAGE
    
    def translate_text(self, text: str, source_language: str = "auto") -> Optional[str]:
        """
        將文本翻譯成繁體中文
        
        Args:
            text: 要翻譯的文本
            source_language: 源語言代碼
        
        Returns:
            翻譯後的文本
        """
        if not text or not text.strip():
            return ""
        
        # 如果文本已經是中文，直接返回
        if self._is_chinese(text):
            logger.info("文本已經是中文，跳過翻譯")
            return text
        
        try:
            # 分段處理長文本
            chunks = self._split_text(text, max_length=3000)
            translated_chunks = []
            
            for i, chunk in enumerate(chunks):
                logger.info(f"正在翻譯第 {i+1}/{len(chunks)} 段...")
                
                prompt = f"""請將以下文本翻譯成繁體中文。保持原文的格式和結構，確保翻譯自然流暢：

{chunk}

翻譯結果："""

                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system", 
                            "content": "你是一個專業的翻譯助手，專門將各種語言的文本翻譯成繁體中文。請保持原文的語調和含義，使翻譯結果自然流暢。"
                        },
                        {
                            "role": "user", 
                            "content": prompt
                        }
                    ],
                    max_tokens=4000,
                    temperature=0.3
                )
                
                translated_chunk = response.choices[0].message.content.strip()
                translated_chunks.append(translated_chunk)
                
                # 避免API限制，添加短暫延遲
                if i < len(chunks) - 1:
                    time.sleep(1)
            
            translated_text = "\n\n".join(translated_chunks)
            logger.info("翻譯完成")
            return translated_text
            
        except Exception as e:
            logger.error(f"翻譯時發生錯誤: {e}")
            return None
    
    def _is_chinese(self, text: str) -> bool:
        """檢查文本是否主要是中文"""
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        total_chars = len(re.findall(r'[a-zA-Z\u4e00-\u9fff]', text))
        
        if total_chars == 0:
            return False
        
        chinese_ratio = chinese_chars / total_chars
        return chinese_ratio > 0.7  # 如果70%以上是中文字符，認為是中文
    
    def _split_text(self, text: str, max_length: int = 3000) -> list:
        """將長文本分割成較小的段落"""
        if len(text) <= max_length:
            return [text]
        
        # 按段落分割
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""
        
        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) + 2 <= max_length:
                if current_chunk:
                    current_chunk += "\n\n" + paragraph
                else:
                    current_chunk = paragraph
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                
                # 如果單個段落太長，按句子分割
                if len(paragraph) > max_length:
                    sentences = re.split(r'[.!?。！？]\s+', paragraph)
                    temp_chunk = ""
                    
                    for sentence in sentences:
                        if len(temp_chunk) + len(sentence) + 1 <= max_length:
                            if temp_chunk:
                                temp_chunk += ". " + sentence
                            else:
                                temp_chunk = sentence
                        else:
                            if temp_chunk:
                                chunks.append(temp_chunk)
                            temp_chunk = sentence
                    
                    current_chunk = temp_chunk
                else:
                    current_chunk = paragraph
        
        if current_chunk:
            chunks.append(current_chunk)
        
        return chunks
    
    def generate_summary(self, text: str, video_title: str = "") -> Optional[str]:
        """
        生成中文重點整理
        
        Args:
            text: 要總結的文本（中文）
            video_title: 影片標題
        
        Returns:
            重點整理文本
        """
        if not text or not text.strip():
            return ""
        
        try:
            prompt = f"""請為以下影片內容生成詳細的中文重點整理。

影片標題：{video_title}

影片內容：
{text}

請按照以下格式整理重點：

## 📝 影片重點整理

### 🎯 核心主題
[用1-2句話概括影片的核心主題]

### 📋 主要內容
[用條列式整理主要內容點，每點用簡潔的語言描述]

### 💡 關鍵洞察
[提取影片中的重要洞察或觀點]

### 🔧 實用建議
[如果有的話，整理實用的建議或方法]

### 📚 延伸思考
[提出相關的延伸思考點或問題]

請確保整理內容：
1. 準確反映原文重點
2. 結構清晰易讀
3. 重點突出
4. 適合快速瀏覽"""

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system", 
                        "content": "你是一個專業的內容整理助手，擅長從長文本中提取重點並進行結構化整理。請用繁體中文回應。"
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.5
            )
            
            summary = response.choices[0].message.content.strip()
            logger.info("重點整理生成完成")
            return summary
            
        except Exception as e:
            logger.error(f"生成重點整理時發生錯誤: {e}")
            return None
    
    def generate_key_quotes(self, text: str) -> Optional[str]:
        """
        提取重要引言或金句
        
        Args:
            text: 要分析的文本
        
        Returns:
            重要引言整理
        """
        if not text or not text.strip():
            return ""
        
        try:
            prompt = f"""請從以下文本中提取最重要和最有價值的引言或金句，並進行整理：

文本內容：
{text}

請按照以下格式整理：

## 💬 重要引言

[提取3-5個最有價值的引言，每個引言用以下格式：]

> "引言內容"
**重要性說明：** [簡短說明為什麼這個引言重要]

請確保：
1. 選擇最具洞察力的引言
2. 涵蓋不同主題面向
3. 引言要完整且有意義
4. 說明要簡潔有力"""

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": "你是一個專業的內容分析師，擅長從文本中提取最有價值的引言和金句。請用繁體中文回應。"
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=1500,
                temperature=0.3
            )
            
            quotes = response.choices[0].message.content.strip()
            logger.info("重要引言提取完成")
            return quotes
            
        except Exception as e:
            logger.error(f"提取重要引言時發生錯誤: {e}")
            return None