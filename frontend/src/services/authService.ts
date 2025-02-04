import { useAuthStore } from '@/stores/authStore';
import api from './api';

import { User } from '@/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(credentials: RegisterCredentials) {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
      useAuthStore.getState().logout();
    } catch (error) {
      throw error;
    }
  },

  async checkAuthStatus() {
    try {
      const response = await api.get<AuthResponse>('/auth/check');
      if (response.data.success) {
        useAuthStore.getState().login(response.data.user, response.data.token);
        return response.data;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      throw error;
    }
  },
};
