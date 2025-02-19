import { useEffect, useState } from "react";
import axios from "axios";

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
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
      setTimeLeft(60);
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
        selectedOption: answers[key]
    }));

    try {
        const res = await axios.post(
            "http://localhost:2424/api/quizzes/submit",
            { quizId: selectedQuiz._id, answers: formattedAnswers },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(res.data.message);
        setScore(res.data.score);
    } catch (err) {
        console.error("Error submitting quiz:", err.response?.data || err);
        alert(err.response?.data?.error || "Error submitting quiz.");
    }
};

  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
      {selectedQuiz ? (
        score !== null ? (
          <div>
            <h3 className="text-xl font-bold">{selectedQuiz.title}</h3>
            <p className="text-lg font-semibold mt-4">
              Your Score: {score} / {selectedQuiz.questions.length}
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
              onClick={() => {
                setSelectedQuiz(null);
                setScore(null);
                setAnswers({});
              }}
            >
              Take Another Quiz
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold">{selectedQuiz.title}</h3>
            <p className="text-red-500 font-semibold">⏳ Time Left: {timeLeft}s</p>
            {selectedQuiz.questions.map((q, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold">{q.question}</p>
                {q.options.map((option, i) => (
                  <label key={i} className="block">
                    <input
                      type="radio"
                      name={`q${index}`}
                      value={option}
                      onChange={(e) =>
                        setAnswers({ ...answers, [index]: e.target.value })
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              onClick={submitAnswers}
            >
              Submit Answers
            </button>
          </div>
        )
      ) : quizzes.length > 0 ? (
        quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="p-4 border rounded mb-2 cursor-pointer hover:bg-gray-100"
            onClick={() => setSelectedQuiz(quiz)}
          >
            {quiz.title}
          </div>
        ))
      ) : (
        <p>No quizzes available.</p>
      )}
    </div>
  );
};

export default StudentDashboard;
