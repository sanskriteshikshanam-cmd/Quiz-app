// UI functions
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showLoginPage() { 
    showPage('authPage');
    closeMenuSlide();
}

function showUserPanel() { 
    showPage('userPanel');
    if (currentUser) {
        const userDisplayName = currentUser.displayName || currentUser.email.split('@')[0];
        document.getElementById('userName').textContent = userDisplayName;
        const resultsUserNameEl = document.getElementById('resultsUserName');
        if (resultsUserNameEl) resultsUserNameEl.textContent = userDisplayName;
    }
    loadQuizzes();
}

function showAdminPanel() { 
    showPage('adminPanel');
    loadDashboardData();
}

function showLeaderboard() {
    showPage('leaderboardPage');
    loadLeaderboard();
    closeMenuSlide();
}

function showContactPage() {
    showPage('contactPage');
    closeMenuSlide();
}

function showResultsPage() {
    showPage('resultsPage');
}

function showQuizSlide() {
    document.getElementById('quizSlide').classList.add('active');
}

function closeQuizSlide() {
    document.getElementById('quizSlide').classList.remove('active');
}

function openMenuSlide() { 
    document.getElementById('menu').classList.add('active'); 
    document.getElementById('menuOverlay').classList.add('active'); 
}

function closeMenuSlide() { 
    document.getElementById('menu').classList.remove('active'); 
    document.getElementById('menuOverlay').classList.remove('active'); 
}

function openAddQuizModal() { 
    document.getElementById('addNewQuizModal').classList.add('active'); 
}

function closeAddQuizModal() { 
    document.getElementById('addNewQuizModal').classList.remove('active'); 
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} alert-icon"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function showError(element, message) {
    element.querySelector('span').textContent = message;
    element.style.display = 'flex';
}

function showSuccess(element, message) {
    element.querySelector('span').textContent = message;
    element.style.display = 'flex';
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    document.getElementById('darkModeSwitch').checked = isDarkMode;
}

// Initialize dark mode from localStorage
function initDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeSwitch').checked = true;
    }
}
