import { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:2424/api/quizzes/leaderboard");
        console.log("API response:", res.data);
        setLeaders(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Check the server or console for details.");
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-12 px-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-6 text-white">
        <h2 className="text-3xl font-extrabold flex items-center justify-center gap-2 animate-pulse">
          <span>🏆</span> Leaderboard Peak
        </h2>
      </div>
      <div className="bg-white shadow-2xl rounded-b-xl overflow-hidden">
        {error ? (
          <p className="p-4 text-red-500">{error}</p>
        ) : leaders.length === 0 ? (
          <p className="p-4 text-gray-500">No leaders found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {leaders.map((user, index) => (
              <li
                key={index}
                className={`p-4 flex items-center justify-between transition-all duration-300 hover:bg-gray-50 animate-fadeIn`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold ${getRankColor(index)}`}>
                    {index + 1}.
                  </span>
                  <div className="relative">
                    <span className="absolute -top-1 -right-2 text-yellow-400 text-xs animate-bounce">
                      {index < 3 && "★"}
                    </span>
                    <span className="font-semibold text-gray-800">{user.name}</span>
                  </div>
                </div>
                <span className="text-indigo-600 font-medium">
                  {user.lastScore} <span className="text-sm text-gray-500">pts</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Helper function for ranking colors
const getRankColor = (index) => {
  switch (index) {
    case 0:
      return "text-yellow-500 drop-shadow-md";
    case 1:
      return "text-gray-400 drop-shadow-sm";
    case 2:
      return "text-amber-600 drop-shadow-sm";
    default:
      return "text-gray-600";
  }
};

export default Leaderboard;