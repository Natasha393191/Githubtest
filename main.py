#!/usr/bin/env python3
"""
YouTube頻道影片自動化處理工具
功能：
1. 抓取YouTube頻道的所有影片
2. 下載影片字幕
3. 翻譯成中文逐字稿
4. 生成中文重點整理
5. 整合到Notion資料庫
"""

import os
import sys
import argparse
import logging
from typing import List, Dict
from datetime import datetime

# 導入自定義模組
from config import Config
from youtube_handler import YouTubeHandler
from subtitle_handler import SubtitleHandler
from translator import Translator
from notion_handler import NotionHandler

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('youtube_processor.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class YouTubeProcessor:
    """YouTube影片處理主類別"""
    
    def __init__(self):
        """初始化處理器"""
        try:
            # 驗證配置
            Config.validate_config()
            
            # 初始化各個處理器
            self.youtube_handler = YouTubeHandler()
            self.subtitle_handler = SubtitleHandler()
            self.translator = Translator()
            self.notion_handler = NotionHandler()
            
            logger.info("YouTube處理器初始化完成")
            
        except Exception as e:
            logger.error(f"初始化失敗: {e}")
            sys.exit(1)
    
    def process_channel(self, channel_url: str, max_videos: int = 10, skip_existing: bool = True) -> Dict:
        """
        處理整個YouTube頻道
        
        Args:
            channel_url: YouTube頻道URL
            max_videos: 最大處理影片數量
            skip_existing: 是否跳過已存在於Notion的影片
        
        Returns:
            處理結果統計
        """
        logger.info(f"開始處理YouTube頻道: {channel_url}")
        
        results = {
            'total_videos': 0,
            'processed_videos': 0,
            'skipped_videos': 0,
            'failed_videos': 0,
            'created_pages': []
        }
        
        try:
            # 獲取頻道影片列表
            videos = self.youtube_handler.get_channel_videos(channel_url, max_videos)
            results['total_videos'] = len(videos)
            
            logger.info(f"找到 {len(videos)} 個影片")
            
            # 處理每個影片
            for i, video in enumerate(videos, 1):
                logger.info(f"處理影片 {i}/{len(videos)}: {video['title']}")
                
                try:
                    # 檢查是否已存在
                    if skip_existing:
                        existing_page = self.notion_handler.search_existing_video(video['url'])
                        if existing_page:
                            logger.info(f"影片已存在於Notion，跳過: {video['title']}")
                            results['skipped_videos'] += 1
                            continue
                    
                    # 處理單個影片
                    page_url = self.process_single_video(video)
                    
                    if page_url:
                        results['processed_videos'] += 1
                        results['created_pages'].append({
                            'title': video['title'],
                            'url': page_url
                        })
                        logger.info(f"成功處理影片: {video['title']}")
                    else:
                        results['failed_videos'] += 1
                        logger.error(f"處理影片失敗: {video['title']}")
                
                except Exception as e:
                    logger.error(f"處理影片時發生錯誤 {video['title']}: {e}")
                    results['failed_videos'] += 1
            
            # 輸出處理結果
            self.print_processing_summary(results)
            
            return results
            
        except Exception as e:
            logger.error(f"處理頻道時發生錯誤: {e}")
            return results
    
    def process_single_video(self, video_info: Dict) -> str:
        """
        處理單個影片
        
        Args:
            video_info: 影片資訊字典
        
        Returns:
            創建的Notion頁面URL
        """
        video_url = video_info['url']
        video_title = video_info['title']
        
        try:
            # 1. 下載字幕
            logger.info(f"正在下載字幕: {video_title}")
            subtitle_text, language_code = self.subtitle_handler.get_subtitle_text(video_url)
            
            if not subtitle_text:
                logger.warning(f"無法獲取字幕: {video_title}")
                return ""
            
            logger.info(f"成功獲取字幕，語言: {language_code}")
            
            # 2. 翻譯字幕（如果需要）
            if language_code != 'zh' and not self.translator._is_chinese(subtitle_text):
                logger.info(f"正在翻譯字幕: {video_title}")
                translated_text = self.translator.translate_text(subtitle_text, language_code)
                
                if translated_text:
                    subtitle_text = translated_text
                    logger.info("字幕翻譯完成")
                else:
                    logger.warning("字幕翻譯失敗，使用原文")
            else:
                logger.info("字幕已是中文，跳過翻譯")
            
            # 3. 生成重點整理
            logger.info(f"正在生成重點整理: {video_title}")
            summary = self.translator.generate_summary(subtitle_text, video_title)
            
            if not summary:
                logger.warning("重點整理生成失敗")
                summary = "無法生成重點整理"
            
            # 4. 提取重要引言
            logger.info(f"正在提取重要引言: {video_title}")
            quotes = self.translator.generate_key_quotes(subtitle_text)
            
            if not quotes:
                quotes = ""
            
            # 5. 創建Notion頁面
            logger.info(f"正在創建Notion頁面: {video_title}")
            page_url = self.notion_handler.create_video_page(
                video_info, 
                subtitle_text, 
                summary, 
                quotes
            )
            
            if page_url:
                logger.info(f"成功創建Notion頁面: {page_url}")
                return page_url
            else:
                logger.error("創建Notion頁面失敗")
                return ""
            
        except Exception as e:
            logger.error(f"處理影片時發生錯誤: {e}")
            return ""
    
    def process_video_url(self, video_url: str) -> str:
        """
        處理單個影片URL
        
        Args:
            video_url: YouTube影片URL
        
        Returns:
            創建的Notion頁面URL
        """
        logger.info(f"開始處理單個影片: {video_url}")
        
        try:
            # 獲取影片詳細資訊
            video_info = self.youtube_handler.download_video_info(video_url)
            if not video_info:
                logger.error("無法獲取影片資訊")
                return ""
            
            # 補充URL資訊
            video_info['url'] = video_url
            
            # 處理影片
            return self.process_single_video(video_info)
            
        except Exception as e:
            logger.error(f"處理單個影片時發生錯誤: {e}")
            return ""
    
    def print_processing_summary(self, results: Dict):
        """輸出處理結果摘要"""
        print("\n" + "="*60)
        print("📊 處理結果摘要")
        print("="*60)
        print(f"總影片數量: {results['total_videos']}")
        print(f"成功處理: {results['processed_videos']}")
        print(f"跳過影片: {results['skipped_videos']}")
        print(f"失敗影片: {results['failed_videos']}")
        print("\n📝 創建的Notion頁面:")
        
        for page in results['created_pages']:
            print(f"  • {page['title']}")
            print(f"    {page['url']}")
        
        print("="*60)

def main():
    """主函數"""
    parser = argparse.ArgumentParser(
        description='YouTube頻道影片自動化處理工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用範例:
  # 處理整個頻道（最多10個影片）
  python main.py --channel "https://www.youtube.com/@channelname" --max-videos 10
  
  # 處理單個影片
  python main.py --video "https://www.youtube.com/watch?v=VIDEO_ID"
  
  # 處理頻道並包含已存在的影片
  python main.py --channel "https://www.youtube.com/@channelname" --no-skip-existing
        """
    )
    
    # 添加參數
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        '--channel', '-c',
        help='YouTube頻道URL'
    )
    group.add_argument(
        '--video', '-v',
        help='單個YouTube影片URL'
    )
    
    parser.add_argument(
        '--max-videos', '-m',
        type=int,
        default=10,
        help='最大處理影片數量（預設：10）'
    )
    
    parser.add_argument(
        '--no-skip-existing',
        action='store_true',
        help='不跳過已存在於Notion的影片'
    )
    
    parser.add_argument(
        '--verbose', '-V',
        action='store_true',
        help='顯示詳細日誌'
    )
    
    args = parser.parse_args()
    
    # 設定日誌級別
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # 初始化處理器
    processor = YouTubeProcessor()
    
    try:
        if args.channel:
            # 處理頻道
            results = processor.process_channel(
                args.channel,
                max_videos=args.max_videos,
                skip_existing=not args.no_skip_existing
            )
            
            if results['processed_videos'] > 0:
                print(f"\n✅ 成功處理 {results['processed_videos']} 個影片！")
            else:
                print("\n❌ 沒有成功處理任何影片")
        
        elif args.video:
            # 處理單個影片
            page_url = processor.process_video_url(args.video)
            
            if page_url:
                print(f"\n✅ 成功處理影片！")
                print(f"Notion頁面: {page_url}")
            else:
                print("\n❌ 影片處理失敗")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  處理被用戶中斷")
        sys.exit(1)
    except Exception as e:
        logger.error(f"程式執行時發生錯誤: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()