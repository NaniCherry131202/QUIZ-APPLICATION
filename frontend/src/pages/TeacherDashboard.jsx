import { useState } from "react";
import axios from "axios";

const TeacherDashboard = () => {
    const [quizTitle, setQuizTitle] = useState("");
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
        if (options.some(opt => !opt.trim())) {
            alert("All options must be filled!");
            return;
        }
        if (!options.includes(correctAnswer)) {
            alert("Correct answer must be one of the options!");
            return;
        }

        const newQuestionObj = { question: newQuestion, options, correctAnswer };
        setQuestions(prevQuestions => [...prevQuestions, newQuestionObj]);
        setNewQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
    };

    const submitQuiz = async () => {
        if (!quizTitle.trim()) {
            alert("Quiz title cannot be empty!");
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

            console.log("Questions being sent:", questionsToSend);

            await axios.post(
                "http://localhost:2424/api/quizzes/create",
                { title: quizTitle, questions: questionsToSend },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Quiz Created Successfully!");
            setQuizTitle("");
            setQuestions([]);
            console.log("Quiz created:", quizTitle, questions);
        } catch (err) {
            console.error("Error creating quiz:", err);
            alert(err.response?.data?.error || "Failed to create quiz.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-4">Create a Quiz</h2>
            <input
                type="text"
                placeholder="Quiz Title"
                className="w-full p-2 border rounded mb-4"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="Question"
                className="w-full p-2 border rounded mb-2"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
            />
            {options.map((opt, index) => (
                <input
                    key={index}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    className="w-full p-2 border rounded mb-2"
                    value={opt}
                    onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                    }}
                />
            ))}
            <input
                type="text"
                placeholder="Correct Answer"
                className="w-full p-2 border rounded mb-4"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={addQuestion}>
                Add Question
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={submitQuiz}>
                Submit Quiz
            </button>
        </div>
    );
};

export default TeacherDashboard;
