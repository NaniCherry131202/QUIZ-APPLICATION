import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js"; // Added for /users route

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get all users (admin only)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().lean(); // .lean() for performance
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;