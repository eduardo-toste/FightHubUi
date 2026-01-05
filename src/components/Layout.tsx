import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const loc = useLocation();
  const items = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/aulas', label: 'Aulas' },
    { to: '/alunos', label: 'Alunos' },
    { to: '/turmas', label: 'Turmas' },
    { to: '/config', label: 'Configurações' },
  ];

  return (
    <aside className="w-64 h-screen p-6 bg-[var(--fh-card)] border-r border-[var(--fh-divider)]">
      <div className="mb-6">
        <div className="text-2xl font-extrabold text-[var(--fh-primary)]">
          FightHub
        </div>
        <div className="text-xs text-[var(--fh-muted)]">
          Disciplina. Evolução. Conquista.
        </div>
      </div>
      <nav className="flex flex-col gap-3 mt-6">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={`px-4 py-2 rounded-lg flex items-center gap-3 text-sm font-medium ${
              loc.pathname === it.to
                ? 'bg-[var(--fh-primary)] text-white'
                : 'text-[var(--fh-body)] hover:bg-[var(--fh-divider)]'
            }`}
          >
            <span className="w-3 h-3 bg-[var(--fh-border)] rounded-sm" />
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

const Topbar: React.FC<{ userName?: string; onLogout?: () => void }> = ({
  userName,
  onLogout,
}) => {
  const [isDark, setIsDark] = React.useState(() => {
    try {
      return document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });

  function toggleTheme() {
    try {
      document.documentElement.classList.toggle('dark');
      const next = !isDark;
      setIsDark(next);
      localStorage.setItem('fh_theme_dark', next ? '1' : '0');
    } catch (e) {
      // log and ignore theme toggle errors in non-browser environments
      // eslint-disable-next-line no-console
      console.warn('toggleTheme error', e);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800">
      <div className="text-lg font-semibold">Painel</div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="px-2 py-1 border rounded"
          aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          )}
        </button>
        <div>{userName}</div>
        <button onClick={onLogout} className="text-sm text-red-600">
          Sair
        </button>
      </div>
    </div>
  );
};

const Layout: React.FC<{
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
}> = ({ children, userName, onLogout }) => {
  return (
    <div className="flex bg-[var(--fh-bg)] min-h-screen">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} onLogout={onLogout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
