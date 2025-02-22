import { useEffect, useState, useCallback } from "react";
import { getUsers, deleteUser, promoteToAdmin, demoteFromAdmin } from "../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState({ show: false, userId: null, action: "" });
  const token = localStorage.getItem("token");

  // Memoized fetchUsers function
  const fetchUsers = useCallback(async () => {
    if (!token) {
      toast.error("Unauthorized access");
      return;
    }
    try {
      const { data } = await getUsers(token);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users: " + (error.response?.data?.message || error.message));
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search and filter users (case-insensitive)
  const filteredUsers = users.filter(user => 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase())
  );

  const handleAction = async (userId, action) => {
    console.log(`Attempting ${action} for user ID:`, userId, "Token:", token);
    try {
      switch(action) {
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
      console.error(`Action error:`, error);
      toast.error(`Failed to ${action} user: ${error.response?.data?.message || error.message}`);
    }
    setShowConfirm({ show: false, userId: null, action: "" });
  };

  // Animation variants for 3D and smooth transitions
  const tableVariants = {
    hidden: { opacity: 0, scale: 0.95, rotateX: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotateX: 0, 
      transition: { duration: 0.8, ease: "easeInOut" } 
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -50, rotateY: -20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      rotateY: 0, 
      scale: 1, 
      transition: { duration: 0.5, type: "spring", stiffness: 100 } 
    },
    hover: { 
      scale: 1.02, 
      rotateY: 5, 
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" 
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.8, y: 50 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
    

      {/* Dashboard content occupying full screen width */}
      <div className="p-6 max-w-full mx-auto">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold mb-8 text-center text-white"
        >
          Admin Dashboard
        </motion.h2>

        {/* Search and Filter Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 w-full">
          <motion.input
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-4 border-none rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md w-full sm:w-auto"
          />
          <motion.select
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-4 border-none rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md w-full sm:w-auto"
          >
            <option value="all" className="bg-gray-700 text-white">All Roles</option>
            <option value="admin" className="bg-gray-700 text-white">Admins</option>
            <option value="user" className="bg-gray-700 text-white">Users</option>
          </motion.select>
        </div>

        {/* Users Table with 3D Effects */}
        <motion.div 
          variants={tableVariants} 
          initial="hidden" 
          animate="visible"
          className="bg-gray-800 rounded-xl shadow-2xl p-6 perspective-1000 w-full"
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
                    exit={{ opacity: 0, x: 50, rotateY: 20 }}
                    className="bg-gray-700 rounded-lg my-2 transform-style-3d transition-transform duration-300"
                    style={{ transform: "perspective(1000px) translateZ(20px)" }}
                  >
                    <td className="p-4 border-b border-gray-600 text-white">{user.name}</td>
                    <td className="p-4 border-b border-gray-600 text-white">{user.email}</td>
                    <td className="p-4 border-b border-gray-600">
                      <span className={`px-3 py-1 rounded ${user.role === 'admin' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 border-b border-gray-600 space-x-2">
                      {user.role !== "admin" ? (
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: "#8E2DE2" }} // Attractive purple gradient base
                          onClick={() => setShowConfirm({ show: true, userId: user._id, action: "promote" })}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300"
                        >
                          Promote
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: "#FF6F61" }} // Attractive coral gradient base
                          onClick={() => setShowConfirm({ show: true, userId: user._id, action: "demote" })}
                          className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300"
                        >
                          Demote
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#2ECC71" }} // Attractive green gradient base
                        onClick={() => setShowConfirm({ show: true, userId: user._id, action: "delete" })}
                        className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300"
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

        {/* Confirmation Modal with 3D Effect */}
        <AnimatePresence>
          {showConfirm.show && (
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center"
            >
              <motion.div
                className="bg-gray-800 p-8 rounded-xl shadow-2xl transform-style-3d"
                style={{ transform: "perspective(1000px) translateZ(50px)" }}
              >
                <h3 className="text-xl font-bold mb-4 text-white">
                  Confirm {showConfirm.action} Action
                </h3>
                <p className="text-gray-300 mb-6">Are you sure you want to {showConfirm.action} this user?</p>
                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#757575" }}
                    onClick={() => setShowConfirm({ show: false, userId: null, action: "" })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#2ECC71" }} // Attractive green gradient base for Confirm
                    onClick={() => handleAction(showConfirm.userId, showConfirm.action)}
                    className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
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