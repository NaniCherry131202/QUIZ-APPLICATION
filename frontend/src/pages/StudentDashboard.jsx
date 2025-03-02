import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizPassword, setQuizPassword] = useState(""); // New state for quiz password
  const [showPasswordInput, setShowPasswordInput] = useState(false); // Show password input for selected quiz
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get("http://localhost:2424/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Ensure quizzes have _id and questions have _id
        const formattedQuizzes = res.data.map((quiz) => ({
          ...quiz,
          questions: quiz.questions.map((q) => ({
            ...q,
            _id: q._id?.toString() || null, // Ensure _id is a string
          })),
        }));
        setQuizzes(formattedQuizzes);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        toast.error(err.response?.data?.error || "Failed to fetch quizzes.", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
      }
    };
    fetchQuizzes();
  }, [token]);

  const handleQuizPasswordSubmit = async () => {
    if (!quizPassword.trim()) {
      toast.error("Please enter the quiz password!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    setIsLoading(true);
    setError(""); // Clear any previous errors

    try {
      const response = await axios.post(
        `http://localhost:2424/api/quizzes/get/${selectedQuiz._id}`,
        { password: quizPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const quiz = response.data.quiz;
      // Ensure selectedQuiz includes _id at the root
      setSelectedQuiz({
        _id: quiz._id, // Add quiz _id at the root
        title: quiz.title,
        duration: quiz.duration,
        questions: quiz.questions.map((q) => ({
          ...q,
          _id: q._id?.toString() || null, // Ensure question _id is a string
        })),
      });
      setShowPasswordInput(false); // Hide password input after success
      setTimeLeft(quiz.duration); // Start timer with quiz duration
      toast.success("Quiz accessed successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    } catch (err) {
      console.error("Error accessing quiz:", err);
      const errorMessage = err.response?.data?.error || "Incorrect quiz password.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      setShowPasswordInput(false); // Reset on failure
      setSelectedQuiz(null); // Clear selection on failure
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedQuiz && !showPasswordInput) {
      setTimeLeft(selectedQuiz.duration);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitAnswers();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedQuiz, showPasswordInput]);

  const submitAnswers = async () => {
    
    const formattedAnswers = Object.keys(answers).map((key) => ({
      questionId: selectedQuiz.questions[key]._id?.toString() || null, // Ensure questionId is a string
      selectedOption: answers[key],
    }));

    setIsLoading(true);
    setError(""); // Clear any previous errors

    try {
      if (!selectedQuiz || !selectedQuiz._id) {
        throw new Error("No quiz selected or invalid quiz ID");
      }

      const res = await axios.post(
        "http://localhost:2424/api/quizzes/submit",
        { quizId: selectedQuiz._id.toString(), answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScore(res.data.score);
      toast.success(`Quiz Submitted! Your score: ${res.data.score} / ${selectedQuiz.questions.length}`, {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    } catch (err) {
      console.error("Error submitting quiz:", err.response?.data || err);
      const errorMessage = err.response?.data?.error || "Error submitting quiz.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
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

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="max-w-2xl w-full p-8 bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl border border-blue-500 backdrop-blur-sm"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-4xl font-bold mb-6 text-center text-blue-400 uppercase tracking-wider">
          QuizMaster Challenge
        </h2>

        {showPasswordInput ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <h3 className="text-2xl font-semibold text-blue-400 mb-4">Enter Quiz Password</h3>
            {error && <p className="text-red-400 text-center mb-4">{error}</p>}
            <motion.input
              type="password"
              placeholder="Quiz Password"
              className="w-full p-3 mb-4 bg-gray-900 text-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={quizPassword}
              onChange={(e) => setQuizPassword(e.target.value)}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              whileFocus="hover"
              whileTap="tap"
            />
            <div className="flex justify-between">
              <motion.button
                className="relative px-6 py-3 text-white font-semibold bg-transparent border border-red-500 rounded-lg overflow-hidden group"
                onClick={() => {
                  setShowPasswordInput(false);
                  setSelectedQuiz(null);
                  setQuizPassword("");
                  setError(""); // Clear error on cancel
                }}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  scale: 1.1,
                  rotate: 2,
                  boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Cancel</span>
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </motion.button>
              <motion.button
                className="relative px-6 py-3 text-white font-semibold bg-transparent border border-purple-600 rounded-lg overflow-hidden group"
                onClick={handleQuizPasswordSubmit}
                disabled={isLoading}
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
                <span className="relative z-10">{isLoading ? "Loading..." : "Submit Password"}</span>
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </motion.button>
            </div>
          </motion.div>
        ) : selectedQuiz ? (
          score !== null ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-full">
              <h3 className="text-2xl font-bold text-center text-blue-400">{selectedQuiz.title}</h3>
              <p className="text-lg font-semibold mt-4 text-center text-purple-500">
                🎯 Score: {score} / {selectedQuiz.questions.length}
              </p>
              <motion.button
                className="relative px-6 py-3 text-white font-semibold bg-transparent border border-blue-500 rounded-lg overflow-hidden group mt-6 block mx-auto"
                whileHover={{
                  scale: 1.1,
                  rotate: 2,
                  boxShadow: "0 0 15px rgba(96, 165, 250, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedQuiz(null);
                  setScore(null);
                  setAnswers({});
                  setTimeLeft(null);
                  setError(""); // Clear error on new attempt
                }}
              >
                <span className="relative z-10">Try Another Challenge</span>
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <h3 className="text-2xl font-bold text-center text-blue-400">{selectedQuiz.title}</h3>
              <p className="text-red-500 font-semibold text-center text-lg">
                ⏳ Time Left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
              </p>
              {selectedQuiz.questions.map((q, index) => (
                <motion.div
                  key={index}
                  className="mb-6 p-4 bg-gray-900 rounded-lg border border-blue-500"
                  initial={{ x: -50 }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-semibold text-white">{q.question}</p>
                  {q.options.map((option, i) => (
                    <label key={i} className="block cursor-pointer hover:text-blue-500 flex items-center">
                      <input
                        type="radio"
                        name={`q${index}`}
                        value={option}
                        onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                        className="mr-2 accent-blue-500"
                      />
                      <span className="text-white">{option}</span>
                    </label>
                  ))}
                </motion.div>
              ))}
              <motion.button
                className="relative px-6 py-3 text-white font-semibold bg-transparent border border-purple-600 rounded-lg overflow-hidden group mt-6 block mx-auto"
                onClick={submitAnswers}
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
                <span className="relative z-10">Submit Challenge</span>
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </motion.button>
            </motion.div>
          )
        ) : quizzes.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl">
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz._id}
                className="p-6 border border-blue-500 rounded-lg mb-4 cursor-pointer bg-gray-900 hover:bg-gray-800 shadow-lg transition-all text-white text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedQuiz(quiz);
                  setShowPasswordInput(true); // Show password input for this quiz
                  setQuizPassword(""); // Reset password input
                  setError(""); // Clear any previous errors
                }}
              >
                {quiz.title} - Duration: {Math.floor(quiz.duration / 60)}m {quiz.duration % 60}s
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-gray-500">No challenges available.</p>
        )}
      </motion.div>
      <ToastContainer />
    </motion.div>
  );
};

export default StudentDashboard;