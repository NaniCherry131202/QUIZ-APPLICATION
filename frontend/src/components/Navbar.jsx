import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const navLinks = [
  { to: "/teacher", label: "Teacher" },
  { to: "/student", label: "Student" },
  { to: "/leaderboard", label: "Leaderboard" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 20 },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.1, color: "#60A5FA", transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: 360,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.nav
      className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center space-x-3"
        variants={logoVariants}
        initial="initial"
        whileHover="hover"
      >
        <svg
          className="w-10 h-10 text-blue-500"
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
        <h1 className="text-2xl font-extrabold tracking-tight text-white hidden sm:block">
          QuizMaster
        </h1>
      </motion.div>
      <div className="flex items-center space-x-6">
        <div className="sm:hidden">
          <motion.button
            className="text-blue-500 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle mobile menu"
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
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </motion.button>
        </div>
        <motion.div
          className="hidden sm:flex items-center space-x-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {navLinks.map((link) => (
            <motion.div key={link.to} variants={linkVariants} whileHover="hover" whileTap="tap">
              <Link to={link.to} className="text-lg font-medium text-white hover:text-blue-500 transition-colors duration-300">
                {link.label}
              </Link>
            </motion.div>
          ))}
          <motion.button
            onClick={handleLogout}
            className="relative px-5 py-2 text-white font-semibold bg-transparent border border-white/30 rounded-lg overflow-hidden group"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Logout</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </motion.button>
        </motion.div>
      </div>
      {isMobileMenuOpen && (
        <motion.div
          className="absolute top-16 left-0 w-full bg-gray-800 p-6 flex flex-col space-y-6 sm:hidden shadow-lg"
          variants={mobileMenuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {navLinks.map((link) => (
            <motion.div key={link.to} variants={linkVariants} whileHover="hover" whileTap="tap">
              <Link
                to={link.to}
                className="text-lg font-medium text-white hover:text-blue-500 transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
          <motion.button
            onClick={handleLogout}
            className="relative px-5 py-2 text-white font-semibold bg-transparent border border-white/30 rounded-lg overflow-hidden group"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Logout</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </motion.button>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;