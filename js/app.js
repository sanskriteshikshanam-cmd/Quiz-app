// Main application initialization
function initApp() {
    setupEventListeners();
    initDarkMode();
    
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            
            // Check if user is admin
            if (user.email === 'sanskriteshikshanam@gmail.com') {
                showAdminPanel();
            } else {
                showUserPanel();
            }
        } else {
            showLoginPage();
        }
    });
}

function setupEventListeners() {
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Auth tabs and toggles
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.getAttribute('data-tab')));
    });
    
    document.getElementById('switchToSignup').addEventListener('click', (e) => {
        e.preventDefault(); 
        switchAuthTab('signup'); 
    });
    
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault(); 
        switchAuthTab('login'); 
    });
    
    // Google login
    document.getElementById('googleLoginBtn').addEventListener('click', handleGoogleLogin);
    
    // Password toggles
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    
    // Menu system
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', openMenuSlide);
    });
    
    document.getElementById('closeMenu').addEventListener('click', closeMenuSlide);
    document.getElementById('menuOverlay').addEventListener('click', closeMenuSlide);
    
    // Menu navigation
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
    document.getElementById('contactPageBtn').addEventListener('click', showContactPage);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('darkModeSwitch').addEventListener('change', toggleDarkMode);
    
    // Quiz navigation
    document.getElementById('backFromQuiz').addEventListener('click', closeQuizSlide);
    document.getElementById('closeQuiz').addEventListener('click', closeQuizSlide);
    document.getElementById('nextQuestion').addEventListener('click', nextQuestion);
    document.getElementById('backToQuizzes').addEventListener('click', showUserPanel);
    
    // Back buttons
    document.getElementById('backFromLeaderboard').addEventListener('click', showUserPanel);
    document.getElementById('backFromContact').addEventListener('click', showUserPanel);
    document.getElementById('backFromResults').addEventListener('click', showUserPanel);
    document.getElementById('backFromAdmin').addEventListener('click', showUserPanel);
    
    // Admin navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            switchAdminSection(item, sectionId);
            
            // Load data for section
            if (sectionId === 'dashboard') loadDashboardData();
            if (sectionId === 'manageQuizzes') loadAdminQuizzes();
            if (sectionId === 'manageUsers') loadAdminUsers();
            if (sectionId === 'manageQuestions') loadAdminQuestions();
        });
    });
    
    // Admin modals and forms
    document.getElementById('addQuizBtn').addEventListener('click', openAddQuizModal);
    document.getElementById('addQuestionBtn').addEventListener('click', addNewQuestion);
    document.getElementById('closeQuizModal').addEventListener('click', closeAddQuizModal);
    document.getElementById('newQuizForm').addEventListener('submit', handleSaveNewQuiz);
    
    // Contact form
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        this.reset();
    });
}

function addNewQuestion() {
    showNotification('To add questions, edit an existing quiz and add questions there.', 'info');
}

// Start the application
document.addEventListener('DOMContentLoaded', initApp);
