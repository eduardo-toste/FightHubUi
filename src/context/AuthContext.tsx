import React, { createContext, useContext, useState, useEffect } from 'react';
import { setToken as saveToken, getToken, clearToken } from '../lib/auth';
import api from '../lib/apiClient';
import { getBaseUrl } from '../lib/env';

type User = {
  email: string;
  name?: string;
};

const AuthContext = createContext<any>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      // In a real app, fetch user profile. Here we mock.
      setUser({ email: 'admin@fighthub.test', name: 'Admin FightHub' });
    }

    // apply saved theme
    try {
      const t = localStorage.getItem('fh_theme_dark');
      if (t === '1') document.documentElement.classList.add('dark');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('apply theme error', e);
    }
  }, []);

  async function login(email: string, password: string) {
    // call API or mock depending on baseUrl
    const base = getBaseUrl();
    if (!base) {
      // mock: accept any credentials and return fake token
      await new Promise((r) => setTimeout(r, 200));
      const accessToken = 'mock-token-123';
      saveToken(accessToken);
      setUser({ email, name: 'Admin FightHub' });
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken } = res.data;
      saveToken(accessToken);
      setUser({ email });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function logout() {
    clearToken();
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
