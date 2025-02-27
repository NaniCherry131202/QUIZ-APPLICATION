const express = require("express");
const { body, param, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
  getAllUsers,
  deleteUser,
  promoteToAdmin,
  demoteFromAdmin,
  getUserById,
  updateUser,
} = require("../controllers/admin.controller.js");
const { authMiddleware } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

const router = express.Router();

// Apply middleware to all routes
router.use(limiter);
router.use(authMiddleware, adminMiddleware);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);
router.put(
  "/users/:id",
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("name").optional().trim().notEmpty(),
    body("email").optional().isEmail().normalizeEmail(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateUser
);

// Role Management Routes
router.put("/promote/:id", promoteToAdmin);
router.put("/demote/:id", demoteFromAdmin);

module.exports = router;