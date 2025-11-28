// js/auth.js - FIXED VERSION
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError(document.getElementById('loginError'), 'Please fill in all fields.');
        return;
    }
    
    showLoading('login');
    document.getElementById('loginError').style.display = 'none';
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Login successful for:', userCredential.user.email);
            hideLoading('login');
            // Page navigation will happen automatically via auth state listener
        })
        .catch((error) => {
            hideLoading('login');
            let errorMessage = 'Authentication failed. Please check email and password.';
            
            switch (error.code) {
                case 'auth/invalid-email':
                case 'auth/user-not-found':
                    errorMessage = 'No user found for this email. Please sign up first.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                default:
                    errorMessage = `Login error: ${error.message}`;
            }
            
            showError(document.getElementById('loginError'), errorMessage);
        });
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showError(document.getElementById('signupError'), 'Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        showError(document.getElementById('signupError'), 'Password should be at least 6 characters.');
        return;
    }

    showLoading('signup');
    document.getElementById('signupError').style.display = 'none';

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Store user data in Firestore
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalQuizzes: 0,
                averageScore: 0
            });
        })
        .then(() => {
            showSuccess(document.getElementById('signupSuccess'), 'Account created successfully! You can now login.');
            hideLoading('signup');
            // DON'T auto-redirect - let user login manually
            document.getElementById('signupForm').reset();
        })
        .catch((error) => {
            hideLoading('signup');
            let errorMessage = 'Signup failed. Please try again.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak.';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            showError(document.getElementById('signupError'), errorMessage);
        });
}

function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            // Check if user exists in Firestore, if not create them
            const user = result.user;
            const userRef = db.collection('users').doc(user.uid);
            
            return userRef.get().then(doc => {
                if (!doc.exists) {
                    return userRef.set({
                        name: user.displayName,
                        email: user.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        totalQuizzes: 0,
                        averageScore: 0
                    });
                }
            });
        })
        .catch((error) => {
            console.error('Google login error:', error);
            showNotification('Google login failed. Please try again.', 'error');
        });
}

function handleLogout() {
    auth.signOut().then(() => {
        currentUser = null;
        closeMenuSlide();
        showLoginPage();
    });
}

function showLoading(type) {
    const btn = document.getElementById(type + 'Btn');
    const text = document.getElementById(type + 'BtnText');
    const spinner = document.getElementById(type + 'Spinner');
    
    text.textContent = type === 'login' ? 'Logging in...' : 'Creating Account...';
    spinner.style.display = 'inline-block';
    btn.disabled = true;
}

function hideLoading(type) {
    const btn = document.getElementById(type + 'Btn');
    const text = document.getElementById(type + 'BtnText');
    const spinner = document.getElementById(type + 'Spinner');
    
    text.textContent = type === 'login' ? 'Login' : 'Create Account';
    spinner.style.display = 'none';
    btn.disabled = false;
}

function switchAuthTab(tabId) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === tabId + 'Form');
    });
    
    // Clear errors
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'none';
}
