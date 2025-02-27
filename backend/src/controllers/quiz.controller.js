import { isValidObjectId } from "mongoose";
import Quiz from "../models/Quiz.js"; // Add .js for ES Modules
import User from "../models/User.js";
import Submission from "../models/Submission.js";

// Helper function for input validation
const validateQuizInput = (title, questions) => {
  if (typeof title !== "string" || title.trim() === "") {
    return "Title is required and must be a non-empty string";
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return "Questions must be a non-empty array";
  }

  for (const [index, question] of questions.entries()) {
    if (!question || typeof question !== "object") {
      return `Question at index ${index + 1} must be an object`;
    }
    if (typeof question.question !== "string" || question.question.trim() === "") {
      return `Question text at index ${index + 1} must be a non-empty string`;
    }
    if (!Array.isArray(question.options) || question.options.length === 0) {
      return `Options at index ${index + 1} must be a non-empty array`;
    }
    if (typeof question.correctAnswer !== "string" || question.correctAnswer.trim() === "") {
      return `Correct answer at index ${index + 1} must be a non-empty string`;
    }
    if (!question.options.includes(question.correctAnswer)) {
      return `Correct answer at index ${index + 1} must be one of the provided options`;
    }
  }
  return null;
};

// Helper function for consistent error handling
const handleError = (res, error, message) => {
  console.error(`${message}:`, error.stack);
  return res.status(500).json({ error: message });
};

// Create a quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, duration, questions } = req.body;
    const teacherId = req.user?.id;

    if (!teacherId || !isValidObjectId(teacherId)) {
      return res.status(401).json({ error: "Valid teacher authentication required" });
    }

    const validationError = validateQuizInput(title, questions);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const quiz = await Quiz.create({ title, duration, questions, createdBy: teacherId });
    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    handleError(res, error, "Error creating quiz");
  }
};

// Get all quizzes
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().lean(); // .lean() for performance
    res.json(quizzes);
  } catch (error) {
    handleError(res, error, "Error retrieving quizzes");
  }
};

// Submit a quiz
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const studentId = req.user?.id;

    if (!studentId || !isValidObjectId(studentId)) {
      return res.status(401).json({ error: "Valid user authentication required" });
    }
    if (!quizId || !isValidObjectId(quizId)) {
      return res.status(400).json({ error: "Invalid or missing quiz ID" });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers must be a non-empty array" });
    }

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let score = 0;
    const validAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);
      if (!question) {
        return res.status(400).json({ error: `Invalid question ID: ${answer.questionId}` });
      }
      if (typeof answer.selectedOption !== "string") {
        return res.status(400).json({ error: `Invalid answer for question ID: ${answer.questionId}` });
      }

      if (question.correctAnswer === answer.selectedOption) score++;
      validAnswers.push({ question: question._id, selectedOption: answer.selectedOption });
    }

    const submission = await Submission.create({
      student: studentId,
      quiz: quizId,
      answers: validAnswers,
      score,
    });

    await User.findByIdAndUpdate(studentId, { $set: { lastScore: score } });

    res.json({ score, submission });
  } catch (error) {
    handleError(res, error, "Error submitting quiz");
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ lastScore: { $exists: true } })
      .sort({ lastScore: -1 })
      .limit(10)
      .lean();
    res.json(leaderboard);
  } catch (error) {
    handleError(res, error, "Error retrieving leaderboard");
  }
};