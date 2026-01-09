import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen">{children}</div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default Providers;
