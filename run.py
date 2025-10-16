#!/usr/bin/env python3
"""
YouTube影片自動化處理工具 - 啟動腳本
提供簡單的選單介面來選擇使用GUI或CLI模式
"""

import sys
import os
import subprocess

def check_dependencies():
    """檢查必要的依賴是否已安裝"""
    try:
        import tkinter
        import yt_dlp
        import openai
        import notion_client
        from youtube_transcript_api import YouTubeTranscriptApi
        from googleapiclient.discovery import build
        return True
    except ImportError as e:
        print(f"❌ 缺少必要的依賴: {e}")
        print("請執行: pip install -r requirements.txt")
        return False

def check_config():
    """檢查配置文件是否存在"""
    if not os.path.exists('.env'):
        print("⚠️  未找到 .env 配置文件")
        print("請參考 SETUP_GUIDE.md 進行API設定")
        return False
    return True

def show_menu():
    """顯示主選單"""
    print("\n" + "="*60)
    print("🎬 YouTube影片自動化處理工具")
    print("="*60)
    print("請選擇使用模式:")
    print()
    print("1. 🖥️  圖形介面 (GUI) - 推薦新手使用")
    print("2. 💻 命令列介面 (CLI) - 適合進階用戶")
    print("3. 📖 查看使用說明")
    print("4. 🛠️  查看設定指南")
    print("5. ❌ 退出")
    print("="*60)

def run_gui():
    """啟動GUI介面"""
    try:
        print("🚀 啟動圖形介面...")
        subprocess.run([sys.executable, "gui.py"])
    except Exception as e:
        print(f"❌ 啟動GUI時發生錯誤: {e}")

def run_cli():
    """顯示CLI使用範例"""
    print("\n💻 命令列介面使用範例:")
    print("-" * 40)
    print("處理YouTube頻道:")
    print('  python main.py --channel "https://www.youtube.com/@channelname"')
    print()
    print("處理單個影片:")
    print('  python main.py --video "https://www.youtube.com/watch?v=VIDEO_ID"')
    print()
    print("查看所有選項:")
    print("  python main.py --help")
    print()
    
    choice = input("是否要直接執行CLI命令? (y/N): ").lower().strip()
    if choice == 'y':
        try:
            subprocess.run([sys.executable, "main.py", "--help"])
        except Exception as e:
            print(f"❌ 啟動CLI時發生錯誤: {e}")

def show_readme():
    """顯示README內容"""
    if os.path.exists("README.md"):
        print("\n📖 使用說明:")
        print("-" * 40)
        with open("README.md", 'r', encoding='utf-8') as f:
            content = f.read()
            # 只顯示前面的重要部分
            lines = content.split('\n')
            for i, line in enumerate(lines[:50]):  # 只顯示前50行
                print(line)
            if len(lines) > 50:
                print("\n... (完整內容請查看 README.md)")
    else:
        print("❌ 找不到 README.md 文件")

def show_setup_guide():
    """顯示設定指南"""
    if os.path.exists("SETUP_GUIDE.md"):
        print("\n🛠️  設定指南:")
        print("-" * 40)
        with open("SETUP_GUIDE.md", 'r', encoding='utf-8') as f:
            content = f.read()
            # 只顯示目錄和重要部分
            lines = content.split('\n')
            in_toc = False
            for i, line in enumerate(lines[:100]):  # 只顯示前100行
                if "📋 目錄" in line:
                    in_toc = True
                if in_toc and line.startswith("## 🎯"):
                    break
                print(line)
            print("\n... (完整內容請查看 SETUP_GUIDE.md)")
    else:
        print("❌ 找不到 SETUP_GUIDE.md 文件")

def main():
    """主函數"""
    print("正在檢查環境...")
    
    # 檢查依賴
    if not check_dependencies():
        return
    
    # 檢查配置
    config_ok = check_config()
    
    while True:
        show_menu()
        
        if not config_ok:
            print("\n⚠️  警告: 未找到配置文件，某些功能可能無法使用")
        
        try:
            choice = input("\n請輸入選項 (1-5): ").strip()
            
            if choice == '1':
                run_gui()
            elif choice == '2':
                run_cli()
            elif choice == '3':
                show_readme()
            elif choice == '4':
                show_setup_guide()
            elif choice == '5':
                print("\n👋 感謝使用！")
                break
            else:
                print("❌ 無效選項，請輸入 1-5")
            
            if choice in ['1', '2']:
                break
            
            input("\n按 Enter 繼續...")
            
        except KeyboardInterrupt:
            print("\n\n👋 感謝使用！")
            break
        except Exception as e:
            print(f"❌ 發生錯誤: {e}")

if __name__ == "__main__":
    main()