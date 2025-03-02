import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const API_URL = "http://localhost:2424";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`);
      return response.data.exists; // Backend returns { exists: true/false }
    } catch (err) {
      console.error("Error checking email:", err.response?.data);
      return false; // Assume email is invalid if the check fails
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError("");

    const payload = { name, email, password, role };
    console.log("Sending to /send-verification-code:", payload);

    try {
      // Check if the email exists (should return false for new users)
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        toast.error("This email is already registered. Please use a different email or log in.", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
        return;
      }

      // Check if email format is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("This is not a valid email address.", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
        return;
      }

      const response = await axios.post(`${API_URL}/api/auth/send-verification-code`, payload);
      console.log("Response from send-verification-code:", response.data);
      setSentCode(true);
    } catch (err) {
      console.error("Error from send-verification-code:", err.response?.data);
      setError(err.response?.data?.message || "Failed to send verification code.");
      if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Invalid request. Please check your details.", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) {
      setError("Please enter the verification code.");
      return;
    }
    setIsLoading(true);
    setError("");

    const payload = { email, code };
    console.log("Sending to /verify-and-register:", payload);

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-and-register`, payload);
      console.log("Response from verify-and-register:", response.data);
      const { token, role: userRole } = response.data;
      if (!token || !userRole) throw new Error("Invalid response from server");

      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      navigate(userRole === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      console.error("Error from verify-and-register:", err.response?.data);
      setError(err.response?.data?.message || "Verification failed. Please try again.");
      if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Invalid verification code or email.", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-black">
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
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg border border-white/20"
      >
        <h2 className="mb-6 text-center text-4xl font-extrabold text-white drop-shadow-md">
          {sentCode ? "Verify Your Email" : "Create Account"}
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
        <form onSubmit={sentCode ? handleVerifyCode : handleSendCode} className="space-y-6">
          {!sentCode ? (
            <>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/30 bg-transparent p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  required
                  aria-label="Name"
                />
              </div>
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
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-white/30 bg-transparent p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 appearance-none"
                  aria-label="Role"
                >
                  <option value="student" className="bg-gray-800 text-white">Student</option>
                  <option value="teacher" className="bg-gray-800 text-white">Teacher</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">▼</span>
              </div>
            </>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength="6"
                className="w-full rounded-lg border border-white/30 bg-transparent p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                required
                aria-label="Verification Code"
              />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                </svg>
                {sentCode ? "Verifying..." : "Sending..."}
              </>
            ) : (
              sentCode ? "Verify Code" : "Send Code"
            )}
          </motion.button>
        </form>
        <p className="mt-6 text-center text-white/80">
          Already have an account?{" "}
          <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
            Login
          </a>
        </p>
      </motion.div>
      <ToastContainer /> {/* Add ToastContainer for toast notifications */}
    </div>
  );
};

export default Signup;