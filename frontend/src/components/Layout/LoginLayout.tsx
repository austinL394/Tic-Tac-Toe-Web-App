import * as React from 'react';
import Header from './Header';

const LoginLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black font-sans">
      <Header />
      <div className="w-full pt-5">{children}</div>
    </div>
  );
};

export default LoginLayout;
