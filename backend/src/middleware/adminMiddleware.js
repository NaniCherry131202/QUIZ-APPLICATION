import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Add .js for ES Modules

// Admin middleware
export const adminMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret"); // Fallback secret
    req.user = decoded; // Attach decoded user data to req.user

    // Find user and check role
    const user = await User.findById(decoded.id).lean(); // .lean() for performance
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next(); // Proceed to the next handler
  } catch (error) {
    console.error("Admin middleware error:", error.stack);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};