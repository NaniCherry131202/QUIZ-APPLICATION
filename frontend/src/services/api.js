import axios from "axios";

const API_URL = "http://localhost:2424/api/admin"; // Matches backend mounting

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Add timeout to prevent hanging
});

// Add request interceptor for consistent header handling
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export const getUsers = async (token, includePasswords = false) => {
  if (!token) throw new Error("No authentication token provided");
  return api.get("/users", { params: { includePasswords } }); // Add query param
};

export const deleteUser = async (userId, token) => {
  if (!token) throw new Error("No authentication token provided");
  if (!userId) throw new Error("User ID is required");
  return api.delete(`/users/${userId}`); // Calls /api/admin/users/:id
};

export const promoteToAdmin = async (userId, token, role) => {
  if (!token) throw new Error("No authentication token provided");
  if (!userId) throw new Error("User ID is required");
  if (!role) throw new Error("Role is required for promotion");
  return api.put(`/promote/${userId}`, { role }); // Calls /api/admin/promote/:id with role in body
};

export const demoteFromAdmin = async (userId, token, role) => {
  if (!token) throw new Error("No authentication token provided");
  if (!userId) throw new Error("User ID is required");
  if (!role) throw new Error("Role is required for demotion");
  return api.put(`/demote/${userId}`, { role }); // Calls /api/admin/demote/:id with role in body
};

// Additional useful API calls
export const getUserById = async (userId, token) => {
  if (!token) throw new Error("No authentication token provided");
  if (!userId) throw new Error("User ID is required");
  return api.get(`/users/${userId}`); // Calls /api/admin/users/:id
};

export const updateUser = async (userId, userData, token) => {
  if (!token) throw new Error("No authentication token provided");
  if (!userId) throw new Error("User ID is required");
  return api.put(`/users/${userId}`, userData); // Calls /api/admin/users/:id
};

export default api;