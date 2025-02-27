import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
      maxlength: 255, // Reasonable limit
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true, // Remove leading/trailing whitespace
      lowercase: true, // Store emails in lowercase
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Invalid email format",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Minimum password length
    },
    role: {
      type: String,
      enum: ["user", "teacher", "student", "admin"], // Define allowed roles
      default: "user",
      required: true,
    },
    lastScore: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);