import { create } from 'zustand';
import UserPool from './UserPool';
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

// Fetch user session
const getSession = (user: CognitoUser): Promise<CognitoUserSession | null> => {
  return new Promise((resolve, reject) => {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        reject(err || new Error('No session found'));
      } else {
        resolve(session);
      }
    });
  });
};

const getUser = async (token: string) => {
  const result = await axiosClient.get<{ result: User }>(`/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result.data.result;
};

const getToken = async () => {
  if (pdf_token) {
    return pdf_token;
  }

  const user = UserPool.getCurrentUser();
  if (!user) {
    throw new Error('No user found');
  }

  const session = await getSession(user);
  if (!session) {
    throw new Error('No session found');
  }

  if (!session.isValid()) {
    throw new Error('Session is invalid');
  }

  return session.getAccessToken().getJwtToken();
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
        const user = UserPool.getCurrentUser();
        user?.signOut();
        localStorage.clear();
        set({ state: 'logged-out', userInfo: null });
      },

      getToken: async () => {
        const token = await getToken();
        if (get().state !== 'logged-in' || !token) {
          throw new Error('User is not logged in');
        }
        return token;
      },
    },
  };
});

useAuth.getState().actions.refresh();
