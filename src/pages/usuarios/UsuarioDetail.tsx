import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsuarioDetalhado } from '../../features/usuarios/useUsuarios';
import { Role, UsuarioUpdateParcialRequest } from '../../types';
import useAuth from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import { ArrowLeft, UserCog } from 'lucide-react';

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

export default function UsuarioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const { usuario, loading, error, atualizarRole, atualizarStatus, atualizarUsuario, recarregar } =
    useUsuarioDetalhado(id!);

  const [isEditing, setIsEditing] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  });

  useEffect(() => {
    // Verificar permissões
    if (currentUser && currentUser.role !== 'ADMIN' && currentUser.role !== 'COORDENADOR') {
      navigate('/dashboard');
    }
  }, [currentUser]);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || '',
        cpf: usuario.cpf,
        endereco: usuario.endereco || {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
        },
      });
    }
  }, [usuario]);

  const handleSaveChanges = async () => {
    const updateData: UsuarioUpdateParcialRequest = {
      nome: formData.nome !== usuario?.nome ? formData.nome : undefined,
      email: formData.email !== usuario?.email ? formData.email : undefined,
      telefone: formData.telefone !== usuario?.telefone ? formData.telefone : undefined,
      cpf: formData.cpf !== usuario?.cpf ? formData.cpf : undefined,
      endereco: JSON.stringify(formData.endereco) !== JSON.stringify(usuario?.endereco) ? formData.endereco : undefined,
    };

    // Remove campos undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key as keyof UsuarioUpdateParcialRequest] === undefined && delete updateData[key as keyof UsuarioUpdateParcialRequest]
    );

    if (Object.keys(updateData).length === 0) {
      setIsEditing(false);
      return;
    }

    const success = await atualizarUsuario(updateData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedRole) return;
    const success = await atualizarRole({ role: selectedRole });
    if (success) {
      setShowRoleModal(false);
      setSelectedRole(null);
    }
  };

  const handleStatusChange = async () => {
    if (selectedStatus === null) return;
    const success = await atualizarStatus({ usuarioAtivo: selectedStatus });
    if (success) {
      setShowStatusModal(false);
      setSelectedStatus(null);
    }
  };

  if (loading && !usuario) {
    return (
      <Layout userName={currentUser?.name} userRole={currentUser?.role} onLogout={logout}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--fh-primary)]"></div>
        </div>
      </Layout>
    );
  }

  if (error || !usuario) {
    return (
      <Layout userName={currentUser?.name} userRole={currentUser?.role} onLogout={logout}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl">
          {error || 'Usuário não encontrado'}
        </div>
      </Layout>
    );
  }

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <Layout userName={currentUser?.name} userRole={currentUser?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate('/usuarios')}
              className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar para usuários
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
                <UserCog className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">{usuario.nome}</h1>
            </div>
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${roleColors[usuario.role]}`}>
                {roleLabels[usuario.role]}
              </span>
              {usuario.ativo ? (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50">
                  Ativo
                </span>
              ) : (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50">
                  Inativo
                </span>
              )}
              {usuario.loginSocial && (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 border border-cyan-300/50 dark:from-cyan-500/20 dark:to-blue-500/20 dark:text-cyan-400 dark:border-cyan-500/50">
                  Login Social
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && !isEditing && (
              <>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Alterar Role
                </button>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Alterar Status
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Editar Dados
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      nome: usuario.nome,
                      email: usuario.email,
                      telefone: usuario.telefone || '',
                      cpf: usuario.cpf,
                      endereco: usuario.endereco || {
                        cep: '',
                        logradouro: '',
                        numero: '',
                        complemento: '',
                        bairro: '',
                        cidade: '',
                        estado: '',
                      },
                    });
                  }}
                  className="px-4 py-2 bg-[var(--fh-card)] hover:bg-[var(--fh-gray-100)] text-[var(--fh-text)] border border-[var(--fh-border)] rounded-lg transition-all shadow-sm hover:shadow"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Salvar Alterações
                </button>
              </>
            )}
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
          <h2 className="text-xl font-bold text-[var(--fh-text)] mb-4">Informações Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">
                Nome Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              ) : (
                <p className="text-[var(--fh-text)]">{usuario.nome}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              ) : (
                <p className="text-[var(--fh-text)]">{usuario.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">
                CPF
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              ) : (
                <p className="text-[var(--fh-text)]">{usuario.cpf}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">
                Telefone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              ) : (
                <p className="text-[var(--fh-text)]">{usuario.telefone || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
          <h2 className="text-xl font-bold text-[var(--fh-text)] mb-4">Endereço</h2>
          {(usuario.endereco || isEditing) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">CEP</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.cep}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cep: e.target.value } })}
                    className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                    placeholder="00000-000"
                  />
                ) : (
                  <p className="text-[var(--fh-text)]">{usuario.endereco?.cep || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">Logradouro</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.logradouro}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, logradouro: e.target.value } })}
                    className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                ) : (
                  <p className="text-[var(--fh-text)]">{usuario.endereco?.logradouro || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">Número</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.numero}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })}
                    className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                ) : (
                  <p className="text-[var(--fh-text)]">{usuario.endereco?.numero || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">Complemento</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.complemento}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, complemento: e.target.value } })}
                    className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                ) : (
                  <p className="text-[var(--fh-text)]">{usuario.endereco?.complemento || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">Bairro</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.bairro}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })}
                    className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                ) : (
                  <p className="text-[var(--fh-text)]">{usuario.endereco?.bairro || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">Cidade/Estado</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.endereco.cidade}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })}
                      className="flex-1 px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                      placeholder="Cidade"
                    />
                    <input
                      type="text"
                      value={formData.endereco.estado}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value.toUpperCase() } })}
                      className="w-20 px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                ) : (
                  <p className="text-[var(--fh-text)]">
                    {usuario.endereco?.cidade || '—'} {usuario.endereco?.estado ? `- ${usuario.endereco.estado}` : ''}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[var(--fh-muted)] text-center py-8">Endereço não cadastrado</p>
          )}
        </div>

        {/* Modal de Alteração de Role */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--fh-card)] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-[var(--fh-border)]">
              <h3 className="text-xl font-bold text-[var(--fh-text)] mb-4">
                Alterar Role do Usuário
              </h3>
              <p className="text-[var(--fh-muted)] mb-4">
                Selecione a nova role para {usuario.nome}:
              </p>
              <select
                value={selectedRole || usuario.role}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] mb-6 transition-all"
              >
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedRole(null);
                  }}
                  className="px-4 py-2 bg-[var(--fh-gray-200)] hover:bg-[var(--fh-gray-300)] text-[var(--fh-text)] rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={loading}
                  className="px-4 py-2 bg-[var(--fh-primary)] hover:bg-[var(--fh-primary-dark)] text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Alteração de Status */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--fh-card)] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-[var(--fh-border)]">
              <h3 className="text-xl font-bold text-[var(--fh-text)] mb-4">
                Alterar Status do Usuário
              </h3>
              <p className="text-[var(--fh-muted)] mb-4">
                Deseja {usuario.ativo ? 'desativar' : 'ativar'} {usuario.nome}?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus(null);
                  }}
                  className="px-4 py-2 bg-[var(--fh-gray-200)] hover:bg-[var(--fh-gray-300)] text-[var(--fh-text)] rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus(!usuario.ativo);
                    handleStatusChange();
                  }}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors ${
                    usuario.ativo
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {usuario.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
