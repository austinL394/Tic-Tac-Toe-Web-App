import create from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
}

interface PersistedState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Full state interface including actions
interface AuthState extends PersistedState {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Persisted state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Non-persisted actions
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),

      logout: () => set({ user: null, token: null, isAuthenticated: false, isLoading: false }),

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      // Only persist specific state properties
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
      }),
      getStorage: () => localStorage,
    },
  ),
);
