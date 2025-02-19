const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts, please try again later",
});

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
            const { name, email, password, role} = req.body;
            if (!role || role !== "admin") {
                role = "student"; // Default role is student
            }
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }

            const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = await User.create({ name, email, password: hashedPassword, role });
            console.log(`User registered: ${email}`);

            res.status(201).json({ success: true, message: "User registered successfully" });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }
            res.status(500).json({ success: false, error: error.message });
        }
    },
];
exports.loginUser = [
    loginLimiter,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success: false, message: "User not found" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }

            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

            console.log(`User logged in: ${email}`);
            res.json({ success: true, token, refreshToken, role: user.role });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
];