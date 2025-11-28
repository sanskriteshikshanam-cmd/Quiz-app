// Quiz functions
async function loadQuizzes() {
    const quizList = document.getElementById('quizList');
    quizList.innerHTML = '<div class="quiz-card"><div class="quiz-title">Loading quizzes...</div></div>';
    
    try {
        const snapshot = await db.collection('quizzes').get();
        allQuizzes = [];
        
        if (snapshot.empty) {
            quizList.innerHTML = `
                <div class="quiz-card">
                    <div class="quiz-title">No Quizzes Available</div>
                    <div class="quiz-description">Please check back later or contact administrator.</div>
                    <div class="quiz-meta"><i class="fas fa-info-circle"></i> 0 questions</div>
                </div>
            `;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const quiz = { id: doc.id, ...doc.data() };
            allQuizzes.push(quiz);
            
            html += `
                <div class="quiz-card" onclick="startQuiz('${doc.id}')">
                    <div class="quiz-title">${quiz.title || 'Untitled Quiz'}</div>
                    <div class="quiz-description">${quiz.description || 'Test your knowledge with this quiz.'}</div>
                    <div class="quiz-meta">
                        <i class="fas fa-question-circle"></i> 
                        ${quiz.questions ? quiz.questions.length : 0} questions • 
                        ${quiz.difficulty || 'Easy'}
                    </div>
                </div>
            `;
        });
        quizList.innerHTML = html;
    } catch (error) {
        console.error('Error loading quizzes:', error);
        quizList.innerHTML = '<div class="quiz-card"><div class="quiz-title">Error loading quizzes</div></div>';
    }
}

function startQuiz(quizId) {
    const quiz = allQuizzes.find(q => q.id === quizId);
    if (!quiz) {
        showNotification('Quiz not found', 'error');
        return;
    }

    currentQuiz = quiz;
    currentQuestionIndex = 0;
    userAnswers = [];
    
    document.getElementById('quizTitle').textContent = quiz.title;
    showQuizSlide();
    loadQuestion();
    updateQuestionIndicators();
}

function loadQuestion() {
    if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
        showNotification('No questions available in this quiz', 'error');
        return;
    }

    const question = currentQuiz.questions[currentQuestionIndex];
    document.getElementById('questionText').textContent = question.text;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    if (question.options && question.options.length > 0) {
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = `option ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`;
            optionElement.textContent = option;
            optionElement.onclick = () => selectOption(index);
            optionsContainer.appendChild(optionElement);
        });
    } else {
        optionsContainer.innerHTML = '<div class="option">No options available</div>';
    }

    updateQuestionIndicators();
}

function selectOption(optionIndex) {
    // Remove selected class from all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.target.classList.add('selected');
    
    // Store answer
    userAnswers[currentQuestionIndex] = optionIndex;
    updateQuestionIndicators();
}

function updateQuestionIndicators() {
    const indicatorsContainer = document.getElementById('questionIndicators');
    indicatorsContainer.innerHTML = '';
    
    if (!currentQuiz || !currentQuiz.questions) return;
    
    currentQuiz.questions.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = `question-indicator ${index === currentQuestionIndex ? 'current' : ''} ${userAnswers[index] !== undefined ? 'answered' : ''}`;
        indicator.textContent = index + 1;
        indicator.onclick = () => goToQuestion(index);
        indicatorsContainer.appendChild(indicator);
    });
}

function goToQuestion(index) {
    if (index >= 0 && index < currentQuiz.questions.length) {
        currentQuestionIndex = index;
        loadQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        submitQuiz();
    }
}

async function submitQuiz() {
    if (!currentQuiz || !currentUser) return;

    let correctAnswers = 0;
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });

    const score = correctAnswers / currentQuiz.questions.length;
    
    // Save result to Firestore
    try {
        await db.collection('results').add({
            userId: currentUser.uid,
            quizId: currentQuiz.id,
            quizTitle: currentQuiz.title,
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: currentQuiz.questions.length,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update user's average score
        await updateUserStats(score);
        
    } catch (error) {
        console.error('Error saving result:', error);
    }

    showResults(correctAnswers, currentQuiz.questions.length);
}

async function updateUserStats(score) {
    if (!currentUser) return;
    
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const totalQuizzes = (userData.totalQuizzes || 0) + 1;
            const averageScore = userData.averageScore 
                ? (userData.averageScore * (totalQuizzes - 1) + score) / totalQuizzes
                : score;
            
            await userRef.update({
                totalQuizzes: totalQuizzes,
                averageScore: averageScore,
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

function showResults(correct, total) {
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);
    
    document.getElementById('scoreCircle').textContent = percentage + '%';
    document.getElementById('correctAnswers').textContent = correct;
    document.getElementById('totalQuestions').textContent = total;
    document.getElementById('wrongAnswers').textContent = wrong;
    
    closeQuizSlide();
    showResultsPage();
}

async function loadLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '<li class="leaderboard-item"><div style="text-align: center; color: var(--text-light);">Loading leaderboard...</div></li>';
    
    try {
        const snapshot = await db.collection('results')
            .orderBy('score', 'desc')
            .limit(10)
            .get();

        if (snapshot.empty) {
            leaderboardList.innerHTML = '<li class="leaderboard-item"><div style="text-align: center; color: var(--text-light);">No results yet. Be the first to take a quiz!</div></li>';
            return;
        }

        let html = '';
        let rank = 1;
        
        for (const doc of snapshot.docs) {
            const result = doc.data();
            const userDoc = await db.collection('users').doc(result.userId).get();
            const user = userDoc.data();
            
            html += `
                <li class="leaderboard-item">
                    <div class="leaderboard-rank ${rank <= 3 ? 'top' : ''}">${rank}</div>
                    <div class="leaderboard-user">
                        <div class="leaderboard-avatar">
                            ${user?.name?.charAt(0) || 'U'}
                        </div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${user?.name || 'Anonymous User'}</div>
                            <div class="leaderboard-email">${user?.email || ''}</div>
                        </div>
                    </div>
                    <div class="leaderboard-score">${Math.round(result.score * 100)}%</div>
                </li>
            `;
            rank++;
        }
        leaderboardList.innerHTML = html;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardList.innerHTML = '<li class="leaderboard-item"><div style="text-align: center; color: var(--danger);">Error loading leaderboard</div></li>';
    }
}
