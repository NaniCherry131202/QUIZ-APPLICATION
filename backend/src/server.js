import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer"; // Add this

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
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.stack);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Subscription Schema and Model
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});
const Subscriber = mongoose.model("Subscriber", subscriberSchema);

// Subscription Endpoint
app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ success: false, message: "Email already subscribed" });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    console.log(`Subscribed: ${email}`);
    res.status(200).json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    console.error("Subscription error:", err.stack);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin", adminRoutes);

// Start Server
const PORT = process.env.PORT || 2424;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server stopped.");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Shutting down...");
  server.close(() => {
    console.log("Server stopped.");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
});