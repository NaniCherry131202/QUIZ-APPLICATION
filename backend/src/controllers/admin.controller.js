const User = require("../models/User"); // Assuming you have a User model

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
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
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(403).json({ message: "Cannot delete the last admin" });
      }
    }
    await user.remove();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
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
    res.json({ message: "User updated successfully", user: user });
  } catch (error) {
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