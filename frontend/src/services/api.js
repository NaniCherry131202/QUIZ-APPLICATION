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

export const getUsers = async (token) => {
  if (!token) throw new Error("No authentication token provided");
  return api.get("/users"); // Calls /api/admin/users
};

export const deleteUser = async (userId, token) => {
  if (!token) throw new Error("No authentication token provided");
  if (!userId) throw new Error("User ID is required");
  return api.delete(`/users/${userId}`); // Updated to /api/admin/users/:id
};

export const promoteToAdmin = async (userId, token) => {
  if (!token) throw new Error("No authentication token provided");
  if (!userId) throw new Error("User ID is required");
  return api.put(`/promote/${userId}`, {}); // Correct for /api/admin/promote/:id
};

export const demoteFromAdmin = async (userId, token) => {
  if (!token) throw new Error("No authentication token provided");
  if (!userId) throw new Error("User ID is required");
  return api.put(`/demote/${userId}`, {}); // Correct for /api/admin/demote/:id
};

// Additional useful API calls you might consider
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