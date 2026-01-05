import React from 'react';
import { AuthProvider } from '../context/AuthContext';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <div className="min-h-screen">{children}</div>
    </AuthProvider>
  );
};

export default Providers;
