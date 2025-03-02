import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    duration: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        options: {
          type: [String],
          required: true,
          validate: [
            (val) => val.length >= 2,
            "A question must have at least two options",
          ],
        },
        correctAnswer: {
          type: String,
          required: true,
          validate: {
            validator(v) {
              return this.options.includes(v);
            },
            message: "Correct answer must be one of the available options",
          },
        },
      },
    ],
    password: {
      type: String, // Hashed password
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);