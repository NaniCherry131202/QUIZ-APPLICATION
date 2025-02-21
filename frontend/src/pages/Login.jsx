import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = ({ onLogin }) => { // Add onLogin prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:2424/api/auth/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        onLogin(res.data.role); // Update App.jsx state
        // Navigate based on role
        if (res.data.role === "admin") {
          navigate("/admin");
        } else if (res.data.role === "teacher") {
          navigate("/teacher");
        } else if (res.data.role === "student") {
          navigate("/student");
        } else {
          throw new Error("Unknown role");
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="relative flex justify-center items-center h-screen overflow-hidden bg-gray-900">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        className="absolute w-full h-full object-cover z-0"
      >
        <source src="/Background.mp4" type="video/mp4" />
      </video>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>
      {/* Login Box */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg shadow-lg w-96 border border-white/20 z-10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">Login</h2>
        {error && <p className="text-red-400 text-center mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-transparent border border-white/30 text-white rounded focus:outline-none focus:ring-2 focus:ring-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-transparent border border-white/30 text-white rounded focus:outline-none focus:ring-2 focus:ring-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full border border-white bg-transparent text-white p-3 rounded-lg transition-all duration-300 hover:bg-white hover:text-black"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </motion.button>
        </form>
        <p className="text-center text-white mt-4">
          Don’t have an account? <a href="/signup" className="text-white-400 hover:underline hover:text-blue-500">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;