import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsuarioDetalhado } from '../../features/usuarios/useUsuarios';
import { Role, UsuarioUpdateParcialRequest } from '../../types';
import useAuth from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { ArrowLeft, UserCog, AlertTriangle, Mail, User, Award, Power, Edit3, Phone, MapPin } from 'lucide-react';

const formatCPF = (cpf: string | undefined) => {
  if (!cpf) return 'Não informado'
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

// Hierarquia de roles (maior número = maior permissão)
const roleHierarchy: Record<Role, number> = {
  ADMIN: 5,
  COORDENADOR: 4,
  PROFESSOR: 3,
  RESPONSAVEL: 2,
  ALUNO: 1,
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
  const [incompleteProfile, setIncompleteProfile] = useState(false);

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
      // Verificar se o perfil está incompleto
      if (!usuario.endereco || !usuario.telefone) {
        setIncompleteProfile(true);
      } else {
        setIncompleteProfile(false);
      }
      
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

  // Verificar se o erro é de endereço nulo
  useEffect(() => {
    if (error && (
      error.includes('endereco') || 
      error.includes('null') || 
      error.includes('NullPointer') ||
      error.includes('Cannot invoke')
    )) {
      setIncompleteProfile(true);
    }
  }, [error]);

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

  if (loading && !usuario && !incompleteProfile) {
    return (
      <Layout userName={currentUser?.name} userRole={currentUser?.role} onLogout={logout}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--fh-primary)]"></div>
        </div>
      </Layout>
    );
  }

  // Tela de cadastro incompleto
  if (incompleteProfile) {
    return (
      <Layout userName={currentUser?.name} userRole={currentUser?.role} onLogout={logout}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">Cadastro Incompleto</h1>
              <p className="text-[var(--fh-muted)] mt-1">Este usuário ainda não finalizou o cadastro</p>
            </div>
          </div>

          {/* Card de Aviso Principal */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/20 dark:to-orange-500/20 border-2 border-yellow-500/50 dark:border-yellow-500/50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">
                  Atenção: Perfil Não Ativado
                </h2>
                <p className="text-[var(--fh-text)] leading-relaxed">
                  Este usuário foi cadastrado no sistema, mas ainda não realizou a primeira ativação da conta 
                  e não preencheu todas as informações necessárias, como endereço, telefone e outros dados pessoais.
                </p>
              </div>
            </div>
          </div>

          {/* Cards de Informação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* O que aconteceu? */}
            <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[var(--fh-text)]">O que aconteceu?</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <p className="text-[var(--fh-text)] text-sm">
                    O usuário foi cadastrado por um administrador
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <p className="text-[var(--fh-text)] text-sm">
                    Ainda não fez o primeiro acesso ao sistema
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <p className="text-[var(--fh-text)] text-sm">
                    Dados completos não estão disponíveis
                  </p>
                </div>
              </div>
            </div>

            {/* O que fazer? */}
            <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[var(--fh-text)]">O que fazer?</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    1
                  </div>
                  <p className="text-[var(--fh-text)] text-sm">
                    Entre em contato com o usuário
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    2
                  </div>
                  <p className="text-[var(--fh-text)] text-sm">
                    Solicite o primeiro acesso ao sistema
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    3
                  </div>
                  <p className="text-[var(--fh-text)] text-sm">
                    Oriente o preenchimento do perfil completo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dica */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-600/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💡</div>
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                <strong>Dica:</strong> O usuário deve ter recebido um email com as instruções de primeiro acesso. 
                Após a ativação, todos os dados ficarão disponíveis aqui.
              </p>
            </div>
          </div>

          {/* Botão de Voltar */}
          <div className="flex justify-start">
            <button
              onClick={() => navigate('/usuarios')}
              className="px-6 py-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Lista de Usuários
            </button>
          </div>
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
  
  // Verificar se o usuário atual pode alterar a role do usuário visualizado
  const canChangeRole = currentUser && usuario && 
    roleHierarchy[currentUser.role] > roleHierarchy[usuario.role];

  return (
    <Layout userName={currentUser?.name} userRole={currentUser?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/usuarios')}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para usuários
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <UserCog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">{usuario.nome}</h1>
              <div className="flex gap-2 mt-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${roleColors[usuario.role]}`}>
                  {roleLabels[usuario.role]}
                </span>
                {usuario.ativo ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50">
                    Ativo
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50">
                    Inativo
                  </span>
                )}
                {usuario.loginSocial && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 border border-cyan-300/50 dark:from-cyan-500/20 dark:to-blue-500/20 dark:text-cyan-400 dark:border-cyan-500/50">
                    Login Social
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-xl font-bold text-[var(--fh-text)] mb-6 flex items-center gap-3">
                <User className="w-5 h-5 text-[var(--fh-primary)]" />
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              ) : (
                <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{usuario.nome}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              ) : (
                <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{usuario.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--fh-muted)]">
                CPF
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              ) : (
                <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{formatCPF(usuario.cpf)}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              ) : (
                <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{usuario.telefone || '—'}</p>
              )}
            </div>
          </div>
            </div>

            {/* Endereço */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-xl font-bold text-[var(--fh-text)] mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--fh-primary)]" />
                Endereço
              </h2>
          {(usuario.endereco || isEditing) ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--fh-muted)]">CEP</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.cep}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cep: e.target.value } })}
                    className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                    placeholder="00000-000"
                  />
                ) : (
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{usuario.endereco?.cep || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--fh-muted)]">Logradouro</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.logradouro}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, logradouro: e.target.value } })}
                    className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                ) : (
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{usuario.endereco?.logradouro || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--fh-muted)]">Número</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.numero}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })}
                    className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                ) : (
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{usuario.endereco?.numero || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--fh-muted)]">Complemento</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.complemento}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, complemento: e.target.value } })}
                    className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                ) : (
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{usuario.endereco?.complemento || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--fh-muted)]">Bairro</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.endereco.bairro}
                    onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })}
                    className="w-full px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                ) : (
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{usuario.endereco?.bairro || '—'}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--fh-muted)]">Cidade/Estado</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.endereco.cidade}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })}
                      className="flex-1 px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                      placeholder="Cidade"
                    />
                    <input
                      type="text"
                      value={formData.endereco.estado}
                      onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value.toUpperCase() } })}
                      className="w-20 px-4 py-2.5 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                ) : (
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">
                    {usuario.endereco?.cidade || '—'} {usuario.endereco?.estado ? `- ${usuario.endereco.estado}` : ''}
                  </p>
                )}
              </div>
            </div>
            </>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-[var(--fh-muted)] mx-auto mb-4" />
              <p className="text-[var(--fh-text)] font-medium">Endereço não cadastrado</p>
              <p className="text-[var(--fh-muted)] text-sm mt-2">O usuário ainda não preencheu as informações de endereço</p>
            </div>
          )}
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-lg font-bold text-[var(--fh-text)] mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--fh-primary)]" />
                Ações
              </h2>
              
              <div className="space-y-4">
                {isAdmin && !isEditing && (
                  <>
                    <Button
                      onClick={() => setShowRoleModal(true)}
                      variant="outline"
                      className="w-full justify-start text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Gerenciar Permissões
                    </Button>

                    <Button
                      onClick={() => setShowStatusModal(true)}
                      variant={usuario.ativo ? 'ghost' : 'outline'}
                      className={`w-full justify-start ${usuario.ativo 
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10' 
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'}`}
                    >
                      <Power className="w-4 h-4 mr-3" />
                      {usuario.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
                    </Button>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="w-full justify-start text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
                      >
                        <Edit3 className="w-4 h-4 mr-3" />
                        Editar Informações
                      </Button>
                    </div>
                  </>
                )}

                {isEditing && (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      variant="outline"
                      className="w-full justify-start text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 disabled:opacity-50"
                    >
                      Salvar Alterações
                    </Button>
                    <Button
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
                      variant="ghost"
                      className="w-full justify-start text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
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
                {Object.entries(roleLabels)
                  .filter(([value]) => {
                    // Só permitir atribuir roles inferiores ao usuário atual
                    const roleValue = value as Role;
                    return currentUser && roleHierarchy[roleValue] < roleHierarchy[currentUser.role];
                  })
                  .map(([value, label]) => (
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
