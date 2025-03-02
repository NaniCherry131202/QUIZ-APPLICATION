import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const API_URL = "http://localhost:2424";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, role } = res.data;
      if (!token || !role) throw new Error("Invalid response from server");

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      onLogin(role);

      const roleRoutes = {
        admin: "/admin",
        teacher: "/teacher",
        student: "/student",
      };
      navigate(roleRoutes[role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Animated Background Video */}
      <motion.video
        autoPlay
        loop
        muted
        className="absolute h-full w-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5 }}
      >
        <source src="/Background.mp4" type="video/mp4" />
      </motion.video>
      {/* Dynamic Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Login Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg border border-white/20"
      >
        <h2 className="mb-6 text-center text-4xl font-extrabold text-white drop-shadow-md">
          Welcome Back
        </h2>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-center text-red-400"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/30 bg-transparent p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              required
              aria-label="Email"
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/30 bg-transparent p-4 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              required
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-white/80">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;