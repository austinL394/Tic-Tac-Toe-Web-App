import { SocketProvider } from '@/contexts/SocketContext';
import { Outlet } from 'react-router-dom';

import MainLayout from './MainLayout';

export function RootLayout() {
  return (
    <SocketProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </SocketProvider>
  );
}
