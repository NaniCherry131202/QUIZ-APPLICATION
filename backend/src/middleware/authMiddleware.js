import jwt from "jsonwebtoken";

const ERROR_MESSAGES = {
  NO_TOKEN: "Unauthorized: No token provided",
  INVALID_TOKEN: "Invalid token",
  TOKEN_EXPIRED: "Token expired",
  INVALID_TOKEN_TYPE: "Invalid token type",
  MISSING_SECRET: "Internal server error",
};

// Extracts and validates the Bearer token
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1]; // Extract token after "Bearer"
};

// Authentication middleware
export const authMiddleware = async (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: ERROR_MESSAGES.NO_TOKEN });
  }

  const secret = process.env.JWT_SECRET || "default_secret"; // Fallback for development
  if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET not set, using default_secret");
  }

  try {
    const verified = jwt.verify(token, secret);
    req.user = { id: verified.id, role: verified.role };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.stack);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: ERROR_MESSAGES.TOKEN_EXPIRED });
    }
    return res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN });
  }
};

// Admin-only middleware
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied, admin only" });
  }
  next();
};