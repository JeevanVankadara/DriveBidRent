// client/src/services/auth.services.js
import axiosInstance from '../utils/axiosInstance.util';

export const authServices = {
  signup: async (data) => {
    const res = await axiosInstance.post('/auth/signup', data);
    return res.data;
  },

  login: async (credentials) => {
    const res = await axiosInstance.post('/auth/login', credentials);
    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.get('/auth/logout');
    return res.data;
  }
};
