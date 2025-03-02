import express from "express";
import { createQuiz, getQuizzes, submitQuiz, getQuiz, getLeaderboard } from "../controllers/quiz.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new quiz (Teacher Only)
router.post("/create", authMiddleware, createQuiz);

// Fetch all quizzes (Student) - Authentication optional depending on requirements
router.get("/", authMiddleware, getQuizzes);

// Get a specific quiz (requires password)
router.post("/get/:quizId", authMiddleware, getQuiz); // Added authMiddleware for security

// Submit a quiz (Student)
router.post("/submit", authMiddleware, submitQuiz);

// Get leaderboard (Public or authenticated, depending on intent)
router.get("/leaderboard", getLeaderboard);

export default router;