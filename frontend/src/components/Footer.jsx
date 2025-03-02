import { useState } from "react";
import { motion } from "framer-motion";
import { EnvelopeIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios"; // Add axios for API calls
import "react-toastify/dist/ReactToastify.css";

// Social Icons (using Font Awesome classes)
const socialLinks = [
  { name: "Twitter", href: "https://twitter.com", icon: "fab fa-twitter" },
  { name: "Facebook", href: "https://facebook.com", icon: "fab fa-facebook" },
  { name: "Instagram", href: "https://instagram.com", icon: "fab fa-instagram" },
  { name: "GitHub", href: "https://github.com", icon: "fab fa-github" },
];

// Use environment variable for API URL
const API_URL = "http://localhost:2424";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/api/subscribe`, { email });
      const { message } = response.data;

      toast.success(message || "Subscribed successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      setEmail(""); // Clear input on success
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Subscription failed. Please try again.";
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: 360,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  return (
    <footer className="relative bg-gradient-to-t from-gray-900 to-black text-white py-12 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={itemVariants} className="space-y-4">
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
          <p className="text-white/80 text-sm leading-relaxed">
            Empowering education with cutting-edge technology. Join us to
            explore, learn, and grow.
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-xl font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2 text-white/70">
            {["Home", "About", "Courses", "Contact"].map((link) => (
              <motion.li
                key={link}
                whileHover={{ x: 5, color: "#60A5FA" }}
                transition={{ duration: 0.3 }}
              >
                <a href={`/${link.toLowerCase()}`} className="hover:underline">
                  {link}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-xl font-semibold text-white">Stay Updated</h4>
          <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-white/50"
                required
                aria-label="Email for subscription"
              />
            </div>
            <motion.button
              type="submit"
              disabled={submitting}
              className="relative px-5 py-3 text-white font-semibold bg-transparent border border-white/30 rounded-lg overflow-hidden group flex items-center justify-center"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">
                {submitting ? (
                  <svg
                    className="animate-spin h-5 w-5"
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
                ) : (
                  <ArrowRightIcon className="h-5 w-5" />
                )}
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 pt-8 border-t border-white/20 mt-12 flex flex-col md:flex-row justify-between items-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.p variants={itemVariants} className="text-white/70 text-sm">
          © {new Date().getFullYear()} QuizMaster. All rights reserved.
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="flex space-x-6 mt-4 md:mt-0"
        >
          {socialLinks.map((social) => (
            <motion.a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 10, color: "#60A5FA" }}
              transition={{ duration: 0.3 }}
              className="text-white/70"
              aria-label={social.name}
            >
              <i className={social.icon}></i>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
      <ToastContainer />
    </footer>
  );
};

export default Footer;