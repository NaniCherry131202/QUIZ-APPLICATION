const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const { isValidObjectId } = require('mongoose'); // If using Mongoose

// Helper function for input validation (adapt as needed)
function validateQuizInput(title, questions) {
    if (typeof title !== 'string' || title.trim() === '') {
        return "Title is required and must be a string.";
    }
    if (!Array.isArray(questions) || questions.length === 0) {
        return "Questions are required and must be an array.";
    }

    for (const question of questions) {
        if (typeof question.text !== 'string' || question.text.trim() === '') {
            return "Question text is required.";
        }
        if (!Array.isArray(question.options) || question.options.length === 0) {
            return "Question options are required.";
        }
        if (typeof question.correctAnswer !== 'string' || question.correctAnswer.trim() === '') {
            return "Correct answer is required.";
        }
        if (!question.options.includes(question.correctAnswer)) {
            return "Correct answer must be one of the options.";
        }
    }

    return null; // No errors
}

exports.createQuiz = async (req, res) => {
    try {
        const { title, questions } = req.body;
        console.log("Received data:", req.body); // Log the received data
        const teacherId = req.user.id;

        if (!teacherId) {
            return res.status(400).json({ error: "Teacher ID is required" });
        }

        const validationError = validateQuizInput(title, questions);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const quiz = await Quiz.create({ title, questions, createdBy: teacherId });
        res.status(201).json({ message: "Quiz created successfully", quiz });

    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ error: "An error occurred while creating the quiz" });
    }
};


exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find(); // You can add filtering here if needed
        res.json(quizzes);
    } catch (error) {
        console.error("Error getting quizzes:", error);
        res.status(500).json({ error: "An error occurred while retrieving quizzes" });
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        const studentId = req.user.id; // Get student ID

        if (!isValidObjectId(quizId)) { // Check if it's a valid ObjectId
            return res.status(400).json({ error: "Invalid quiz ID" });
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: "Answers are required and must be an array." });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        let score = 0;
        const validAnswers = [];

        for (const answer of answers) {
            if (!answer.questionId || !answer.selectedOption) {
                return res.status(400).json({ error: "questionId and selectedOption are required in answers array." });
            }

            const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
            if (!question) {
                console.error(`Question not found for ID: ${answer.questionId}`);
                return res.status(400).json({ error: `Question not found for ID: ${answer.questionId}` }); // Return error if invalid questionId
            }

            if (question.correctAnswer === answer.selectedOption) {
                score++;
            }
            validAnswers.push({ question: question._id, selectedOption: answer.selectedOption });
        }

        const submission = await Submission.create({ student: studentId, quiz: quizId, answers: validAnswers, score });
        res.json({ score, submission });

    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ error: "An error occurred during submission" });
    }
};