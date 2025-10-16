#!/usr/bin/env python3
"""
YouTube頻道影片自動化處理工具 - 互動式版本
簡化的使用者介面，方便直接貼上YouTube頻道連結使用
"""

import os
import sys
from main import YouTubeProcessor
import logging

# 簡化日誌輸出
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def print_banner():
    """顯示程式標題"""
    print("\n" + "="*70)
    print("🎬 YouTube頻道影片自動化處理工具")
    print("📝 自動下載字幕 → 翻譯中文 → 生成摘要 → 整合到Notion")
    print("="*70)

def check_environment():
    """檢查環境設定"""
    print("\n🔧 檢查環境設定...")
    
    # 檢查 .env 文件
    if not os.path.exists('.env'):
        print("❌ 找不到 .env 文件")
        print("請複製 .env.example 為 .env 並填入您的API金鑰")
        return False
    
    try:
        from config import Config
        Config.validate_config()
        print("✅ 環境設定檢查通過")
        return True
    except Exception as e:
        print(f"❌ 環境設定錯誤: {e}")
        print("\n請確認 .env 文件中包含以下設定:")
        print("- YOUTUBE_API_KEY=您的YouTube API金鑰")
        print("- OPENAI_API_KEY=您的OpenAI API金鑰")
        print("- NOTION_TOKEN=您的Notion整合Token")
        print("- NOTION_DATABASE_ID=您的Notion資料庫ID")
        return False

def get_user_input():
    """獲取使用者輸入"""
    print("\n📋 請選擇處理模式:")
    print("1. 處理整個YouTube頻道")
    print("2. 處理單個YouTube影片")
    
    while True:
        choice = input("\n請選擇 (1 或 2): ").strip()
        if choice in ['1', '2']:
            break
        print("請輸入 1 或 2")
    
    if choice == '1':
        # 頻道模式
        while True:
            channel_url = input("\n請貼上YouTube頻道連結: ").strip()
            if channel_url and ('youtube.com' in channel_url or 'youtu.be' in channel_url):
                break
            print("請輸入有效的YouTube頻道連結")
        
        while True:
            try:
                max_videos = input("\n要處理幾個影片？(預設: 5): ").strip()
                if not max_videos:
                    max_videos = 5
                else:
                    max_videos = int(max_videos)
                break
            except ValueError:
                print("請輸入有效的數字")
        
        skip_existing = input("\n跳過已存在於Notion的影片？(Y/n): ").strip().lower()
        skip_existing = skip_existing != 'n'
        
        return {
            'mode': 'channel',
            'url': channel_url,
            'max_videos': max_videos,
            'skip_existing': skip_existing
        }
    
    else:
        # 單個影片模式
        while True:
            video_url = input("\n請貼上YouTube影片連結: ").strip()
            if video_url and ('youtube.com' in video_url or 'youtu.be' in video_url):
                break
            print("請輸入有效的YouTube影片連結")
        
        return {
            'mode': 'video',
            'url': video_url
        }

def main():
    """主函數"""
    print_banner()
    
    # 檢查環境
    if not check_environment():
        sys.exit(1)
    
    # 獲取使用者輸入
    user_input = get_user_input()
    
    # 初始化處理器
    print("\n🚀 初始化處理器...")
    try:
        processor = YouTubeProcessor()
    except Exception as e:
        print(f"❌ 初始化失敗: {e}")
        sys.exit(1)
    
    print("✅ 處理器初始化完成")
    
    try:
        if user_input['mode'] == 'channel':
            # 處理頻道
            print(f"\n📺 開始處理頻道: {user_input['url']}")
            print(f"📊 最大影片數: {user_input['max_videos']}")
            print(f"⏭️  跳過已存在: {'是' if user_input['skip_existing'] else '否'}")
            
            results = processor.process_channel(
                user_input['url'],
                max_videos=user_input['max_videos'],
                skip_existing=user_input['skip_existing']
            )
            
            if results['processed_videos'] > 0:
                print(f"\n🎉 成功處理 {results['processed_videos']} 個影片！")
                print("\n📄 創建的Notion頁面:")
                for page in results['created_pages']:
                    print(f"  • {page['title']}")
                    print(f"    🔗 {page['url']}")
            else:
                print(f"\n⚠️  沒有成功處理任何影片")
                if results['skipped_videos'] > 0:
                    print(f"跳過了 {results['skipped_videos']} 個已存在的影片")
        
        else:
            # 處理單個影片
            print(f"\n📺 開始處理影片: {user_input['url']}")
            
            page_url = processor.process_video_url(user_input['url'])
            
            if page_url:
                print(f"\n🎉 影片處理完成！")
                print(f"📄 Notion頁面: {page_url}")
            else:
                print(f"\n❌ 影片處理失敗")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  處理被用戶中斷")
    except Exception as e:
        print(f"\n❌ 處理時發生錯誤: {e}")
        logger.error(f"詳細錯誤: {e}", exc_info=True)
    
    print("\n👋 感謝使用YouTube自動化處理工具！")

if __name__ == "__main__":
    main()