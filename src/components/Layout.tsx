import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';

const Topbar: React.FC<{ userName?: string; userRole?: string; onLogout?: () => void }> = ({
  userName,
  userRole,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-[var(--fh-card)] border-b border-[var(--fh-border)] shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)]" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--fh-border)] text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--fh-card)]" />
          </button>

          {/* User Avatar */}
          <div 
            onClick={() => navigate('/perfil')}
            className="flex items-center gap-3 pl-4 border-l border-[var(--fh-border)] cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-accent)] flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
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
  onLogout?: () => void;
}> = ({ children, userName, userRole, onLogout }) => {
  return (
    <div className="flex bg-[var(--fh-bg)] min-h-screen">
      <Sidebar userName={userName} userRole={userRole} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Topbar userName={userName} userRole={userRole} onLogout={onLogout} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
