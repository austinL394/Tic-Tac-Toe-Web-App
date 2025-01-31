import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// import { Reports } from 'features/reports';

import './App.css';
import 'draft-js/dist/Draft.css';
import AppLayout from 'components/Layout/AppLayout';
import AuthGuard from './features/login/AuthGuard';

// Create a client
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        loader: () => redirect('/reports'),
      },
      {
        path: '/reports',
        element: <div />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <RouterProvider router={router} />
      </AuthGuard>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
