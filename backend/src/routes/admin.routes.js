const express = require("express");
const { getAllUsers, deleteUser } = require("../controllers/admin.controller.js");
const {authMiddleware,adminMiddleware} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.delete("/user/:id", authMiddleware, adminMiddleware, deleteUser);
router.put("/promote/:id", authMiddleware, adminMiddleware, promoteToAdmin);

module.exports = router;
