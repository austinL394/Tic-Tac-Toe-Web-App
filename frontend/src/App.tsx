import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// import { Reports } from 'features/reports';

import './App.css';
import 'draft-js/dist/Draft.css';
import AppLayout from 'components/Layout/AppLayout';
import Register from './features/register/Register';
import { Login } from './features/login/Login';

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
        path: '/',
        loader: () => redirect('/reports'),
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
