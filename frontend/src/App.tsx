import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/Router';
import { I18nProvider } from './i18n/i18nContext';
import { AuthProvider } from './context/AuthContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </AuthProvider>
  );
};

export default App;
