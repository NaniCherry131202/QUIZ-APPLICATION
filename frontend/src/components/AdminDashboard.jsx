import { useEffect, useState, useCallback } from "react";
import { getUsers, deleteUser, promoteToAdmin, demoteFromAdmin } from "../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState({ show: false, userId: null, action: "" });
  const [loading, setLoading] = useState(false); // Loading state
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
      setUsers([...data]);
    } catch (error) {
      toast.error("Error fetching users: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleAction = async (userId, action) => {
    console.log(`Attempting ${action} for user ID: ${userId}, Token: ${token}`);
    setLoading(true);
    try {
      switch (action) {
        case "delete":
          await deleteUser(userId, token);
          toast.success("User deleted successfully");
          break;
        case "promote":
          await promoteToAdmin(userId, token);
          toast.success("User promoted to admin");
          break;
        case "demote":
          await demoteFromAdmin(userId, token);
          toast.success("User demoted to user");
          break;
        default:
          throw new Error("Invalid action");
      }
      fetchUsers();
    } catch (error) {
      console.error(`Failed ${action}:`, error.response?.data || error);
      toast.error(`Failed to ${action} user: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setShowConfirm({ show: false, userId: null, action: "" });
    }
  };

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0, scale: 0.95, rotateX: -10 },
    visible: { opacity: 1, scale: 1, rotateX: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -50, rotateY: -20, scale: 0.9 },
    visible: { opacity: 1, x: 0, rotateY: 0, scale: 1, transition: { duration: 0.5, type: "spring" } },
    hover: { scale: 1.02, rotateY: 5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.8, y: 50 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-grow">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-white"
        >
          Admin Dashboard
        </motion.h2>

        {/* Search and Filter Controls */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4 w-full">
          <motion.input
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 sm:p-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md w-full"
          />
          <motion.select
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-3 sm:p-4 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md w-full sm:w-40"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </motion.select>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-teal-500 border-gray-600 rounded-full"
            />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <motion.div
              variants={tableVariants}
              initial="hidden"
              animate="visible"
              className="hidden sm:block bg-gray-800 rounded-xl shadow-2xl p-6 w-full"
            >
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-teal-600 to-green-500 text-white">
                  <tr>
                    <th className="p-4 font-semibold text-left">Name</th>
                    <th className="p-4 font-semibold text-left">Email</th>
                    <th className="p-4 font-semibold text-left">Role</th>
                    <th className="p-4 font-semibold text-left">Actions</th>
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
                        <td className="p-4 border-b border-gray-600">{user.name}</td>
                        <td className="p-4 border-b border-gray-600">{user.email}</td>
                        <td className="p-4 border-b border-gray-600">
                          <span
                            className={`px-3 py-1 rounded ${
                              user.role === "admin" ? "bg-green-500" : "bg-blue-500"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 border-b border-gray-600 space-x-2">
                          {user.role !== "admin" ? (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() =>
                                setShowConfirm({ show: true, userId: user._id, action: "promote" })
                              }
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md"
                            >
                              Promote
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() =>
                                setShowConfirm({ show: true, userId: user._id, action: "demote" })
                              }
                              className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md"
                            >
                              Demote
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() =>
                              setShowConfirm({ show: true, userId: user._id, action: "delete" })
                            }
                            className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg shadow-md"
                          >
                            Delete
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>

            {/* Mobile Card Layout */}
            <div className="sm:hidden space-y-4">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: 50 }}
                    className="bg-gray-700 p-4 rounded-lg shadow-md"
                  >
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">Name:</span> {user.name}
                      </div>
                      <div>
                        <span className="font-semibold">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="font-semibold">Role:</span>{" "}
                        <span
                          className={`px-2 py-1 rounded ${
                            user.role === "admin" ? "bg-green-500" : "bg-blue-500"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {user.role !== "admin" ? (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() =>
                              setShowConfirm({ show: true, userId: user._id, action: "promote" })
                            }
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-lg shadow-md"
                          >
                            Promote
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() =>
                              setShowConfirm({ show: true, userId: user._id, action: "demote" })
                            }
                            className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-3 py-1 rounded-lg shadow-md"
                          >
                            Demote
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() =>
                            setShowConfirm({ show: true, userId: user._id, action: "delete" })
                          }
                          className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-3 py-1 rounded-lg shadow-md"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
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
              <motion.div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-white">
                  Confirm {showConfirm.action} Action
                </h3>
                <p className="text-gray-300 mb-6">Are you sure you want to {showConfirm.action} this user?</p>
                <div className="flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowConfirm({ show: false, userId: null, action: "" })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleAction(showConfirm.userId, showConfirm.action)}
                    className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-lg"
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