// src/services/authService.ts
import api from './api';
import { useAuthStore } from '../stores/authStore';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(credentials: RegisterCredentials) {
    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials);
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

  async getProfile() {
    try {
      const response = await api.get<User>('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
