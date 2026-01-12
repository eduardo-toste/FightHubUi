import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarios } from '../../features/usuarios/useUsuarios';
import { UsuarioResponse, Role } from '../../types';
import useAuth from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import { UserCog, Search } from 'lucide-react';

const roleLabels: Record<Role, string> = {
  ADMIN: 'Administrador',
  COORDENADOR: 'Coordenador',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
  RESPONSAVEL: 'Responsável',
};

const roleColors: Record<Role, string> = {
  ADMIN: 'bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-700 border border-red-300/50 dark:from-red-500/20 dark:to-pink-500/20 dark:text-red-400 dark:border-red-500/50',
  COORDENADOR: 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border border-purple-300/50 dark:from-purple-500/20 dark:to-indigo-500/20 dark:text-purple-400 dark:border-purple-500/50',
  PROFESSOR: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 border border-blue-300/50 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-400 dark:border-blue-500/50',
  ALUNO: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50',
  RESPONSAVEL: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-300/50 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-400 dark:border-amber-500/50',
};

export default function UsuariosList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { usuarios, loading, error, carregarUsuarios } = useUsuarios();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Verificar permissões (ADMIN ou COORDENADOR)
    if (user && user.role !== 'ADMIN' && user.role !== 'COORDENADOR') {
      navigate('/dashboard');
      return;
    }
    carregarUsuarios(page, 10);
  }, [page, user]);

  const filteredUsuarios = usuarios?.content.filter((u) =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cpf.includes(searchTerm)
  );

  if (loading && !usuarios) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--fh-primary)]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
            <UserCog className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">Usuários</h1>
            <p className="text-[var(--fh-muted)] mt-1">
              Gerencie todos os usuários do sistema
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)]" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--fh-border)]">
              <thead className="bg-[var(--fh-gray-50)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fh-muted)] uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fh-muted)] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fh-muted)] uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fh-muted)] uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fh-muted)] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--fh-muted)] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--fh-card)] divide-y divide-[var(--fh-border)]">
                {filteredUsuarios && filteredUsuarios.length > 0 ? (
                  filteredUsuarios.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="hover:bg-[var(--fh-gray-50)] cursor-pointer transition-colors"
                      onClick={() => navigate(`/usuarios/${usuario.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--fh-text)]">
                          {usuario.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--fh-body)]">
                          {usuario.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--fh-body)]">
                          {usuario.cpf}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--fh-body)]">
                          {usuario.telefone || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${roleColors[usuario.role]}`}>
                          {roleLabels[usuario.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {usuario.ativo ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50">
                            Inativo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--fh-muted)]">
                      {searchTerm
                        ? 'Nenhum usuário encontrado com os critérios de busca.'
                        : 'Nenhum usuário cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {usuarios && usuarios.totalPages > 1 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-[var(--fh-muted)]">
              Mostrando página {page + 1} de {usuarios.totalPages} ({usuarios.totalElements} usuários)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-[var(--fh-card)] border border-[var(--fh-border)] rounded-lg hover:bg-[var(--fh-gray-50)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--fh-text)] transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(usuarios.totalPages - 1, page + 1))}
                disabled={page >= usuarios.totalPages - 1}
                className="px-4 py-2 bg-[var(--fh-card)] border border-[var(--fh-border)] rounded-lg hover:bg-[var(--fh-gray-50)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--fh-text)] transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
