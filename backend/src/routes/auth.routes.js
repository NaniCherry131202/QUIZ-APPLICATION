const express = require('express');
const { registerUser, loginUser } = require('../controllers/auth.controller.js');
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware.js");
const router = express.Router();

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
    const users = await User.find();
    res.json(users);
  });
module.exports = router;
