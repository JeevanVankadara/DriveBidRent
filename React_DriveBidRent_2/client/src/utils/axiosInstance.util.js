// client/src/utils/axiosInstance.util.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "https://drivebidrent.onrender.com"}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 from an auth endpoint means "those credentials were wrong", not
    // "your session expired" — the login page has to stay put and show the
    // message itself. Only a 401 from a protected resource is a dead session
    // worth bouncing to the home page.
    //
    // This is deliberately checked on the request URL rather than on
    // window.location: the old pathname check missed /secret-login and
    // /secret-signup, because "/secret-login".includes("/login") is false.
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/');

    // Second guard: never bounce off a login/signup screen, whatever fired
    // the request. Matches /login, /signup, /secret-login, /secret-signup.
    const path = window.location.pathname;
    const onAuthPage = /(login|signup)$/i.test(path);

    if (error.response?.status === 401 && !isAuthRequest && !onAuthPage) {
      localStorage.setItem('loginMessage', 'Please login to continue');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;