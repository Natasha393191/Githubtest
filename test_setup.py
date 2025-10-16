#!/usr/bin/env python3
"""
設定測試腳本
用於驗證所有API連接和配置是否正確
"""

import os
import sys
from typing import Dict, List, Tuple

def test_imports() -> bool:
    """測試必要模組的導入"""
    print("🔍 測試模組導入...")
    
    required_modules = [
        ('tkinter', 'GUI支援'),
        ('yt_dlp', 'YouTube下載'),
        ('openai', 'OpenAI API'),
        ('notion_client', 'Notion API'),
        ('youtube_transcript_api', 'YouTube字幕API'),
        ('googleapiclient', 'Google API'),
        ('dotenv', '環境變數支援')
    ]
    
    failed_imports = []
    
    for module_name, description in required_modules:
        try:
            __import__(module_name)
            print(f"  ✅ {module_name} - {description}")
        except ImportError:
            print(f"  ❌ {module_name} - {description}")
            failed_imports.append(module_name)
    
    if failed_imports:
        print(f"\n❌ 缺少以下模組: {', '.join(failed_imports)}")
        print("請執行: pip install -r requirements.txt")
        return False
    
    print("✅ 所有必要模組已安裝")
    return True

def test_config_file() -> Tuple[bool, Dict[str, str]]:
    """測試配置文件"""
    print("\n🔍 測試配置文件...")
    
    if not os.path.exists('.env'):
        print("❌ 未找到 .env 配置文件")
        print("請複製 .env.example 並填入您的API金鑰")
        return False, {}
    
    print("✅ 找到 .env 配置文件")
    
    # 讀取配置
    config = {}
    required_keys = [
        'YOUTUBE_API_KEY',
        'OPENAI_API_KEY',
        'NOTION_TOKEN',
        'NOTION_DATABASE_ID'
    ]
    
    try:
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    config[key] = value
    except Exception as e:
        print(f"❌ 讀取配置文件時發生錯誤: {e}")
        return False, {}
    
    # 檢查必要的配置項
    missing_keys = []
    for key in required_keys:
        if key not in config or not config[key].strip():
            missing_keys.append(key)
        else:
            # 隱藏敏感資訊
            masked_value = config[key][:8] + "..." if len(config[key]) > 8 else "***"
            print(f"  ✅ {key}: {masked_value}")
    
    if missing_keys:
        print(f"\n❌ 缺少以下配置: {', '.join(missing_keys)}")
        return False, config
    
    print("✅ 所有必要配置已設定")
    return True, config

def test_youtube_api(config: Dict[str, str]) -> bool:
    """測試YouTube API連接"""
    print("\n🔍 測試YouTube API連接...")
    
    try:
        from youtube_handler import YouTubeHandler
        handler = YouTubeHandler()
        
        # 嘗試搜索一個公開頻道
        test_channel = "https://www.youtube.com/@YouTube"
        channel_id = handler.extract_channel_id(test_channel)
        
        if channel_id:
            print(f"  ✅ 成功解析頻道ID: {channel_id}")
            print("✅ YouTube API 連接正常")
            return True
        else:
            print("❌ 無法解析頻道ID")
            return False
            
    except Exception as e:
        print(f"❌ YouTube API 測試失敗: {e}")
        return False

def test_openai_api(config: Dict[str, str]) -> bool:
    """測試OpenAI API連接"""
    print("\n🔍 測試OpenAI API連接...")
    
    try:
        from translator import Translator
        translator = Translator()
        
        # 測試簡單翻譯
        test_text = "Hello, this is a test."
        result = translator.translate_text(test_text, "en")
        
        if result and len(result) > 0:
            print(f"  ✅ 翻譯測試成功: {result[:50]}...")
            print("✅ OpenAI API 連接正常")
            return True
        else:
            print("❌ 翻譯測試失敗")
            return False
            
    except Exception as e:
        print(f"❌ OpenAI API 測試失敗: {e}")
        print("請檢查API金鑰和帳戶餘額")
        return False

def test_notion_api(config: Dict[str, str]) -> bool:
    """測試Notion API連接"""
    print("\n🔍 測試Notion API連接...")
    
    try:
        from notion_handler import NotionHandler
        handler = NotionHandler()
        
        # 獲取資料庫屬性
        properties = handler.get_database_properties()
        
        if properties:
            print(f"  ✅ 成功連接資料庫，找到 {len(properties)} 個欄位:")
            for prop_name in list(properties.keys())[:5]:  # 只顯示前5個
                print(f"    - {prop_name}")
            if len(properties) > 5:
                print(f"    ... 還有 {len(properties) - 5} 個欄位")
            print("✅ Notion API 連接正常")
            return True
        else:
            print("❌ 無法獲取資料庫屬性")
            return False
            
    except Exception as e:
        print(f"❌ Notion API 測試失敗: {e}")
        print("請檢查Integration Token和Database ID")
        return False

def test_subtitle_download() -> bool:
    """測試字幕下載功能"""
    print("\n🔍 測試字幕下載功能...")
    
    try:
        from subtitle_handler import SubtitleHandler
        handler = SubtitleHandler()
        
        # 使用一個有字幕的公開影片進行測試
        test_video = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Roll (通常有字幕)
        
        available_transcripts = handler.get_available_transcripts("dQw4w9WgXcQ")
        
        if available_transcripts:
            print(f"  ✅ 找到 {len(available_transcripts)} 種語言的字幕")
            for transcript in available_transcripts[:3]:  # 只顯示前3個
                print(f"    - {transcript['language']} ({transcript['language_code']})")
            print("✅ 字幕下載功能正常")
            return True
        else:
            print("⚠️  測試影片沒有可用字幕，但功能可能正常")
            return True
            
    except Exception as e:
        print(f"❌ 字幕下載測試失敗: {e}")
        return False

def run_all_tests() -> None:
    """執行所有測試"""
    print("🧪 開始系統測試...")
    print("="*60)
    
    tests = []
    
    # 測試模組導入
    tests.append(("模組導入", test_imports()))
    
    # 測試配置文件
    config_ok, config = test_config_file()
    tests.append(("配置文件", config_ok))
    
    if config_ok:
        # 測試各個API
        tests.append(("YouTube API", test_youtube_api(config)))
        tests.append(("OpenAI API", test_openai_api(config)))
        tests.append(("Notion API", test_notion_api(config)))
        tests.append(("字幕下載", test_subtitle_download()))
    
    # 顯示測試結果摘要
    print("\n" + "="*60)
    print("📊 測試結果摘要")
    print("="*60)
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, result in tests:
        status = "✅ 通過" if result else "❌ 失敗"
        print(f"{test_name:<15} {status}")
        if result:
            passed_tests += 1
    
    print("-"*60)
    print(f"總計: {passed_tests}/{total_tests} 項測試通過")
    
    if passed_tests == total_tests:
        print("\n🎉 所有測試通過！系統已準備就緒")
        print("您可以執行以下命令開始使用:")
        print("  python run.py     # 啟動選單")
        print("  python gui.py     # 直接啟動GUI")
        print("  python main.py    # 查看CLI選項")
    else:
        print(f"\n⚠️  有 {total_tests - passed_tests} 項測試失敗")
        print("請根據上述錯誤訊息進行修正")
        print("參考 SETUP_GUIDE.md 獲取詳細設定說明")

def main():
    """主函數"""
    if len(sys.argv) > 1 and sys.argv[1] == '--quick':
        # 快速測試，只測試配置
        config_ok, config = test_config_file()
        if config_ok:
            print("✅ 快速測試通過")
        else:
            print("❌ 快速測試失敗")
    else:
        # 完整測試
        run_all_tests()

if __name__ == "__main__":
    main()