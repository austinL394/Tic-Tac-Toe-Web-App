import { create } from 'zustand';;
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import axiosClient from '@/utils/axiosClient';
import { User, UserRole } from '../admin/types';

export type AuthState = 'loading' | 'logged-out' | 'logged-in';

declare global {
  interface Window {
    pdf_token: string | undefined;
  }
}

const pdf_token = window.pdf_token;

export type UserInfo = {
  username: string;
  email: string;
  id_organization: string;
  id_user: string;
  agreement_acknowledged: boolean;
  userrole: UserRole;
};

export type AuthStore = {
  state: AuthState;
  userInfo: UserInfo | null;
  actions: {
    refresh: () => Promise<void>;
    logout: () => void;
    getToken: () => Promise<string>;
  };
  pdf_token?: string;
};

const getUser = async (token: string) => {
  const result = await axiosClient.get<{ result: User }>(`/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result.data.result;
};

export const useAuth = create<AuthStore>((set, get) => {
  return {
    state: 'loading',
    userInfo: null,
    actions: {
      refresh: async () => {
        console.log('refreshing');
        try {
          const token = await getToken();
          if (!token) {
            console.log('no token');
            set({ state: 'logged-out', userInfo: null });
            return;
          }

          const user = await getUser(token);
          const userInfo = {
            username: user.username,
            email: user.emailaddress,
            id_user: user.id_user,
            id_organization: user.id_organization,
            userrole: user.userrole as UserRole,
            agreement_acknowledged: user.agreement_acknowledged,
          };
          set({ state: 'logged-in', userInfo });
        } catch (error) {
          console.log('error', error);
          set({ state: 'logged-out', userInfo: null });
        }
      },

      logout: () => {
        localStorage.clear();
      },
    },
  };
});

useAuth.getState().actions.refresh();
