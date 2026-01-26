import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, MapPin, AlertTriangle, Plus, Trash2, Users } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import useAuth from '../../hooks/useAuth'
import { responsaveisApi } from '../../api/responsaveis'
import { alunosApi } from '../../api/alunos'
import Layout from '../../components/Layout'
import LinkAlunoResponsavelModal from '../../components/LinkAlunoResponsavelModal'
import type { ResponsavelDetalhadoResponse } from '../../api/responsaveis'

interface AlunoVinculado {
  id: string;
  nome: string;
  email: string;
}

const formatCPF = (cpf: string | undefined) => {
  if (!cpf) return 'Não informado'
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const ResponsavelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  const { user, logout } = useAuth()
  
  const [responsavel, setResponsavel] = useState<ResponsavelDetalhadoResponse | null>(null)
  const [alunos, setAlunos] = useState<AlunoVinculado[]>([])
  const [loading, setLoading] = useState(true)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [incompleteProfile, setIncompleteProfile] = useState(false)
  const [deletingAlunoId, setDeletingAlunoId] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadResponsavel()
    }
  }, [id])

  const loadResponsavel = async () => {
    try {
      setLoading(true)
      setIncompleteProfile(false)
      const responsavelData = await responsaveisApi.buscarPorId(id!)
      setResponsavel(responsavelData)
      // Carregar alunos do responsável que foram retornados pela API
      if (responsavelData.alunos && responsavelData.alunos.length > 0) {
        setAlunos(responsavelData.alunos)
      } else {
        setAlunos([])
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || ''
      
      // Detectar se é erro de cadastro incompleto (endereco null, etc)
      if (errorMessage.includes('endereco') || 
          errorMessage.includes('null') || 
          errorMessage.includes('NullPointer')) {
        setIncompleteProfile(true)
      } else {
        showError(errorMessage || 'Erro ao carregar dados do responsável')
        navigate('/responsaveis')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDesvinculaAluno = async (alunoId: string) => {
    if (!id) return
    
    try {
      setDeletingAlunoId(alunoId)
      await responsaveisApi.desvinculaAluno(id, alunoId)
      setAlunos(alunos.filter(a => a.id !== alunoId))
      showSuccess('Aluno desvinculado com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao desvinculiar aluno'
      showError(errorMessage)
    } finally {
      setDeletingAlunoId(null)
    }
  }

  if (loading) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse mb-2" />
            <div className="h-6 bg-gray-200 rounded-lg w-48 animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
                  <div className="h-6 bg-gray-200 rounded-lg w-32 animate-pulse mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                        <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
                <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Tela amigável para cadastro incompleto
  if (incompleteProfile) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">Cadastro Incompleto</h1>
              <p className="text-[var(--fh-muted)] mt-1">Este responsável ainda não finalizou o cadastro</p>
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
                  Este responsável foi cadastrado no sistema, mas ainda não realizou a primeira ativação da conta 
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
                    O responsável foi cadastrado por um administrador
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
                    Entre em contato com o responsável
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
                <strong>Dica:</strong> O responsável deve ter recebido um email com as instruções de primeiro acesso. 
                Após a ativação, todos os dados ficarão disponíveis aqui.
              </p>
            </div>
          </div>

          {/* Botão de Voltar */}
          <div className="flex justify-start">
            <button
              onClick={() => navigate('/responsaveis')}
              className="px-6 py-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Lista de Responsáveis
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!responsavel) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Responsável não encontrado</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Não foi possível encontrar os dados deste responsável.</p>
            <button
              onClick={() => navigate('/responsaveis')}
              className="px-6 py-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Lista
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/responsaveis')}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para responsáveis
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">{responsavel.nome}</h1>
          </div>
        </div>

        {/* Alert for incomplete profile */}
        {(!responsavel.telefone || !responsavel.endereco) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Cadastro Incompleto</p>
                <p className="text-sm">
                  {!responsavel.telefone && 'Telefone não informado. '}
                  {!responsavel.endereco && 'Endereço não informado.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{responsavel.email || 'Não informado'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{responsavel.telefone || 'Não informado'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)]">CPF</label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{formatCPF(responsavel.cpf)}</p>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-xl font-bold text-[var(--fh-text)] mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--fh-primary)]" />
                Endereço
              </h2>
              {responsavel.endereco ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--fh-muted)]">Logradouro</label>
                      <p className="text-[var(--fh-text)] font-medium">{responsavel.endereco.logradouro || 'Não informado'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--fh-muted)]">Número</label>
                      <p className="text-[var(--fh-text)] font-medium">{responsavel.endereco.numero || 'S/N'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--fh-muted)]">Complemento</label>
                      <p className="text-[var(--fh-text)] font-medium">{responsavel.endereco.complemento || 'Não informado'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--fh-muted)]">Bairro</label>
                      <p className="text-[var(--fh-text)] font-medium">{responsavel.endereco.bairro || 'Não informado'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--fh-muted)]">Cidade</label>
                      <p className="text-[var(--fh-text)] font-medium">{responsavel.endereco.cidade || 'Não informado'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--fh-muted)]">CEP</label>
                      <p className="text-[var(--fh-text)] font-medium">{responsavel.endereco.cep || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  {/* Endereço Completo em Destaque */}
                  <div className="mt-6 p-4 bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)]">
                    <label className="text-sm font-semibold text-[var(--fh-text)] mb-2 block">Endereço Completo</label>
                    <p className="text-[var(--fh-text)] font-medium">
                      {[
                        responsavel.endereco.logradouro,
                        responsavel.endereco.numero && `Nº ${responsavel.endereco.numero}`,
                        responsavel.endereco.complemento,
                        responsavel.endereco.bairro,
                        responsavel.endereco.cidade,
                        responsavel.endereco.estado && `- ${responsavel.endereco.estado}`,
                        responsavel.endereco.cep
                      ].filter(Boolean).join(', ') || 'Endereço não informado'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-[var(--fh-muted)] mx-auto mb-4" />
                  <p className="text-[var(--fh-text)] font-medium">Endereço não cadastrado</p>
                  <p className="text-[var(--fh-muted)] text-sm mt-2">O responsável ainda não preencheu as informações de endereço</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Alunos Vinculados */}
          <div>
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--fh-text)] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--fh-primary)]" />
                  Alunos
                </h3>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="p-2 hover:bg-[var(--fh-gray-50)] rounded-lg transition-colors"
                  title="Vincular aluno"
                >
                  <Plus className="w-5 h-5 text-[var(--fh-primary)]" />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alunos.length > 0 ? (
                  alunos.map((aluno) => (
                    <div
                      key={aluno.id}
                      className="flex items-center justify-between p-3 bg-[var(--fh-gray-50)] rounded-lg hover:bg-[var(--fh-gray-100)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--fh-text)] truncate">{aluno.nome}</p>
                        <p className="text-xs text-[var(--fh-muted)] truncate">{aluno.email}</p>
                      </div>
                      <button
                        onClick={() => handleDesvinculaAluno(aluno.id)}
                        disabled={deletingAlunoId === aluno.id}
                        className="ml-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                        title="Desvinculiar aluno"
                      >
                        {deletingAlunoId === aluno.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-[var(--fh-muted)] mx-auto mb-2 opacity-50" />
                    <p className="text-[var(--fh-text)] font-medium text-sm">Nenhum aluno vinculado</p>
                    <p className="text-[var(--fh-muted)] text-xs mt-1">Clique em + para vincular alunos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Vincular Aluno */}
        {showLinkModal && (
          <LinkAlunoResponsavelModal
            responsavelId={id!}
            onClose={() => setShowLinkModal(false)}
            onSuccess={(novoAluno) => {
              setAlunos([...alunos, novoAluno])
            }}
            alunosVinculados={alunos.map(a => a.id)}
          />
        )}
      </div>
    </Layout>
  )
}

export default ResponsavelDetail
