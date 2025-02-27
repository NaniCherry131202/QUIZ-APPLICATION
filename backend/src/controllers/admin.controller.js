import mongoose from "mongoose";
import User from "../models/User.js"; // Add .js extension for ES Modules

// Helper function to handle errors consistently
const handleError = (res, error, message) => {
  console.error(`${message}:`, error.stack);
  return res.status(500).json({ message, error: error.message });
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean(); // .lean() for performance
    res.json(users);
  } catch (error) {
    handleError(res, error, "Error fetching users");
  }
};

// Get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    handleError(res, error, "Error fetching user");
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate ObjectId early
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Prevent self-deletion
    if (req.user.id === userId) {
      return res.status(403).json({ message: "Cannot delete yourself" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(403).json({ message: "Cannot delete the last admin" });
      }
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    handleError(res, error, "Error deleting user");
  }
};

// Promote to admin
export const promoteToAdmin = async (req, res) => {
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
    handleError(res, error, "Error promoting user");
  }
};

// Demote from admin
export const demoteFromAdmin = async (req, res) => {
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
    handleError(res, error, "Error demoting user");
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update only provided fields
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: "User updated successfully", user: user.toObject() });
  } catch (error) {
    handleError(res, error, "Error updating user");
  }
};