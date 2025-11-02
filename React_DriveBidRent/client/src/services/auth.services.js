import axiosInstance from '../utils/axiosInstance.util';

export const authServices = {
  signup: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      } else {
        throw error;
      }
    }
  },
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      } else {
        throw error;
      }
    }
  },
  logout: async () => {
    try {
      const response = await axiosInstance.get('/auth/logout');
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      } else {
        throw error;
      }
    }
  }
};