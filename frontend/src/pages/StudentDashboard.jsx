import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // Initial value set to null
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get("http://localhost:2424/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(res.data);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      setTimeLeft(selectedQuiz.duration); // Set timeLeft to the quiz duration from API (in seconds)
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
  }, [selectedQuiz]);

  const submitAnswers = async () => {
    const formattedAnswers = Object.keys(answers).map((key) => ({
      questionId: selectedQuiz.questions[key]._id,
      selectedOption: answers[key],
    }));

    try {
      const res = await axios.post(
        "http://localhost:2424/api/quizzes/submit",
        { quizId: selectedQuiz._id, answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScore(res.data.score);
    } catch (err) {
      console.error("Error submitting quiz:", err.response?.data || err);
      alert(err.response?.data?.error || "Error submitting quiz.");
    }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-8 bg-black text-green-400 shadow-xl rounded-lg mt-10 border border-green-500"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-6 text-center text-green-300 uppercase tracking-wider">QuizMaster Challenge</h2>
      {selectedQuiz ? (
        score !== null ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <h3 className="text-2xl font-bold text-center">{selectedQuiz.title}</h3>
            <p className="text-lg font-semibold mt-4 text-center text-green-500">
              🎯 Score: {score} / {selectedQuiz.questions.length}
            </p>
            <motion.button
              className="bg-green-600 text-black px-6 py-3 rounded mt-6 block mx-auto hover:bg-green-800 transition-all font-semibold"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedQuiz(null);
                setScore(null);
                setAnswers({});
                setTimeLeft(null); // Reset timeLeft when exiting quiz
              }}
            >
              Try Another Challenge
            </motion.button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-2xl font-bold text-center">{selectedQuiz.title}</h3>
            <p className="text-red-500 font-semibold text-center text-lg">
              ⏳ Time Left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
            </p>
            {selectedQuiz.questions.map((q, index) => (
              <motion.div key={index} className="mb-6 bg-gray-900 p-4 rounded-lg" initial={{ x: -50 }} animate={{ x: 0 }}>
                <p className="font-semibold text-green-300">{q.question}</p>
                {q.options.map((option, i) => (
                  <label key={i} className="block cursor-pointer hover:text-green-500 flex items-center">
                    <input
                      type="radio"
                      name={`q${index}`}
                      value={option}
                      onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                      className="mr-2 accent-green-500"
                    />
                    {option}
                  </label>
                ))}
              </motion.div>
            ))}
            <motion.button
              className="bg-green-500 text-black px-6 py-3 rounded mt-6 block mx-auto hover:bg-green-700 transition-all font-semibold"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={submitAnswers}
            >
              Submit Challenge
            </motion.button>
          </motion.div>
        )
      ) : quizzes.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz._id}
              className="p-6 border border-green-500 rounded-lg mb-4 cursor-pointer bg-gray-900 hover:bg-gray-800 shadow-lg transition-all text-green-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedQuiz(quiz)}
            >
              {quiz.title} - Duration: {Math.floor(quiz.duration / 60)}m {quiz.duration % 60}s
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-center text-gray-500">No challenges available.</p>
      )}
    </motion.div>
  );
};

export default StudentDashboard;