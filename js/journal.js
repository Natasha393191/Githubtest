// 正念冥想記錄表單 - 專用JavaScript功能

// 當DOM載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('journalForm')) {
        initJournalForm();
    }
});

// 初始化記錄表單
function initJournalForm() {
    const form = document.getElementById('journalForm');
    
    // 初始化所有功能
    initCharacterCounters();
    initCustomDuration();
    initMoodSliders();
    initDraftSystem();
    
    // 綁定事件監聽器
    bindFormEvents(form);
    
    // 載入草稿（如果存在）
    loadDraft();
}

// 綁定表單事件
function bindFormEvents(form) {
    // 表單提交
    form.addEventListener('submit', handleFormSubmit);
    
    // 自動保存草稿
    form.addEventListener('input', debounce(saveDraft, 2000));
    
    // 草稿按鈕
    const saveDraftBtn = document.createElement('button');
    saveDraftBtn.type = 'button';
    saveDraftBtn.className = 'btn btn-secondary';
    saveDraftBtn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">儲存草稿</span>';
    saveDraftBtn.onclick = saveDraftManually;
    
    const formActions = form.querySelector('.form-actions');
    if (formActions && !formActions.querySelector('.btn-secondary')) {
        formActions.insertBefore(saveDraftBtn, formActions.firstChild);
    }
}

// 處理表單提交
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // 驗證表單
    if (!validateForm(form)) {
        showErrorMessage('請檢查並填寫所有必填欄位');
        return;
    }
    
    // 收集表單數據
    const formData = collectFormData(form);
    
    // 顯示載入狀態
    showLoadingState(form, true);
    
    // 模擬API調用延遲
    setTimeout(() => {
        try {
            // 保存到localStorage
            saveJournalEntry(formData);
            
            // 清除草稿
            clearDraft();
            
            // 顯示成功訊息
            showSuccessMessage('您的正念覺察記錄已成功保存！✨ 感謝您對內在世界的關注。');
            
            // 重置表單
            resetForm(form);
            
        } catch (error) {
            showErrorMessage('保存失敗，請稍後再試');
            console.error('保存記錄失敗:', error);
        } finally {
            // 隱藏載入狀態
            showLoadingState(form, false);
        }
    }, 1500);
}

// 收集表單數據
function collectFormData(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // 收集複選框數據
    data.meditationTypes = formData.getAll('meditation-type');
    data.thoughtTypes = formData.getAll('thought-type');
    
    // 處理自訂時長
    if (data.duration === 'other') {
        data.duration = parseInt(data['custom-duration']) || 0;
    } else {
        data.duration = parseInt(data.duration) || 0;
    }
    
    // 轉換情緒狀態為數字
    data.beforeMood = parseInt(data['before-mood']) || 5;
    data.afterMood = parseInt(data['after-mood']) || 5;
    
    // 添加元數據
    data.id = generateUniqueId();
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    data.version = '1.0';
    
    return data;
}

// 生成唯一ID
function generateUniqueId() {
    return 'journal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 保存記錄到localStorage
function saveJournalEntry(data) {
    try {
        // 獲取現有記錄
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        
        // 添加新記錄
        entries.push(data);
        
        // 按時間排序（最新的在前）
        entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // 保存回localStorage
        localStorage.setItem('journalEntries', JSON.stringify(entries));
        
        // 更新統計數據
        updateStatistics(entries);
        
        return true;
    } catch (error) {
        console.error('保存記錄失敗:', error);
        throw error;
    }
}

// 更新統計數據
function updateStatistics(entries) {
    const stats = {
        totalEntries: entries.length,
        totalMeditationTime: entries.reduce((sum, entry) => sum + (entry.duration || 0), 0),
        averageMoodImprovement: calculateAverageMoodImprovement(entries),
        mostUsedMeditationType: findMostUsedMeditationType(entries),
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('journalStatistics', JSON.stringify(stats));
}

// 計算平均情緒改善
function calculateAverageMoodImprovement(entries) {
    const validEntries = entries.filter(entry => entry.beforeMood && entry.afterMood);
    if (validEntries.length === 0) return 0;
    
    const totalImprovement = validEntries.reduce((sum, entry) => {
        return sum + (entry.afterMood - entry.beforeMood);
    }, 0);
    
    return Math.round((totalImprovement / validEntries.length) * 10) / 10;
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

// 表單驗證
function validateForm(form) {
    let isValid = true;
    
    // 清除所有錯誤
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
    const durationSelect = form.querySelector('#session-duration');
    if (durationSelect && durationSelect.value === 'other') {
        const customInput = form.querySelector('#custom-duration');
        const customValue = parseInt(customInput.value);
        if (!customValue || customValue < 1 || customValue > 180) {
            showFieldError(customInput, '請輸入1-180分鐘之間的時長');
            isValid = false;
        }
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

// 顯示載入狀態
function showLoadingState(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (isLoading) {
        form.classList.add('form-loading');
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">保存中...</span>';
        submitBtn.disabled = true;
    } else {
        form.classList.remove('form-loading');
        submitBtn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">保存覺察記錄</span>';
        submitBtn.disabled = false;
    }
}

// 重置表單
function resetForm(form) {
    if (!form) {
        form = document.getElementById('journalForm');
    }
    if (!form) return;
    
    form.reset();
    resetMoodSliders();
    resetCharacterCounters();
    hideCustomDuration();
    clearAllErrors(form);
    
    // 重置所有滑桿到預設值
    const sliders = form.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.value = 5;
        const event = new Event('input');
        slider.dispatchEvent(event);
    });
}

// 初始化情緒滑桿
function initMoodSliders() {
    const moodSliders = document.querySelectorAll('.mood-slider');
    
    moodSliders.forEach(slider => {
        const valueDisplay = document.getElementById(slider.id + '-value');
        const fillElement = document.getElementById(slider.id + '-fill');
        
        if (valueDisplay && fillElement) {
            updateMoodSlider(slider, valueDisplay, fillElement);
            
            slider.addEventListener('input', function() {
                updateMoodSlider(this, valueDisplay, fillElement);
            });
        }
    });
}

// 更新情緒滑桿顯示
function updateMoodSlider(slider, valueDisplay, fillElement) {
    const value = slider.value;
    const percentage = (value - 1) / 9 * 100;
    
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

// 初始化字數統計
function initCharacterCounters() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        const counter = document.getElementById(textarea.id + '-count');
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
    const parent = counter.closest('.character-count');
    if (parent) {
        parent.classList.remove('warning', 'error');
        
        if (count > maxLength * 0.8 && count <= maxLength) {
            parent.classList.add('warning');
        } else if (count > maxLength) {
            parent.classList.add('error');
        }
    }
}

// 重置字數統計
function resetCharacterCounters() {
    const counters = document.querySelectorAll('.character-count span');
    counters.forEach(counter => {
        counter.textContent = '0';
        const parent = counter.closest('.character-count');
        if (parent) {
            parent.classList.remove('warning', 'error');
        }
    });
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

// 隱藏自訂時長
function hideCustomDuration() {
    const customGroup = document.getElementById('customDurationGroup');
    if (customGroup) {
        customGroup.style.display = 'none';
    }
}

// 初始化草稿系統
function initDraftSystem() {
    // 檢查是否有草稿
    const draft = localStorage.getItem('journalDraft');
    if (draft) {
        showDraftNotification();
    }
}

// 自動保存草稿
function saveDraft() {
    const form = document.getElementById('journalForm');
    if (!form) return;
    
    const formData = collectFormData(form);
    formData.isDraft = true;
    formData.draftSavedAt = new Date().toISOString();
    
    try {
        localStorage.setItem('journalDraft', JSON.stringify(formData));
        console.log('草稿已自動保存');
    } catch (error) {
        console.error('保存草稿失敗:', error);
    }
}

// 手動保存草稿
function saveDraftManually() {
    saveDraft();
    showSuccessMessage('草稿已保存！您可以稍後繼續完成記錄。');
}

// 載入草稿
function loadDraft() {
    try {
        const draft = localStorage.getItem('journalDraft');
        if (draft) {
            const draftData = JSON.parse(draft);
            populateFormWithDraft(draftData);
        }
    } catch (error) {
        console.error('載入草稿失敗:', error);
        clearDraft();
    }
}

// 用草稿數據填充表單
function populateFormWithDraft(draftData) {
    const form = document.getElementById('journalForm');
    if (!form) return;
    
    // 填充基本欄位
    if (draftData.date) form.querySelector('[name="date"]').value = draftData.date;
    if (draftData.time) form.querySelector('[name="time"]').value = draftData.time;
    if (draftData.duration) {
        const durationSelect = form.querySelector('[name="duration"]');
        if (draftData.duration > 30) {
            durationSelect.value = 'other';
            form.querySelector('#custom-duration').value = draftData.duration;
            document.getElementById('customDurationGroup').style.display = 'block';
        } else {
            durationSelect.value = draftData.duration.toString();
        }
    }
    
    // 填充情緒狀態
    if (draftData.beforeMood) {
        const beforeSlider = form.querySelector('#before-mood');
        beforeSlider.value = draftData.beforeMood;
        beforeSlider.dispatchEvent(new Event('input'));
    }
    
    if (draftData.afterMood) {
        const afterSlider = form.querySelector('#after-mood');
        afterSlider.value = draftData.afterMood;
        afterSlider.dispatchEvent(new Event('input'));
    }
    
    // 填充冥想類型
    if (draftData.meditationTypes) {
        draftData.meditationTypes.forEach(type => {
            const checkbox = form.querySelector(`input[name="meditation-type"][value="${type}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // 填充思緒類型
    if (draftData.thoughtTypes) {
        draftData.thoughtTypes.forEach(type => {
            const checkbox = form.querySelector(`input[name="thought-type"][value="${type}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // 填充文字區域
    if (draftData['physical-sensations']) {
        form.querySelector('#physical-sensations').value = draftData['physical-sensations'];
        form.querySelector('#physical-sensations').dispatchEvent(new Event('input'));
    }
    
    if (draftData['awareness-notes']) {
        form.querySelector('#awareness-notes').value = draftData['awareness-notes'];
        form.querySelector('#awareness-notes').dispatchEvent(new Event('input'));
    }
    
    if (draftData['mindfulness-reminder']) {
        form.querySelector('#mindfulness-reminder').value = draftData['mindfulness-reminder'];
        form.querySelector('#mindfulness-reminder').dispatchEvent(new Event('input'));
    }
}

// 顯示草稿通知
function showDraftNotification() {
    const notification = document.createElement('div');
    notification.className = 'draft-notification';
    notification.innerHTML = `
        <div class="draft-content">
            <span class="draft-icon">📝</span>
            <span class="draft-text">發現未完成的草稿</span>
            <div class="draft-actions">
                <button class="btn btn-small" onclick="loadDraftAndRemoveNotification()">載入草稿</button>
                <button class="btn btn-small btn-secondary" onclick="clearDraftAndRemoveNotification()">忽略</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 10秒後自動移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// 載入草稿並移除通知
function loadDraftAndRemoveNotification() {
    loadDraft();
    removeDraftNotification();
    showSuccessMessage('草稿已載入！您可以繼續完成記錄。');
}

// 清除草稿並移除通知
function clearDraftAndRemoveNotification() {
    clearDraft();
    removeDraftNotification();
}

// 移除草稿通知
function removeDraftNotification() {
    const notification = document.querySelector('.draft-notification');
    if (notification) {
        notification.remove();
    }
}

// 清除草稿
function clearDraft() {
    localStorage.removeItem('journalDraft');
}

// 防抖函數
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

