import axios from "axios";

const API_URL = "http://localhost:2424/api";

export const getUsers = async (token) => {
  return axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteUser = async (userId, token) => {
  return axios.delete(`${API_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const promoteToAdmin = async (userId, token) => {
  return axios.put(`${API_URL}/admin/promote/${userId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
