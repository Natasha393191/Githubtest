// Personal Finance Tracker JavaScript

// Data storage
let financeData = {
    income: [],
    expenses: [],
    assets: [],
    liabilities: []
};

// Load data from localStorage on page load
function loadData() {
    const savedData = localStorage.getItem('financeTrackerData');
    if (savedData) {
        financeData = JSON.parse(savedData);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('financeTrackerData', JSON.stringify(financeData));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeNavigation();
    initializeForms();
    updateCurrentDate();
    updateDashboard();
    renderAllLists();
});

// Navigation functionality
function initializeNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const contentSections = document.querySelectorAll('.content-section');

    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and sections
            navTabs.forEach(t => t.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Form initialization
function initializeForms() {
    // Income form
    const incomeForm = document.getElementById('income-form');
    incomeForm.addEventListener('submit', handleIncomeSubmit);

    // Expense form
    const expenseForm = document.getElementById('expense-form');
    expenseForm.addEventListener('submit', handleExpenseSubmit);

    // Asset form
    const assetForm = document.getElementById('asset-form');
    assetForm.addEventListener('submit', handleAssetSubmit);

    // Liability form
    const liabilityForm = document.getElementById('liability-form');
    liabilityForm.addEventListener('submit', handleLiabilitySubmit);

    // Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('income-date').value = today;
    document.getElementById('expense-date').value = today;
    document.getElementById('liability-due').value = today;
}

// Form submission handlers
function handleIncomeSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const incomeEntry = {
        id: Date.now(),
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        date: formData.get('date'),
        type: 'income'
    };

    financeData.income.push(incomeEntry);
    saveData();
    updateDashboard();
    renderIncomeList();
    e.target.reset();
    
    // Reset date to today
    document.getElementById('income-date').value = new Date().toISOString().split('T')[0];
    
    showNotification('Income added successfully!', 'success');
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const expenseEntry = {
        id: Date.now(),
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        date: formData.get('date'),
        type: 'expense'
    };

    financeData.expenses.push(expenseEntry);
    saveData();
    updateDashboard();
    renderExpenseList();
    e.target.reset();
    
    // Reset date to today
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    
    showNotification('Expense added successfully!', 'success');
}

function handleAssetSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const assetEntry = {
        id: Date.now(),
        name: formData.get('name'),
        value: parseFloat(formData.get('value')),
        category: formData.get('category'),
        dateAdded: new Date().toISOString().split('T')[0]
    };

    financeData.assets.push(assetEntry);
    saveData();
    updateDashboard();
    renderAssetList();
    e.target.reset();
    
    showNotification('Asset added successfully!', 'success');
}

function handleLiabilitySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const liabilityEntry = {
        id: Date.now(),
        name: formData.get('name'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        due: formData.get('due'),
        dateAdded: new Date().toISOString().split('T')[0]
    };

    financeData.liabilities.push(liabilityEntry);
    saveData();
    updateDashboard();
    renderLiabilityList();
    e.target.reset();
    
    // Reset date to today
    document.getElementById('liability-due').value = new Date().toISOString().split('T')[0];
    
    showNotification('Liability added successfully!', 'success');
}

// Dashboard calculations and updates
function updateDashboard() {
    const totalIncome = financeData.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = financeData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalAssets = financeData.assets.reduce((sum, item) => sum + item.value, 0);
    const netBalance = totalIncome - totalExpenses;

    // Update dashboard cards
    document.querySelector('.summary-card:nth-child(1) .amount').textContent = formatCurrency(totalIncome);
    document.querySelector('.summary-card:nth-child(2) .amount').textContent = formatCurrency(totalExpenses);
    document.querySelector('.summary-card:nth-child(3) .amount').textContent = formatCurrency(netBalance);
    document.querySelector('.summary-card:nth-child(4) .amount').textContent = formatCurrency(totalAssets);

    // Update net balance color
    const netBalanceElement = document.querySelector('.summary-card:nth-child(3) .amount');
    netBalanceElement.className = 'amount';
    if (netBalance > 0) {
        netBalanceElement.classList.add('success');
    } else if (netBalance < 0) {
        netBalanceElement.classList.add('danger');
    }

    // Update recent transactions
    renderRecentTransactions();
}

// Render functions
function renderAllLists() {
    renderIncomeList();
    renderExpenseList();
    renderAssetList();
    renderLiabilityList();
}

function renderIncomeList() {
    const container = document.querySelector('.income-list .transaction-list');
    
    if (financeData.income.length === 0) {
        container.innerHTML = '<p class="no-data">No income entries yet.</p>';
        return;
    }

    const sortedIncome = [...financeData.income].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedIncome.map(item => `
        <div class="transaction-item">
            <div class="transaction-details">
                <h4>${item.description}</h4>
                <div class="transaction-meta">
                    <span>Category: ${item.category}</span>
                    <span>Date: ${formatDate(item.date)}</span>
                </div>
            </div>
            <div class="transaction-amount income">+${formatCurrency(item.amount)}</div>
            <button class="btn-delete" onclick="deleteItem('income', ${item.id})" title="Delete">×</button>
        </div>
    `).join('');
}

function renderExpenseList() {
    const container = document.querySelector('.expense-list .transaction-list');
    
    if (financeData.expenses.length === 0) {
        container.innerHTML = '<p class="no-data">No expense entries yet.</p>';
        return;
    }

    const sortedExpenses = [...financeData.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedExpenses.map(item => `
        <div class="transaction-item">
            <div class="transaction-details">
                <h4>${item.description}</h4>
                <div class="transaction-meta">
                    <span>Category: ${item.category}</span>
                    <span>Date: ${formatDate(item.date)}</span>
                </div>
            </div>
            <div class="transaction-amount expense">-${formatCurrency(item.amount)}</div>
            <button class="btn-delete" onclick="deleteItem('expenses', ${item.id})" title="Delete">×</button>
        </div>
    `).join('');
}

function renderAssetList() {
    const container = document.querySelector('.asset-list .transaction-list');
    
    if (financeData.assets.length === 0) {
        container.innerHTML = '<p class="no-data">No assets added yet.</p>';
        return;
    }

    const sortedAssets = [...financeData.assets].sort((a, b) => b.value - a.value);
    
    container.innerHTML = sortedAssets.map(item => `
        <div class="transaction-item">
            <div class="transaction-details">
                <h4>${item.name}</h4>
                <div class="transaction-meta">
                    <span>Category: ${item.category}</span>
                    <span>Added: ${formatDate(item.dateAdded)}</span>
                </div>
            </div>
            <div class="transaction-amount primary">${formatCurrency(item.value)}</div>
            <button class="btn-delete" onclick="deleteItem('assets', ${item.id})" title="Delete">×</button>
        </div>
    `).join('');
}

function renderLiabilityList() {
    const container = document.querySelector('.liability-list .transaction-list');
    
    if (financeData.liabilities.length === 0) {
        container.innerHTML = '<p class="no-data">No liabilities added yet.</p>';
        return;
    }

    const sortedLiabilities = [...financeData.liabilities].sort((a, b) => new Date(a.due) - new Date(b.due));
    
    container.innerHTML = sortedLiabilities.map(item => {
        const dueDate = new Date(item.due);
        const today = new Date();
        const isOverdue = dueDate < today;
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="transaction-item ${isOverdue ? 'overdue' : ''}">
                <div class="transaction-details">
                    <h4>${item.name}</h4>
                    <div class="transaction-meta">
                        <span>Category: ${item.category}</span>
                        <span>Due: ${formatDate(item.due)} ${isOverdue ? '(OVERDUE)' : daysUntilDue <= 7 ? '(Due Soon)' : ''}</span>
                    </div>
                </div>
                <div class="transaction-amount danger">${formatCurrency(item.amount)}</div>
                <button class="btn-delete" onclick="deleteItem('liabilities', ${item.id})" title="Delete">×</button>
            </div>
        `;
    }).join('');
}

function renderRecentTransactions() {
    const container = document.querySelector('.recent-transactions .transaction-list');
    
    // Combine all transactions
    const allTransactions = [
        ...financeData.income.map(item => ({...item, type: 'income'})),
        ...financeData.expenses.map(item => ({...item, type: 'expense'}))
    ];

    if (allTransactions.length === 0) {
        container.innerHTML = '<p class="no-data">No transactions yet. Add some income or expenses to get started!</p>';
        return;
    }

    // Sort by date (most recent first) and take only the last 5
    const recentTransactions = allTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    container.innerHTML = recentTransactions.map(item => `
        <div class="transaction-item">
            <div class="transaction-details">
                <h4>${item.description}</h4>
                <div class="transaction-meta">
                    <span>Category: ${item.category}</span>
                    <span>Date: ${formatDate(item.date)}</span>
                </div>
            </div>
            <div class="transaction-amount ${item.type}">
                ${item.type === 'income' ? '+' : '-'}${formatCurrency(item.amount)}
            </div>
        </div>
    `).join('');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function updateCurrentDate() {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-date').textContent = today;
}

function deleteItem(type, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        financeData[type] = financeData[type].filter(item => item.id !== id);
        saveData();
        updateDashboard();
        renderAllLists();
        showNotification('Item deleted successfully!', 'success');
    }
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? 'var(--success-green)' : 'var(--danger-red)'};
        color: white;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Export data functionality (bonus feature)
function exportData() {
    const dataStr = JSON.stringify(financeData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
}

// Import data functionality (bonus feature)
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
                saveData();
                updateDashboard();
                renderAllLists();
                showNotification('Data imported successfully!', 'success');
            } else {
                throw new Error('Invalid file format');
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
        const tabs = document.querySelectorAll('.nav-tab');
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