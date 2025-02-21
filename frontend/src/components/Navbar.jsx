import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const linkVariants = {
    hover: { scale: 1.1, color: "#34d399" },
    tap: { scale: 0.95 },
  };

  const logoVariants = {
    initial: { rotate: 0 },
    hover: { rotate: 360, transition: { duration: 0.5 } },
  };

  return (
    <motion.nav
      className="bg-gray-900 p-4 text-white flex justify-between items-center shadow-lg sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      {/* Logo Section */}
      <motion.div
        className="flex items-center space-x-3"
        variants={logoVariants}
        whileHover="hover"
      >
        <svg
          className="w-10 h-10 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
          />
        </svg>
        <h1 className="text-2xl font-extrabold tracking-tight text-green-300 hidden sm:block">
          QuizMaster
        </h1>
      </motion.div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        {/* Hamburger Menu for Mobile */}
        <div className="sm:hidden">
          <motion.button
            className="text-green-400 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </motion.button>
        </div>

        {/* Desktop Links */}
        <div className="hidden sm:flex space-x-6">
          <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
            <Link to="/teacher" className="text-lg font-medium hover:text-green-400 transition-colors">
              Teacher
            </Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
            <Link to="/student" className="text-lg font-medium hover:text-green-400 transition-colors">
              Student
            </Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover" whileTap="tap">
            <Link to="/leaderboard" className="text-lg font-medium hover:text-green-400 transition-colors">
              Leaderboard
            </Link>
          </motion.div>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
          whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(239, 68, 68, 0.7)" }}
          whileTap={{ scale: 0.95 }}
        >
          Logout
        </motion.button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <motion.div
          className="absolute top-16 left-0 w-full bg-gray-800 p-4 flex flex-col space-y-4 sm:hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/teacher" className="text-lg font-medium text-green-300 hover:text-green-400" onClick={() => setIsMobileMenuOpen(false)}>
            Teacher
          </Link>
          <Link to="/student" className="text-lg font-medium text-green-300 hover:text-green-400" onClick={() => setIsMobileMenuOpen(false)}>
            Student
          </Link>
          <Link to="/leaderboard" className="text-lg font-medium text-green-300 hover:text-green-400" onClick={() => setIsMobileMenuOpen(false)}>
            Leaderboard
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;