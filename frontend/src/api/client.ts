import axios from 'axios';
import { authApi } from './auth.api';

const API_URL = import.meta.env.VITE_API_URL || 'https://on-the-map-project-d5f6.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // required for refresh token cookie
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await authApi.refresh();
        localStorage.setItem('accessToken', data.accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
