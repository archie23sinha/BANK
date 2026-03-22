// Dashboard JavaScript for ASP Bank
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();

    // Set up event listeners
    setupEventListeners();

    // Update current date
    updateCurrentDate();
});

function initializeDashboard() {
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
        window.location.href = 'customer-login.html';
        return;
    }

    const user = auth.getCurrentUser();

    // Update dashboard based on user role
    if (user.role === 'employee') {
        document.getElementById('dashboard-title').textContent = 'Employee Dashboard';
        document.getElementById('dashboard-subtitle').textContent = 'Manage banking operations efficiently';
    }

    // Load user data
    loadUserData(user);

    // Load transactions
    loadTransactions();

    // Load notifications
    loadNotifications();
}

function loadUserData(user) {
    // Update account information
    document.getElementById('account-number').textContent = user.accountNumber || 'N/A';
    document.getElementById('account-holder').textContent = user.name || 'N/A';
    document.getElementById('account-email').textContent = user.email || 'N/A';
    document.getElementById('account-phone').textContent = user.contact || 'N/A';

    // Update navbar greeting
    auth.updateNavbar();
}

function loadTransactions() {
    const transactions = auth.getUserTransactions();
    const transactionsList = document.getElementById('transactions-list');

    if (transactions.length === 0) {
        transactionsList.innerHTML = '<div class="transaction-item"><div class="transaction-details"><h4>No transactions yet</h4><p>Your transaction history will appear here</p></div></div>';
        return;
    }

    // Display recent transactions (last 4)
    const recentTransactions = transactions.slice(0, 4);
    transactionsList.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-icon">
                <i class="fas fa-${getTransactionIcon(transaction.type)}"></i>
            </div>
            <div class="transaction-details">
                <h4>${transaction.description || 'Transaction'}</h4>
                <p>${transaction.type}</p>
                <span class="transaction-date">${formatDate(transaction.date)}</span>
            </div>
            <div class="transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                ${transaction.amount >= 0 ? '+' : ''}₹${Math.abs(transaction.amount).toLocaleString()}
            </div>
        </div>
    `).join('');
}

function loadNotifications() {
    // For demo purposes, notifications are static
    // In a real app, these would come from the server
    const notifications = [
        {
            id: 1,
            type: 'security',
            title: 'Security Alert',
            message: 'New login detected from Chrome browser',
            time: '2 hours ago',
            unread: true
        },
        {
            id: 2,
            type: 'offer',
            title: 'Special Offer',
            message: 'Get 5% cashback on online shopping this month',
            time: '1 day ago',
            unread: false
        },
        {
            id: 3,
            type: 'bill',
            title: 'Bill Payment Due',
            message: 'Your electricity bill of ₹2,450 is due tomorrow',
            time: '2 days ago',
            unread: false
        }
    ];

    // Mark first notification as read after viewing
    setTimeout(() => {
        const firstNotification = document.querySelector('.notification-item.unread');
        if (firstNotification) {
            firstNotification.classList.remove('unread');
        }
    }, 3000);
}

function setupEventListeners() {
    // Transfer form submission
    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
    }

    // Navigation links
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
        });
    });
}

function handleTransfer(e) {
    e.preventDefault();

    const recipientAccount = document.getElementById('recipient-account').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const description = document.getElementById('transfer-description').value;

    if (!recipientAccount || !amount || amount <= 0) {
        showError('Please fill in all required fields with valid values');
        return;
    }

    try {
        const user = auth.getCurrentUser();
        const transaction = auth.transferMoney(user.accountNumber, recipientAccount, amount, description);

        // Update UI
        loadUserData(auth.getCurrentUser());
        loadTransactions();

        // Show success message
        showSuccess(`Successfully transferred ₹${amount.toLocaleString()} to account ${recipientAccount}`);

        // Close modal
        closeModal();

        // Reset form
        e.target.reset();

    } catch (error) {
        showError(error.message);
    }
}

function openTransferModal() {
    const modal = document.getElementById('transfer-modal');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
}

function closeModal() {
    const modal = document.getElementById('transfer-modal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function showSection(sectionName) {
    // For now, just scroll to top
    // In a full implementation, this would show different sections
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // You could implement tabbed sections here
    alert(`Navigating to ${sectionName} section`);
}

function showAllTransactions() {
    showSection('transactions');
}

function showAllNotifications() {
    showSection('notifications');
}

// Utility functions
function formatCurrency(amount) {
    return amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTransactionIcon(type) {
    const icons = {
        'transfer': 'exchange-alt',
        'deposit': 'plus',
        'withdrawal': 'minus',
        'payment': 'credit-card',
        'shopping': 'shopping-cart',
        'dining': 'utensils',
        'salary': 'money-bill-wave'
    };
    return icons[type] || 'circle';
}

function updateCurrentDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-IN', options);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('auth-error');
    errorDiv.textContent = message;
    errorDiv.className = 'success-message';
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showError(message) {
    const errorDiv = document.getElementById('auth-error');
    errorDiv.textContent = message;
    errorDiv.className = 'error-message';
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Add some interactive features
document.addEventListener('click', function(e) {
    // Close modal when clicking outside
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Add smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for actions
function addLoadingState(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
}

function removeLoadingState(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}