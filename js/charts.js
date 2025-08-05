// 正念覺察筆記 - 圖表功能

// 當DOM載入完成後初始化圖表
document.addEventListener('DOMContentLoaded', function() {
    // 檢查是否在統計頁面
    if (document.getElementById('moodChart')) {
        initCharts();
    }
});

// 初始化所有圖表
function initCharts() {
    initMoodChart();
    initTypeChart();
    initDurationChart();
    initRatingChart();
}

// 初始化情緒趨勢圖表
function initMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;

    // 模擬數據 - 這裡可以從API或localStorage獲取真實數據
    const data = {
        labels: ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7', '1/8', '1/9', '1/10', 
                '1/11', '1/12', '1/13', '1/14', '1/15', '1/16', '1/17', '1/18', '1/19', '1/20',
                '1/21', '1/22', '1/23', '1/24', '1/25', '1/26', '1/27', '1/28', '1/29', '1/30'],
        datasets: [
            {
                label: '非常放鬆',
                data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
                backgroundColor: '#7FB069',
                borderColor: '#7FB069',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: '放鬆',
                data: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                backgroundColor: '#9BC53D',
                borderColor: '#9BC53D',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: '平靜',
                data: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
                backgroundColor: '#E6A23C',
                borderColor: '#E6A23C',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: '緊張',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#E67E22',
                borderColor: '#E67E22',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: '非常緊張',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#F56C6C',
                borderColor: '#F56C6C',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // 使用自定義圖例
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value === 1 ? '是' : '否';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            }
        }
    });
}

// 初始化冥想類型分布圖表
function initTypeChart() {
    const ctx = document.getElementById('typeChart');
    if (!ctx) return;

    const data = {
        labels: ['呼吸冥想', '身體掃描', '慈心冥想', '正念冥想', '超覺冥想', '其他'],
        datasets: [{
            data: [8, 5, 3, 6, 1, 1],
            backgroundColor: [
                '#8B7355',
                '#D4A574',
                '#E6CCB2',
                '#7FB069',
                '#9BC53D',
                '#E6A23C'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// 初始化每日冥想時長圖表
function initDurationChart() {
    const ctx = document.getElementById('durationChart');
    if (!ctx) return;

    // 模擬30天的數據
    const labels = [];
    const data = [];
    
    for (let i = 1; i <= 30; i++) {
        labels.push(`${i}`);
        // 模擬15-30分鐘的隨機時長
        data.push(Math.floor(Math.random() * 16) + 15);
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '冥想時長（分鐘）',
                data: data,
                backgroundColor: '#8B7355',
                borderColor: '#D4A574',
                borderWidth: 1,
                borderRadius: 4
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
                    max: 40,
                    title: {
                        display: true,
                        text: '分鐘'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '日期'
                    }
                }
            }
        }
    });
}

// 初始化專注度與平靜度對比圖表
function initRatingChart() {
    const ctx = document.getElementById('ratingChart');
    if (!ctx) return;

    // 模擬30天的評分數據
    const labels = [];
    const focusData = [];
    const peaceData = [];
    
    for (let i = 1; i <= 30; i++) {
        labels.push(`${i}`);
        // 模擬6-9分的評分
        focusData.push(+(Math.random() * 3 + 6).toFixed(1));
        peaceData.push(+(Math.random() * 3 + 6).toFixed(1));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '專注度',
                    data: focusData,
                    borderColor: '#8B7355',
                    backgroundColor: 'rgba(139, 115, 85, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: '平靜度',
                    data: peaceData,
                    borderColor: '#7FB069',
                    backgroundColor: 'rgba(127, 176, 105, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
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
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: '評分 (1-10)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '日期'
                    }
                }
            },
            elements: {
                point: {
                    radius: 3,
                    hoverRadius: 5
                }
            }
        }
    });
}

// 更新圖表數據（根據時間範圍）
function updateChartsData(timeRange) {
    console.log('更新圖表數據，時間範圍:', timeRange);
    
    // 這裡可以根據選擇的時間範圍重新載入數據
    // 並重新初始化圖表
    
    // 示例：重新初始化所有圖表
    initCharts();
}

// 獲取真實的冥想數據
function getMeditationData() {
    // 從localStorage獲取數據
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    return entries;
}

// 處理情緒數據
function processMoodData(entries) {
    const moodCounts = {
        'very-calm': 0,
        'calm': 0,
        'neutral': 0,
        'stressed': 0,
        'very-stressed': 0
    };
    
    entries.forEach(entry => {
        const mood = entry['after-mood'];
        if (moodCounts.hasOwnProperty(mood)) {
            moodCounts[mood]++;
        }
    });
    
    return moodCounts;
}

// 處理冥想類型數據
function processTypeData(entries) {
    const typeCounts = {
        'breathing': 0,
        'body-scan': 0,
        'loving-kindness': 0,
        'mindfulness': 0,
        'transcendental': 0,
        'other': 0
    };
    
    entries.forEach(entry => {
        const types = entry.meditationTypes || [];
        types.forEach(type => {
            if (typeCounts.hasOwnProperty(type)) {
                typeCounts[type]++;
            }
        });
    });
    
    return typeCounts;
}

// 處理時長數據
function processDurationData(entries) {
    return entries.map(entry => ({
        date: entry.date,
        duration: parseInt(entry.duration) || 0
    }));
}

// 處理評分數據
function processRatingData(entries) {
    return entries.map(entry => ({
        date: entry.date,
        focus: parseInt(entry['focus-rating']) || 5,
        peace: parseInt(entry['peace-rating']) || 5
    }));
}