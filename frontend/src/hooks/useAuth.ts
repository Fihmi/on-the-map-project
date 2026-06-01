import { useState, useEffect } from 'react';
import type { User } from '../api/auth.api';
import { authApi } from '../api/auth.api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // You would typically have a /me endpoint to get user details
          // We can simulate fetching user or just relying on successful refresh
          const { data } = await authApi.refresh();
          localStorage.setItem('accessToken', data.accessToken);
          // Here we would ideally set the user data, assuming a simple decode or a fetch
          // For scaffolding, we just mark as authenticated if refresh works
          setUser({ _id: 'temp', name: 'User', email: 'user@example.com' });
        } catch (error) {
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: any) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser({ _id: data.data._id, name: data.data.name, email: data.data.email });
  };

  const register = async (userData: any) => {
    const { data } = await authApi.register(userData);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser({ _id: data.data._id, name: data.data.name, email: data.data.email });
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return { user, loading, login, register, logout };
};
