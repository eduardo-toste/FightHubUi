import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import InactivityWarningModal from './InactivityWarningModal';
import NotificationsPanel from './NotificationsPanel';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import { useNotifications } from '../hooks/useNotifications';
import { usuariosApi } from '../api/usuarios';
import { alunosApi } from '../api/alunos';
import { aulasApi } from '../api/aulas';
import { professoresApi } from '../api/professores';
import { responsaveisApi } from '../api/responsaveis';
import { turmasApi } from '../api/turmas';
import useAuth from '../hooks/useAuth';
import { Search, GraduationCap, School, UserCheck, Users2, BookOpen, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  nome: string;
  tipo: 'aluno' | 'professor' | 'responsavel' | 'turma' | 'aula';
  detalhes?: string;
}

const Topbar: React.FC<{ 
  userName?: string; 
  userRole?: string; 
  userPhoto?: string;
  onLogout?: () => void;
}> = ({
  userName,
  userRole,
  userPhoto,
  onLogout,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      await performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const performSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: SearchResult[] = [];

    try {
      // Buscar em paralelo em todos os módulos permitidos
      const promises = [];

      // Alunos (ADMIN, COORDENADOR, PROFESSOR)
      if (user?.role && ['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user.role)) {
        promises.push(
          alunosApi.listar(0, 5)
            .then(data => {
              const alunos = (data.content || data).filter((a: any) =>
                a.nome?.toLowerCase().includes(term.toLowerCase()) ||
                a.email?.toLowerCase().includes(term.toLowerCase())
              );
              return alunos.slice(0, 3).map((a: any) => ({
                id: a.id,
                nome: a.nome,
                tipo: 'aluno' as const,
                detalhes: a.email
              }));
            })
            .catch(() => [])
        );
      }

      // Turmas (ADMIN, COORDENADOR, PROFESSOR)
      if (user?.role && ['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user.role)) {
        promises.push(
          turmasApi.listar(0, 5)
            .then(data => {
              const turmas = (data.content || data).filter((t: any) =>
                t.nome?.toLowerCase().includes(term.toLowerCase()) ||
                t.horario?.toLowerCase().includes(term.toLowerCase())
              );
              return turmas.slice(0, 3).map((t: any) => ({
                id: t.id,
                nome: t.nome,
                tipo: 'turma' as const,
                detalhes: t.horario
              }));
            })
            .catch(() => [])
        );
      }

      // Aulas (ADMIN, COORDENADOR, PROFESSOR)
      if (user?.role && ['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user.role)) {
        promises.push(
          aulasApi.listar(0, 5)
            .then(data => {
              const aulas = (data.content || data).filter((a: any) =>
                a.titulo?.toLowerCase().includes(term.toLowerCase()) ||
                a.descricao?.toLowerCase().includes(term.toLowerCase())
              );
              return aulas.slice(0, 3).map((a: any) => ({
                id: a.id,
                nome: a.titulo,
                tipo: 'aula' as const,
                detalhes: a.data ? new Date(a.data).toLocaleDateString('pt-BR') : ''
              }));
            })
            .catch(() => [])
        );
      }

      // Professores (ADMIN, COORDENADOR)
      if (user?.role && ['ADMIN', 'COORDENADOR'].includes(user.role)) {
        promises.push(
          professoresApi.listar(0, 5)
            .then(data => {
              const professores = (data.content || data).filter((p: any) =>
                p.nome?.toLowerCase().includes(term.toLowerCase()) ||
                p.email?.toLowerCase().includes(term.toLowerCase())
              );
              return professores.slice(0, 3).map((p: any) => ({
                id: p.id,
                nome: p.nome,
                tipo: 'professor' as const,
                detalhes: p.email
              }));
            })
            .catch(() => [])
        );
      }

      // Responsáveis (ADMIN, COORDENADOR)
      if (user?.role && ['ADMIN', 'COORDENADOR'].includes(user.role)) {
        promises.push(
          responsaveisApi.listar(0, 5)
            .then(data => {
              const responsaveis = (data.content || data).filter((r: any) =>
                r.nomeCompleto?.toLowerCase().includes(term.toLowerCase()) ||
                r.email?.toLowerCase().includes(term.toLowerCase())
              );
              return responsaveis.slice(0, 3).map((r: any) => ({
                id: r.id,
                nome: r.nomeCompleto,
                tipo: 'responsavel' as const,
                detalhes: r.email
              }));
            })
            .catch(() => [])
        );
      }

      const allResults = await Promise.all(promises);
      const flatResults = allResults.flat();
      setSearchResults(flatResults);
      setShowResults(flatResults.length > 0);
    } catch (error) {
      console.error('Erro ao buscar:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const routes = {
      aluno: `/alunos/${result.id}`,
      professor: `/professores/${result.id}`,
      responsavel: `/responsaveis/${result.id}`,
      turma: `/turmas/${result.id}`,
      aula: `/aulas/${result.id}`
    };
    navigate(routes[result.tipo]);
    setSearchTerm('');
    setShowResults(false);
  };

  const getResultIcon = (tipo: string) => {
    const icons = {
      aluno: <GraduationCap className="w-4 h-4" />,
      professor: <School className="w-4 h-4" />,
      responsavel: <UserCheck className="w-4 h-4" />,
      turma: <Users2 className="w-4 h-4" />,
      aula: <BookOpen className="w-4 h-4" />
    };
    return icons[tipo as keyof typeof icons];
  };

  const getResultLabel = (tipo: string) => {
    const labels = {
      aluno: 'Aluno',
      professor: 'Professor',
      responsavel: 'Responsável',
      turma: 'Turma',
      aula: 'Aula'
    };
    return labels[tipo as keyof typeof labels];
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[var(--fh-card)] border-b border-[var(--fh-border)] shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative search-container">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)]" />
            <input
              type="text"
              placeholder="Buscar alunos, aulas, turmas, professores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)] animate-spin" />
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[var(--fh-card)] border border-[var(--fh-border)] rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.map((result) => (
                <button
                  key={`${result.tipo}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--fh-gray-50)] transition-colors border-b border-[var(--fh-border)] last:border-b-0 text-left"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--fh-primary)]/10 flex items-center justify-center text-[var(--fh-primary)]">
                    {getResultIcon(result.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--fh-text)] truncate">{result.nome}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--fh-primary)]/10 text-[var(--fh-primary)] flex-shrink-0">
                        {getResultLabel(result.tipo)}
                      </span>
                    </div>
                    {result.detalhes && (
                      <p className="text-sm text-[var(--fh-muted)] truncate">{result.detalhes}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute top-full mt-2 w-full bg-[var(--fh-card)] border border-[var(--fh-border)] rounded-xl shadow-lg p-8 text-center z-50">
              <Search className="w-12 h-12 mx-auto mb-2 text-[var(--fh-muted)] opacity-30" />
              <p className="text-[var(--fh-muted)]">Nenhum resultado encontrado</p>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationsPanel />

          {/* User Avatar */}
          <div 
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-3 pl-4 border-l border-[var(--fh-border)] cursor-pointer hover:opacity-80 transition-opacity"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-accent)] flex items-center justify-center text-white font-bold text-sm shadow-lg"
              >
                {userName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-[var(--fh-text)]">
                {userName || 'Usuário'}
              </div>
              {userRole && (
                <div className="text-xs text-[var(--fh-muted)] capitalize">
                  {userRole.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Layout: React.FC<{
  children: React.ReactNode;
  userName?: string;
  userRole?: string;
  userPhoto?: string;
  onLogout?: () => void;
}> = ({ children, userName, userRole, userPhoto: propUserPhoto, onLogout }) => {
  const { user } = useAuth();
  const [userPhoto, setUserPhoto] = useState<string | undefined>(propUserPhoto);
  
  useEffect(() => {
    const loadUserPhoto = async () => {
      // Se já tem foto nas props, não precisa carregar
      if (propUserPhoto) {
        setUserPhoto(propUserPhoto);
        return;
      }
      
      // Só carrega se estiver logado
      if (!user) return;
      
      try {
        const perfil = await usuariosApi.obterPerfil();
        const fotoUrl = usuariosApi.getPhotoUrl(perfil.foto);
        setUserPhoto(fotoUrl);
      } catch (err) {
        // Silenciosamente falha se não conseguir carregar
        console.error('Erro ao carregar foto:', err);
      }
    };
    
    loadUserPhoto();
  }, [user, propUserPhoto]);
  const { isWarningVisible, dismissWarning } = useInactivityTimeout({
    warningMinutes: 12, // Aviso 3 minutos antes (token expira em 15)
    logoutMinutes: 15,  // Logout em 15 minutos (sincronizado com JWT)
  });

  // Sistema de notificações 100% frontend - sem backend necessário
  useNotifications({
    persistir: true // Salvar notificações no localStorage
  });

  return (
    <div className="flex bg-[var(--fh-bg)] min-h-screen">
      <Sidebar userName={userName} userRole={userRole} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar 
          userName={userName} 
          userRole={userRole} 
          userPhoto={userPhoto}
          onLogout={onLogout}
        />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
      <InactivityWarningModal 
        isVisible={isWarningVisible} 
        onDismiss={dismissWarning}
        minutesRemaining={3}
      />
    </div>
  );
};

export default Layout;
