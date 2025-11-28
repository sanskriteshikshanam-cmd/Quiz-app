// Admin functions
async function loadDashboardData() {
    try {
        const totalQuizzes = await fetchTotalQuizzesTaken();
        const userCount = await fetchUserCount();
        const quizCount = await fetchQuizCount();
        const avgScore = await fetchAverageScore();

        document.getElementById('totalQuizzesTaken').textContent = totalQuizzes.toLocaleString();
        document.getElementById('registeredUsers').textContent = userCount.toLocaleString();
        document.getElementById('activeQuizzes').textContent = quizCount.toLocaleString();
        document.getElementById('averageScore').textContent = avgScore + '%';
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function fetchQuizCount() {
    try {
        const snapshot = await db.collection('quizzes').get();
        return snapshot.size;
    } catch (error) {
        console.error('Error fetching quiz count:', error);
        return 0;
    }
}

async function fetchUserCount() {
    try {
        const snapshot = await db.collection('users').get();
        return snapshot.size;
    } catch (error) {
        console.error('Error fetching user count:', error);
        return 0;
    }
}

async function fetchTotalQuizzesTaken() {
    try {
        const snapshot = await db.collection('results').get();
        return snapshot.size;
    } catch (error) {
        console.error('Error fetching total quizzes:', error);
        return 0;
    }
}

async function fetchAverageScore() {
    try {
        const snapshot = await db.collection('results').get();
        if (snapshot.empty) return 0;
        
        let totalScore = 0;
        snapshot.forEach(doc => {
            totalScore += doc.data().score || 0;
        });
        
        return Math.round((totalScore / snapshot.size) * 100);
    } catch (error) {
        console.error('Error fetching average score:', error);
        return 0;
    }
}

async function loadAdminQuizzes() {
    const adminQuizList = document.getElementById('adminQuizList');
    adminQuizList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">Loading quizzes...</td></tr>';
    
    try {
        const snapshot = await db.collection('quizzes').get();
        if (snapshot.empty) {
            adminQuizList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No Quizzes Found. Use "Add New Quiz" to start.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const quiz = doc.data();
            html += `
                <tr>
                    <td>${quiz.title || 'Untitled Quiz'}</td>
                    <td>${quiz.category || 'General'}</td>
                    <td>${quiz.questions ? quiz.questions.length : 0}</td>
                    <td><span style="color: var(--success);">Active</span></td>
                    <td class="action-buttons">
                        <button class="action-btn btn-edit" onclick="editQuiz('${doc.id}')">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteQuiz('${doc.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
        adminQuizList.innerHTML = html;
    } catch (error) {
        console.error('Error loading quizzes:', error);
        adminQuizList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Error loading quizzes.</td></tr>';
    }
}

async function loadAdminUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-light);">Loading users...</td></tr>';
    
    try {
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            userList.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-light);">No Registered Users Found.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            html += `
                <tr>
                    <td>${user.name || 'Unknown User'}</td>
                    <td>${user.email || 'No email'}</td>
                    <td>${user.totalQuizzes || 0}</td>
                    <td>${user.averageScore ? Math.round(user.averageScore * 100) + '%' : '0%'}</td>
                    <td><span style="color: var(--success);">Active</span></td>
                    <td class="action-buttons">
                        <button class="action-btn btn-view">View</button>
                        <button class="action-btn btn-reset">Reset</button>
                    </td>
                </tr>
            `;
        });
        userList.innerHTML = html;
    } catch (error) {
        console.error('Error loading users:', error);
        userList.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger);">Error loading users.</td></tr>';
    }
}

async function loadAdminQuestions() {
    const adminQuestionList = document.getElementById('adminQuestionList');
    adminQuestionList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-light);">Loading questions...</td></tr>';
    
    try {
        const snapshot = await db.collection('quizzes').get();
        if (snapshot.empty) {
            adminQuestionList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-light);">No Questions Found.</td></tr>';
            return;
        }

        let html = '';
        let questionCount = 0;
        
        snapshot.forEach(quizDoc => {
            const quiz = quizDoc.data();
            if (quiz.questions && quiz.questions.length > 0) {
                quiz.questions.forEach((question, index) => {
                    questionCount++;
                    const shortQuestion = question.text.length > 80 
                        ? question.text.substring(0, 80) + '...' 
                        : question.text;
                    
                    html += `
                        <tr>
                            <td title="${question.text}">${shortQuestion}</td>
                            <td>${quiz.title || 'Unknown Quiz'}</td>
                            <td>Multiple Choice (${question.options ? question.options.length : 0} options)</td>
                            <td class="action-buttons">
                                <button class="action-btn btn-edit" onclick="editQuestion('${quizDoc.id}', ${index})">Edit</button>
                                <button class="action-btn btn-delete" onclick="deleteQuestion('${quizDoc.id}', ${index})">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
        });
        
        if (!html) {
            html = '<tr><td colspan="4" style="text-align: center; color: var(--text-light);">No Questions Found. Use "Add New Question" to populate.</td></tr>';
        }
        adminQuestionList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading questions:', error);
        adminQuestionList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--danger);">Error loading questions.</td></tr>';
    }
}

async function handleSaveNewQuiz(e) {
    e.preventDefault();
    
    const title = document.getElementById('newQuizTitle').value;
    const category = document.getElementById('newQuizCategory').value;
    const difficulty = document.getElementById('newQuizDifficulty').value;
    const description = document.getElementById('newQuizDescription').value;
    
    try {
        await db.collection('quizzes').add({
            title: title,
            category: category,
            difficulty: difficulty,
            description: description,
            questions: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });
        
        showNotification('Quiz created successfully!', 'success');
        closeAddQuizModal();
        document.getElementById('newQuizForm').reset();
        loadAdminQuizzes();
        loadQuizzes();
        
    } catch (error) {
        console.error('Error saving quiz:', error);
        showNotification('Error saving quiz. Please try again.', 'error');
    }
}

function editQuiz(quizId) {
    showNotification('Edit quiz functionality would open here for quiz: ' + quizId, 'info');
}

function deleteQuiz(quizId) {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
        db.collection('quizzes').doc(quizId).delete()
            .then(() => {
                showNotification('Quiz deleted successfully!', 'success');
                loadAdminQuizzes();
                loadQuizzes();
            })
            .catch(error => {
                console.error('Error deleting quiz:', error);
                showNotification('Error deleting quiz. Please try again.', 'error');
            });
    }
}

function editQuestion(quizId, questionIndex) {
    showNotification('Edit question functionality would open here with quiz ID: ' + quizId + ', question index: ' + questionIndex, 'info');
}

function deleteQuestion(quizId, questionIndex) {
    if (confirm('Are you sure you want to delete this question?')) {
        // Get the quiz document
        const quizRef = db.collection('quizzes').doc(quizId);
        
        quizRef.get().then(doc => {
            if (doc.exists) {
                const quizData = doc.data();
                const questions = quizData.questions || [];
                
                // Remove the question at the specified index
                questions.splice(questionIndex, 1);
                
                // Update the quiz document
                return quizRef.update({
                    questions: questions
                });
            }
        }).then(() => {
            showNotification('Question deleted successfully!', 'success');
            loadAdminQuestions();
        }).catch(error => {
            console.error('Error deleting question:', error);
            showNotification('Error deleting question. Please try again.', 'error');
        });
    }
}

function switchAdminSection(clickedItem, sectionId) {
    // Remove active class from all nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked nav item
    clickedItem.classList.add('active');
    
    // Hide all content sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the target content section
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
}
