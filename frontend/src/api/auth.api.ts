import { apiClient } from './client';

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  data: User & { accessToken: string };
}

export interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

export const authApi = {
  login: async (credentials: any) => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },
  register: async (userData: any) => {
    return apiClient.post<AuthResponse>('/auth/register', userData);
  },
  refresh: async () => {
    // Dynamic import to avoid circular dependency / interceptor issues
    const { default: axios } = await import('axios');
    return axios.post<RefreshResponse>(`${apiClient.defaults.baseURL}/auth/refresh`, {}, {
      withCredentials: true
    });
  },
  logout: async () => {
    return apiClient.post('/auth/logout');
  }
};
