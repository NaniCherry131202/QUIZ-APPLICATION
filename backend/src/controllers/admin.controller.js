const User = require("../models/User");
const mongoose = require("mongoose");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.stack);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error.stack);
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Attempting to delete user ID: ${userId}`);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (req.user.id === userId) {
      return res.status(403).json({ message: "Cannot delete yourself" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      console.log(`Admin count: ${adminCount}`);
      if (adminCount <= 1) {
        return res.status(403).json({ message: "Cannot delete the last admin" });
      }
    }
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Detailed error deleting user:", error.stack);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// Promote to admin
const promoteToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }
    user.role = "admin";
    await user.save();
    res.json({ message: "User promoted to admin" });
  } catch (error) {
    console.error("Error promoting user:", error.stack);
    res.status(500).json({ message: "Error promoting user", error: error.message });
  }
};

// Demote from admin
const demoteFromAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin" });
    }
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(403).json({ message: "Cannot demote the last admin" });
    }
    user.role = "user";
    await user.save();
    res.json({ message: "User demoted to regular user" });
  } catch (error) {
    console.error("Error demoting user:", error.stack);
    res.status(500).json({ message: "Error demoting user", error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error.stack);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  promoteToAdmin,
  demoteFromAdmin,
  updateUser,
};