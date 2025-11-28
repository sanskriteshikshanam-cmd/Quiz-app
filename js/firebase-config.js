// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZnh-To0JsKiEwbfc0fHqiksGm_3ClKOs",
    authDomain: "sanskrit-e-shikshanam.firebaseapp.com",
    projectId: "sanskrit-e-shikshanam",
    storageBucket: "sanskrit-e-shikshanam.firebasestorage.app",
    messagingSenderId: "135144595086",
    appId: "1:135144595086:web:688c01162c0cb0e57b73df"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global variables
let currentUser = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let allQuizzes = [];
let currentEditingQuizId = null;
