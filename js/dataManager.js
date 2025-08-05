// 正念冥想數據管理系統

// 數據結構版本
const DATA_VERSION = '1.0';

// 成就徽章定義
const achievementBadges = {
    'first_meditation': {
        name: '初學者',
        description: '完成第一次冥想',
        icon: '🌱'
    },
    'week_streak': {
        name: '堅持一週',
        description: '連續冥想7天',
        icon: '🔥'
    },
    'month_streak': {
        name: '月度大師',
        description: '連續冥想30天',
        icon: '🌟'
    },
    'hundred_hours': {
        name: '百小時成就',
        description: '累計冥想100小時',
        icon: '💎'
    },
    'early_bird': {
        name: '晨鳥',
        description: '連續7天在早上6-8點冥想',
        icon: '🌅'
    },
    'night_owl': {
        name: '夜貓子',
        description: '連續7天在晚上9-11點冥想',
        icon: '🌙'
    },
    'mood_improver': {
        name: '情緒調節師',
        description: '連續10次冥想後情緒改善3分以上',
        icon: '😌'
    },
    'variety_seeker': {
        name: '多樣化探索者',
        description: '嘗試過所有冥想類型',
        icon: '🎯'
    }
};

// 當DOM載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('settings.html')) {
        initDataManager();
    }
});

// 初始化數據管理器
function initDataManager() {
    // 綁定事件監聽器
    bindDataManagerEvents();
    
    // 更新數據統計
    updateDataStatistics();
    
    // 載入提醒設定
    loadReminderSettings();
}

// 綁定數據管理事件
function bindDataManagerEvents() {
    // 匯出按鈕
    const exportJsonBtn = document.getElementById('exportJson');
    const exportCsvBtn = document.getElementById('exportCsv');
    const importBtn = document.getElementById('importData');
    const clearDataBtn = document.getElementById('clearData');
    
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', exportDataAsJson);
    }
    
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportDataAsCsv);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', importData);
    }
    
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', showClearDataConfirmation);
    }
    
    // 提醒設定按鈕
    const saveReminderBtn = document.getElementById('saveReminderSettings');
    if (saveReminderBtn) {
        saveReminderBtn.addEventListener('click', saveReminderSettings);
    }
    
    // 通知權限按鈕
    const requestNotificationBtn = document.getElementById('requestNotification');
    if (requestNotificationBtn) {
        requestNotificationBtn.addEventListener('click', requestNotificationPermission);
    }
}

// 更新數據統計
function updateDataStatistics() {
    try {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const achievements = JSON.parse(localStorage.getItem('achievementBadges') || '{}');
        const settings = JSON.parse(localStorage.getItem('reminderSettings') || '{}');
        
        const totalEntries = entries.length;
        const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(1);
        const unlockedAchievements = Object.values(achievements).filter(unlocked => unlocked).length;
        const totalAchievements = Object.keys(achievementBadges).length;
        
        // 更新統計顯示
        const statsElements = {
            'totalEntries': totalEntries,
            'totalHours': totalHours,
            'unlockedAchievements': unlockedAchievements,
            'totalAchievements': totalAchievements,
            'dataSize': calculateDataSize()
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // 更新最後備份時間
        const lastBackup = localStorage.getItem('lastBackupDate');
        const lastBackupElement = document.getElementById('lastBackup');
        if (lastBackupElement) {
            lastBackupElement.textContent = lastBackup ? 
                new Date(lastBackup).toLocaleString('zh-TW') : '從未備份';
        }
        
    } catch (error) {
        console.error('更新數據統計失敗:', error);
        showMessage('更新數據統計失敗', 'error');
    }
}

// 計算數據大小
function calculateDataSize() {
    try {
        const data = {
            journalEntries: localStorage.getItem('journalEntries') || '[]',
            achievementBadges: localStorage.getItem('achievementBadges') || '{}',
            reminderSettings: localStorage.getItem('reminderSettings') || '{}',
            weeklyGoal: localStorage.getItem('weeklyGoal') || '5',
            journalDraft: localStorage.getItem('journalDraft') || '',
            dailyQuote: localStorage.getItem('dailyQuote') || '',
            lastReminderDate: localStorage.getItem('lastReminderDate') || '',
            lastBackupDate: localStorage.getItem('lastBackupDate') || ''
        };
        
        const totalSize = Object.values(data).reduce((sum, value) => sum + value.length, 0);
        return formatBytes(totalSize);
    } catch (error) {
        console.error('計算數據大小失敗:', error);
        return '0 B';
    }
}

// 格式化字節大小
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 匯出數據為JSON格式
function exportDataAsJson() {
    try {
        // 收集所有數據
        const exportData = {
            version: DATA_VERSION,
            exportDate: new Date().toISOString(),
            data: {
                journalEntries: JSON.parse(localStorage.getItem('journalEntries') || '[]'),
                achievementBadges: JSON.parse(localStorage.getItem('achievementBadges') || '{}'),
                reminderSettings: JSON.parse(localStorage.getItem('reminderSettings') || '{}'),
                weeklyGoal: localStorage.getItem('weeklyGoal') || '5',
                journalDraft: localStorage.getItem('journalDraft') || '',
                dailyQuote: localStorage.getItem('dailyQuote') || '',
                lastReminderDate: localStorage.getItem('lastReminderDate') || '',
                lastBackupDate: localStorage.getItem('lastBackupDate') || ''
            }
        };
        
        // 創建並下載文件
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `正念冥想備份_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL
        URL.revokeObjectURL(url);
        
        // 更新最後備份時間
        localStorage.setItem('lastBackupDate', new Date().toISOString());
        updateDataStatistics();
        
        showMessage('數據已成功匯出為JSON格式！', 'success');
        
    } catch (error) {
        console.error('匯出JSON失敗:', error);
        showMessage('匯出失敗，請稍後再試', 'error');
    }
}

// 匯出數據為CSV格式
function exportDataAsCsv() {
    try {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        
        if (entries.length === 0) {
            showMessage('沒有數據可以匯出', 'warning');
            return;
        }
        
        // CSV標題行
        const headers = [
            '日期',
            '時間',
            '冥想時長(分鐘)',
            '冥想類型',
            '冥想前情緒',
            '冥想後情緒',
            '思緒類型',
            '身體感受',
            '覺察筆記',
            '正念提醒',
            '創建時間'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        // 添加數據行
        entries.forEach(entry => {
            const row = [
                formatDate(entry.createdAt),
                entry.time || '',
                entry.duration || 0,
                (entry.meditationTypes || []).join(';'),
                entry.beforeMood || '',
                entry.afterMood || '',
                (entry.thoughtTypes || []).join(';'),
                escapeCsvField(entry['physical-sensations'] || ''),
                escapeCsvField(entry['awareness-notes'] || ''),
                escapeCsvField(entry['mindfulness-reminder'] || ''),
                formatDateTime(entry.createdAt)
            ];
            
            csvContent += row.join(',') + '\n';
        });
        
        // 創建並下載文件
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `正念冥想記錄_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL
        URL.revokeObjectURL(url);
        
        showMessage('數據已成功匯出為CSV格式！', 'success');
        
    } catch (error) {
        console.error('匯出CSV失敗:', error);
        showMessage('匯出失敗，請稍後再試', 'error');
    }
}

// 轉義CSV字段
function escapeCsvField(field) {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
}

// 格式化日期
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-TW');
}

// 格式化日期時間
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('zh-TW');
}

// 匯入數據
function importData() {
    // 創建文件輸入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // 驗證數據格式
                if (!validateImportData(importData)) {
                    showMessage('數據格式不正確，請選擇有效的備份文件', 'error');
                    return;
                }
                
                // 顯示確認對話框
                showImportConfirmation(importData);
                
            } catch (error) {
                console.error('解析JSON文件失敗:', error);
                showMessage('文件格式錯誤，請選擇有效的JSON文件', 'error');
            }
        };
        
        reader.readAsText(file);
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

// 驗證匯入數據
function validateImportData(data) {
    try {
        // 檢查基本結構
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        if (!data.version || !data.exportDate || !data.data) {
            return false;
        }
        
        // 檢查必要字段
        const requiredFields = ['journalEntries', 'achievementBadges', 'reminderSettings'];
        for (const field of requiredFields) {
            if (!(field in data.data)) {
                return false;
            }
        }
        
        // 檢查數據類型
        if (!Array.isArray(data.data.journalEntries)) {
            return false;
        }
        
        if (typeof data.data.achievementBadges !== 'object') {
            return false;
        }
        
        if (typeof data.data.reminderSettings !== 'object') {
            return false;
        }
        
        // 驗證記錄數據結構
        for (const entry of data.data.journalEntries) {
            if (!validateJournalEntry(entry)) {
                return false;
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('驗證數據失敗:', error);
        return false;
    }
}

// 驗證日誌記錄
function validateJournalEntry(entry) {
    try {
        // 檢查必要字段
        if (!entry.id || !entry.createdAt) {
            return false;
        }
        
        // 檢查日期格式
        if (isNaN(new Date(entry.createdAt).getTime())) {
            return false;
        }
        
        // 檢查數值字段
        if (entry.duration && (isNaN(entry.duration) || entry.duration < 0)) {
            return false;
        }
        
        if (entry.beforeMood && (isNaN(entry.beforeMood) || entry.beforeMood < 1 || entry.beforeMood > 10)) {
            return false;
        }
        
        if (entry.afterMood && (isNaN(entry.afterMood) || entry.afterMood < 1 || entry.afterMood > 10)) {
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('驗證記錄失敗:', error);
        return false;
    }
}

// 顯示匯入確認對話框
function showImportConfirmation(importData) {
    const entriesCount = importData.data.journalEntries.length;
    const achievementsCount = Object.keys(importData.data.achievementBadges).length;
    const exportDate = new Date(importData.exportDate).toLocaleString('zh-TW');
    
    const modal = document.createElement('div');
    modal.className = 'import-confirmation-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>確認匯入數據</h3>
                    <button class="close-btn" onclick="closeImportConfirmation()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="import-info">
                        <p><strong>備份信息：</strong></p>
                        <ul>
                            <li>備份日期：${exportDate}</li>
                            <li>冥想記錄：${entriesCount} 條</li>
                            <li>成就徽章：${achievementsCount} 個</li>
                            <li>數據版本：${importData.version}</li>
                        </ul>
                    </div>
                    
                    <div class="warning-message">
                        <p>⚠️ <strong>注意：</strong>匯入數據將覆蓋現有的所有數據，此操作無法撤銷。</p>
                        <p>建議在匯入前先備份當前數據。</p>
                    </div>
                    
                    <div class="import-options">
                        <label>
                            <input type="checkbox" id="backupBeforeImport" checked>
                            匯入前自動備份當前數據
                        </label>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="confirmImport()">確認匯入</button>
                    <button class="btn btn-secondary" onclick="closeImportConfirmation()">取消</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 保存匯入數據到全局變量
    window.pendingImportData = importData;
}

// 關閉匯入確認對話框
function closeImportConfirmation() {
    const modal = document.querySelector('.import-confirmation-modal');
    if (modal) {
        modal.remove();
    }
    window.pendingImportData = null;
}

// 確認匯入
function confirmImport() {
    if (!window.pendingImportData) {
        showMessage('匯入數據丟失，請重新選擇文件', 'error');
        return;
    }
    
    const backupBeforeImport = document.getElementById('backupBeforeImport').checked;
    
    try {
        // 如果需要，先備份當前數據
        if (backupBeforeImport) {
            const currentData = {
                version: DATA_VERSION,
                exportDate: new Date().toISOString(),
                data: {
                    journalEntries: JSON.parse(localStorage.getItem('journalEntries') || '[]'),
                    achievementBadges: JSON.parse(localStorage.getItem('achievementBadges') || '{}'),
                    reminderSettings: JSON.parse(localStorage.getItem('reminderSettings') || '{}'),
                    weeklyGoal: localStorage.getItem('weeklyGoal') || '5',
                    journalDraft: localStorage.getItem('journalDraft') || '',
                    dailyQuote: localStorage.getItem('dailyQuote') || '',
                    lastReminderDate: localStorage.getItem('lastReminderDate') || '',
                    lastBackupDate: localStorage.getItem('lastBackupDate') || ''
                }
            };
            
            // 自動保存備份
            const backupStr = JSON.stringify(currentData, null, 2);
            const backupBlob = new Blob([backupStr], { type: 'application/json' });
            const backupUrl = URL.createObjectURL(backupBlob);
            
            const backupLink = document.createElement('a');
            backupLink.href = backupUrl;
            backupLink.download = `自動備份_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
            document.body.appendChild(backupLink);
            backupLink.click();
            document.body.removeChild(backupLink);
            
            URL.revokeObjectURL(backupUrl);
        }
        
        // 執行匯入
        const importData = window.pendingImportData;
        
        // 清除現有數據
        clearAllData();
        
        // 匯入新數據
        localStorage.setItem('journalEntries', JSON.stringify(importData.data.journalEntries));
        localStorage.setItem('achievementBadges', JSON.stringify(importData.data.achievementBadges));
        localStorage.setItem('reminderSettings', JSON.stringify(importData.data.reminderSettings));
        localStorage.setItem('weeklyGoal', importData.data.weeklyGoal || '5');
        localStorage.setItem('journalDraft', importData.data.journalDraft || '');
        localStorage.setItem('dailyQuote', importData.data.dailyQuote || '');
        localStorage.setItem('lastReminderDate', importData.data.lastReminderDate || '');
        localStorage.setItem('lastBackupDate', importData.data.lastBackupDate || '');
        
        // 更新最後備份時間
        localStorage.setItem('lastBackupDate', new Date().toISOString());
        
        // 關閉對話框
        closeImportConfirmation();
        
        // 更新統計
        updateDataStatistics();
        
        showMessage('數據匯入成功！', 'success');
        
        // 重新載入頁面以更新所有功能
        setTimeout(() => {
            if (confirm('數據匯入完成，建議重新載入頁面以確保所有功能正常運作。是否現在重新載入？')) {
                window.location.reload();
            }
        }, 1000);
        
    } catch (error) {
        console.error('匯入數據失敗:', error);
        showMessage('匯入失敗，請稍後再試', 'error');
        closeImportConfirmation();
    }
}

// 顯示清除數據確認
function showClearDataConfirmation() {
    const modal = document.createElement('div');
    modal.className = 'clear-data-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ 清除所有數據</h3>
                    <button class="close-btn" onclick="closeClearDataConfirmation()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="warning-message">
                        <p><strong>此操作將永久刪除：</strong></p>
                        <ul>
                            <li>所有冥想記錄</li>
                            <li>所有成就徽章</li>
                            <li>提醒設置</li>
                            <li>草稿數據</li>
                            <li>其他所有個人數據</li>
                        </ul>
                        <p><strong>此操作無法撤銷！</strong></p>
                    </div>
                    
                    <div class="clear-options">
                        <label>
                            <input type="checkbox" id="backupBeforeClear" checked>
                            清除前自動備份數據
                        </label>
                    </div>
                    
                    <div class="confirmation-input">
                        <label for="confirmText">請輸入「DELETE」以確認：</label>
                        <input type="text" id="confirmText" placeholder="輸入 DELETE">
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-danger" id="confirmClearBtn" disabled onclick="confirmClearData()">確認清除</button>
                    <button class="btn btn-secondary" onclick="closeClearDataConfirmation()">取消</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 綁定確認輸入事件
    const confirmInput = document.getElementById('confirmText');
    const confirmBtn = document.getElementById('confirmClearBtn');
    
    if (confirmInput && confirmBtn) {
        confirmInput.addEventListener('input', function() {
            confirmBtn.disabled = this.value !== 'DELETE';
        });
    }
}

// 關閉清除數據確認
function closeClearDataConfirmation() {
    const modal = document.querySelector('.clear-data-modal');
    if (modal) {
        modal.remove();
    }
}

// 確認清除數據
function confirmClearData() {
    const backupBeforeClear = document.getElementById('backupBeforeClear').checked;
    
    try {
        // 如果需要，先備份數據
        if (backupBeforeClear) {
            exportDataAsJson();
        }
        
        // 清除所有數據
        clearAllData();
        
        // 關閉對話框
        closeClearDataConfirmation();
        
        // 更新統計
        updateDataStatistics();
        
        showMessage('所有數據已清除！', 'success');
        
        // 重新載入頁面
        setTimeout(() => {
            if (confirm('數據已清除，建議重新載入頁面。是否現在重新載入？')) {
                window.location.reload();
            }
        }, 1000);
        
    } catch (error) {
        console.error('清除數據失敗:', error);
        showMessage('清除失敗，請稍後再試', 'error');
    }
}

// 清除所有數據
function clearAllData() {
    const keysToRemove = [
        'journalEntries',
        'achievementBadges',
        'reminderSettings',
        'weeklyGoal',
        'journalDraft',
        'dailyQuote',
        'lastReminderDate',
        'lastBackupDate'
    ];
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
}

// 載入提醒設定
function loadReminderSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('reminderSettings') || '{}');
        const weeklyGoal = localStorage.getItem('weeklyGoal') || '5';
        
        // 設定預設值
        const defaultSettings = {
            enabled: false,
            time: '08:00',
            days: [1, 2, 3, 4, 5, 6, 0], // 週一到週日
            message: '該是時候進行正念冥想了，給自己一些寧靜的時光。',
            notificationEnabled: false
        };
        
        const reminderSettings = { ...defaultSettings, ...settings };
        
        // 更新表單
        document.getElementById('reminderEnabled').checked = reminderSettings.enabled;
        document.getElementById('reminderTime').value = reminderSettings.time;
        document.getElementById('reminderMessage').value = reminderSettings.message;
        document.getElementById('notificationEnabled').checked = reminderSettings.notificationEnabled;
        document.getElementById('weeklyGoal').value = weeklyGoal;
        
        // 更新日期選擇器
        const dayCheckboxes = document.querySelectorAll('.day-selector input[type="checkbox"]');
        dayCheckboxes.forEach(checkbox => {
            checkbox.checked = reminderSettings.days.includes(parseInt(checkbox.value));
        });
        
        // 更新通知權限按鈕顯示
        updateNotificationButton();
        
    } catch (error) {
        console.error('載入提醒設定失敗:', error);
        showMessage('載入提醒設定失敗', 'error');
    }
}

// 保存提醒設定
function saveReminderSettings() {
    try {
        const enabled = document.getElementById('reminderEnabled').checked;
        const time = document.getElementById('reminderTime').value;
        const message = document.getElementById('reminderMessage').value;
        const notificationEnabled = document.getElementById('notificationEnabled').checked;
        const weeklyGoal = document.getElementById('weeklyGoal').value;
        
        // 收集選中的日期
        const days = [];
        document.querySelectorAll('.day-selector input:checked').forEach(checkbox => {
            days.push(parseInt(checkbox.value));
        });
        
        const reminderSettings = {
            enabled: enabled,
            time: time,
            days: days,
            message: message,
            notificationEnabled: notificationEnabled
        };
        
        // 保存到localStorage
        localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
        localStorage.setItem('weeklyGoal', weeklyGoal);
        
        showMessage('提醒設定已保存！', 'success');
        
        // 更新通知權限按鈕顯示
        updateNotificationButton();
        
    } catch (error) {
        console.error('保存提醒設定失敗:', error);
        showMessage('保存提醒設定失敗', 'error');
    }
}

// 請求通知權限
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showMessage('您的瀏覽器不支持通知功能', 'warning');
        return;
    }
    
    if (Notification.permission === 'granted') {
        showMessage('通知權限已啟用！', 'success');
        updateNotificationButton();
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            showMessage('通知權限已啟用！您將收到冥想提醒。', 'success');
            document.getElementById('notificationEnabled').checked = true;
        } else {
            showMessage('通知權限被拒絕，您將不會收到提醒。', 'info');
            document.getElementById('notificationEnabled').checked = false;
        }
        updateNotificationButton();
    });
}

// 更新通知權限按鈕顯示
function updateNotificationButton() {
    const notificationEnabled = document.getElementById('notificationEnabled');
    const requestBtn = document.getElementById('requestNotification');
    
    if (notificationEnabled && requestBtn) {
        if (Notification.permission === 'granted' || notificationEnabled.checked) {
            requestBtn.style.display = 'none';
        } else {
            requestBtn.style.display = 'inline-block';
        }
    }
}

