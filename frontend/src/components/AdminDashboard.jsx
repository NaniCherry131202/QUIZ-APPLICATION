import { useEffect, useState } from "react";
import { getUsers, deleteUser, promoteToAdmin } from "../services/api";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token"); // Fetch stored JWT

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers(token);
      setUsers(data);
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId, token);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handlePromote = async (userId) => {
    try {
      await promoteToAdmin(userId, token);
      toast.success("User promoted to admin");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to promote user");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center">
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2 space-x-2">
                {user.role !== "admin" && (
                  <button
                    onClick={() => handlePromote(user._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Promote
                  </button>
                )}
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
