import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';

import Register from './features/register/Register';
import { Login } from './features/login/Login';
import Dashboard from './features/dashboard/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import GameRoom from './features/game/GameRoom';
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
