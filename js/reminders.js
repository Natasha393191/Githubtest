// 正念冥想提醒和激勵系統

// 全局變量
let reminderSettings = {};
let achievements = {};
let dailyQuote = '';
let weeklyGoal = 0;
let currentStreak = 0;
let longestStreak = 0;

// 正念名言庫
const mindfulnessQuotes = [
    {
        text: "正念不是要清空思緒，而是要以慈悲的心觀察它們。",
        author: "一行禪師"
    },
    {
        text: "每一次呼吸都是新的開始。",
        author: "禪宗智慧"
    },
    {
        text: "當下就是最好的時光，此刻就是最好的地方。",
        author: "禪宗智慧"
    },
    {
        text: "平靜不是沒有風暴，而是在風暴中找到內在的寧靜。",
        author: "禪宗智慧"
    },
    {
        text: "正念練習讓我們學會與當下同在，而不是被過去或未來牽引。",
        author: "喬·卡巴金"
    },
    {
        text: "慈悲始於對自己的溫柔。",
        author: "禪宗智慧"
    },
    {
        text: "觀察思緒如同觀察雲朵，讓它們來去自如。",
        author: "禪宗智慧"
    },
    {
        text: "每一次冥想都是對內在世界的探索之旅。",
        author: "禪宗智慧"
    },
    {
        text: "正念是覺醒的藝術，讓我們從自動駕駛模式中醒來。",
        author: "喬·卡巴金"
    },
    {
        text: "內在的平靜是我們最珍貴的財富。",
        author: "禪宗智慧"
    },
    {
        text: "呼吸是連接身心的重要橋樑。",
        author: "禪宗智慧"
    },
    {
        text: "正念練習幫助我們重新認識自己。",
        author: "禪宗智慧"
    },
    {
        text: "每一次覺察都是成長的機會。",
        author: "禪宗智慧"
    },
    {
        text: "內在的智慧比外在的知識更為珍貴。",
        author: "禪宗智慧"
    },
    {
        text: "正念讓我們學會接納當下的一切。",
        author: "禪宗智慧"
    }
];

// 成就徽章系統
const achievementBadges = {
    firstSession: {
        id: 'firstSession',
        name: '初學者',
        description: '完成第一次冥想',
        icon: '🌱',
        unlocked: false
    },
    weekStreak: {
        id: 'weekStreak',
        name: '堅持一週',
        description: '連續冥想7天',
        icon: '🔥',
        unlocked: false
    },
    monthStreak: {
        id: 'monthStreak',
        name: '月度達人',
        description: '連續冥想30天',
        icon: '🌟',
        unlocked: false
    },
    tenSessions: {
        id: 'tenSessions',
        name: '十次練習',
        description: '完成10次冥想',
        icon: '📚',
        unlocked: false
    },
    fiftySessions: {
        id: 'fiftySessions',
        name: '半百成就',
        description: '完成50次冥想',
        icon: '🎯',
        unlocked: false
    },
    hundredSessions: {
        id: 'hundredSessions',
        name: '百次大師',
        description: '完成100次冥想',
        icon: '🏆',
        unlocked: false
    },
    fiveHours: {
        id: 'fiveHours',
        name: '五小時專注',
        description: '累計冥想5小時',
        icon: '⏰',
        unlocked: false
    },
    tenHours: {
        id: 'tenHours',
        name: '十小時專注',
        description: '累計冥想10小時',
        icon: '⌛',
        unlocked: false
    },
    twentyHours: {
        id: 'twentyHours',
        name: '二十小時專注',
        description: '累計冥想20小時',
        icon: '💎',
        unlocked: false
    },
    earlyBird: {
        id: 'earlyBird',
        name: '晨鳥',
        description: '連續7天在早晨冥想',
        icon: '🌅',
        unlocked: false
    },
    nightOwl: {
        id: 'nightOwl',
        name: '夜貓子',
        description: '連續7天在晚上冥想',
        icon: '🌙',
        unlocked: false
    },
    varietySeeker: {
        id: 'varietySeeker',
        name: '探索者',
        description: '嘗試5種不同的冥想類型',
        icon: '🔍',
        unlocked: false
    },
    consistencyKing: {
        id: 'consistencyKing',
        name: '一致性之王',
        description: '連續100天冥想',
        icon: '👑',
        unlocked: false
    }
};

// 當DOM載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    initReminderSystem();
});

// 初始化提醒系統
function initReminderSystem() {
    // 載入設置和數據
    loadReminderSettings();
    loadAchievements();
    loadWeeklyGoal();
    
    // 初始化各個功能
    initNotificationPermission();
    initDailyQuote();
    updateStreakInfo();
    checkAchievements(); // 檢查並更新成就
    updateTodayWidget();
    checkAndShowReminders();
    
    // 設定定時檢查
    setInterval(checkAndShowReminders, 60000); // 每分鐘檢查一次
    setInterval(updateTodayWidget, 300000); // 每5分鐘更新一次今日小部件
}

// 載入提醒設置
function loadReminderSettings() {
    try {
        const settings = localStorage.getItem('reminderSettings');
        reminderSettings = settings ? JSON.parse(settings) : {
            enabled: false,
            time: '08:00',
            days: [1, 2, 3, 4, 5, 6, 0], // 週一到週日
            message: '該是時候進行正念冥想了，給自己一些寧靜的時光。',
            notificationEnabled: false
        };
    } catch (error) {
        console.error('載入提醒設置失敗:', error);
        reminderSettings = {
            enabled: false,
            time: '08:00',
            days: [1, 2, 3, 4, 5, 6, 0],
            message: '該是時候進行正念冥想了，給自己一些寧靜的時光。',
            notificationEnabled: false
        };
    }
}

// 保存提醒設置到localStorage
function saveReminderSettingsToStorage() {
    try {
        localStorage.setItem('reminderSettings', JSON.stringify(reminderSettings));
        console.log('提醒設置已保存');
    } catch (error) {
        console.error('保存提醒設置失敗:', error);
    }
}

// 載入成就數據
function loadAchievements() {
    try {
        const saved = localStorage.getItem('achievementBadges');
        achievements = saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error('載入成就數據失敗:', error);
        achievements = {};
    }
}

// 保存成就數據
function saveAchievements() {
    try {
        localStorage.setItem('achievementBadges', JSON.stringify(achievements));
    } catch (error) {
        console.error('保存成就數據失敗:', error);
    }
}

// 載入每週目標
function loadWeeklyGoal() {
    try {
        const goal = localStorage.getItem('weeklyGoal');
        weeklyGoal = goal ? parseInt(goal) : 5; // 預設5小時
    } catch (error) {
        console.error('載入每週目標失敗:', error);
        weeklyGoal = 5;
    }
}

// 保存每週目標
function saveWeeklyGoal() {
    try {
        localStorage.setItem('weeklyGoal', weeklyGoal.toString());
    } catch (error) {
        console.error('保存每週目標失敗:', error);
    }
}

// 初始化通知權限
function initNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('此瀏覽器不支持通知功能');
        return;
    }
    
    // 檢查是否已經有權限
    if (Notification.permission === 'granted') {
        reminderSettings.notificationEnabled = true;
        saveReminderSettingsToStorage();
    } else if (Notification.permission === 'denied') {
        reminderSettings.notificationEnabled = false;
        saveReminderSettingsToStorage();
    }
}

// 請求通知權限
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showMessage('您的瀏覽器不支持通知功能', 'warning');
        return;
    }
    
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            reminderSettings.notificationEnabled = true;
            saveReminderSettingsToStorage();
            showMessage('通知權限已啟用！您將收到冥想提醒。', 'success');
        } else {
            reminderSettings.notificationEnabled = false;
            saveReminderSettingsToStorage();
            showMessage('通知權限被拒絕，您將不會收到提醒。', 'info');
        }
    });
}

// 初始化每日名言
function initDailyQuote() {
    const today = new Date().toDateString();
    const savedQuote = localStorage.getItem('dailyQuote');
    
    if (savedQuote) {
        const quoteData = JSON.parse(savedQuote);
        if (quoteData.date === today) {
            dailyQuote = quoteData.quote;
            return;
        }
    }
    
    // 選擇新的名言
    const randomIndex = Math.floor(Math.random() * mindfulnessQuotes.length);
    dailyQuote = mindfulnessQuotes[randomIndex];
    
    // 保存今日名言
    localStorage.setItem('dailyQuote', JSON.stringify({
        date: today,
        quote: dailyQuote
    }));
}

// 更新連續天數信息
function updateStreakInfo() {
    try {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const streakInfo = calculateStreak(entries);
        currentStreak = streakInfo.current;
        longestStreak = streakInfo.longest;
    } catch (error) {
        console.error('更新連續天數失敗:', error);
        currentStreak = 0;
        longestStreak = 0;
    }
}

// 計算連續天數
function calculateStreak(entries) {
    if (entries.length === 0) return { current: 0, longest: 0 };
    
    const dates = entries.map(entry => {
        const date = new Date(entry.createdAt);
        return date.toDateString();
    });
    
    const uniqueDates = [...new Set(dates)].sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const nextDate = i < uniqueDates.length - 1 ? new Date(uniqueDates[i + 1]) : null;
        
        if (nextDate) {
            const diffDays = (currentDate - nextDate) / (1000 * 60 * 60 * 24);
            if (diffDays === 1) {
                tempStreak++;
            } else {
                if (tempStreak > longestStreak) longestStreak = tempStreak;
                tempStreak = 0;
            }
        } else {
            tempStreak++;
        }
        
        if (i === 0) currentStreak = tempStreak;
    }
    
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    
    return { current: currentStreak, longest: longestStreak };
}

// 檢查並顯示提醒
function checkAndShowReminders() {
    if (!reminderSettings.enabled) return;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const reminderTime = parseInt(reminderSettings.time.split(':')[0]) * 60 + 
                        parseInt(reminderSettings.time.split(':')[1]);
    
    // 檢查是否在提醒時間（允許5分鐘的誤差）
    if (Math.abs(currentTime - reminderTime) <= 5) {
        const today = now.getDay();
        
        // 檢查是否在設定的日期
        if (reminderSettings.days.includes(today)) {
            // 檢查今天是否已經冥想過
            if (!hasMeditatedToday()) {
                showMeditationReminder();
            }
        }
    }
}

// 檢查今天是否已經冥想
function hasMeditatedToday() {
    try {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const today = new Date().toDateString();
        
        return entries.some(entry => {
            const entryDate = new Date(entry.createdAt).toDateString();
            return entryDate === today;
        });
    } catch (error) {
        console.error('檢查今日冥想狀態失敗:', error);
        return false;
    }
}

// 顯示冥想提醒
function showMeditationReminder() {
    // 顯示瀏覽器通知
    if (reminderSettings.notificationEnabled && Notification.permission === 'granted') {
        const notification = new Notification('正念冥想提醒', {
            body: reminderSettings.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'meditation-reminder',
            requireInteraction: false,
            silent: false
        });
        
        notification.onclick = function() {
            window.focus();
            window.location.href = 'journal.html';
            notification.close();
        };
        
        // 5秒後自動關閉
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
    
    // 顯示頁面內提醒
    showInPageReminder();
}

// 顯示頁面內提醒
function showInPageReminder() {
    // 檢查是否已經顯示過提醒
    const lastReminder = localStorage.getItem('lastReminderDate');
    const today = new Date().toDateString();
    
    if (lastReminder === today) return;
    
    const reminderDiv = document.createElement('div');
    reminderDiv.className = 'meditation-reminder';
    reminderDiv.innerHTML = `
        <div class="reminder-content">
            <div class="reminder-icon">🧘</div>
            <div class="reminder-text">
                <h4>正念冥想提醒</h4>
                <p>${reminderSettings.message}</p>
            </div>
            <div class="reminder-actions">
                <button class="btn btn-primary btn-small" onclick="startMeditation()">
                    <span class="btn-icon">🎯</span>
                    <span class="btn-text">開始冥想</span>
                </button>
                <button class="btn btn-secondary btn-small" onclick="dismissReminder()">
                    <span class="btn-icon">⏰</span>
                    <span class="btn-text">稍後提醒</span>
                </button>
            </div>
        </div>
    `;
    
    reminderDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-background);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        border-left: 4px solid var(--primary-color);
    `;
    
    document.body.appendChild(reminderDiv);
    
    // 記錄今日已顯示提醒
    localStorage.setItem('lastReminderDate', today);
    
    // 30秒後自動消失
    setTimeout(() => {
        if (reminderDiv.parentNode) {
            reminderDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (reminderDiv.parentNode) {
                    reminderDiv.remove();
                }
            }, 300);
        }
    }, 30000);
}

// 開始冥想
function startMeditation() {
    window.location.href = 'journal.html';
}

// 關閉提醒
function dismissReminder() {
    const reminder = document.querySelector('.meditation-reminder');
    if (reminder) {
        reminder.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (reminder.parentNode) {
                reminder.remove();
            }
        }, 300);
    }
}

// 更新今日小部件
function updateTodayWidget() {
    const todayWidget = document.getElementById('todayWidget');
    if (!todayWidget) return;
    
    updateStreakInfo();
    const weeklyProgress = calculateWeeklyProgress();
    
    todayWidget.innerHTML = `
        <div class="today-header">
            <h3>今日提醒</h3>
            <span class="today-date">${new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}</span>
        </div>
        
        <div class="today-content">
            <div class="quote-section">
                <div class="quote-icon">💭</div>
                <div class="quote-text">
                    <p>"${dailyQuote.text}"</p>
                    <span class="quote-author">— ${dailyQuote.author}</span>
                </div>
            </div>
            
            <div class="streak-section">
                <div class="streak-info">
                    <div class="streak-current">
                        <span class="streak-number">${currentStreak}</span>
                        <span class="streak-label">連續天數</span>
                    </div>
                    <div class="streak-longest">
                        <span class="streak-number">${longestStreak}</span>
                        <span class="streak-label">最長記錄</span>
                    </div>
                </div>
                ${currentStreak > 0 ? `<div class="streak-encouragement">🔥 太棒了！您已經連續冥想 ${currentStreak} 天！</div>` : ''}
            </div>
            
            <div class="goal-section">
                <div class="goal-header">
                    <span class="goal-icon">🎯</span>
                    <span class="goal-title">本週目標</span>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(weeklyProgress.percentage, 100)}%"></div>
                    </div>
                    <div class="progress-text">
                        ${weeklyProgress.current} / ${weeklyGoal} 小時 (${weeklyProgress.percentage.toFixed(0)}%)
                    </div>
                </div>
                ${weeklyProgress.percentage >= 100 ? '<div class="goal-complete">🎉 恭喜完成本週目標！</div>' : ''}
            </div>
            
            <div class="achievement-section">
                <div class="achievement-header">
                    <span class="achievement-icon">🏆</span>
                    <span class="achievement-title">最近成就</span>
                </div>
                <div class="recent-achievements">
                    ${getRecentAchievements()}
                </div>
            </div>
            
            <div class="today-actions">
                <button class="btn btn-primary" onclick="startMeditation()">
                    <span class="btn-icon">🧘</span>
                    <span class="btn-text">開始今日冥想</span>
                </button>
                <button class="btn btn-secondary" onclick="showReminderSettings()">
                    <span class="btn-icon">⚙️</span>
                    <span class="btn-text">提醒設置</span>
                </button>
            </div>
        </div>
    `;
}

// 計算本週進度
function calculateWeeklyProgress() {
    try {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const weeklyEntries = entries.filter(entry => {
            const entryDate = new Date(entry.createdAt);
            return entryDate >= startOfWeek;
        });
        
        const currentHours = weeklyEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
        const percentage = (currentHours / weeklyGoal) * 100;
        
        return {
            current: currentHours.toFixed(1),
            percentage: percentage
        };
    } catch (error) {
        console.error('計算本週進度失敗:', error);
        return { current: '0.0', percentage: 0 };
    }
}

// 獲取最近成就
function getRecentAchievements() {
    const unlockedAchievements = Object.entries(achievements).filter(([key, unlocked]) => unlocked);
    const recent = unlockedAchievements.slice(-3); // 最近3個成就
    
    if (recent.length === 0) {
        return '<div class="no-achievements">還沒有成就，開始冥想來獲得第一個徽章吧！</div>';
    }
    
    return recent.map(([key, unlocked]) => {
        const badge = achievementBadges[key];
        if (!badge) return '';
        
        return `
            <div class="achievement-item">
                <span class="achievement-icon">${badge.icon}</span>
                <div class="achievement-info">
                    <span class="achievement-name">${badge.name}</span>
                    <span class="achievement-desc">${badge.description}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 檢查成就
function checkAchievements() {
    try {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const totalSessions = entries.length;
        const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        const totalHours = totalMinutes / 60;
        
        // 更新連續天數信息
        updateStreakInfo();
        
        // 檢查各種成就
        const newAchievements = [];
        
        // 第一次冥想
        if (totalSessions >= 1 && !achievements.firstSession) {
            achievements.firstSession = true;
            newAchievements.push(achievementBadges.firstSession);
        }
        
        // 十次練習
        if (totalSessions >= 10 && !achievements.tenSessions) {
            achievements.tenSessions = true;
            newAchievements.push(achievementBadges.tenSessions);
        }
        
        // 五十次練習
        if (totalSessions >= 50 && !achievements.fiftySessions) {
            achievements.fiftySessions = true;
            newAchievements.push(achievementBadges.fiftySessions);
        }
        
        // 一百次練習
        if (totalSessions >= 100 && !achievements.hundredSessions) {
            achievements.hundredSessions = true;
            newAchievements.push(achievementBadges.hundredSessions);
        }
        
        // 五小時專注
        if (totalHours >= 5 && !achievements.fiveHours) {
            achievements.fiveHours = true;
            newAchievements.push(achievementBadges.fiveHours);
        }
        
        // 十小時專注
        if (totalHours >= 10 && !achievements.tenHours) {
            achievements.tenHours = true;
            newAchievements.push(achievementBadges.tenHours);
        }
        
        // 二十小時專注
        if (totalHours >= 20 && !achievements.twentyHours) {
            achievements.twentyHours = true;
            newAchievements.push(achievementBadges.twentyHours);
        }
        
        // 連續天數成就
        if (currentStreak >= 7 && !achievements.weekStreak) {
            achievements.weekStreak = true;
            newAchievements.push(achievementBadges.weekStreak);
        }
        
        if (currentStreak >= 30 && !achievements.monthStreak) {
            achievements.monthStreak = true;
            newAchievements.push(achievementBadges.monthStreak);
        }
        
        if (currentStreak >= 100 && !achievements.consistencyKing) {
            achievements.consistencyKing = true;
            newAchievements.push(achievementBadges.consistencyKing);
        }
        
        // 保存成就
        if (newAchievements.length > 0) {
            saveAchievements();
            showAchievementNotification(newAchievements);
        }
        
    } catch (error) {
        console.error('檢查成就失敗:', error);
    }
}

// 顯示成就通知
function showAchievementNotification(achievements) {
    achievements.forEach((achievement, index) => {
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.innerHTML = `
                <div class="achievement-content">
                    <div class="achievement-icon-large">${achievement.icon}</div>
                    <div class="achievement-text">
                        <h4>🎉 獲得成就！</h4>
                        <p class="achievement-name">${achievement.name}</p>
                        <p class="achievement-desc">${achievement.description}</p>
                    </div>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                border-radius: var(--border-radius-lg);
                padding: var(--spacing-md);
                box-shadow: var(--shadow-lg);
                z-index: 10001;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            `;
            
            document.body.appendChild(notification);
            
            // 5秒後自動消失
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, 5000);
        }, index * 1000); // 每個成就間隔1秒顯示
    });
}

// 顯示提醒設置
function showReminderSettings() {
    const settingsModal = document.createElement('div');
    settingsModal.className = 'settings-modal';
    settingsModal.innerHTML = `
        <div class="settings-overlay">
            <div class="settings-content">
                <div class="settings-header">
                    <h3>冥想提醒設置</h3>
                    <button class="close-btn" onclick="closeReminderSettings()">×</button>
                </div>
                
                <div class="settings-body">
                    <div class="setting-group">
                        <label class="setting-label">
                            <input type="checkbox" id="reminderEnabled" ${reminderSettings.enabled ? 'checked' : ''}>
                            <span class="setting-text">啟用每日提醒</span>
                        </label>
                    </div>
                    
                    <div class="setting-group">
                        <label for="reminderTime">提醒時間：</label>
                        <input type="time" id="reminderTime" value="${reminderSettings.time}">
                    </div>
                    
                    <div class="setting-group">
                        <label>提醒日期：</label>
                        <div class="day-selector">
                            <label><input type="checkbox" value="1" ${reminderSettings.days.includes(1) ? 'checked' : ''}> 週一</label>
                            <label><input type="checkbox" value="2" ${reminderSettings.days.includes(2) ? 'checked' : ''}> 週二</label>
                            <label><input type="checkbox" value="3" ${reminderSettings.days.includes(3) ? 'checked' : ''}> 週三</label>
                            <label><input type="checkbox" value="4" ${reminderSettings.days.includes(4) ? 'checked' : ''}> 週四</label>
                            <label><input type="checkbox" value="5" ${reminderSettings.days.includes(5) ? 'checked' : ''}> 週五</label>
                            <label><input type="checkbox" value="6" ${reminderSettings.days.includes(6) ? 'checked' : ''}> 週六</label>
                            <label><input type="checkbox" value="0" ${reminderSettings.days.includes(0) ? 'checked' : ''}> 週日</label>
                        </div>
                    </div>
                    
                    <div class="setting-group">
                        <label for="reminderMessage">提醒訊息：</label>
                        <textarea id="reminderMessage" rows="3">${reminderSettings.message}</textarea>
                    </div>
                    
                    <div class="setting-group">
                        <label class="setting-label">
                            <input type="checkbox" id="notificationEnabled" ${reminderSettings.notificationEnabled ? 'checked' : ''}>
                            <span class="setting-text">啟用瀏覽器通知</span>
                        </label>
                        ${reminderSettings.notificationEnabled ? '' : '<button class="btn btn-small" onclick="requestNotificationPermission()">請求通知權限</button>'}
                    </div>
                    
                    <div class="setting-group">
                        <label for="weeklyGoal">每週目標時數：</label>
                        <input type="number" id="weeklyGoal" value="${weeklyGoal}" min="1" max="50" step="0.5">
                    </div>
                </div>
                
                <div class="settings-footer">
                    <button class="btn btn-primary" onclick="saveReminderSettings()">保存設置</button>
                    <button class="btn btn-secondary" onclick="closeReminderSettings()">取消</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(settingsModal);
}

// 保存提醒設置
function saveReminderSettings() {
    const enabled = document.getElementById('reminderEnabled').checked;
    const time = document.getElementById('reminderTime').value;
    const message = document.getElementById('reminderMessage').value;
    const notificationEnabled = document.getElementById('notificationEnabled').checked;
    const newWeeklyGoal = parseFloat(document.getElementById('weeklyGoal').value);
    
    // 收集選中的日期
    const days = [];
    document.querySelectorAll('.day-selector input:checked').forEach(checkbox => {
        days.push(parseInt(checkbox.value));
    });
    
    reminderSettings = {
        enabled: enabled,
        time: time,
        days: days,
        message: message,
        notificationEnabled: notificationEnabled
    };
    
    weeklyGoal = newWeeklyGoal;
    
    saveReminderSettingsToStorage();
    saveWeeklyGoal();
    
    closeReminderSettings();
    showMessage('提醒設置已保存！', 'success');
}

// 關閉提醒設置
function closeReminderSettings() {
    const modal = document.querySelector('.settings-modal');
    if (modal) {
        modal.remove();
    }
}

// 顯示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 4000);
}