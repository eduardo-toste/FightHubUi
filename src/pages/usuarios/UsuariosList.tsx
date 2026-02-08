import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarios } from '../../features/usuarios/useUsuarios';
import { useAppNotifications } from '../../hooks/useAppNotifications';
import { UsuarioResponse, Role } from '../../types';
import useAuth from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import { UserCog, Search, Filter, X } from 'lucide-react';

const formatCPF = (cpf: string | undefined) => {
  if (!cpf) return '—'
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

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
  
  // ===== NOTIFICAÇÕES INTEGRADAS =====
  const { notificarUsuarioCriado, notificarUsuarioAtualizado, notificarUsuarioDeletado, notificarUsuarioErro } = useAppNotifications();
  
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

  useEffect(() => {
    // Verificar permissões (ADMIN ou COORDENADOR)
    if (user && user.role !== 'ADMIN' && user.role !== 'COORDENADOR') {
      navigate('/dashboard');
      return;
    }
    carregarUsuarios(page, 10);
  }, [page, user]);

  const filteredUsuarios = useMemo(() => {
    if (!usuarios?.content) return [];

    return usuarios.content.filter((u) => {
      // Filtro de busca
      const matchesSearch = searchTerm === '' ||
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.cpf.includes(searchTerm);

      // Filtro de status
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && u.ativo) ||
        (statusFilter === 'inactive' && !u.ativo);

      // Filtro de role
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [usuarios, searchTerm, statusFilter, roleFilter]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || roleFilter !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowClick = (usuario: UsuarioResponse) => {
    navigate(`/usuarios/${usuario.id}`);
  };

  const columns = [
    {
      key: 'nome',
      label: 'Usuário',
      render: (usuario: UsuarioResponse) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{usuario.nome}</span>
          {!usuario.telefone && (
            <div title="Cadastro incompleto - Falta telefone">
              <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (usuario: UsuarioResponse) => usuario.email
    },
    {
      key: 'cpf',
      label: 'CPF',
      render: (usuario: UsuarioResponse) => formatCPF(usuario.cpf)
    },
    {
      key: 'telefone',
      label: 'Telefone',
      render: (usuario: UsuarioResponse) => usuario.telefone || '—'
    },
    {
      key: 'role',
      label: 'Role',
      render: (usuario: UsuarioResponse) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${roleColors[usuario.role]}`}>
          {roleLabels[usuario.role]}
        </span>
      )
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (usuario: UsuarioResponse) => (
        usuario.ativo ? (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50">
            Ativo
          </span>
        ) : (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50">
            Inativo
          </span>
        )
      )
    }
  ];

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
        </div>

        {/* Filters */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fh-muted)]" 
                size={20} 
              />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border border-[var(--fh-border)] rounded-xl hover:bg-[var(--fh-gray-50)] transition-colors ${
                showFilters ? 'bg-[var(--fh-gray-50)]' : ''
              }`}
            >
              <Filter size={20} />
              Filtros
            </button>
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-[var(--fh-muted)] hover:text-[var(--fh-text)] hover:bg-[var(--fh-gray-50)] rounded-xl transition-colors"
              >
                <X size={20} />
                Limpar
              </button>
            )}
          </div>

          {/* Filtros Avançados */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--fh-border)]">
              <div>
                <label className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
                >
                  <option value="all">Todas</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="COORDENADOR">Coordenador</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="ALUNO">Aluno</option>
                  <option value="RESPONSAVEL">Responsável</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          data={filteredUsuarios}
          loading={loading}
          emptyMessage={
            hasActiveFilters 
              ? "Nenhum usuário encontrado com os filtros aplicados" 
              : "Nenhum usuário cadastrado"
          }
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        {usuarios && usuarios.totalPages > 0 && (
          <Pagination
            currentPage={page}
            totalPages={usuarios.totalPages}
            totalElements={usuarios.totalElements}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </Layout>
  );
}
