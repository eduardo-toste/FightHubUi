import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BRAND = 'FightHub';

const routeTitles: Record<string, string> = {
  '/home':                    'Home',
  '/dashboard':               'Home',
  '/login':                   'Entrar',
  '/ativar':                  'Ativação de Conta',
  '/aulas':                   'Aulas',
  '/aulas/novo':              'Nova Aula',
  '/minhas-aulas':            'Minhas Aulas',
  '/aulas-professor':         'Minhas Aulas',
  '/aulas-dependentes':       'Aulas dos Dependentes',
  '/alunos':                  'Alunos',
  '/alunos/novo':             'Novo Aluno',
  '/professores':             'Professores',
  '/professores/novo':        'Novo Professor',
  '/responsaveis':            'Responsáveis',
  '/responsaveis/novo':       'Novo Responsável',
  '/turmas':                  'Turmas',
  '/turmas/novo':             'Nova Turma',
  '/usuarios':                'Usuários',
  '/perfil':                  'Meu Perfil',
  '/estatisticas':            'Estatísticas',
  '/estatisticas-alunos':     'Desempenho dos Alunos',
  '/meu-desempenho':          'Meu Desempenho',
  '/desempenho-dependentes':  'Desempenho dos Dependentes',
};

function resolveTitle(pathname: string): string {
  // exact match first
  if (routeTitles[pathname]) return routeTitles[pathname];

  // prefix match for detail pages  (/alunos/:id, /turmas/:id, etc.)
  const prefixes: [string, string][] = [
    ['/alunos/',              'Aluno'],
    ['/professores/',         'Professor'],
    ['/responsaveis/',        'Responsável'],
    ['/turmas/',              'Turma'],
    ['/usuarios/',            'Usuário'],
    ['/estatisticas-alunos/', 'Desempenho'],
  ];
  for (const [prefix, label] of prefixes) {
    if (pathname.startsWith(prefix)) return label;
  }

  return BRAND;
}

/**
 * Updates document.title to "<Page> · FightHub" on every route change.
 * Call once inside the router tree (e.g. inside <Router>).
 */
export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = resolveTitle(pathname);
    document.title = page === BRAND
      ? `${BRAND} · Jiu-Jitsu`
      : `${page} · ${BRAND}`;
  }, [pathname]);
}
