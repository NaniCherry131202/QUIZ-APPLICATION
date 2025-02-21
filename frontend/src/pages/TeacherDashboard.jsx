import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const TeacherDashboard = () => {
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState(""); // New state for quiz duration in minutes
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const token = localStorage.getItem("token");

  const addQuestion = () => {
    if (!newQuestion.trim()) {
      alert("Question cannot be empty!");
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      alert("All options must be filled!");
      return;
    }
    if (!options.includes(correctAnswer)) {
      alert("Correct answer must be one of the options!");
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
      alert("Quiz title cannot be empty!");
      return;
    }
    if (!quizDuration || parseInt(quizDuration) <= 0) {
      alert("Please set a valid duration (in minutes) greater than 0!");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least one question to the quiz.");
      return;
    }
    if (!token) {
      alert("Authentication failed! Please log in again.");
      return;
    }

    try {
      const questionsToSend = [...questions];
      const durationInSeconds = parseInt(quizDuration) * 60; // Convert minutes to seconds

      console.log("Quiz data being sent:", { title: quizTitle, duration: durationInSeconds, questions: questionsToSend });

      await axios.post(
        "http://localhost:2424/api/quizzes/create",
        { title: quizTitle, duration: durationInSeconds, questions: questionsToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Quiz Created Successfully!");
      setQuizTitle("");
      setQuizDuration("");
      setQuestions([]);
      console.log("Quiz created:", quizTitle, durationInSeconds, questions);
    } catch (err) {
      console.error("Error creating quiz:", err);
      alert(err.response?.data?.error || "Failed to create quiz.");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="max-w-3xl w-full p-8 bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl border border-green-500 backdrop-blur-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <motion.h2
          className="text-4xl font-bold mb-6 text-center text-green-400 uppercase tracking-wider"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Create Your Quiz
        </motion.h2>

        {/* Quiz Title Input */}
        <motion.input
          type="text"
          placeholder="Quiz Title"
          className="w-full p-3 mb-4 bg-gray-900 text-green-300 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />

        {/* Quiz Duration Input */}
        <motion.input
          type="number"
          placeholder="Duration (in minutes)"
          className="w-full p-3 mb-4 bg-gray-900 text-green-300 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          value={quizDuration}
          onChange={(e) => setQuizDuration(e.target.value)}
          min="1"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />

        {/* Question Input */}
        <motion.input
          type="text"
          placeholder="Question"
          className="w-full p-3 mb-4 bg-gray-900 text-green-300 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />

        {/* Options Inputs */}
        {options.map((opt, index) => (
          <motion.input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            className="w-full p-3 mb-3 bg-gray-900 text-green-300 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={opt}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = e.target.value;
              setOptions(newOptions);
            }}
            whileFocus={{ scale: 1.02 }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
        ))}

        {/* Correct Answer Input */}
        <motion.input
          type="text"
          placeholder="Correct Answer"
          className="w-full p-3 mb-6 bg-gray-900 text-green-300 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        />

        {/* Buttons */}
        <div className="flex justify-between">
          <motion.button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            onClick={addQuestion}
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Add Question
          </motion.button>
          <motion.button
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
            onClick={submitQuiz}
            whileHover={{ scale: 1.1, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Submit Quiz
          </motion.button>
        </div>

        {/* Display Added Questions */}
        {questions.length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-green-400 mb-4">Added Questions:</h3>
            {questions.map((q, index) => (
              <motion.div
                key={index}
                className="p-4 mb-3 bg-gray-900 rounded-lg border border-green-600 text-green-300"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <p className="font-semibold">{q.question}</p>
                <ul className="list-disc pl-5 mt-2">
                  {q.options.map((opt, i) => (
                    <li key={i} className={opt === q.correctAnswer ? "text-green-500" : ""}>
                      {opt} {opt === q.correctAnswer && "(Correct)"}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
            <p className="text-green-400 mt-4">Duration: {quizDuration} minutes</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TeacherDashboard;