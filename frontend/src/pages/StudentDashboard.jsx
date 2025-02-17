import { useEffect, useState } from "react";
import axios from "axios";

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res =await axios.post(
          "http://localhost:2424/api/quizzes/create",
          { title: quizTitle, questions },
          { headers: { Authorization: `Bearer ${token}` } }
      );
      
        setQuizzes(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuizzes();
  }, []);

  const submitAnswers = async () => {
    try {
      const res = await axios.post(
        "http://localhost:2424/api/quizzes/submit",
        { quizId: selectedQuiz._id, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setSelectedQuiz(null);
    } catch (err) {
      console.error(err);
      alert("Error submitting quiz.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
      {selectedQuiz ? (
        <div>
          <h3 className="text-xl font-bold">{selectedQuiz.title}</h3>
          {selectedQuiz.questions.map((q, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{q.question}</p>
              {q.options.map((option, i) => (
                <label key={i} className="block">
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option}
                    onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-4" onClick={submitAnswers}>
            Submit Answers
          </button>
        </div>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz._id} className="p-4 border rounded mb-2 cursor-pointer" onClick={() => setSelectedQuiz(quiz)}>
            {quiz.title}
          </div>
        ))
      )}
    </div>
  );
};

export default StudentDashboard;
