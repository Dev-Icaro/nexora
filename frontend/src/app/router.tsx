import { createBrowserRouter } from 'react-router-dom';

import { BookmarksPage } from '@/pages/bookmarks-page';
import { HomePage } from '@/pages/home-page';
import { LoginPage } from '@/pages/login-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { ProfilePage } from '@/pages/profile-page';
import { ResetPasswordPage } from '@/pages/reset-password-page';
import { SettingsPage } from '@/pages/settings-page';
import { SignupPage } from '@/pages/signup-page';
import { VerifyEmailPage } from '@/pages/verify-email-page';

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
              { path: 'bookmarks', element: <BookmarksPage /> },
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
              { path: 'reset-password', element: <ResetPasswordPage /> },
              { path: 'verify-email', element: <VerifyEmailPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
