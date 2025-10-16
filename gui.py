#!/usr/bin/env python3
"""
YouTube處理工具的圖形用戶介面
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import threading
import queue
import sys
import os
from datetime import datetime

# 導入主要處理類別
from main import YouTubeProcessor
from config import Config

class YouTubeProcessorGUI:
    """YouTube處理工具的GUI介面"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("YouTube影片自動化處理工具")
        self.root.geometry("800x700")
        
        # 創建處理器實例
        self.processor = None
        self.processing = False
        
        # 創建消息隊列用於線程間通信
        self.message_queue = queue.Queue()
        
        # 設置GUI
        self.setup_gui()
        
        # 開始檢查消息隊列
        self.check_queue()
    
    def setup_gui(self):
        """設置GUI元素"""
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 配置網格權重
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # 標題
        title_label = ttk.Label(
            main_frame, 
            text="🎬 YouTube影片自動化處理工具", 
            font=('Arial', 16, 'bold')
        )
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # URL輸入區域
        url_frame = ttk.LabelFrame(main_frame, text="🔗 輸入YouTube連結", padding="10")
        url_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        url_frame.columnconfigure(1, weight=1)
        
        ttk.Label(url_frame, text="YouTube URL:").grid(row=0, column=0, sticky=tk.W, padx=(0, 10))
        
        self.url_var = tk.StringVar()
        self.url_entry = ttk.Entry(url_frame, textvariable=self.url_var, width=50)
        self.url_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=(0, 10))
        
        # URL類型選擇
        self.url_type_var = tk.StringVar(value="channel")
        ttk.Radiobutton(url_frame, text="頻道", variable=self.url_type_var, value="channel").grid(row=1, column=0, sticky=tk.W, pady=(5, 0))
        ttk.Radiobutton(url_frame, text="單個影片", variable=self.url_type_var, value="video").grid(row=1, column=1, sticky=tk.W, pady=(5, 0))
        
        # 設定區域
        settings_frame = ttk.LabelFrame(main_frame, text="⚙️ 處理設定", padding="10")
        settings_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        settings_frame.columnconfigure(1, weight=1)
        
        # 最大影片數量
        ttk.Label(settings_frame, text="最大處理影片數:").grid(row=0, column=0, sticky=tk.W, padx=(0, 10))
        self.max_videos_var = tk.IntVar(value=10)
        max_videos_spinbox = ttk.Spinbox(settings_frame, from_=1, to=100, textvariable=self.max_videos_var, width=10)
        max_videos_spinbox.grid(row=0, column=1, sticky=tk.W)
        
        # 跳過已存在
        self.skip_existing_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(settings_frame, text="跳過已存在於Notion的影片", variable=self.skip_existing_var).grid(row=1, column=0, columnspan=2, sticky=tk.W, pady=(5, 0))
        
        # 控制按鈕
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=3, column=0, columnspan=3, pady=(0, 10))
        
        self.process_button = ttk.Button(button_frame, text="🚀 開始處理", command=self.start_processing)
        self.process_button.pack(side=tk.LEFT, padx=(0, 10))
        
        self.stop_button = ttk.Button(button_frame, text="⏹️ 停止處理", command=self.stop_processing, state=tk.DISABLED)
        self.stop_button.pack(side=tk.LEFT, padx=(0, 10))
        
        ttk.Button(button_frame, text="⚙️ 設定API", command=self.open_config_dialog).pack(side=tk.LEFT, padx=(0, 10))
        
        ttk.Button(button_frame, text="📁 開啟下載資料夾", command=self.open_download_folder).pack(side=tk.LEFT)
        
        # 進度條
        self.progress_var = tk.StringVar(value="準備就緒")
        ttk.Label(main_frame, textvariable=self.progress_var).grid(row=4, column=0, columnspan=3, sticky=tk.W)
        
        self.progress_bar = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress_bar.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(5, 10))
        
        # 日誌輸出區域
        log_frame = ttk.LabelFrame(main_frame, text="📋 處理日誌", padding="10")
        log_frame.grid(row=6, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        main_frame.rowconfigure(6, weight=1)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=15, width=80)
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 結果區域
        result_frame = ttk.LabelFrame(main_frame, text="📊 處理結果", padding="10")
        result_frame.grid(row=7, column=0, columnspan=3, sticky=(tk.W, tk.E))
        
        self.result_text = tk.Text(result_frame, height=4, width=80)
        self.result_text.grid(row=0, column=0, sticky=(tk.W, tk.E))
        
        # 綁定Enter鍵
        self.url_entry.bind('<Return>', lambda e: self.start_processing())
    
    def log_message(self, message):
        """添加日誌消息"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        formatted_message = f"[{timestamp}] {message}\n"
        self.log_text.insert(tk.END, formatted_message)
        self.log_text.see(tk.END)
        self.root.update_idletasks()
    
    def start_processing(self):
        """開始處理"""
        url = self.url_var.get().strip()
        if not url:
            messagebox.showerror("錯誤", "請輸入YouTube URL")
            return
        
        # 檢查配置
        try:
            Config.validate_config()
        except ValueError as e:
            messagebox.showerror("配置錯誤", f"請先設定API金鑰:\n{e}")
            self.open_config_dialog()
            return
        
        # 初始化處理器
        try:
            self.processor = YouTubeProcessor()
        except Exception as e:
            messagebox.showerror("初始化錯誤", f"初始化處理器失敗:\n{e}")
            return
        
        # 更新UI狀態
        self.processing = True
        self.process_button.config(state=tk.DISABLED)
        self.stop_button.config(state=tk.NORMAL)
        self.progress_bar.start()
        self.progress_var.set("正在處理...")
        
        # 清空日誌和結果
        self.log_text.delete(1.0, tk.END)
        self.result_text.delete(1.0, tk.END)
        
        # 在新線程中開始處理
        self.processing_thread = threading.Thread(target=self.process_videos, args=(url,))
        self.processing_thread.daemon = True
        self.processing_thread.start()
    
    def process_videos(self, url):
        """在後台線程中處理影片"""
        try:
            self.message_queue.put(("log", f"開始處理: {url}"))
            
            if self.url_type_var.get() == "channel":
                # 處理頻道
                results = self.processor.process_channel(
                    url,
                    max_videos=self.max_videos_var.get(),
                    skip_existing=self.skip_existing_var.get()
                )
                
                # 格式化結果
                result_text = f"""處理完成！

總影片數量: {results['total_videos']}
成功處理: {results['processed_videos']}
跳過影片: {results['skipped_videos']}
失敗影片: {results['failed_videos']}

創建的Notion頁面:
"""
                for page in results['created_pages']:
                    result_text += f"• {page['title']}\n"
                
                self.message_queue.put(("result", result_text))
                self.message_queue.put(("log", "頻道處理完成！"))
                
            else:
                # 處理單個影片
                page_url = self.processor.process_video_url(url)
                
                if page_url:
                    result_text = f"影片處理成功！\n\nNotion頁面: {page_url}"
                    self.message_queue.put(("result", result_text))
                    self.message_queue.put(("log", "影片處理完成！"))
                else:
                    self.message_queue.put(("result", "影片處理失敗"))
                    self.message_queue.put(("log", "影片處理失敗"))
            
        except Exception as e:
            self.message_queue.put(("error", f"處理時發生錯誤: {e}"))
        
        finally:
            self.message_queue.put(("finished", ""))
    
    def stop_processing(self):
        """停止處理"""
        self.processing = False
        self.progress_var.set("正在停止...")
        self.log_message("用戶請求停止處理")
    
    def check_queue(self):
        """檢查消息隊列"""
        try:
            while True:
                message_type, message = self.message_queue.get_nowait()
                
                if message_type == "log":
                    self.log_message(message)
                elif message_type == "result":
                    self.result_text.delete(1.0, tk.END)
                    self.result_text.insert(1.0, message)
                elif message_type == "error":
                    self.log_message(f"錯誤: {message}")
                    messagebox.showerror("處理錯誤", message)
                elif message_type == "finished":
                    self.processing = False
                    self.process_button.config(state=tk.NORMAL)
                    self.stop_button.config(state=tk.DISABLED)
                    self.progress_bar.stop()
                    self.progress_var.set("處理完成")
                
        except queue.Empty:
            pass
        
        # 每100ms檢查一次
        self.root.after(100, self.check_queue)
    
    def open_config_dialog(self):
        """開啟配置對話框"""
        ConfigDialog(self.root)
    
    def open_download_folder(self):
        """開啟下載資料夾"""
        download_path = Config.DOWNLOAD_PATH
        if not os.path.exists(download_path):
            os.makedirs(download_path)
        
        # 根據作業系統開啟資料夾
        import platform
        system = platform.system()
        
        if system == "Windows":
            os.startfile(download_path)
        elif system == "Darwin":  # macOS
            os.system(f"open '{download_path}'")
        else:  # Linux
            os.system(f"xdg-open '{download_path}'")

class ConfigDialog:
    """配置對話框"""
    
    def __init__(self, parent):
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("API設定")
        self.dialog.geometry("500x400")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        self.setup_dialog()
        
        # 居中顯示
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (self.dialog.winfo_width() // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (self.dialog.winfo_height() // 2)
        self.dialog.geometry(f"+{x}+{y}")
    
    def setup_dialog(self):
        """設置對話框"""
        main_frame = ttk.Frame(self.dialog, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 說明文字
        info_text = """請設定以下API金鑰以使用本工具：

1. YouTube Data API v3 金鑰
2. OpenAI API 金鑰 (用於翻譯和摘要)
3. Notion Integration Token
4. Notion Database ID

這些設定將保存在 .env 文件中。"""
        
        ttk.Label(main_frame, text=info_text, justify=tk.LEFT).pack(anchor=tk.W, pady=(0, 20))
        
        # API金鑰輸入
        self.create_input_field(main_frame, "YouTube API Key:", "YOUTUBE_API_KEY")
        self.create_input_field(main_frame, "OpenAI API Key:", "OPENAI_API_KEY")
        self.create_input_field(main_frame, "Notion Token:", "NOTION_TOKEN")
        self.create_input_field(main_frame, "Notion Database ID:", "NOTION_DATABASE_ID")
        
        # 按鈕
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(20, 0))
        
        ttk.Button(button_frame, text="保存", command=self.save_config).pack(side=tk.RIGHT, padx=(10, 0))
        ttk.Button(button_frame, text="取消", command=self.dialog.destroy).pack(side=tk.RIGHT)
        ttk.Button(button_frame, text="載入現有設定", command=self.load_config).pack(side=tk.LEFT)
    
    def create_input_field(self, parent, label_text, var_name):
        """創建輸入欄位"""
        frame = ttk.Frame(parent)
        frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(frame, text=label_text).pack(anchor=tk.W)
        
        var = tk.StringVar()
        entry = ttk.Entry(frame, textvariable=var, show="*" if "KEY" in var_name or "TOKEN" in var_name else "")
        entry.pack(fill=tk.X, pady=(2, 0))
        
        setattr(self, f"{var_name.lower()}_var", var)
    
    def load_config(self):
        """載入現有配置"""
        env_file = ".env"
        if os.path.exists(env_file):
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        var_name = f"{key.lower()}_var"
                        if hasattr(self, var_name):
                            getattr(self, var_name).set(value)
            
            messagebox.showinfo("載入完成", "已載入現有配置")
        else:
            messagebox.showwarning("檔案不存在", "找不到 .env 配置檔案")
    
    def save_config(self):
        """保存配置"""
        config_data = {
            'YOUTUBE_API_KEY': self.youtube_api_key_var.get(),
            'OPENAI_API_KEY': self.openai_api_key_var.get(),
            'NOTION_TOKEN': self.notion_token_var.get(),
            'NOTION_DATABASE_ID': self.notion_database_id_var.get()
        }
        
        # 檢查必填欄位
        missing_fields = [key for key, value in config_data.items() if not value.strip()]
        if missing_fields:
            messagebox.showerror("設定不完整", f"請填寫以下必要欄位:\n{', '.join(missing_fields)}")
            return
        
        # 保存到 .env 文件
        try:
            with open('.env', 'w', encoding='utf-8') as f:
                for key, value in config_data.items():
                    f.write(f"{key}={value}\n")
            
            messagebox.showinfo("保存成功", "配置已保存到 .env 文件")
            self.dialog.destroy()
            
        except Exception as e:
            messagebox.showerror("保存失敗", f"保存配置時發生錯誤:\n{e}")

def main():
    """主函數"""
    root = tk.Tk()
    app = YouTubeProcessorGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()