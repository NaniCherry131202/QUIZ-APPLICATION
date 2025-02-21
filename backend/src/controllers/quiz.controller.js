const Quiz = require('../models/Quiz');
const User = require("../models/User");
const Submission = require('../models/Submission');
const { isValidObjectId } = require('mongoose');

// Helper function for input validation
function validateQuizInput(title, questions) {
    if (typeof title !== 'string' || title.trim() === '') {
        return "Title is required and must be a string.";
    }
    if (!Array.isArray(questions) || questions.length === 0) {
        return "Questions are required and must be an array.";
    }

    for (const [index, question] of questions.entries()) {
        if (!question || typeof question !== 'object') {
            return `Invalid question format at index ${index + 1}`;
        }
        if (!question.question || typeof question.question !== 'string' || question.question.trim() === '') {
            return `Question text is required at index ${index + 1}`;
        }
        if (!Array.isArray(question.options) || question.options.length === 0) {
            return `Options are required at index ${index + 1}`;
        }
        if (typeof question.correctAnswer !== 'string' || question.correctAnswer.trim() === '') {
            return `Correct answer is required at index ${index + 1}`;
        }
        if (!question.options.includes(question.correctAnswer)) {
            return `Correct answer must be one of the options at index ${index + 1}`;
        }
    }
    return null;
}

exports.createQuiz = async (req, res) => {
    try {
        const { title, duration, questions } = req.body;
        const teacherId = req.user.id;

        if (!teacherId) {
            return res.status(400).json({ error: "Teacher ID is required" });
        }

        const validationError = validateQuizInput(title, questions);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const quiz = await Quiz.create({ title, questions,duration, createdBy: teacherId });
        res.status(201).json({ message: "Quiz created successfully", quiz });
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ error: "An error occurred while creating the quiz" });
    }
};

exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (error) {
        console.error("Error getting quizzes:", error);
        res.status(500).json({ error: "An error occurred while retrieving quizzes" });
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        const studentId = req.user?.id;
        
        if (!studentId) return res.status(400).json({ error: "User authentication required" });
        if (!quizId || !isValidObjectId(quizId)) return res.status(400).json({ error: "Invalid or missing quiz ID" });

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });

        let score = 0;
        const validAnswers = [];

        for (const answer of answers) {
            const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
            if (!question) return res.status(400).json({ error: `Invalid question ID: ${answer.questionId}` });

            if (question.correctAnswer === answer.selectedOption) score++;
            validAnswers.push({ question: question._id, selectedOption: answer.selectedOption });
        }

        // Save the submission and update user score
        const submission = await Submission.create({ student: studentId, quiz: quizId, answers: validAnswers, score });
        await User.findByIdAndUpdate(studentId, { $set: { lastScore: score } });

        res.json({ score, submission });
    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ error: "An unexpected error occurred." });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find({ lastScore: { $exists: true } }).sort({ lastScore: -1 }).limit(10);
        res.json(leaderboard);
    } catch (error) {
        console.error("Error getting leaderboard:", error);
        res.status(500).json({ error: error.message });
    }
};
