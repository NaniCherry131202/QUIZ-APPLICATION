import express from "express";
import { registerUser, loginUser, sendVerificationCode, verifyAndRegister, checkEmail } from "../controllers/auth.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Check if email exists
router.get("/check-email", checkEmail);

// Send Verification Code
router.post("/send-verification-code", sendVerificationCode);

// Verify Code and Register
router.post("/verify-and-register", verifyAndRegister);

// Register (kept for compatibility)
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get all users (admin only)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;