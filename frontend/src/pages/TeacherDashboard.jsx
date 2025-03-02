import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherDashboard = () => {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState(""); // Duration in minutes
  const [quizPassword, setQuizPassword] = useState(""); // Quiz password
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const token = localStorage.getItem("token");

  const addQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error("Question cannot be empty!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      toast.error("All options must be filled!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    if (!options.includes(correctAnswer)) {
      toast.error("Correct answer must be one of the options!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    const newQuestionObj = { question: newQuestion, options, correctAnswer };
    setQuestions((prevQuestions) => [...prevQuestions, newQuestionObj]);
    setNewQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
  };

  const submitQuiz = async () => {
    if (!quizTitle.trim()) {
      toast.error("Quiz title cannot be empty!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    if (!quizDuration || parseInt(quizDuration) <= 0) {
      toast.error("Please set a valid duration (in minutes) greater than 0!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    if (!quizPassword.trim()) {
      toast.error("Please set a password for the quiz!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question to the quiz.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    if (!token) {
      toast.error("Authentication failed! Please log in again.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    try {
      const questionsToSend = [...questions];
      const durationInSeconds = parseInt(quizDuration) * 60; // Convert minutes to seconds

      console.log("Quiz data being sent:", {
        title: quizTitle,
        duration: durationInSeconds,
        questions: questionsToSend,
        password: quizPassword,
      });

      await axios.post(
        "http://localhost:2424/api/quizzes/create",
        {
          title: quizTitle,
          duration: durationInSeconds,
          questions: questionsToSend,
          password: quizPassword, // Send plaintext password to be hashed on backend
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Quiz Created Successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      setQuizTitle("");
      setQuizDuration("");
      setQuizPassword(""); // Clear password
      setQuestions([]);
      console.log("Quiz created:", quizTitle, durationInSeconds, questions, quizPassword);
    } catch (err) {
      console.error("Error creating quiz:", err);
      toast.error(err.response?.data?.error || "Failed to create quiz.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const formVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const inputVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
    hover: { scale: 1.1, rotate: 2, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const questionVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="max-w-3xl w-full p-8 bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl border border-blue-500 backdrop-blur-sm"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-4xl font-bold mb-6 text-center text-blue-400 uppercase tracking-wider"
          variants={inputVariants}
          initial="hidden"
          animate="visible"
        >
          Create Your Quiz
        </motion.h2>

        {/* Quiz Title Input */}
        <motion.input
          type="text"
          placeholder="Quiz Title"
          className="w-full p-3 mb-4 bg-gray-900 text-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          whileFocus="hover"
          whileTap="tap"
        />

        {/* Quiz Duration Input */}
        <motion.input
          type="number"
          placeholder="Duration (in minutes)"
          className="w-full p-3 mb-4 bg-gray-900 text-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={quizDuration}
          onChange={(e) => setQuizDuration(e.target.value)}
          min="1"
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          whileFocus="hover"
          whileTap="tap"
        />

        {/* Quiz Password Input */}
        <motion.input
          type="password"
          placeholder="Set Quiz Password"
          className="w-full p-3 mb-4 bg-gray-900 text-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={quizPassword}
          onChange={(e) => setQuizPassword(e.target.value)}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          whileFocus="hover"
          whileTap="tap"
        />

        {/* Question Input */}
        <motion.input
          type="text"
          placeholder="Question"
          className="w-full p-3 mb-4 bg-gray-900 text-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          whileFocus="hover"
          whileTap="tap"
        />

        {/* Options Inputs */}
        {options.map((opt, index) => (
          <motion.input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            className="w-full p-3 mb-3 bg-gray-900 text-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={opt}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = e.target.value;
              setOptions(newOptions);
            }}
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            whileFocus="hover"
            whileTap="tap"
          />
        ))}

        {/* Correct Answer Input */}
        <motion.input
          type="text"
          placeholder="Correct Answer"
          className="w-full p-3 mb-6 bg-gray-900 text-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          variants={inputVariants}
          initial="hidden"
          animate="visible"
          whileFocus="hover"
          whileTap="tap"
        />

        {/* Buttons */}
        <div className="flex justify-between">
          <motion.button
            className="relative px-6 py-3 text-white font-semibold bg-transparent border border-blue-500 rounded-lg overflow-hidden group"
            onClick={addQuestion}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
              scale: 1.1,
              rotate: 2,
              boxShadow: "0 0 15px rgba(96, 165, 250, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Add Question</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </motion.button>
          <motion.button
            className="relative px-6 py-3 text-white font-semibold bg-transparent border border-purple-600 rounded-lg overflow-hidden group"
            onClick={submitQuiz}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
              scale: 1.1,
              rotate: -2,
              boxShadow: "0 0 15px rgba(147, 51, 234, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Submit Quiz</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </motion.button>
        </div>

        {/* Display Added Questions */}
        {questions.length > 0 && (
          <motion.div
            className="mt-6"
            variants={questionVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-xl font-semibold text-blue-400 mb-4">Added Questions:</h3>
            {questions.map((q, index) => (
              <motion.div
                key={index}
                className="p-4 mb-3 bg-gray-900 rounded-lg border border-blue-500 text-white"
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <p className="font-semibold">{q.question}</p>
                <ul className="list-disc pl-5 mt-2">
                  {q.options.map((opt, i) => (
                    <li key={i} className={opt === q.correctAnswer ? "text-purple-500" : ""}>
                      {opt} {opt === q.correctAnswer && "(Correct)"}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
            <p className="text-blue-400 mt-4">Duration: {quizDuration} minutes</p>
          </motion.div>
        )}
      </motion.div>
      <ToastContainer /> {/* Add ToastContainer for toast notifications */}
    </motion.div>
  );
};

export default TeacherDashboard;