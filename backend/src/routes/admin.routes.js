import express from "express";
import { body, param, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  getAllUsers,
  deleteUser,
  promoteToAdmin,
  demoteFromAdmin,
  getUserById,
  updateUser,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

// Validation middleware for updateUser
const validateUpdateUser = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Initialize router
const router = express.Router();

// Apply middleware to all routes
router.use(limiter);
router.use(authMiddleware, adminMiddleware);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", validateUpdateUser, updateUser);

// Role Management Routes
router.put("/promote/:id", promoteToAdmin);
router.put("/demote/:id", demoteFromAdmin);

export default router;