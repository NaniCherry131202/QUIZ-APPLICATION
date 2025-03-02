import { useEffect, useState, useCallback } from "react";
import { getUsers, deleteUser, promoteToAdmin } from "../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState({ show: false, userId: null, action: "", selectedRole: "" });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    if (!token) {
      toast.error("Unauthorized access. Please log in.");
      window.location.href = "/";
      return;
    }
    setLoading(true);
    try {
      const { data } = await getUsers(token);
      setUsers(data);
    } catch (error) {
      toast.error(`Error fetching users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAction = async (userId, action, selectedRole) => {
    setLoading(true);
    try {
      switch (action) {
        case "delete":
          await deleteUser(userId, token);
          toast.success("User deleted successfully");
          break;
        case "promote":
        case "demote":
          await promoteToAdmin(userId, token, selectedRole);
          toast.success(`User ${action === "promote" ? "promoted" : "demoted"} to ${selectedRole}`);
          break;
        default:
          throw new Error("Invalid action");
      }
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${action} user: ${error.message}`);
    } finally {
      setLoading(false);
      setShowConfirm({ show: false, userId: null, action: "", selectedRole: "" });
    }
  };

  // Animation Variants
  const searchBarVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    focus: { scale: 1.02, borderColor: "#14b8a6", transition: { duration: 0.3 } },
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.1 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, backgroundColor: "#374151", transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-grow">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center text-teal-400"
        >
          Admin Dashboard
        </motion.h2>

        {/* Search and Filter Controls */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4 w-full">
          <motion.div
            variants={searchBarVariants}
            initial="hidden"
            animate="visible"
            className="relative w-full"
          >
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 sm:p-4 pr-10 sm:pr-12 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-lg transition-all duration-300 text-sm sm:text-base"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </motion.span>
          </motion.div>
          <motion.select
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-3 sm:p-4 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md w-full sm:w-36 lg:w-40 text-sm sm:text-base transition-all duration-300"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </motion.select>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <motion.div
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-t-teal-500 border-gray-600 rounded-full"
            />
          </motion.div>
        ) : (
          <motion.div
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            className="bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full"
          >
            {/* Table for larger screens */}
            <div className="hidden sm:block">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-teal-600 to-green-500 text-white">
                  <tr>
                    <th className="p-3 sm:p-4 font-semibold text-left text-sm sm:text-base">Name</th>
                    <th className="p-3 sm:p-4 font-semibold text-left text-sm sm:text-base">Email</th>
                    <th className="p-3 sm:p-4 font-semibold text-left text-sm sm:text-base">Role</th>
                    <th className="p-3 sm:p-4 font-semibold text-left text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user._id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        exit={{ opacity: 0, x: 50 }}
                        className="bg-gray-700"
                      >
                        <td className="p-3 sm:p-4 border-b border-gray-600 text-sm sm:text-base">{user.name}</td>
                        <td className="p-3 sm:p-4 border-b border-gray-600 text-sm sm:text-base">{user.email}</td>
                        <td className="p-3 sm:p-4 border-b border-gray-600">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                              user.role === "admin"
                                ? "bg-green-500"
                                : user.role === "teacher"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 border-b border-gray-600 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-start">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setShowConfirm({ show: true, userId: user._id, action: "promote", selectedRole: "student" })
                            }
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-md text-xs sm:text-sm w-full sm:w-auto"
                          >
                            Promote
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setShowConfirm({ show: true, userId: user._id, action: "demote", selectedRole: "student" })
                            }
                            className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-md text-xs sm:text-sm w-full sm:w-auto"
                          >
                            Demote
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setShowConfirm({ show: true, userId: user._id, action: "delete", selectedRole: "" })
                            }
                            className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-md text-xs sm:text-sm w-full sm:w-auto"
                          >
                            Delete
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Card layout for smaller screens */}
            <div className="block sm:hidden space-y-4">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    exit={{ opacity: 0, x: 50 }}
                    className="bg-gray-700 p-4 rounded-lg shadow-md"
                  >
                    <div className="text-sm mb-2">
                      <span className="font-semibold">Name:</span> {user.name}
                    </div>
                    <div className="text-sm mb-2">
                      <span className="font-semibold">Email:</span> {user.email}
                    </div>
                    <div className="text-sm mb-3">
                      <span className="font-semibold">Role:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === "admin"
                            ? "bg-green-500"
                            : user.role === "teacher"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setShowConfirm({ show: true, userId: user._id, action: "promote", selectedRole: "student" })
                        }
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg shadow-md text-sm w-full"
                      >
                        Promote
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setShowConfirm({ show: true, userId: user._id, action: "demote", selectedRole: "student" })
                        }
                        className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-3 py-2 rounded-lg shadow-md text-sm w-full"
                      >
                        Demote
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setShowConfirm({ show: true, userId: user._id, action: "delete", selectedRole: "" })
                        }
                        className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-3 py-2 rounded-lg shadow-md text-sm w-full"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm.show && (
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4"
            >
              <motion.div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-teal-400">Confirm {showConfirm.action} Action</h3>
                <p className="text-gray-300 mb-4 text-sm sm:text-base">Please select the role for this user:</p>
                <select
                  value={showConfirm.selectedRole}
                  onChange={(e) => setShowConfirm({ ...showConfirm, selectedRole: e.target.value })}
                  className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                >
                  {showConfirm.action === "promote" && (
                    <>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </>
                  )}
                  {showConfirm.action === "demote" && (
                    <>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </>
                  )}
                  {showConfirm.action === "delete" && <option value="">N/A</option>}
                </select>
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirm({ show: false, userId: null, action: "", selectedRole: "" })}
                    className="px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg text-sm sm:text-base w-full sm:w-auto"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAction(showConfirm.userId, showConfirm.action, showConfirm.selectedRole)}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-lg text-sm sm:text-base w-full sm:w-auto"
                  >
                    Confirm
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;