import React, { createContext, useContext, useState, useEffect } from 'react';
import { setToken as saveToken, setRefreshToken as saveRefreshToken, getToken, clearToken } from '../lib/auth';
import api from '../lib/apiClient';
import { getBaseUrl } from '../lib/env';

type User = {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  alunoId?: string; // ID do aluno vinculado (se for role ALUNO)
};

const AuthContext = createContext<any>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do usuário quando tiver token
  const fetchUserProfile = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const base = getBaseUrl();
    if (!base) {
      // Modo mock
      setUser({ email: 'admin@fighthub.test', name: 'Admin FightHub' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/usuarios/me');
      const userData = res.data;
      
      // Se for ALUNO, buscar o ID do aluno vinculado
      let alunoId;
      if (userData.role === 'ALUNO') {
        try {
          const alunoRes = await api.get(`/alunos/por-usuario/${userData.id}`);
          alunoId = alunoRes.data.id;
        } catch (err) {
          console.error('Erro ao buscar ID do aluno:', err);
        }
      }
      
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.nome,
        role: userData.role,
        alunoId,
      });
    } catch (err) {
      // Se falhar ao buscar perfil, limpa tokens
      console.error('Erro ao buscar perfil do usuário:', err);
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();

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
      // Backend espera 'senha' ao invés de 'password'
      const res = await api.post('/auth/login', { email, senha: password });
      const { accessToken, refreshToken } = res.data;
      saveToken(accessToken);
      if (refreshToken) {
        saveRefreshToken(refreshToken);
      }
      
      // Buscar dados do usuário após login
      await fetchUserProfile();
    } catch (err: any) {
      // Extrair mensagem de erro do backend
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Erro ao autenticar — verifique suas credenciais e tente novamente';
      return Promise.reject(new Error(errorMessage));
    }
  }

  async function logout() {
    const base = getBaseUrl();
    if (base) {
      try {
        // Chamar endpoint de logout do backend
        await api.post('/auth/logout');
      } catch (err) {
        // Ignora erros no logout (pode ser que o token já esteja expirado)
        console.warn('Erro ao fazer logout no backend:', err);
      }
    }
    clearToken();
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
