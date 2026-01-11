import { useState, useEffect } from 'react';
import { useMeuPerfil } from '../../features/usuarios/useUsuarios';
import { usuariosService } from '../../features/usuarios/usuariosService';
import { UsuarioUpdateParcialRequest } from '../../types';
import { Eye, EyeOff, UserCircle, Sun, Moon, Monitor } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import { useTheme } from '../../context/ThemeContext';

// Componente de Preferências de Tema
function ThemePreferences() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Modo Claro', description: 'Interface clara' },
    { value: 'dark', icon: Moon, label: 'Modo Escuro', description: 'Interface escura' },
    { value: 'system', icon: Monitor, label: 'Sistema', description: 'Seguir preferência do navegador' }
  ];

  return (
    <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
      <h2 className="text-xl font-bold text-[var(--fh-text)] mb-4">Preferências de Tema</h2>
      <p className="text-sm text-[var(--fh-muted)] mb-6">
        Escolha como você prefere visualizar a interface do sistema
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map(({ value, icon: Icon, label, description }) => (
          <button
            key={value}
            onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === value
                ? 'border-[var(--fh-primary)] bg-[var(--fh-primary)]/5 shadow-md'
                : 'border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50 hover:bg-[var(--fh-gray-50)]'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-full ${
                theme === value
                  ? 'bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white'
                  : 'bg-[var(--fh-gray-100)] text-[var(--fh-muted)]'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className={`font-semibold ${
                  theme === value ? 'text-[var(--fh-primary)]' : 'text-[var(--fh-text)]'
                }`}>
                  {label}
                </p>
                <p className="text-xs text-[var(--fh-muted)] mt-1">{description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {theme === 'system' && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-600/50 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Modo Sistema:</strong> A interface seguirá automaticamente a preferência de tema do seu navegador/sistema operacional
          </p>
        </div>
      )}
    </div>
  );
}

export default function MeuPerfil() {
  const { user, logout } = useAuth();
  const { usuario, loading, error, atualizarPerfil, recarregar } = useMeuPerfil();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
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

  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    senhaNova: '',
    confirmarSenha: '',
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || '',
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
      endereco: JSON.stringify(formData.endereco) !== JSON.stringify(usuario?.endereco) ? formData.endereco : undefined,
    };

    // Remove campos undefined
    Object.keys(updateData).forEach(
      (key) =>
        updateData[key as keyof UsuarioUpdateParcialRequest] === undefined &&
        delete updateData[key as keyof UsuarioUpdateParcialRequest]
    );

    if (Object.keys(updateData).length === 0) {
      setIsEditing(false);
      return;
    }

    const success = await atualizarPerfil(updateData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwordData.senhaAtual || !passwordData.senhaNova) {
      setPasswordError('Preencha todos os campos');
      return;
    }

    if (passwordData.senhaNova !== passwordData.confirmarSenha) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (passwordData.senhaNova.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      await usuariosService.alterarSenha({
        senhaAtual: passwordData.senhaAtual,
        senhaNova: passwordData.senhaNova,
      });
      setPasswordSuccess(true);
      setPasswordData({ senhaAtual: '', senhaNova: '', confirmarSenha: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Erro ao alterar senha');
    }
  };

  if (loading && !usuario) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--fh-primary)]"></div>
        </div>
      </Layout>
    );
  }

  if (error || !usuario) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-600/50 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl">
          {error || 'Erro ao carregar perfil'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">Minha Conta</h1>
              <p className="text-[var(--fh-muted)] mt-1">Gerencie suas informações pessoais</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  disabled={usuario.loginSocial}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  title={usuario.loginSocial ? 'Usuários com login social não podem alterar senha' : ''}
                >
                  Alterar Senha
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Editar Perfil
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

      {/* Foto e Info Básica */}
      <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--fh-text)]">{usuario.nome}</h2>
            <p className="text-[var(--fh-muted)]">{usuario.email}</p>
            <div className="flex gap-2 mt-2">
              {usuario.loginSocial && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 border border-cyan-300/50 dark:from-cyan-500/20 dark:to-blue-500/20 dark:text-cyan-400 dark:border-cyan-500/50">
                  Login Social
                </span>
              )}
              {usuario.ativo ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50">
                  Ativo
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50">
                  Inativo
                </span>
              )}
            </div>
          </div>
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
            <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">Email</label>
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
            <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">CPF</label>
            <p className="text-[var(--fh-text)]">{usuario.cpf}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">Telefone</label>
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

      {/* Preferências */}
      <ThemePreferences />
      </div>

      {/* Modal de Alteração de Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--fh-card)] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-[var(--fh-border)]">
            <h3 className="text-xl font-bold text-[var(--fh-text)] mb-4">Alterar Senha</h3>
            
            {passwordSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-600/50 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg">
                Senha alterada com sucesso!
              </div>
            )}

            {passwordError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-600/50 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.senhaAtual}
                    onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.senhaNova}
                    onChange={(e) => setPasswordData({ ...passwordData, senhaNova: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--fh-muted)] mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.confirmarSenha}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmarSenha: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-lg focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ senhaAtual: '', senhaNova: '', confirmarSenha: '' });
                  setPasswordError(null);
                  setPasswordSuccess(false);
                }}
                className="px-4 py-2 bg-[var(--fh-card)] hover:bg-[var(--fh-gray-100)] text-[var(--fh-text)] border border-[var(--fh-border)] rounded-lg transition-all shadow-sm hover:shadow"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
