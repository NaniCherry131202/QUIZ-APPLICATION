const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

dotenv.config();

// Rate limiter for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts, please try again later",
});

// User Registration
exports.registerUser = [
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

            // Proper role assignment (allowing "teacher" and "admin")
            const userRole = role && (role === "admin" || role === "teacher") ? role : "student";

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }

            // Hash password
            const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const user = await User.create({ name, email, password: hashedPassword, role: userRole });

            // Generate JWT token
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

            console.log(`User registered: ${email} | Role: ${userRole}`);

            res.status(201).json({ 
                success: true, 
                message: "User registered successfully", 
                token, 
                role: userRole 
            });

        } catch (error) {
            console.error("Registration Error:", error);
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },
];

// User Login
exports.loginUser = [
    loginLimiter,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success: false, message: "User not found" });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }

            // Generate JWT tokens
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

            console.log(`User logged in: ${email} | Role: ${user.role}`);

            res.json({ 
                success: true, 
                token, 
                refreshToken, 
                role: user.role 
            });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },
];
