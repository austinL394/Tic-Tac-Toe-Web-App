// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      alert("SDDSDFSDF");

      // If refresh token logic is needed, implement it here
      // const newToken = await refreshToken();
      // if (newToken) {
      //   useAuthStore.getState().login(useAuthStore.getState().user!, newToken);
      //   return api(originalRequest);
      // }

      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
