// 正念覺察筆記 - 主要JavaScript功能

// 當DOM載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化導航系統
    initNavigation();
    
    // 初始化評分滑塊
    initRatingSliders();
    
    // 初始化表單處理（僅適用於非journal頁面）
    if (!document.getElementById('journalForm')) {
        initFormHandlers();
    }
    
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

// 初始化評分滑塊和情緒滑桿
function initRatingSliders() {
    // 初始化情緒狀態滑桿
    const moodSliders = document.querySelectorAll('.mood-slider');
    
    moodSliders.forEach(slider => {
        const valueDisplay = document.getElementById(slider.id + '-value');
        const fillElement = document.getElementById(slider.id + '-fill');
        
        if (valueDisplay && fillElement) {
            // 更新顯示值和填充條
            updateMoodSlider(slider, valueDisplay, fillElement);
            
            // 監聽滑塊變化
            slider.addEventListener('input', function() {
                updateMoodSlider(this, valueDisplay, fillElement);
            });
        }
    });
    
    // 初始化一般評分滑塊
    const ratingSliders = document.querySelectorAll('input[type="range"]:not(.mood-slider)');
    
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

// 更新情緒滑桿顯示
function updateMoodSlider(slider, valueDisplay, fillElement) {
    const value = slider.value;
    const percentage = (value - 1) / 9 * 100; // 1-10 轉換為 0-100%
    
    valueDisplay.textContent = value;
    fillElement.style.width = percentage + '%';
    
    // 根據數值改變顏色
    if (value <= 3) {
        fillElement.style.background = 'var(--error-color)';
    } else if (value <= 6) {
        fillElement.style.background = 'var(--warning-color)';
    } else {
        fillElement.style.background = 'var(--success-color)';
    }
}

// 初始化表單處理
function initFormHandlers() {
    // 覺察記錄表單
    const journalForm = document.getElementById('journalForm');
    if (journalForm) {
        journalForm.addEventListener('submit', handleJournalSubmit);
        initFormValidation(journalForm);
        initCharacterCounters();
        initCustomDuration();
    }
    
    // 快速記錄表單
    const quickForm = document.querySelector('.quick-form');
    if (quickForm) {
        quickForm.addEventListener('submit', handleQuickSubmit);
    }
}

// 初始化表單驗證
function initFormValidation(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // 即時驗證
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// 初始化字數統計
function initCharacterCounters() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        const counter = document.getElementById(textarea.id.replace('-', '-') + '-count');
        if (counter) {
            updateCharacterCount(textarea, counter);
            
            textarea.addEventListener('input', function() {
                updateCharacterCount(this, counter);
            });
        }
    });
}

// 更新字數統計
function updateCharacterCount(textarea, counter) {
    const count = textarea.value.length;
    const maxLength = getMaxLength(textarea.id);
    
    counter.textContent = count;
    
    // 移除舊的警告類別
    counter.parentElement.classList.remove('warning', 'error');
    
    // 根據字數添加警告類別
    if (count > maxLength * 0.8 && count <= maxLength) {
        counter.parentElement.classList.add('warning');
    } else if (count > maxLength) {
        counter.parentElement.classList.add('error');
    }
}

// 獲取最大字數
function getMaxLength(textareaId) {
    const maxLengths = {
        'physical-sensations': 500,
        'awareness-notes': 1000,
        'mindfulness-reminder': 200
    };
    return maxLengths[textareaId] || 1000;
}

// 初始化自訂時長
function initCustomDuration() {
    const durationSelect = document.getElementById('session-duration');
    const customGroup = document.getElementById('customDurationGroup');
    const customInput = document.getElementById('custom-duration');
    
    if (durationSelect && customGroup && customInput) {
        durationSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                customGroup.style.display = 'block';
                customInput.required = true;
            } else {
                customGroup.style.display = 'none';
                customInput.required = false;
                customInput.value = '';
            }
        });
    }
}

// 處理覺察記錄表單提交
function handleJournalSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // 收集複選框的值
    const meditationTypes = formData.getAll('meditation-type');
    const thoughtTypes = formData.getAll('thought-type');
    data.meditationTypes = meditationTypes;
    data.thoughtTypes = thoughtTypes;
    
    // 驗證所有欄位
    if (!validateJournalForm(form, data)) {
        return;
    }
    
    // 顯示載入狀態
    form.classList.add('form-loading');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">保存中...</span>';
    
    // 模擬API調用
    setTimeout(() => {
        // 儲存數據（這裡可以連接到後端API）
        saveJournalEntry(data);
        
        // 顯示成功訊息
        showSuccessMessage('覺察記錄已成功保存！');
        
        // 重置表單
        resetForm();
        
        // 恢復按鈕狀態
        form.classList.remove('form-loading');
        submitBtn.innerHTML = originalText;
    }, 1500);
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
function validateJournalForm(form, data) {
    let isValid = true;
    
    // 清除所有錯誤狀態
    clearAllErrors(form);
    
    // 驗證必填欄位
    const requiredFields = [
        { name: 'date', label: '日期' },
        { name: 'time', label: '時間' },
        { name: 'duration', label: '冥想時長' },
        { name: 'before-mood', label: '冥想前情緒狀態' },
        { name: 'after-mood', label: '冥想後情緒狀態' },
        { name: 'awareness-notes', label: '覺察筆記' }
    ];
    
    requiredFields.forEach(field => {
        const element = form.querySelector(`[name="${field.name}"]`);
        if (!element || !element.value.trim()) {
            showFieldError(element, `請填寫${field.label}`);
            isValid = false;
        }
    });
    
    // 驗證冥想類型
    const meditationTypes = form.querySelectorAll('input[name="meditation-type"]:checked');
    if (meditationTypes.length === 0) {
        const errorElement = document.getElementById('meditation-type-error');
        if (errorElement) {
            errorElement.textContent = '請至少選擇一種冥想類型';
        }
        isValid = false;
    }
    
    // 驗證自訂時長
    if (data.duration === 'other' && (!data['custom-duration'] || data['custom-duration'] < 1 || data['custom-duration'] > 180)) {
        const customInput = form.querySelector('#custom-duration');
        showFieldError(customInput, '請輸入1-180分鐘之間的時長');
        isValid = false;
    }
    
    // 驗證字數限制
    const textareas = form.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const maxLength = getMaxLength(textarea.id);
        if (textarea.value.length > maxLength) {
            showFieldError(textarea, `字數超過限制（最多${maxLength}字）`);
            isValid = false;
        }
    });
    
    return isValid;
}

// 顯示欄位錯誤
function showFieldError(element, message) {
    if (!element) return;
    
    const formGroup = element.closest('.form-group');
    const errorElement = document.getElementById(element.id + '-error') || 
                        formGroup.querySelector('.error-message');
    
    if (formGroup) {
        formGroup.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// 清除所有錯誤
function clearAllErrors(form) {
    const formGroups = form.querySelectorAll('.form-group');
    const errorMessages = form.querySelectorAll('.error-message');
    
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
    });
    
    errorMessages.forEach(error => {
        error.textContent = '';
    });
}

// 驗證單個欄位
function validateField(field) {
    const formGroup = field.closest('.form-group');
    const errorElement = document.getElementById(field.id + '-error') || 
                        formGroup.querySelector('.error-message');
    
    // 清除舊的錯誤狀態
    formGroup.classList.remove('error', 'success');
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    // 驗證必填欄位
    if (field.hasAttribute('required') && !field.value.trim()) {
        formGroup.classList.add('error');
        if (errorElement) {
            errorElement.textContent = '此欄位為必填';
        }
        return false;
    }
    
    // 驗證字數限制
    if (field.tagName === 'TEXTAREA') {
        const maxLength = getMaxLength(field.id);
        if (field.value.length > maxLength) {
            formGroup.classList.add('error');
            if (errorElement) {
                errorElement.textContent = `字數超過限制（最多${maxLength}字）`;
            }
            return false;
        }
    }
    
    // 驗證成功
    if (field.value.trim()) {
        formGroup.classList.add('success');
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
        resetMoodSliders();
        resetCharacterCounters();
        hideCustomDuration();
        clearAllErrors(form);
        showSuccessMessage('表單已重置');
    }
}

// 重置情緒滑桿
function resetMoodSliders() {
    const moodSliders = document.querySelectorAll('.mood-slider');
    moodSliders.forEach(slider => {
        slider.value = 5;
        const valueDisplay = document.getElementById(slider.id + '-value');
        const fillElement = document.getElementById(slider.id + '-fill');
        if (valueDisplay && fillElement) {
            updateMoodSlider(slider, valueDisplay, fillElement);
        }
    });
}

// 重置字數統計
function resetCharacterCounters() {
    const counters = document.querySelectorAll('.character-count span');
    counters.forEach(counter => {
        counter.textContent = '0';
        counter.parentElement.classList.remove('warning', 'error');
    });
}

// 隱藏自訂時長
function hideCustomDuration() {
    const customGroup = document.getElementById('customDurationGroup');
    if (customGroup) {
        customGroup.style.display = 'none';
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