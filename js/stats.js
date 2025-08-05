// 正念冥想統計分析 - 專用JavaScript功能

// 全局變量
let charts = {};
let currentTimeRange = 30;
let journalEntries = [];

// 當DOM載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('stats.html')) {
        initStatsPage();
    }
});

// 初始化統計頁面
function initStatsPage() {
    // 載入數據
    loadJournalData();
    
    // 初始化時間範圍選擇器
    initTimeRangeSelector();
    
    // 更新所有圖表
    updateAllCharts();
    
    // 設定自動更新（每5分鐘）
    setInterval(updateAllCharts, 300000);
}

// 載入日誌數據
function loadJournalData() {
    try {
        const entries = localStorage.getItem('journalEntries');
        journalEntries = entries ? JSON.parse(entries) : [];
        
        // 按時間排序（最新的在前）
        journalEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log(`載入了 ${journalEntries.length} 條冥想記錄`);
    } catch (error) {
        console.error('載入數據失敗:', error);
        journalEntries = [];
    }
}

// 初始化時間範圍選擇器
function initTimeRangeSelector() {
    const timeRangeSelect = document.getElementById('time-range');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            const value = this.value;
            currentTimeRange = value === 'all' ? 'all' : parseInt(value);
            updateAllCharts();
        });
    }
}

// 更新所有圖表
function updateAllCharts() {
    // 更新概覽統計
    updateOverviewStats();
    
    // 更新各個圖表
    updateMoodTrendChart();
    updateDurationPieChart();
    updateTypeBarChart();
    updateWeeklyFrequencyChart();
    updateThoughtTypeChart();
    
    // 更新洞察建議
    updateInsights();
}

// 獲取指定時間範圍內的數據
function getFilteredData() {
    if (currentTimeRange === 'all' || currentTimeRange === 0) {
        return journalEntries;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentTimeRange);
    
    return journalEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= cutoffDate;
    });
}

// 更新概覽統計
function updateOverviewStats() {
    const filteredData = getFilteredData();
    const allData = journalEntries;
    
    // 總冥想次數
    const totalSessions = filteredData.length;
    const weeklySessions = getWeeklyData().length;
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('sessionsChange').textContent = `本週 +${weeklySessions}`;
    document.getElementById('sessionsChange').className = 'stat-change positive';
    
    // 總冥想時長
    const totalMinutes = filteredData.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const weeklyMinutes = getWeeklyData().reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const weeklyHours = (weeklyMinutes / 60).toFixed(1);
    document.getElementById('totalDuration').textContent = `${totalHours} 小時`;
    document.getElementById('durationChange').textContent = `本週 +${weeklyHours} 小時`;
    document.getElementById('durationChange').className = 'stat-change positive';
    
    // 連續冥想天數
    const streakInfo = calculateStreak(allData);
    document.getElementById('streakDays').textContent = `${streakInfo.current} 天`;
    document.getElementById('streakChange').textContent = `最長 ${streakInfo.longest} 天`;
    
    // 平均情緒改善
    const moodImprovement = calculateAverageMoodImprovement(filteredData);
    const prevImprovement = calculateAverageMoodImprovement(getPreviousPeriodData());
    const improvementChange = (moodImprovement - prevImprovement).toFixed(1);
    document.getElementById('avgMoodImprovement').textContent = moodImprovement.toFixed(1);
    document.getElementById('moodChange').textContent = `較上期 ${improvementChange > 0 ? '+' : ''}${improvementChange}`;
    document.getElementById('moodChange').className = `stat-change ${improvementChange > 0 ? 'positive' : improvementChange < 0 ? 'negative' : 'neutral'}`;
    
    // 本月冥想時數
    const monthlyHours = calculateMonthlyHours();
    const monthlyTarget = 20;
    const monthlyProgress = ((monthlyHours / monthlyTarget) * 100).toFixed(0);
    document.getElementById('monthlyHours').textContent = `${monthlyHours.toFixed(1)} 小時`;
    document.getElementById('monthlyChange').textContent = `目標 ${monthlyTarget} 小時 (${monthlyProgress}%)`;
    
    // 最常用冥想類型
    const favoriteType = findMostUsedMeditationType(filteredData);
    const typeCount = countMeditationType(favoriteType, filteredData);
    document.getElementById('favoriteType').textContent = getMeditationTypeName(favoriteType);
    document.getElementById('typeChange').textContent = `使用 ${typeCount} 次`;
}

// 更新情緒變化趨勢圖
function updateMoodTrendChart() {
    const filteredData = getFilteredData();
    const recentData = filteredData.slice(0, 30); // 最近30天
    
    // 準備數據
    const labels = [];
    const beforeMood = [];
    const afterMood = [];
    const improvements = [];
    
    recentData.forEach(entry => {
        const date = new Date(entry.createdAt);
        labels.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));
        beforeMood.push(entry.beforeMood || 5);
        afterMood.push(entry.afterMood || 5);
        improvements.push((entry.afterMood || 5) - (entry.beforeMood || 5));
    });
    
    // 更新洞察
    const avgImprovement = improvements.length > 0 ? improvements.reduce((sum, val) => sum + val, 0) / improvements.length : 0;
    const bestDayIndex = improvements.length > 0 ? improvements.indexOf(Math.max(...improvements)) : -1;
    const bestDay = bestDayIndex >= 0 ? labels[bestDayIndex] : '-';
    
    document.getElementById('trendImprovement').textContent = avgImprovement.toFixed(1);
    document.getElementById('bestDay').textContent = bestDay;
    
    // 建議
    let suggestion = '繼續保持每日冥想習慣';
    if (avgImprovement > 2) {
        suggestion = '您的冥想效果非常顯著，建議保持這個節奏';
    } else if (avgImprovement > 0) {
        suggestion = '冥想正在幫助您改善情緒，建議增加練習頻率';
    } else if (avgImprovement < 0) {
        suggestion = '建議嘗試不同的冥想類型或調整練習時間';
    }
    document.getElementById('moodSuggestion').textContent = suggestion;
    
    // 創建圖表
    const ctx = document.getElementById('moodTrendChart');
    if (ctx) {
        if (charts.moodTrend) {
            charts.moodTrend.destroy();
        }
        
        charts.moodTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '冥想前情緒',
                        data: beforeMood,
                        borderColor: '#63B3ED',
                        backgroundColor: 'rgba(99, 179, 237, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: '冥想後情緒',
                        data: afterMood,
                        borderColor: '#68D391',
                        backgroundColor: 'rgba(104, 211, 145, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 1,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
}

// 更新冥想時長分布圖
function updateDurationPieChart() {
    const filteredData = getFilteredData();
    
    // 統計時長分布
    const durationStats = {};
    let totalDuration = 0;
    
    filteredData.forEach(entry => {
        const duration = entry.duration || 0;
        totalDuration += duration;
        
        let category;
        if (duration <= 10) category = '10分鐘以下';
        else if (duration <= 20) category = '10-20分鐘';
        else if (duration <= 30) category = '20-30分鐘';
        else if (duration <= 60) category = '30-60分鐘';
        else category = '60分鐘以上';
        
        durationStats[category] = (durationStats[category] || 0) + 1;
    });
    
    const labels = Object.keys(durationStats);
    const data = Object.values(durationStats);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    // 更新洞察
    const mostUsedDuration = data.length > 0 ? labels[data.indexOf(Math.max(...data))] || '-' : '-';
    const avgDuration = filteredData.length > 0 ? totalDuration / filteredData.length : 0;
    
    document.getElementById('mostUsedDuration').textContent = mostUsedDuration;
    document.getElementById('avgDuration').textContent = avgDuration.toFixed(0);
    
    // 創建圖表
    const ctx = document.getElementById('durationPieChart');
    if (ctx) {
        if (charts.durationPie) {
            charts.durationPie.destroy();
        }
        
        charts.durationPie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
}

// 更新冥想類型分布圖
function updateTypeBarChart() {
    const filteredData = getFilteredData();
    
    // 統計類型分布
    const typeStats = {};
    const typeNames = {
        'breathing': '呼吸冥想',
        'body-scan': '身體掃描',
        'loving-kindness': '慈心冥想',
        'walking': '行走冥想',
        'mindfulness': '正念冥想',
        'transcendental': '超覺冥想',
        'zen': '禪修',
        'vipassana': '內觀冥想'
    };
    
    filteredData.forEach(entry => {
        if (entry.meditationTypes) {
            entry.meditationTypes.forEach(type => {
                typeStats[type] = (typeStats[type] || 0) + 1;
            });
        }
    });
    
    const labels = Object.keys(typeStats).map(type => typeNames[type] || type);
    const data = Object.values(typeStats);
    
    // 更新洞察
    const favoriteType = Object.keys(typeStats).length > 0 ? Object.keys(typeStats).reduce((a, b) => typeStats[a] > typeStats[b] ? a : b) : 'breathing';
    const favoriteTypeName = typeNames[favoriteType] || favoriteType;
    const suggestedTypes = Object.keys(typeNames).filter(type => !typeStats[type]);
    const suggestedType = suggestedTypes.length > 0 ? typeNames[suggestedTypes[0]] : '嘗試新的冥想技巧';
    
    document.getElementById('favoriteMeditationType').textContent = favoriteTypeName;
    document.getElementById('suggestedType').textContent = suggestedType;
    
    // 創建圖表
    const ctx = document.getElementById('typeBarChart');
    if (ctx) {
        if (charts.typeBar) {
            charts.typeBar.destroy();
        }
        
        charts.typeBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '使用次數',
                    data: data,
                    backgroundColor: 'rgba(127, 176, 105, 0.8)',
                    borderColor: 'rgba(127, 176, 105, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// 更新每週冥想頻率圖
function updateWeeklyFrequencyChart() {
    const filteredData = getFilteredData();
    
    // 統計每週各天的冥想次數
    const weeklyStats = {
        '週日': 0, '週一': 0, '週二': 0, '週三': 0, 
        '週四': 0, '週五': 0, '週六': 0
    };
    
    filteredData.forEach(entry => {
        const date = new Date(entry.createdAt);
        const dayName = date.toLocaleDateString('zh-TW', { weekday: 'long' });
        weeklyStats[dayName] = (weeklyStats[dayName] || 0) + 1;
    });
    
    const labels = Object.keys(weeklyStats);
    const data = Object.values(weeklyStats);
    
    // 更新洞察
    const mostActiveDay = data.length > 0 ? labels[data.indexOf(Math.max(...data))] || '-' : '-';
    let frequencySuggestion = '保持每日冥想習慣';
    const maxFrequency = data.length > 0 ? Math.max(...data) : 0;
    if (maxFrequency >= 5) {
        frequencySuggestion = '您的冥想習慣非常規律，建議保持這個節奏';
    } else if (maxFrequency >= 3) {
        frequencySuggestion = '建議增加冥想頻率，建立更穩定的習慣';
    } else {
        frequencySuggestion = '建議設定固定的冥想時間，建立每日習慣';
    }
    
    document.getElementById('mostActiveDay').textContent = mostActiveDay;
    document.getElementById('frequencySuggestion').textContent = frequencySuggestion;
    
    // 創建圖表
    const ctx = document.getElementById('weeklyFrequencyChart');
    if (ctx) {
        if (charts.weeklyFrequency) {
            charts.weeklyFrequency.destroy();
        }
        
        charts.weeklyFrequency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '冥想次數',
                    data: data,
                    backgroundColor: 'rgba(168, 213, 186, 0.8)',
                    borderColor: 'rgba(168, 213, 186, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// 更新思緒類型分析圖
function updateThoughtTypeChart() {
    const filteredData = getFilteredData();
    
    // 統計思緒類型
    const thoughtStats = {};
    const thoughtNames = {
        'worry': '擔憂',
        'memory': '回憶',
        'planning': '計劃',
        'judgment': '批判',
        'gratitude': '感恩',
        'curiosity': '好奇',
        'peaceful': '平靜',
        'other': '其他'
    };
    
    filteredData.forEach(entry => {
        if (entry.thoughtTypes) {
            entry.thoughtTypes.forEach(thought => {
                thoughtStats[thought] = (thoughtStats[thought] || 0) + 1;
            });
        }
    });
    
    const labels = Object.keys(thoughtStats).map(thought => thoughtNames[thought] || thought);
    const data = Object.values(thoughtStats);
    
    // 更新洞察
    const mostCommonThought = Object.keys(thoughtStats).length > 0 ? Object.keys(thoughtStats).reduce((a, b) => thoughtStats[a] > thoughtStats[b] ? a : b) : 'worry';
    const mostCommonThoughtName = thoughtNames[mostCommonThought] || mostCommonThought;
    
    let thoughtInsight = '觀察思緒而不評判是正念的核心';
    if (mostCommonThought === 'worry') {
        thoughtInsight = '擔憂是常見的思緒，學會觀察它們而不被牽引';
    } else if (mostCommonThought === 'gratitude') {
        thoughtInsight = '感恩的思緒很美好，這顯示您的心境正向';
    } else if (mostCommonThought === 'peaceful') {
        thoughtInsight = '平靜的思緒增多，說明您的正念練習正在發揮效果';
    }
    
    document.getElementById('mostCommonThought').textContent = mostCommonThoughtName;
    document.getElementById('thoughtInsight').textContent = thoughtInsight;
    
    // 創建圖表
    const ctx = document.getElementById('thoughtTypeChart');
    if (ctx) {
        if (charts.thoughtType) {
            charts.thoughtType.destroy();
        }
        
        charts.thoughtType = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '出現次數',
                    data: data,
                    backgroundColor: 'rgba(184, 224, 210, 0.8)',
                    borderColor: 'rgba(184, 224, 210, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// 更新洞察建議
function updateInsights() {
    const filteredData = getFilteredData();
    
    // 最佳冥想時段
    const timeStats = {};
    filteredData.forEach(entry => {
        if (entry.time) {
            const hour = parseInt(entry.time.split(':')[0]);
            const period = hour < 12 ? '早晨' : hour < 18 ? '下午' : '晚上';
            timeStats[period] = (timeStats[period] || 0) + 1;
        }
    });
    
    const bestTime = Object.keys(timeStats).length > 0 ? Object.keys(timeStats).reduce((a, b) => timeStats[a] > timeStats[b] ? a : b) : '早晨';
    document.getElementById('bestTimeInsight').textContent = 
        `根據您的數據分析，建議在${bestTime}進行冥想練習，此時心境最為平靜。`;
    
    // 進步趨勢
    const recentImprovement = calculateAverageMoodImprovement(filteredData.slice(0, 7));
    const olderImprovement = calculateAverageMoodImprovement(filteredData.slice(7, 14));
    let progressText = '您的正念練習正在穩步提升，情緒管理能力有明顯改善。';
    
    if (recentImprovement > olderImprovement) {
        progressText = '您的正念練習效果正在提升，情緒改善趨勢良好。';
    } else if (recentImprovement < olderImprovement) {
        progressText = '建議增加練習頻率或調整冥想方式，以提升效果。';
    }
    document.getElementById('progressInsight').textContent = progressText;
    
    // 專注度建議
    const avgDuration = filteredData.reduce((sum, entry) => sum + (entry.duration || 0), 0) / filteredData.length;
    let focusText = '建議嘗試不同的冥想類型，找到最適合您的練習方式。';
    
    if (avgDuration < 15) {
        focusText = '建議逐步增加冥想時長，培養更深的專注力。';
    } else if (avgDuration > 30) {
        focusText = '您的冥想時長很充足，建議專注於品質而非時長。';
    }
    document.getElementById('focusInsight').textContent = focusText;
    
    // 一致性提醒
    const streakInfo = calculateStreak(journalEntries);
    let consistencyText = '保持每日冥想的習慣比時長更重要，建議設定固定的冥想時間。';
    
    if (streakInfo.current >= 7) {
        consistencyText = '您已經建立了良好的冥想習慣，請繼續保持這個節奏。';
    } else if (streakInfo.current >= 3) {
        consistencyText = '您正在建立冥想習慣，建議設定每日提醒以保持一致性。';
    }
    document.getElementById('consistencyInsight').textContent = consistencyText;
    
    // 成就里程碑
    const totalSessions = journalEntries.length;
    let achievementText = '恭喜您已經建立了穩定的正念練習習慣！';
    
    if (totalSessions >= 100) {
        achievementText = '恭喜您完成100次冥想！您已經建立了深厚的正念基礎。';
    } else if (totalSessions >= 50) {
        achievementText = '恭喜您完成50次冥想！您的正念練習正在穩步發展。';
    } else if (totalSessions >= 10) {
        achievementText = '恭喜您完成10次冥想！您已經開始了正念之旅。';
    }
    document.getElementById('achievementInsight').textContent = achievementText;
    
    // 下一步建議
    const monthlyHours = calculateMonthlyHours();
    let nextStepText = '考慮增加冥想時長或嘗試新的冥想技巧來深化練習。';
    
    if (monthlyHours >= 20) {
        nextStepText = '您的練習量很充足，建議專注於深化正念品質和內在洞察。';
    } else if (monthlyHours >= 10) {
        nextStepText = '建議逐步增加練習頻率，建立更穩定的正念習慣。';
    } else {
        nextStepText = '建議設定每日冥想目標，逐步建立正念練習習慣。';
    }
    document.getElementById('nextStepInsight').textContent = nextStepText;
}

// 輔助函數

// 計算連續冥想天數
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

// 計算平均情緒改善
function calculateAverageMoodImprovement(entries) {
    const validEntries = entries.filter(entry => entry.beforeMood && entry.afterMood);
    if (validEntries.length === 0) return 0;
    
    const totalImprovement = validEntries.reduce((sum, entry) => {
        return sum + (entry.afterMood - entry.beforeMood);
    }, 0);
    
    return totalImprovement / validEntries.length;
}

// 找出最常用的冥想類型
function findMostUsedMeditationType(entries) {
    const typeCount = {};
    
    entries.forEach(entry => {
        if (entry.meditationTypes) {
            entry.meditationTypes.forEach(type => {
                typeCount[type] = (typeCount[type] || 0) + 1;
            });
        }
    });
    
    const mostUsed = Object.entries(typeCount)
        .sort(([,a], [,b]) => b - a)[0];
    
    return mostUsed ? mostUsed[0] : 'breathing';
}

// 統計冥想類型使用次數
function countMeditationType(type, entries) {
    return entries.filter(entry => 
        entry.meditationTypes && entry.meditationTypes.includes(type)
    ).length;
}

// 獲取冥想類型名稱
function getMeditationTypeName(type) {
    const typeNames = {
        'breathing': '呼吸冥想',
        'body-scan': '身體掃描',
        'loving-kindness': '慈心冥想',
        'walking': '行走冥想',
        'mindfulness': '正念冥想',
        'transcendental': '超覺冥想',
        'zen': '禪修',
        'vipassana': '內觀冥想'
    };
    return typeNames[type] || type;
}

// 計算本月冥想時數
function calculateMonthlyHours() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyEntries = journalEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= startOfMonth;
    });
    
    const totalMinutes = monthlyEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return totalMinutes / 60;
}

// 獲取本週數據
function getWeeklyData() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return journalEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= startOfWeek;
    });
}

// 獲取上期數據（用於比較）
function getPreviousPeriodData() {
    const filteredData = getFilteredData();
    const halfLength = Math.floor(filteredData.length / 2);
    return filteredData.slice(halfLength);
}

// 匯出功能
function exportPDF() {
    alert('PDF匯出功能開發中...');
}

function exportCSV() {
    const filteredData = getFilteredData();
    let csv = '日期,時間,冥想時長,冥想類型,冥想前情緒,冥想後情緒,思緒類型,身體感受,覺察筆記\n';
    
    filteredData.forEach(entry => {
        const date = new Date(entry.createdAt).toLocaleDateString('zh-TW');
        const time = entry.time || '';
        const duration = entry.duration || 0;
        const types = (entry.meditationTypes || []).join(';');
        const beforeMood = entry.beforeMood || '';
        const afterMood = entry.afterMood || '';
        const thoughts = (entry.thoughtTypes || []).join(';');
        const sensations = (entry['physical-sensations'] || '').replace(/"/g, '""');
        const notes = (entry['awareness-notes'] || '').replace(/"/g, '""');
        
        csv += `"${date}","${time}","${duration}","${types}","${beforeMood}","${afterMood}","${thoughts}","${sensations}","${notes}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `正念冥想記錄_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareReport() {
    if (navigator.share) {
        navigator.share({
            title: '我的正念冥想統計報告',
            text: '查看我的正念覺察旅程統計分析',
            url: window.location.href
        });
    } else {
        alert('分享功能需要現代瀏覽器支持');
    }
}

function resetData() {
    if (confirm('確定要清除所有冥想記錄數據嗎？此操作無法撤銷。')) {
        localStorage.removeItem('journalEntries');
        localStorage.removeItem('journalStatistics');
        localStorage.removeItem('journalDraft');
        journalEntries = [];
        updateAllCharts();
        alert('所有數據已清除');
    }
}