import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Add .js for ES Modules
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: "Too many login attempts, please try again later",
});

// Helper function for consistent error handling
const handleError = (res, error, message) => {
  console.error(`${message}:`, error.stack);
  return res.status(500).json({ success: false, message: "Internal Server Error" });
};

// User Registration
export const registerUser = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;

      // Assign role with validation (default to "student")
      const validRoles = ["admin", "teacher"];
      const userRole = role && validRoles.includes(role) ? role : "student";

      // Check if user exists
      const existingUser = await User.findOne({ email }).lean();
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already registered" });
      }

      // Hash password
      const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({ name, email, password: hashedPassword, role: userRole });

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "default_secret", // Fallback for safety
        { expiresIn: "1h" }
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        role: userRole,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "Email already registered" });
      }
      handleError(res, error, "Registration Error");
    }
  },
];

// User Login
export const loginUser = [
  loginLimiter,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select("+password"); // Include password explicitly
      if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      // Generate tokens
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1h" }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token,
        refreshToken,
        role: user.role,
      });
    } catch (error) {
      handleError(res, error, "Login Error");
    }
  },
];