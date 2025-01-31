import { PropsWithChildren } from 'react';
import { Login } from './Login';
import { useAuth } from './useAuth';

const AuthGuard = ({ children }: PropsWithChildren) => {
  const state = useAuth((store) => store.state);

  if (state === 'loading') {
    return <div className="bg-black h-screen flex items-center justify-center text-white">Loading...</div>;
  } else if (state === 'logged-out') {
    return <Login />;
  } else if (state === 'logged-in') {
    return <>{children}</>;
  } else {
    throw new Error(`Unknown state: ${state}`);
  }
};

export default AuthGuard;
