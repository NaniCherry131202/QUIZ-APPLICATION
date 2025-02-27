import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Student is required
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true, // Quiz is required
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question", // Note: This assumes a separate Question model or subdocument reference
          required: true,
        },
        selectedOption: {
          type: String,
          required: true,
        },
      },
    ],
    score: {
      type: Number,
      required: true, // Score is required
      min: 0, // Score cannot be negative
    },
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);