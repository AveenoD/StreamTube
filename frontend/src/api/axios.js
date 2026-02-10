import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data);
    return Promise.reject(error);
  }
);
export default api;