import axios from "axios";

const axiosInstance = axios.create({
  // Vite env vars are prefixed with VITE_
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Optional: keep the interceptor if you want to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosInstance;