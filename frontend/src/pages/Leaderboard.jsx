import { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:2424/api/quizzes/leaderboard");
        setLeaders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">🏆 Leaderboard</h2>
      <ul>
        {leaders.map((user, index) => (
          <li key={index} className="p-2 border-b">
            <span className="font-bold">{index + 1}. {user.name}</span> - {user.lastScore} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
