// middleware/adminMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Assuming you have a User model

const adminMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret from .env
    req.user = decoded; // Store decoded user data in req.user

    // Find the user in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has the admin role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next(); // Proceed to the route handler
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = adminMiddleware;