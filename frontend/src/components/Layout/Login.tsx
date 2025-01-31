import * as React from 'react';
import LoginHeader from '../Header/Login';

export const LoginLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="w-full min-h-[100vh] bg-black text-center font-grotesk">
      <LoginHeader />
      <div className="w-full h-full">{children}</div>
    </div>
  );
};
