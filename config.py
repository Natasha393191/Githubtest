import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

class Config:
    """配置類別，管理所有API金鑰和設定"""
    
    # YouTube API 設定
    YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
    
    # OpenAI API 設定
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # Notion API 設定
    NOTION_TOKEN = os.getenv('NOTION_TOKEN')
    NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    
    # 下載設定
    DOWNLOAD_PATH = './downloads'
    SUBTITLE_LANGUAGE = 'zh-TW'  # 優先中文字幕
    FALLBACK_LANGUAGE = 'en'     # 備用英文字幕
    
    # 翻譯設定
    TARGET_LANGUAGE = 'zh-TW'    # 目標語言：繁體中文
    
    @classmethod
    def validate_config(cls):
        """驗證必要的配置是否存在"""
        required_keys = [
            'YOUTUBE_API_KEY',
            'OPENAI_API_KEY', 
            'NOTION_TOKEN',
            'NOTION_DATABASE_ID'
        ]
        
        missing_keys = []
        for key in required_keys:
            if not getattr(cls, key):
                missing_keys.append(key)
        
        if missing_keys:
            raise ValueError(f"缺少必要的環境變數: {', '.join(missing_keys)}")
        
        return True