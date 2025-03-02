import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // Add Framer Motion for animations
import { toast, ToastContainer } from "react-toastify"; // Add react-toastify for consistency
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:2424/api/quizzes/leaderboard");
        console.log("API response:", res.data);
        setLeaders(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Check the server or console for details.");
        toast.error("Failed to load leaderboard. Please try again.", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut", staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, type: "spring", stiffness: 100 } },
  };

  const titleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
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
        variants={containerVariants}
      >
        <motion.h2
          className="text-4xl font-bold mb-8 text-center text-blue-400 uppercase tracking-wider flex items-center justify-center gap-2"
          variants={titleVariants}
        >
          <span>🏆</span> Leaderboard Peak
        </motion.h2>
        {isLoading ? (
          <motion.div
            className="flex justify-center items-center h-32"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-blue-400 text-2xl">Loading...</span>
          </motion.div>
        ) : error ? (
          <motion.p
            className="p-4 text-red-400 text-center"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            {error}
          </motion.p>
        ) : leaders.length === 0 ? (
          <motion.p
            className="p-4 text-gray-500 text-center"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            No leaders found.
          </motion.p>
        ) : (
          <motion.ul
            className="divide-y divide-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {leaders.map((user, index) => (
              <motion.li
                key={user._id || index} // Use _id if available, fallback to index
                className="p-4 flex items-center justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-lg"
                variants={itemVariants}
                whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(96, 165, 250, 0.3)" }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xl font-bold ${getRankColor(index)}`}
                    style={{ textShadow: index < 3 ? "0 0 5px rgba(255, 255, 255, 0.5)" : "none" }}
                  >
                    {index + 1}.
                  </span>
                  <div className="relative">
                    <span
                      className={`absolute -top-1 -right-2 text-yellow-400 text-sm animate-pulse`}
                    >
                      {index < 3 && "★"}
                    </span>
                    <span className="font-semibold text-white">{user.name || "Anonymous"}</span>
                  </div>
                </div>
                <span className="text-purple-500 font-medium">
                  {user.lastScore || 0} <span className="text-sm text-gray-400">pts</span>
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>
      <ToastContainer />
    </motion.div>
  );
};

// Helper function for ranking colors
const getRankColor = (index) => {
  switch (index) {
    case 0:
      return "text-yellow-500 drop-shadow-md";
    case 1:
      return "text-gray-300 drop-shadow-sm";
    case 2:
      return "text-amber-400 drop-shadow-sm";
    default:
      return "text-gray-400";
  }
};

export default Leaderboard;