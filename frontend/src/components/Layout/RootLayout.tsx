import { Outlet } from 'react-router-dom';

import { SocketProvider } from '@/contexts/SocketContext';
import { ToastProvider } from '@/contexts/ToastrContext';

import MainLayout from '@/components/Layout/MainLayout';
import { Toaster } from 'react-hot-toast';

export function RootLayout() {
  return (
    <ToastProvider>
      <SocketProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </SocketProvider>
      <Toaster />
    </ToastProvider>
  );
}
