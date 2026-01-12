import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Menu, 
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog
} from 'lucide-react';

interface SidebarProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, userRole, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Definir itens de menu baseado no role
  const baseMenuItems = [
    { to: '/home', label: 'Home', icon: LayoutDashboard, roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL'] },
    { to: '/alunos', label: 'Alunos', icon: Users, roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'RESPONSAVEL'] },
    { to: '/usuarios', label: 'Usuários', icon: UserCog, roles: ['ADMIN', 'COORDENADOR'] },
  ];

  // Filtrar itens baseado no role do usuário
  const menuItems = baseMenuItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className={`flex items-center justify-between mb-8 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">FH</span>
            </div>
            <div>
              <div className="text-xl font-black text-[var(--fh-primary)] leading-tight">
                FightHub
              </div>
              <div className="text-xs text-[var(--fh-muted)] leading-tight">
                Jiu-Jitsu
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg mx-auto">
            <span className="text-white font-black text-lg">FH</span>
          </div>
        )}
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--fh-border)] text-[var(--fh-muted)]"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 min-h-[48px] ${
                active
                  ? 'bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white shadow-lg shadow-[var(--fh-primary)]/30'
                  : 'text-[var(--fh-body)] hover:bg-[var(--fh-border)] hover:text-[var(--fh-primary)]'
              } ${isCollapsed ? 'justify-center !px-3' : ''}`}
            >
              <Icon 
                size={20} 
                className={`flex-shrink-0 ${active ? 'text-white' : 'text-[var(--fh-muted)] group-hover:text-[var(--fh-primary)]'}`} 
              />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-[var(--fh-text)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {!isCollapsed && (
        <div className="mt-auto pt-6 border-t border-[var(--fh-border)]">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--fh-body)] hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut size={20} className="text-[var(--fh-muted)]" />
              <span className="font-medium text-sm">Sair</span>
            </button>
          )}
        </div>
      )}

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center rounded-full bg-[var(--fh-card)] border-2 border-[var(--fh-border)] shadow-md hover:shadow-lg text-[var(--fh-muted)] hover:text-[var(--fh-primary)] transition-all duration-200 z-10"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--fh-card)] border border-[var(--fh-border)] shadow-lg text-[var(--fh-text)]"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          bg-[var(--fh-card)] border-r border-[var(--fh-border)]
          flex flex-col
          transition-all duration-300 ease-in-out
          z-40
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        <div className="flex flex-col h-full p-4 relative">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
