import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import VerificationCode from "../models/VerificationCode.js";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
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

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Check if email exists
export const checkEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const exists = await User.findOne({ email }).lean();
    res.json({ exists: !!exists });
  } catch (error) {
    handleError(res, error, "Email Check Error");
  }
};

// Send Verification Code
export const sendVerificationCode = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    const code = generateCode();

    try {
      const existingUser = await User.findOne({ email }).lean();
      if (existingUser) {
        return res.status(400).json({ success: false, message: "This email is already registered. Please use a different email or log in." });
      }

      // Check if email format is valid (already done by express-validator, but adding extra check for clarity)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "This is not a valid email address." });
      }

      await VerificationCode.deleteOne({ email });

      await VerificationCode.create({
        email,
        code,
        userData: { name, password, role: role || "student" },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your QuizMaster Account",
        text: `Your verification code is: ${code}. It expires in 10 minutes.`,
      };

      await transporter.sendMail(mailOptions);
      
      res.status(200).json({ success: true, message: "Verification code sent!" });
    } catch (error) {
      handleError(res, error, "Send Verification Code Error");
    }
  },
];

// Verify Code and Register User
export const verifyAndRegister = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: "Email and code are required" });
  }

  try {
    const verification = await VerificationCode.findOne({ email });
    if (!verification || verification.code !== code) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    const { name, password, role } = verification.userData;

    const validRoles = ["admin", "teacher"];
    const userRole = role && validRoles.includes(role) ? role : "student";

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ name, email, password: hashedPassword, role: userRole });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    await VerificationCode.deleteOne({ email });

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
};

// User Login (unchanged)
export const loginUser = [
  loginLimiter,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

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

// User Registration (kept for compatibility, but not used in new flow)
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

      const validRoles = ["admin", "teacher"];
      const userRole = role && validRoles.includes(role) ? role : "student";

      const existingUser = await User.findOne({ email }).lean();
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already registered" });
      }

      const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await User.create({ name, email, password: hashedPassword, role: userRole });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "default_secret",
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