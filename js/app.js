// 記帳App主要功能
class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.currentType = 'expense';
        this.categories = {
            expense: ['餐飲', '交通', '購物', '娛樂', '醫療', '教育', '其他'],
            income: ['薪資', '獎金', '投資', '副業', '其他']
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateBalance();
        this.updateRecentTransactions();
        this.updateCategoryOptions();
        this.setCurrentDate();
        this.updateMonthlyStats();
        this.setupFilters();
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 導航切換
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 類型切換按鈕
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchType(e.target.dataset.type);
            });
        });

        // 表單提交
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // 篩選器
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    // 切換標籤頁
    switchTab(tabName) {
        // 更新導航狀態
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 切換內容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // 更新對應頁面的數據
        if (tabName === 'history') {
            this.updateHistoryList();
        } else if (tabName === 'stats') {
            this.updateStats();
        }
    }

    // 切換交易類型
    switchType(type) {
        this.currentType = type;
        
        // 更新按鈕狀態
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // 更新分類選項
        this.updateCategoryOptions();
    }

    // 更新分類選項
    updateCategoryOptions() {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">請選擇分類</option>';
        
        this.categories[this.currentType].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // 設置當前日期
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    // 新增交易
    addTransaction() {
        const form = document.getElementById('transactionForm');
        const formData = new FormData(form);
        
        const transaction = {
            id: Date.now(),
            type: this.currentType,
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            description: formData.get('description') || '',
            date: formData.get('date'),
            timestamp: new Date().toISOString()
        };

        // 驗證
        if (!transaction.amount || !transaction.category || !transaction.date) {
            this.showMessage('請填寫所有必填欄位', 'error');
            return;
        }

        // 添加到交易列表
        this.transactions.unshift(transaction);
        this.saveTransactions();

        // 更新界面
        this.updateBalance();
        this.updateRecentTransactions();
        this.updateMonthlyStats();

        // 重置表單
        form.reset();
        this.setCurrentDate();

        // 顯示成功訊息
        this.showMessage('交易新增成功！', 'success');

        // 切換到首頁
        this.switchTab('home');
    }

    // 更新餘額顯示
    updateBalance() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalIncome - totalExpense;

        document.getElementById('totalBalance').textContent = `NT$ ${balance.toLocaleString()}`;
        document.getElementById('totalIncome').textContent = `NT$ ${totalIncome.toLocaleString()}`;
        document.getElementById('totalExpense').textContent = `NT$ ${totalExpense.toLocaleString()}`;
    }

    // 更新最近交易
    updateRecentTransactions() {
        const recentList = document.getElementById('recentList');
        const recentTransactions = this.transactions.slice(0, 5);

        if (recentTransactions.length === 0) {
            recentList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📝</div>
                    <div class="message">還沒有交易記錄</div>
                    <div class="description">點擊上方按鈕開始記帳</div>
                </div>
            `;
            return;
        }

        recentList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}NT$ ${transaction.amount.toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    // 更新歷史記錄列表
    updateHistoryList() {
        const historyList = document.getElementById('historyList');
        let filteredTransactions = [...this.transactions];

        // 應用篩選
        const monthFilter = document.getElementById('monthFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;

        if (monthFilter) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.date.startsWith(monthFilter)
            );
        }

        if (categoryFilter) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.category === categoryFilter
            );
        }

        if (typeFilter) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.type === typeFilter
            );
        }

        if (filteredTransactions.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <div class="message">沒有找到符合條件的記錄</div>
                    <div class="description">試試調整篩選條件</div>
                </div>
            `;
            return;
        }

        historyList.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}NT$ ${transaction.amount.toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    // 設置篩選器選項
    setupFilters() {
        // 月份篩選器
        const monthFilter = document.getElementById('monthFilter');
        const months = [...new Set(this.transactions.map(t => t.date.substring(0, 7)))].sort().reverse();
        
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = this.formatMonth(month);
            monthFilter.appendChild(option);
        });

        // 分類篩選器
        const categoryFilter = document.getElementById('categoryFilter');
        const allCategories = [...new Set(this.transactions.map(t => t.category))].sort();
        
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // 應用篩選
    applyFilters() {
        this.updateHistoryList();
    }

    // 更新月度統計
    updateMonthlyStats() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyTransactions = this.transactions.filter(t => 
            t.date.startsWith(currentMonth)
        );

        const monthIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthExpense = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthBalance = monthIncome - monthExpense;

        document.getElementById('monthIncome').textContent = `NT$ ${monthIncome.toLocaleString()}`;
        document.getElementById('monthExpense').textContent = `NT$ ${monthExpense.toLocaleString()}`;
        document.getElementById('monthBalance').textContent = `NT$ ${monthBalance.toLocaleString()}`;
        document.getElementById('monthBalance').className = `stat-value ${monthBalance >= 0 ? 'income' : 'expense'}`;
    }

    // 更新統計頁面
    updateStats() {
        this.updateMonthlyStats();
        this.updateCategoryChart();
    }

    // 更新分類統計圖表
    updateCategoryChart() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyExpenses = this.transactions.filter(t => 
            t.date.startsWith(currentMonth) && t.type === 'expense'
        );

        if (monthlyExpenses.length === 0) {
            document.getElementById('categoryChart').innerHTML = `
                <div class="empty-state">
                    <div class="icon">📊</div>
                    <div class="message">本月還沒有支出記錄</div>
                </div>
            `;
            return;
        }

        // 計算各分類支出
        const categoryTotals = {};
        monthlyExpenses.forEach(transaction => {
            categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
        });

        // 生成簡單的條形圖
        const maxAmount = Math.max(...Object.values(categoryTotals));
        const chartHTML = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => {
                const percentage = (amount / maxAmount) * 100;
                return `
                    <div class="category-bar" style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span>${category}</span>
                            <span>NT$ ${amount.toLocaleString()}</span>
                        </div>
                        <div style="background: #e0e0e0; border-radius: 4px; height: 8px;">
                            <div style="background: var(--danger-color); height: 100%; width: ${percentage}%; border-radius: 4px;"></div>
                        </div>
                    </div>
                `;
            }).join('');

        document.getElementById('categoryChart').innerHTML = chartHTML;
    }

    // 顯示快速新增表單
    showAddForm(type) {
        this.switchType(type);
        this.switchTab('add');
    }

    // 儲存交易到本地存儲
    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    // 格式化月份
    formatMonth(monthString) {
        const [year, month] = monthString.split('-');
        return `${year}年${parseInt(month)}月`;
    }

    // 顯示訊息
    showMessage(message, type = 'info') {
        // 移除現有訊息
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 創建新訊息
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-toast';
        messageDiv.textContent = message;
        
        // 設置樣式
        messageDiv.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideDown 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;

        // 根據類型設置顏色
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#4CAF50';
        } else if (type === 'error') {
            messageDiv.style.backgroundColor = '#F44336';
        } else {
            messageDiv.style.backgroundColor = '#2196F3';
        }

        document.body.appendChild(messageDiv);

        // 3秒後移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
}

// 全域函數
function showAddForm(type) {
    window.app.showAddForm(type);
}

// 初始化應用
document.addEventListener('DOMContentLoaded', function() {
    window.app = new ExpenseTracker();
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translate(-50%, -100%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, 0);
                opacity: 1;
            }
        }
        
        @keyframes slideUp {
            from {
                transform: translate(-50%, 0);
                opacity: 1;
            }
            to {
                transform: translate(-50%, -100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});