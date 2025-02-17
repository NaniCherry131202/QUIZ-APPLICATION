const express = require('express');
const { createQuiz, getQuizzes, submitQuiz } = require('../controllers/quiz.controller.js');
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create a new quiz (Teacher Only)
router.post('/create', authMiddleware, createQuiz); // Correct middleware placement

// Fetch all quizzes (Student) - No authentication needed if all students can view
router.get('/', getQuizzes);  // Consider if authentication is needed here

// Submit a quiz (Student)
router.post('/submit', authMiddleware, submitQuiz); // Add auth middleware

module.exports = router;