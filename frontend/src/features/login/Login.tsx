import React, { useState, FormEvent, useMemo } from 'react';
import QRCode from 'qrcode';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { LoginLayout } from '../../components/Layout/Login';
import UserPool from './UserPool';
import { useAuth } from './useAuth';
import ArrowLeftIcon from '@/components/Icons/ArrowLeftIcon';

export type ResetState = 'reset-idle' | 'reset-started' | 'reset-verifying' | 'reset-complete' | 'reset-new';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string>('');


  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

  };

  const handleResetPassword = () => {
    setMessage('');
  };

  return (
    <LoginLayout>
      <div className="flex justify-center min-h-screen my-[10%]">
        <div className="w-full max-w-lg">
          {message && (
            <div className="flex items-center justify-center my-[10%] text-red" data-testid="error message">
              {message}
            </div>
          )}
          <form aria-label="login" onSubmit={onSubmit}>
            <div className="mb-4">
              <label>
                <span className="block text-xs text-white text-left">Username</span>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
            </div>
            <div className="mb-6 my-[10%]">
              <label>
                <span className="block text-xs text-white text-left">Password</span>
                <input
                  type="password"
                  className="w-full px-3 py-2 border font-black border-gray-300 rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div className="flex items-center justify-center my-[10%]">
              <button
                className="py-2 px-4 w-full bg-white"
                style={{ color: 'white', backgroundColor: 'rgb(71, 135, 209)' }}
              >
                Login
              </button>
            </div>
            <div className="flex my-[10%]">
              <button className="py-2 text-white text-left" onClick={handleResetPassword}>
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </LoginLayout>
  );
};
