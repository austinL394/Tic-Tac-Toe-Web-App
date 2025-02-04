import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// import { Reports } from 'features/reports';

import './App.css';
import 'draft-js/dist/Draft.css';
import Register from './features/register/Register';
import { Login } from './features/login/Login';
import Dashboard from './features/dashboard/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import GameBoard from './features/gameboard/GameBoard';
import GameRoom from './features/gameboard/GameBoard';
import { RootLayout } from './components/Layout/RootLayout';


// App.tsx
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/game/:roomId',
        element: <GameRoom />,
      },
      {
        path: '/gameboard',
        element: (
          <ProtectedRoute>
            <GameBoard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/',
        loader: () => redirect('/dashboard'),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
