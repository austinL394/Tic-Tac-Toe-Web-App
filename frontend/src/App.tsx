import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// import { Reports } from 'features/reports';

import './App.css';
import 'draft-js/dist/Draft.css';
import AppLayout from 'components/Layout/AppLayout';
import Register from './features/register/Register';
import { Login } from './features/login/Login';
import Dashboard from './features/dashboard/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SocketProvider } from './contexts/SocketContext';

// Create a client
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/reports',
        element: <div />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            {' '}
            <Dashboard />{' '}
          </ProtectedRoute>
        ),
      },
      {
        path: '/',
        loader: () => redirect('/reports'),
      },
    ],
  },
]);

function App() {
  return (
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SocketProvider>
  );
}

export default App;
