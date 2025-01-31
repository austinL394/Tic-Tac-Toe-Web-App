import * as React from 'react';
import { Header } from '../Header';

export const MainLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Header>
      </Header>
      {/* Tool Bar */}
      <div className="w-full h-full overflow-hidden">{children}</div>
      {/* Main Body */}
    </>
  );
};
