import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.stack);
    process.exit(1); // Exit process on failure
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 1310;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));