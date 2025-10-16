#!/usr/bin/env python3
"""
YouTube影片自動化處理工具 - 快速入門腳本
為新用戶提供簡化的設定和使用流程
"""

import os
import sys
import subprocess

def welcome_message():
    """顯示歡迎訊息"""
    print("\n" + "🎬" * 20)
    print("歡迎使用 YouTube影片自動化處理工具！")
    print("🎬" * 20)
    print("""
這個工具可以幫您：
✨ 自動抓取YouTube頻道的所有影片
✨ 下載並翻譯影片字幕成中文
✨ 生成AI重點整理和摘要
✨ 自動整理到您的Notion資料庫

讓我們開始設定吧！
""")

def check_python_version():
    """檢查Python版本"""
    print("🔍 檢查Python版本...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 7:
        print(f"✅ Python版本: {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python版本過舊: {version.major}.{version.minor}.{version.micro}")
        print("請升級到Python 3.7或更高版本")
        return False

def install_dependencies():
    """安裝依賴包"""
    print("\n📦 安裝必要的依賴包...")
    
    if not os.path.exists("requirements.txt"):
        print("❌ 找不到requirements.txt文件")
        return False
    
    try:
        print("正在執行: pip install -r requirements.txt")
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ 依賴包安裝完成")
            return True
        else:
            print(f"❌ 安裝失敗: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ 安裝過程中發生錯誤: {e}")
        return False

def setup_config():
    """設定配置文件"""
    print("\n⚙️ 設定API配置...")
    
    if os.path.exists(".env"):
        choice = input("已存在配置文件，是否要重新設定？(y/N): ").lower().strip()
        if choice != 'y':
            print("跳過配置設定")
            return True
    
    print("""
您需要獲取以下API金鑰：

1. 🎯 YouTube Data API v3 金鑰
   - 前往: https://console.cloud.google.com/
   - 啟用YouTube Data API v3並創建API金鑰

2. 🤖 OpenAI API 金鑰
   - 前往: https://platform.openai.com/
   - 註冊並獲取API金鑰

3. 📚 Notion API 設定
   - 前往: https://developers.notion.com/
   - 創建Integration並獲取Token和Database ID

詳細設定步驟請參考 SETUP_GUIDE.md
""")
    
    choice = input("是否現在設定API金鑰？(Y/n): ").lower().strip()
    if choice == 'n':
        print("⚠️  跳過API設定，稍後可通過GUI設定")
        return True
    
    # 收集API金鑰
    config_data = {}
    
    print("\n請輸入您的API金鑰（可以稍後通過GUI修改）:")
    
    config_data['YOUTUBE_API_KEY'] = input("YouTube API Key: ").strip()
    config_data['OPENAI_API_KEY'] = input("OpenAI API Key: ").strip()
    config_data['NOTION_TOKEN'] = input("Notion Integration Token: ").strip()
    config_data['NOTION_DATABASE_ID'] = input("Notion Database ID: ").strip()
    
    # 保存配置
    try:
        with open('.env', 'w', encoding='utf-8') as f:
            for key, value in config_data.items():
                f.write(f"{key}={value}\n")
        
        print("✅ 配置已保存到 .env 文件")
        return True
        
    except Exception as e:
        print(f"❌ 保存配置時發生錯誤: {e}")
        return False

def run_test():
    """執行測試"""
    print("\n🧪 測試系統設定...")
    
    try:
        result = subprocess.run([
            sys.executable, "test_setup.py", "--quick"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ 測試時發生錯誤: {e}")
        return False

def show_next_steps():
    """顯示後續步驟"""
    print("""
🎉 設定完成！接下來您可以：

1. 🖥️  使用圖形介面（推薦新手）:
   python gui.py

2. 💻 使用命令列介面:
   python main.py --help

3. 📋 使用選單系統:
   python run.py

4. 🧪 執行完整測試:
   python test_setup.py

5. 📖 查看詳細說明:
   - README.md - 使用說明
   - SETUP_GUIDE.md - 設定指南

開始處理您的第一個YouTube影片吧！
""")

def main():
    """主函數"""
    welcome_message()
    
    # 檢查Python版本
    if not check_python_version():
        return
    
    # 安裝依賴
    print("是否要安裝必要的依賴包？")
    choice = input("(建議選擇 Y，如已安裝可選擇 N) (Y/n): ").lower().strip()
    
    if choice != 'n':
        if not install_dependencies():
            print("❌ 依賴安裝失敗，請手動執行: pip install -r requirements.txt")
            return
    
    # 設定配置
    if not setup_config():
        print("❌ 配置設定失敗")
        return
    
    # 執行測試
    if os.path.exists(".env"):
        choice = input("\n是否要測試API連接？(Y/n): ").lower().strip()
        if choice != 'n':
            test_ok = run_test()
            if not test_ok:
                print("⚠️  測試未完全通過，但您仍可以嘗試使用工具")
    
    # 顯示後續步驟
    show_next_steps()
    
    # 詢問是否立即啟動
    choice = input("是否要立即啟動圖形介面？(Y/n): ").lower().strip()
    if choice != 'n':
        try:
            subprocess.run([sys.executable, "gui.py"])
        except Exception as e:
            print(f"❌ 啟動GUI時發生錯誤: {e}")
            print("您可以稍後手動執行: python gui.py")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 設定已取消")
    except Exception as e:
        print(f"\n❌ 發生未預期的錯誤: {e}")
        print("請查看錯誤訊息並重新執行腳本")