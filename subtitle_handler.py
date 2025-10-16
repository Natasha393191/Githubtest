import os
import re
import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from config import Config
from typing import List, Dict, Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SubtitleHandler:
    """處理字幕下載和處理的類別"""
    
    def __init__(self):
        self.download_path = Config.DOWNLOAD_PATH
        os.makedirs(self.download_path, exist_ok=True)
    
    def extract_video_id(self, url: str) -> Optional[str]:
        """從YouTube URL中提取影片ID"""
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'youtu\.be\/([0-9A-Za-z_-]{11})',
            r'youtube\.com\/embed\/([0-9A-Za-z_-]{11})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def get_available_transcripts(self, video_id: str) -> List[Dict]:
        """獲取影片可用的字幕列表"""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            available_transcripts = []
            
            for transcript in transcript_list:
                transcript_info = {
                    'language': transcript.language,
                    'language_code': transcript.language_code,
                    'is_generated': transcript.is_generated,
                    'is_translatable': transcript.is_translatable
                }
                available_transcripts.append(transcript_info)
            
            return available_transcripts
            
        except Exception as e:
            logger.error(f"獲取字幕列表時發生錯誤: {e}")
            return []
    
    def download_transcript(self, video_url: str, preferred_languages: List[str] = None) -> Tuple[Optional[str], Optional[str]]:
        """
        下載影片字幕
        
        Args:
            video_url: YouTube影片URL
            preferred_languages: 偏好的語言代碼列表，例如 ['zh-TW', 'zh', 'en']
        
        Returns:
            Tuple[字幕內容, 使用的語言代碼]
        """
        video_id = self.extract_video_id(video_url)
        if not video_id:
            logger.error("無法從URL中提取影片ID")
            return None, None
        
        if not preferred_languages:
            preferred_languages = [Config.SUBTITLE_LANGUAGE, 'zh', Config.FALLBACK_LANGUAGE]
        
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # 嘗試按照偏好順序獲取字幕
            for lang_code in preferred_languages:
                try:
                    # 首先嘗試獲取手動字幕
                    transcript = transcript_list.find_manually_created_transcript([lang_code])
                    transcript_data = transcript.fetch()
                    
                    # 格式化字幕文本
                    formatter = TextFormatter()
                    subtitle_text = formatter.format_transcript(transcript_data)
                    
                    logger.info(f"成功獲取手動字幕，語言: {lang_code}")
                    return subtitle_text, lang_code
                    
                except:
                    try:
                        # 如果沒有手動字幕，嘗試自動生成的字幕
                        transcript = transcript_list.find_generated_transcript([lang_code])
                        transcript_data = transcript.fetch()
                        
                        formatter = TextFormatter()
                        subtitle_text = formatter.format_transcript(transcript_data)
                        
                        logger.info(f"成功獲取自動字幕，語言: {lang_code}")
                        return subtitle_text, lang_code
                        
                    except:
                        continue
            
            # 如果偏好語言都沒有，嘗試翻譯其他語言的字幕
            try:
                # 獲取第一個可用的字幕並翻譯
                for transcript in transcript_list:
                    if transcript.is_translatable:
                        for target_lang in preferred_languages:
                            try:
                                translated = transcript.translate(target_lang)
                                transcript_data = translated.fetch()
                                
                                formatter = TextFormatter()
                                subtitle_text = formatter.format_transcript(transcript_data)
                                
                                logger.info(f"成功獲取翻譯字幕，原語言: {transcript.language_code}，目標語言: {target_lang}")
                                return subtitle_text, target_lang
                                
                            except:
                                continue
                        break
                        
            except Exception as e:
                logger.error(f"翻譯字幕時發生錯誤: {e}")
            
            logger.warning("無法獲取任何字幕")
            return None, None
            
        except Exception as e:
            logger.error(f"下載字幕時發生錯誤: {e}")
            return None, None
    
    def download_subtitle_with_yt_dlp(self, video_url: str, language_codes: List[str] = None) -> Optional[str]:
        """
        使用yt-dlp下載字幕作為備用方案
        
        Args:
            video_url: YouTube影片URL
            language_codes: 語言代碼列表
        
        Returns:
            字幕文件路徑
        """
        if not language_codes:
            language_codes = [Config.SUBTITLE_LANGUAGE, 'zh', Config.FALLBACK_LANGUAGE]
        
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return None
        
        # 設定yt-dlp選項
        ydl_opts = {
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': language_codes,
            'subtitlesformat': 'vtt',
            'skip_download': True,
            'outtmpl': os.path.join(self.download_path, f'{video_id}.%(ext)s'),
            'quiet': True,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
            
            # 查找下載的字幕文件
            for lang_code in language_codes:
                subtitle_files = [
                    os.path.join(self.download_path, f'{video_id}.{lang_code}.vtt'),
                    os.path.join(self.download_path, f'{video_id}.{lang_code}.auto.vtt')
                ]
                
                for subtitle_file in subtitle_files:
                    if os.path.exists(subtitle_file):
                        logger.info(f"成功下載字幕文件: {subtitle_file}")
                        return subtitle_file
            
            logger.warning("未找到下載的字幕文件")
            return None
            
        except Exception as e:
            logger.error(f"使用yt-dlp下載字幕時發生錯誤: {e}")
            return None
    
    def parse_vtt_file(self, vtt_file_path: str) -> str:
        """解析VTT字幕文件並提取純文本"""
        try:
            with open(vtt_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 移除VTT格式標記
            lines = content.split('\n')
            text_lines = []
            
            for line in lines:
                line = line.strip()
                # 跳過VTT頭部、時間戳和空行
                if (line.startswith('WEBVTT') or 
                    line.startswith('NOTE') or 
                    '-->' in line or 
                    line == '' or 
                    line.isdigit()):
                    continue
                
                # 移除HTML標籤
                line = re.sub(r'<[^>]+>', '', line)
                if line:
                    text_lines.append(line)
            
            return '\n'.join(text_lines)
            
        except Exception as e:
            logger.error(f"解析VTT文件時發生錯誤: {e}")
            return ""
    
    def get_subtitle_text(self, video_url: str) -> Tuple[Optional[str], Optional[str]]:
        """
        獲取影片字幕文本的主要方法
        
        Returns:
            Tuple[字幕內容, 語言代碼]
        """
        # 首先嘗試使用YouTube Transcript API
        subtitle_text, language_code = self.download_transcript(video_url)
        
        if subtitle_text:
            return subtitle_text, language_code
        
        # 如果失敗，嘗試使用yt-dlp
        logger.info("YouTube Transcript API失敗，嘗試使用yt-dlp...")
        subtitle_file = self.download_subtitle_with_yt_dlp(video_url)
        
        if subtitle_file:
            subtitle_text = self.parse_vtt_file(subtitle_file)
            if subtitle_text:
                # 從文件名推斷語言代碼
                filename = os.path.basename(subtitle_file)
                if '.zh-TW.' in filename or '.zh.' in filename:
                    language_code = 'zh'
                elif '.en.' in filename:
                    language_code = 'en'
                else:
                    language_code = 'unknown'
                
                return subtitle_text, language_code
        
        logger.error("無法獲取字幕")
        return None, None
    
    def save_subtitle_to_file(self, video_id: str, subtitle_text: str, language_code: str) -> str:
        """將字幕保存到文件"""
        filename = f"{video_id}_{language_code}_subtitle.txt"
        filepath = os.path.join(self.download_path, filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(subtitle_text)
            
            logger.info(f"字幕已保存到: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"保存字幕文件時發生錯誤: {e}")
            return ""