import os
import re
import yt_dlp
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from config import Config
from typing import List, Dict, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YouTubeHandler:
    """處理YouTube相關操作的類別"""
    
    def __init__(self):
        self.api_key = Config.YOUTUBE_API_KEY
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        
        # 建立下載目錄
        os.makedirs(Config.DOWNLOAD_PATH, exist_ok=True)
    
    def extract_channel_id(self, url: str) -> Optional[str]:
        """從YouTube URL中提取頻道ID"""
        patterns = [
            r'youtube\.com/channel/([a-zA-Z0-9_-]+)',
            r'youtube\.com/c/([a-zA-Z0-9_-]+)',
            r'youtube\.com/@([a-zA-Z0-9_-]+)',
            r'youtube\.com/user/([a-zA-Z0-9_-]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                channel_identifier = match.group(1)
                
                # 如果是 @username 或 /c/ 或 /user/ 格式，需要轉換為頻道ID
                if '/c/' in url or '/@' in url or '/user/' in url:
                    return self.get_channel_id_by_username(channel_identifier)
                else:
                    return channel_identifier
        
        return None
    
    def get_channel_id_by_username(self, username: str) -> Optional[str]:
        """通過用戶名獲取頻道ID"""
        try:
            # 嘗試通過用戶名搜索
            request = self.youtube.search().list(
                part='snippet',
                q=username,
                type='channel',
                maxResults=1
            )
            response = request.execute()
            
            if response['items']:
                return response['items'][0]['snippet']['channelId']
                
            # 如果搜索失敗，嘗試通過頻道API
            request = self.youtube.channels().list(
                part='id',
                forUsername=username
            )
            response = request.execute()
            
            if response['items']:
                return response['items'][0]['id']
                
        except HttpError as e:
            logger.error(f"獲取頻道ID時發生錯誤: {e}")
        
        return None
    
    def get_channel_videos(self, channel_url: str, max_videos: int = 50) -> List[Dict]:
        """獲取頻道的所有影片資訊"""
        channel_id = self.extract_channel_id(channel_url)
        if not channel_id:
            raise ValueError("無法從URL中提取頻道ID")
        
        logger.info(f"正在獲取頻道 {channel_id} 的影片...")
        
        videos = []
        next_page_token = None
        
        try:
            while len(videos) < max_videos:
                # 獲取頻道的上傳播放列表ID
                channel_request = self.youtube.channels().list(
                    part='contentDetails',
                    id=channel_id
                )
                channel_response = channel_request.execute()
                
                if not channel_response['items']:
                    raise ValueError("找不到指定的頻道")
                
                uploads_playlist_id = channel_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
                
                # 獲取播放列表中的影片
                playlist_request = self.youtube.playlistItems().list(
                    part='snippet',
                    playlistId=uploads_playlist_id,
                    maxResults=min(50, max_videos - len(videos)),
                    pageToken=next_page_token
                )
                playlist_response = playlist_request.execute()
                
                # 提取影片ID
                video_ids = [item['snippet']['resourceId']['videoId'] for item in playlist_response['items']]
                
                # 獲取詳細的影片資訊
                videos_request = self.youtube.videos().list(
                    part='snippet,statistics,contentDetails',
                    id=','.join(video_ids)
                )
                videos_response = videos_request.execute()
                
                for video in videos_response['items']:
                    video_info = {
                        'video_id': video['id'],
                        'title': video['snippet']['title'],
                        'description': video['snippet']['description'],
                        'published_at': video['snippet']['publishedAt'],
                        'duration': video['contentDetails']['duration'],
                        'view_count': video['statistics'].get('viewCount', 0),
                        'like_count': video['statistics'].get('likeCount', 0),
                        'url': f"https://www.youtube.com/watch?v={video['id']}"
                    }
                    videos.append(video_info)
                
                next_page_token = playlist_response.get('nextPageToken')
                if not next_page_token:
                    break
            
            logger.info(f"成功獲取 {len(videos)} 個影片")
            return videos[:max_videos]
            
        except HttpError as e:
            logger.error(f"獲取影片時發生錯誤: {e}")
            raise
    
    def download_video_info(self, video_url: str) -> Dict:
        """使用yt-dlp獲取影片詳細資訊"""
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(video_url, download=False)
                return {
                    'title': info.get('title'),
                    'description': info.get('description'),
                    'duration': info.get('duration'),
                    'upload_date': info.get('upload_date'),
                    'uploader': info.get('uploader'),
                    'view_count': info.get('view_count'),
                    'like_count': info.get('like_count'),
                    'subtitles': list(info.get('subtitles', {}).keys()) if info.get('subtitles') else [],
                    'automatic_captions': list(info.get('automatic_captions', {}).keys()) if info.get('automatic_captions') else []
                }
            except Exception as e:
                logger.error(f"獲取影片資訊時發生錯誤: {e}")
                return {}
    
    def get_available_subtitles(self, video_url: str) -> List[str]:
        """獲取影片可用的字幕語言"""
        info = self.download_video_info(video_url)
        subtitles = info.get('subtitles', [])
        automatic_captions = info.get('automatic_captions', [])
        
        # 合併手動字幕和自動字幕
        all_subtitles = list(set(subtitles + automatic_captions))
        return all_subtitles