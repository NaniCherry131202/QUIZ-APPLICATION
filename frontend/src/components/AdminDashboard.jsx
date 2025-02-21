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
  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-6 text-center"
      >
        Admin Dashboard
      </motion.h2>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>

      {/* Users Table */}
      <motion.div variants={tableVariants} initial="hidden" animate="visible">
        <table className="w-full border-collapse border border-gray-300 shadow-lg">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
            <tr>
              <th className="border p-3 font-semibold">Name</th>
              <th className="border p-3 font-semibold">Email</th>
              <th className="border p-3 font-semibold">Role</th>
              <th className="border p-3 font-semibold">Actions</th>
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
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center hover:bg-gray-50 transition-colors"
                >
                  <td className="border p-3">{user.name}</td>
                  <td className="border p-3">{user.email}</td>
                  <td className="border p-3">
                    <span className={`px-2 py-1 rounded ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="border p-3 space-x-2">
                    {user.role !== "admin" ? (
                      <button
                        onClick={() => setShowConfirm({ show: true, userId: user._id, action: "promote" })}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded transition-colors"
                      >
                        Promote
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirm({ show: true, userId: user._id, action: "demote" })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded transition-colors"
                      >
                        Demote
                      </button>
                    )}
                    <button
                      onClick={() => setShowConfirm({ show: true, userId: user._id, action: "delete" })}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-6 rounded-lg shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-4">
                Confirm {showConfirm.action} action
              </h3>
              <p>Are you sure you want to {showConfirm.action} this user?</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm({ show: false, userId: null, action: "" })}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(showConfirm.userId, showConfirm.action)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;