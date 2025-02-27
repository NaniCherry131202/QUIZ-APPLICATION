import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Title is required
      trim: true, // Trim whitespace
      maxlength: 200, // Reasonable maximum length
    },
    duration: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Quiz must have a creator
    },
    questions: [
      {
        question: {
          type: String,
          required: true, // Question text is required
          trim: true, // Trim whitespace
          maxlength: 500, // Reasonable maximum length
        },
        options: {
          type: [String],
          required: true, // Options are required
          validate: [
            (val) => val.length >= 2, // Minimum of 2 options
            "A question must have at least two options",
          ],
        },
        correctAnswer: {
          type: String,
          required: true, // Correct answer is required
          validate: {
            validator(v) {
              return this.options.includes(v);
            },
            message: "Correct answer must be one of the available options",
          },
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);