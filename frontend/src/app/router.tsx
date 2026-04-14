import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from '@/pages/home/home-page';
import { LoginPage } from '@/pages/login/login-page';
import { SignupPage } from '@/pages/signup/signup-page';

import { AuthLayout } from './layouts/auth-layout';
import { RootLayout } from './layouts/root-layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
        ],
      },
    ],
  },
]);
