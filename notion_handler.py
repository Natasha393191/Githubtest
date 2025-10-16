from notion_client import Client
from config import Config
from typing import Dict, List, Optional
import logging
from datetime import datetime
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotionHandler:
    """處理Notion API相關操作的類別"""
    
    def __init__(self):
        self.client = Client(auth=Config.NOTION_TOKEN)
        self.database_id = Config.NOTION_DATABASE_ID
    
    def create_video_page(self, video_info: Dict, transcript: str, summary: str, quotes: str = "") -> Optional[str]:
        """
        在Notion資料庫中創建新的影片頁面
        
        Args:
            video_info: 影片資訊字典
            transcript: 中文逐字稿
            summary: 重點整理
            quotes: 重要引言
        
        Returns:
            創建的頁面URL
        """
        try:
            # 準備頁面屬性
            properties = self._prepare_page_properties(video_info)
            
            # 準備頁面內容
            children = self._prepare_page_content(video_info, transcript, summary, quotes)
            
            # 創建頁面
            response = self.client.pages.create(
                parent={"database_id": self.database_id},
                properties=properties,
                children=children
            )
            
            page_url = response.get("url", "")
            logger.info(f"成功創建Notion頁面: {page_url}")
            return page_url
            
        except Exception as e:
            logger.error(f"創建Notion頁面時發生錯誤: {e}")
            return None
    
    def _prepare_page_properties(self, video_info: Dict) -> Dict:
        """準備頁面屬性"""
        # 清理標題，移除特殊字符
        title = self._clean_title(video_info.get('title', '未知標題'))
        
        properties = {
            "標題": {
                "title": [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            }
        }
        
        # 添加其他屬性（如果資料庫有對應欄位）
        if video_info.get('url'):
            properties["影片連結"] = {
                "url": video_info['url']
            }
        
        if video_info.get('published_at'):
            try:
                # 轉換日期格式
                pub_date = datetime.fromisoformat(video_info['published_at'].replace('Z', '+00:00'))
                properties["發布日期"] = {
                    "date": {
                        "start": pub_date.strftime('%Y-%m-%d')
                    }
                }
            except:
                pass
        
        if video_info.get('duration'):
            properties["影片長度"] = {
                "rich_text": [
                    {
                        "text": {
                            "content": str(video_info['duration'])
                        }
                    }
                ]
            }
        
        if video_info.get('view_count'):
            try:
                properties["觀看次數"] = {
                    "number": int(video_info['view_count'])
                }
            except:
                pass
        
        # 添加標籤
        properties["標籤"] = {
            "multi_select": [
                {"name": "YouTube"},
                {"name": "已處理"}
            ]
        }
        
        # 添加處理日期
        properties["處理日期"] = {
            "date": {
                "start": datetime.now().strftime('%Y-%m-%d')
            }
        }
        
        return properties
    
    def _clean_title(self, title: str) -> str:
        """清理標題，移除可能導致問題的字符"""
        # 移除或替換特殊字符
        title = re.sub(r'[^\w\s\u4e00-\u9fff\-_()（）【】\[\]！!？?。.]', '', title)
        # 限制長度
        if len(title) > 100:
            title = title[:97] + "..."
        return title.strip()
    
    def _prepare_page_content(self, video_info: Dict, transcript: str, summary: str, quotes: str = "") -> List[Dict]:
        """準備頁面內容"""
        children = []
        
        # 添加影片基本資訊
        children.extend([
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "📺 影片資訊"
                            }
                        }
                    ]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": f"🔗 影片連結: "
                            }
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": video_info.get('url', ''),
                                "link": {
                                    "url": video_info.get('url', '')
                                }
                            }
                        }
                    ]
                }
            }
        ])
        
        # 添加影片描述（如果有）
        if video_info.get('description'):
            description = video_info['description'][:500]  # 限制長度
            children.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": f"📝 影片描述: {description}"
                            }
                        }
                    ]
                }
            })
        
        # 添加重點整理
        if summary:
            children.extend([
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "📋 重點整理"
                                }
                            }
                        ]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": summary
                                }
                            }
                        ]
                    }
                }
            ])
        
        # 添加重要引言（如果有）
        if quotes:
            children.extend([
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "💬 重要引言"
                                }
                            }
                        ]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": quotes
                                }
                            }
                        ]
                    }
                }
            ])
        
        # 添加完整逐字稿
        if transcript:
            children.extend([
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "📄 完整逐字稿"
                                }
                            }
                        ]
                    }
                },
                {
                    "object": "block",
                    "type": "toggle",
                    "toggle": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "點擊展開完整逐字稿"
                                }
                            }
                        ],
                        "children": self._split_transcript_into_blocks(transcript)
                    }
                }
            ])
        
        return children
    
    def _split_transcript_into_blocks(self, transcript: str) -> List[Dict]:
        """將長逐字稿分割成多個段落塊"""
        # Notion的文本塊有長度限制，需要分割
        max_length = 1500
        paragraphs = transcript.split('\n\n')
        blocks = []
        current_text = ""
        
        for paragraph in paragraphs:
            if len(current_text) + len(paragraph) + 2 <= max_length:
                if current_text:
                    current_text += "\n\n" + paragraph
                else:
                    current_text = paragraph
            else:
                if current_text:
                    blocks.append({
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [
                                {
                                    "type": "text",
                                    "text": {
                                        "content": current_text
                                    }
                                }
                            ]
                        }
                    })
                current_text = paragraph
        
        if current_text:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": current_text
                            }
                        }
                    ]
                }
            })
        
        return blocks
    
    def update_page(self, page_id: str, properties: Dict) -> bool:
        """更新頁面屬性"""
        try:
            self.client.pages.update(
                page_id=page_id,
                properties=properties
            )
            logger.info(f"成功更新頁面: {page_id}")
            return True
            
        except Exception as e:
            logger.error(f"更新頁面時發生錯誤: {e}")
            return False
    
    def search_existing_video(self, video_url: str) -> Optional[str]:
        """搜索是否已存在相同影片的頁面"""
        try:
            response = self.client.databases.query(
                database_id=self.database_id,
                filter={
                    "property": "影片連結",
                    "url": {
                        "equals": video_url
                    }
                }
            )
            
            if response['results']:
                return response['results'][0]['id']
            
            return None
            
        except Exception as e:
            logger.error(f"搜索現有影片時發生錯誤: {e}")
            return None
    
    def get_database_properties(self) -> Dict:
        """獲取資料庫的屬性結構"""
        try:
            response = self.client.databases.retrieve(database_id=self.database_id)
            return response.get('properties', {})
            
        except Exception as e:
            logger.error(f"獲取資料庫屬性時發生錯誤: {e}")
            return {}