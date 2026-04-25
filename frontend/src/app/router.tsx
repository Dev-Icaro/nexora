import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from '@/pages/home/home-page';
import { LoginPage } from '@/pages/login/login-page';
import { ProfilePage } from '@/pages/profile/profile-page';
import { SettingsPage } from '@/pages/settings/settings-page';
import { SignupPage } from '@/pages/signup/signup-page';

import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';
import { RootLayout } from './layouts/root-layout';
import { ProtectedRoute } from './routes/protected-route';
import { PublicOnlyRoute } from './routes/public-only-route';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <HomePage /> },
              { path: 'posts/:id', element: <HomePage /> },
              { path: 'profile/:userId', element: <ProfilePage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', element: <LoginPage /> },
              { path: 'signup', element: <SignupPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
