// 正念覺察筆記 - 主要JavaScript功能

// 當DOM載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化導航系統
    initNavigation();
    
    // 初始化評分滑塊
    initRatingSliders();
    
    // 初始化表單處理
    initFormHandlers();
    
    // 初始化搜尋功能
    initSearchFunction();
    
    // 初始化篩選功能
    initFilterFunction();
    
    // 設定當前日期和時間
    setCurrentDateTime();
});

// 初始化導航系統
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        // 漢堡選單點擊事件
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // 防止背景滾動
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // 點擊導航項目時關閉選單
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // 點擊外部區域關閉選單
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // 視窗大小改變時重置選單狀態
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // 高亮當前頁面
    highlightCurrentPage();
}

// 高亮當前頁面
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath.split('/').pop() || 
            (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// 初始化評分滑塊
function initRatingSliders() {
    const ratingSliders = document.querySelectorAll('input[type="range"]');
    
    ratingSliders.forEach(slider => {
        const valueDisplay = slider.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('rating-value')) {
            // 更新顯示值
            valueDisplay.textContent = slider.value;
            
            // 監聽滑塊變化
            slider.addEventListener('input', function() {
                valueDisplay.textContent = this.value;
            });
        }
    });
}

// 初始化表單處理
function initFormHandlers() {
    // 覺察記錄表單
    const journalForm = document.getElementById('journalForm');
    if (journalForm) {
        journalForm.addEventListener('submit', handleJournalSubmit);
    }
    
    // 快速記錄表單
    const quickForm = document.querySelector('.quick-form');
    if (quickForm) {
        quickForm.addEventListener('submit', handleQuickSubmit);
    }
}

// 處理覺察記錄表單提交
function handleJournalSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // 收集複選框的值
    const meditationTypes = formData.getAll('meditation-type');
    data.meditationTypes = meditationTypes;
    
    // 驗證必填欄位
    if (!validateJournalForm(data)) {
        return;
    }
    
    // 儲存數據（這裡可以連接到後端API）
    saveJournalEntry(data);
    
    // 顯示成功訊息
    showSuccessMessage('覺察記錄已成功保存！');
    
    // 重置表單
    event.target.reset();
    
    // 重置評分滑塊
    resetRatingSliders();
}

// 處理快速記錄表單提交
function handleQuickSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // 驗證必填欄位
    if (!data.mood || !data.note.trim()) {
        showErrorMessage('請填寫心情和筆記內容');
        return;
    }
    
    // 儲存快速記錄
    saveQuickEntry(data);
    
    // 顯示成功訊息
    showSuccessMessage('快速記錄已保存！');
    
    // 重置表單
    event.target.reset();
}

// 驗證覺察記錄表單
function validateJournalForm(data) {
    const requiredFields = ['date', 'time', 'duration', 'before-mood', 'after-mood'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            showErrorMessage(`請填寫 ${getFieldLabel(field)}`);
            return false;
        }
    }
    
    if (data.duration < 1 || data.duration > 180) {
        showErrorMessage('冥想時長應在1-180分鐘之間');
        return false;
    }
    
    return true;
}

// 獲取欄位標籤
function getFieldLabel(fieldName) {
    const labels = {
        'date': '日期',
        'time': '時間',
        'duration': '冥想時長',
        'before-mood': '冥想前心情',
        'after-mood': '冥想後心情'
    };
    return labels[fieldName] || fieldName;
}

// 儲存覺察記錄
function saveJournalEntry(data) {
    // 這裡可以連接到後端API或本地儲存
    console.log('儲存覺察記錄:', data);
    
    // 儲存到localStorage作為示例
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    entries.push({
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('journalEntries', JSON.stringify(entries));
}

// 儲存快速記錄
function saveQuickEntry(data) {
    console.log('儲存快速記錄:', data);
    
    // 儲存到localStorage作為示例
    const quickEntries = JSON.parse(localStorage.getItem('quickEntries') || '[]');
    quickEntries.push({
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('quickEntries', JSON.stringify(quickEntries));
}

// 重置表單
function resetForm() {
    const form = document.getElementById('journalForm');
    if (form) {
        form.reset();
        resetRatingSliders();
        showSuccessMessage('表單已重置');
    }
}

// 重置評分滑塊
function resetRatingSliders() {
    const ratingSliders = document.querySelectorAll('input[type="range"]');
    ratingSliders.forEach(slider => {
        slider.value = 5;
        const valueDisplay = slider.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('rating-value')) {
            valueDisplay.textContent = '5';
        }
    });
}

// 設定當前日期和時間
function setCurrentDateTime() {
    const now = new Date();
    
    // 設定日期
    const dateInput = document.getElementById('session-date');
    if (dateInput) {
        const dateString = now.toISOString().split('T')[0];
        dateInput.value = dateString;
    }
    
    // 設定時間
    const timeInput = document.getElementById('session-time');
    if (timeInput) {
        const timeString = now.toTimeString().slice(0, 5);
        timeInput.value = timeString;
    }
}

// 初始化搜尋功能
function initSearchFunction() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        // 搜尋按鈕點擊
        searchBtn.addEventListener('click', performSearch);
        
        // 按下Enter鍵搜尋
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// 執行搜尋
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showErrorMessage('請輸入搜尋關鍵字');
        return;
    }
    
    // 這裡可以實現搜尋邏輯
    console.log('搜尋:', searchTerm);
    showSuccessMessage(`正在搜尋: ${searchTerm}`);
}

// 初始化篩選功能
function initFilterFunction() {
    const filterSelects = document.querySelectorAll('.filter-select');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

// 套用篩選
function applyFilters() {
    const dateFilter = document.getElementById('date-filter')?.value;
    const moodFilter = document.getElementById('mood-filter')?.value;
    const typeFilter = document.getElementById('type-filter')?.value;
    
    console.log('套用篩選:', { dateFilter, moodFilter, typeFilter });
    
    // 這裡可以實現篩選邏輯
    showSuccessMessage('篩選已套用');
}

// 查看記錄詳情
function viewEntry(entryId) {
    console.log('查看記錄:', entryId);
    // 這裡可以實現查看詳情的邏輯
    showSuccessMessage('正在載入記錄詳情...');
}

// 編輯記錄
function editEntry(entryId) {
    console.log('編輯記錄:', entryId);
    // 這裡可以實現編輯記錄的邏輯
    showSuccessMessage('正在載入編輯模式...');
}

// 更新圖表
function updateCharts() {
    const timeRange = document.getElementById('time-range')?.value;
    console.log('更新圖表，時間範圍:', timeRange);
    
    // 這裡可以實現圖表更新邏輯
    showSuccessMessage('圖表已更新');
}

// 匯出PDF報告
function exportPDF() {
    console.log('匯出PDF報告');
    showSuccessMessage('正在生成PDF報告...');
}

// 匯出CSV數據
function exportCSV() {
    console.log('匯出CSV數據');
    showSuccessMessage('正在匯出CSV數據...');
}

// 分享報告
function shareReport() {
    console.log('分享報告');
    showSuccessMessage('正在準備分享...');
}

// 顯示成功訊息
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// 顯示錯誤訊息
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// 顯示訊息
function showMessage(message, type = 'info') {
    // 移除現有的訊息
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 創建新訊息
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast message-${type}`;
    messageDiv.textContent = message;
    
    // 添加樣式
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // 根據類型設定背景色
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#7FB069';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#F56C6C';
    } else {
        messageDiv.style.backgroundColor = '#8B7355';
    }
    
    // 添加到頁面
    document.body.appendChild(messageDiv);
    
    // 3秒後自動移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 3000);
}

// 添加動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);