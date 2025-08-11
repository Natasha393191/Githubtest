// Personal Finance Tracker JavaScript

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const currentDateElement = document.getElementById('current-date');

// Data storage (using localStorage)
let financeData = {
    income: JSON.parse(localStorage.getItem('income')) || [],
    expenses: JSON.parse(localStorage.getItem('expenses')) || [],
    assets: JSON.parse(localStorage.getItem('assets')) || [],
    liabilities: JSON.parse(localStorage.getItem('liabilities')) || []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateDashboard();
    displayCurrentDate();
});

// Initialize application
function initializeApp() {
    // Set default date inputs to today
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
    
    // Load and display existing data
    displayIncomeHistory();
    displayExpenseHistory();
    displayAssetPortfolio();
    displayLiabilityList();
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    navLinks.forEach(link => {
        link.addEventListener('click', handleTabSwitch);
    });
    
    // Form submissions
    document.querySelector('.income-form').addEventListener('submit', handleIncomeSubmission);
    document.querySelector('.expense-form').addEventListener('submit', handleExpenseSubmission);
    document.querySelector('.asset-form').addEventListener('submit', handleAssetSubmission);
    document.querySelector('.liability-form').addEventListener('submit', handleLiabilitySubmission);
}

// Tab switching functionality
function handleTabSwitch(e) {
    const targetTab = e.target.dataset.tab;
    
    // Remove active class from all nav links and tab contents
    navLinks.forEach(link => link.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked nav link and corresponding tab content
    e.target.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
}

// Display current date in footer
function displayCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Income form handling
function handleIncomeSubmission(e) {
    e.preventDefault();
    
    const source = document.getElementById('income-source').value.trim();
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value;
    
    if (!source || !amount || !date) {
        showNotification('Please fill in all income fields', 'error');
        return;
    }
    
    const incomeEntry = {
        id: generateId(),
        source,
        amount,
        date,
        timestamp: new Date().toISOString()
    };
    
    financeData.income.push(incomeEntry);
    saveToLocalStorage('income', financeData.income);
    
    // Reset form and update displays
    e.target.reset();
    document.getElementById('income-date').value = new Date().toISOString().split('T')[0];
    displayIncomeHistory();
    updateDashboard();
    
    showNotification('Income added successfully!', 'success');
}

// Expense form handling
function handleExpenseSubmission(e) {
    e.preventDefault();
    
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    
    if (!category || !description || !amount || !date) {
        showNotification('Please fill in all expense fields', 'error');
        return;
    }
    
    const expenseEntry = {
        id: generateId(),
        category,
        description,
        amount,
        date,
        timestamp: new Date().toISOString()
    };
    
    financeData.expenses.push(expenseEntry);
    saveToLocalStorage('expenses', financeData.expenses);
    
    // Reset form and update displays
    e.target.reset();
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    displayExpenseHistory();
    updateDashboard();
    
    showNotification('Expense added successfully!', 'success');
}

// Asset form handling
function handleAssetSubmission(e) {
    e.preventDefault();
    
    const name = document.getElementById('asset-name').value.trim();
    const type = document.getElementById('asset-type').value;
    const value = parseFloat(document.getElementById('asset-value').value);
    
    if (!name || !type || !value) {
        showNotification('Please fill in all asset fields', 'error');
        return;
    }
    
    const assetEntry = {
        id: generateId(),
        name,
        type,
        value,
        timestamp: new Date().toISOString()
    };
    
    financeData.assets.push(assetEntry);
    saveToLocalStorage('assets', financeData.assets);
    
    // Reset form and update displays
    e.target.reset();
    displayAssetPortfolio();
    updateDashboard();
    
    showNotification('Asset added successfully!', 'success');
}

// Liability form handling
function handleLiabilitySubmission(e) {
    e.preventDefault();
    
    const name = document.getElementById('liability-name').value.trim();
    const type = document.getElementById('liability-type').value;
    const amount = parseFloat(document.getElementById('liability-amount').value);
    const rate = parseFloat(document.getElementById('liability-rate').value) || 0;
    
    if (!name || !type || !amount) {
        showNotification('Please fill in all required liability fields', 'error');
        return;
    }
    
    const liabilityEntry = {
        id: generateId(),
        name,
        type,
        amount,
        rate,
        timestamp: new Date().toISOString()
    };
    
    financeData.liabilities.push(liabilityEntry);
    saveToLocalStorage('liabilities', financeData.liabilities);
    
    // Reset form and update displays
    e.target.reset();
    displayLiabilityList();
    updateDashboard();
    
    showNotification('Liability added successfully!', 'success');
}

// Display income history
function displayIncomeHistory() {
    const incomeList = document.querySelector('.income-list');
    
    if (financeData.income.length === 0) {
        incomeList.innerHTML = '<p class="no-data">No income entries yet.</p>';
        return;
    }
    
    const sortedIncome = [...financeData.income].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    incomeList.innerHTML = sortedIncome.map(income => `
        <div class="income-item" data-id="${income.id}">
            <div class="item-details">
                <div class="item-name">${income.source}</div>
                <div class="item-date">${formatDate(income.date)}</div>
            </div>
            <div class="item-amount success">+$${income.amount.toFixed(2)}</div>
            <button class="btn-delete" onclick="deleteItem('income', '${income.id}')" title="Delete">×</button>
        </div>
    `).join('');
}

// Display expense history
function displayExpenseHistory() {
    const expenseList = document.querySelector('.expense-list');
    
    if (financeData.expenses.length === 0) {
        expenseList.innerHTML = '<p class="no-data">No expense entries yet.</p>';
        return;
    }
    
    const sortedExpenses = [...financeData.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    expenseList.innerHTML = sortedExpenses.map(expense => `
        <div class="expense-item" data-id="${expense.id}">
            <div class="item-details">
                <div class="item-name">${expense.description}</div>
                <div class="item-category">${formatCategory(expense.category)}</div>
                <div class="item-date">${formatDate(expense.date)}</div>
            </div>
            <div class="item-amount danger">-$${expense.amount.toFixed(2)}</div>
            <button class="btn-delete" onclick="deleteItem('expenses', '${expense.id}')" title="Delete">×</button>
        </div>
    `).join('');
}

// Display asset portfolio
function displayAssetPortfolio() {
    const assetList = document.querySelector('.asset-list');
    
    if (financeData.assets.length === 0) {
        assetList.innerHTML = '<p class="no-data">No assets recorded yet.</p>';
        return;
    }
    
    const sortedAssets = [...financeData.assets].sort((a, b) => b.value - a.value);
    
    assetList.innerHTML = sortedAssets.map(asset => `
        <div class="asset-item" data-id="${asset.id}">
            <div class="item-details">
                <div class="item-name">${asset.name}</div>
                <div class="item-category">${formatCategory(asset.type)}</div>
            </div>
            <div class="item-amount primary">$${asset.value.toFixed(2)}</div>
            <button class="btn-delete" onclick="deleteItem('assets', '${asset.id}')" title="Delete">×</button>
        </div>
    `).join('');
}

// Display liability list
function displayLiabilityList() {
    const liabilityList = document.querySelector('.liability-list');
    
    if (financeData.liabilities.length === 0) {
        liabilityList.innerHTML = '<p class="no-data">No liabilities recorded yet.</p>';
        return;
    }
    
    const sortedLiabilities = [...financeData.liabilities].sort((a, b) => b.amount - a.amount);
    
    liabilityList.innerHTML = sortedLiabilities.map(liability => `
        <div class="liability-item" data-id="${liability.id}">
            <div class="item-details">
                <div class="item-name">${liability.name}</div>
                <div class="item-category">${formatCategory(liability.type)} ${liability.rate > 0 ? `(${liability.rate}% APR)` : ''}</div>
            </div>
            <div class="item-amount danger">$${liability.amount.toFixed(2)}</div>
            <button class="btn-delete" onclick="deleteItem('liabilities', '${liability.id}')" title="Delete">×</button>
        </div>
    `).join('');
}

// Update dashboard summary
function updateDashboard() {
    const totalIncome = financeData.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = financeData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalAssets = financeData.assets.reduce((sum, item) => sum + item.value, 0);
    const totalLiabilities = financeData.liabilities.reduce((sum, item) => sum + item.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    const monthlyBudget = totalIncome - totalExpenses;
    
    // Update summary cards
    updateSummaryCard('.dashboard-grid .summary-card:nth-child(1) .amount', `$${totalIncome.toFixed(2)}`);
    updateSummaryCard('.dashboard-grid .summary-card:nth-child(2) .amount', `$${totalExpenses.toFixed(2)}`);
    updateSummaryCard('.dashboard-grid .summary-card:nth-child(3) .amount', `$${netWorth.toFixed(2)}`);
    updateSummaryCard('.dashboard-grid .summary-card:nth-child(4) .amount', `$${monthlyBudget.toFixed(2)}`);
    
    // Update recent transactions
    updateRecentTransactions();
}

// Update summary card value
function updateSummaryCard(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

// Update recent transactions display
function updateRecentTransactions() {
    const transactionList = document.querySelector('.transaction-list');
    
    // Combine and sort all transactions by date
    const allTransactions = [
        ...financeData.income.map(item => ({...item, type: 'income', displayName: item.source})),
        ...financeData.expenses.map(item => ({...item, type: 'expense', displayName: item.description}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (allTransactions.length === 0) {
        transactionList.innerHTML = '<p class="no-data">No transactions yet. Start by adding income or expenses!</p>';
        return;
    }
    
    transactionList.innerHTML = allTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="item-details">
                <div class="item-name">${transaction.displayName}</div>
                <div class="item-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="item-amount ${transaction.type === 'income' ? 'success' : 'danger'}">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Delete item functionality
function deleteItem(category, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        financeData[category] = financeData[category].filter(item => item.id !== id);
        saveToLocalStorage(category, financeData[category]);
        
        // Refresh displays
        switch(category) {
            case 'income':
                displayIncomeHistory();
                break;
            case 'expenses':
                displayExpenseHistory();
                break;
            case 'assets':
                displayAssetPortfolio();
                break;
            case 'liabilities':
                displayLiabilityList();
                break;
        }
        
        updateDashboard();
        showNotification('Item deleted successfully!', 'success');
    }
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            notification.style.backgroundColor = '#e74c3c';
            break;
        default:
            notification.style.backgroundColor = '#3498db';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export/Import functionality (for future enhancement)
function exportData() {
    const dataStr = JSON.stringify(financeData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (importedData.income && importedData.expenses && importedData.assets && importedData.liabilities) {
                financeData = importedData;
                
                // Save to localStorage
                Object.keys(financeData).forEach(key => {
                    saveToLocalStorage(key, financeData[key]);
                });
                
                // Refresh all displays
                displayIncomeHistory();
                displayExpenseHistory();
                displayAssetPortfolio();
                displayLiabilityList();
                updateDashboard();
                
                showNotification('Data imported successfully!', 'success');
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            showNotification('Error importing data. Please check file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + 1-5 for tab navigation
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabs = document.querySelectorAll('.nav-link');
        if (tabs[tabIndex]) {
            tabs[tabIndex].click();
        }
    }
});

// Service worker registration for offline support (if needed in the future)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker registration code would go here
        // navigator.serviceWorker.register('/sw.js');
    });
}