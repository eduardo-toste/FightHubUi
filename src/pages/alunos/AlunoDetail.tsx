import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit3, 
  Shield, 
  ShieldCheck,
  ShieldOff,
  TrendingUp, 
  TrendingDown,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Award,
  BookOpen,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import useAuth from '../../hooks/useAuth'
import { alunosApi } from '../../api/alunos'
import { Button } from '../../components/Button'
import { ConfirmModal } from '../../components/ConfirmModal'
import Layout from '../../components/Layout'
import type { AlunoDetalhadoResponse } from '../../types'

// Interface para o formulário de edição
interface EditFormData {
  dataNascimento: string
  dataMatricula: string
}

interface EditAlunoModalProps {
  aluno: AlunoDetalhadoResponse
  isOpen: boolean
  onClose: () => void
  onSave: (dadosAtualizados: EditFormData) => Promise<void>
}

const EditAlunoModal: React.FC<EditAlunoModalProps> = ({ aluno, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<EditFormData>({
    dataNascimento: aluno.dataNascimento ? aluno.dataNascimento.toString().split('T')[0] : '',
    dataMatricula: aluno.dataMatricula ? aluno.dataMatricula.toString().split('T')[0] : ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (aluno) {
      setFormData({
        dataNascimento: aluno.dataNascimento ? aluno.dataNascimento.toString().split('T')[0] : '',
        dataMatricula: aluno.dataMatricula ? aluno.dataMatricula.toString().split('T')[0] : ''
      })
    }
  }, [aluno])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error is handled by onSave
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Datas</h2>
            <p className="text-gray-600 mt-1">Atualize as datas do aluno</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, dataNascimento: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="inline w-4 h-4 mr-2" />
                Data de Matrícula
              </label>
              <input
                type="date"
                value={formData.dataMatricula}
                onChange={(e) => setFormData(prev => ({ ...prev, dataMatricula: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AlunoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { user, logout } = useAuth()
  
  const [aluno, setAluno] = useState<AlunoDetalhadoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [incompleteProfile, setIncompleteProfile] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
    onConfirm: () => Promise<void>
  } | null>(null)

  useEffect(() => {
    if (id) {
      loadAluno()
    }
  }, [id])

  const loadAluno = async () => {
    try {
      setLoading(true)
      setIncompleteProfile(false)
      const alunoData = await alunosApi.buscarPorId(id!)
      setAluno(alunoData)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || ''
      
      // Detectar se é erro de cadastro incompleto (endereco null, etc)
      if (errorMessage.includes('endereco') || 
          errorMessage.includes('null') || 
          errorMessage.includes('NullPointer')) {
        setIncompleteProfile(true)
      } else {
        showError(errorMessage || 'Erro ao carregar dados do aluno')
        navigate('/alunos')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMatricula = () => {
    if (!aluno) return
    
    const action = aluno.matriculaAtiva ? 'inativar' : 'ativar'
    const variant = aluno.matriculaAtiva ? 'danger' : 'info'
    
    setConfirmModal({
      isOpen: true,
      title: `${action === 'ativar' ? 'Ativar' : 'Inativar'} Matrícula`,
      message: `Tem certeza que deseja ${action} a matrícula de ${aluno.nome}?`,
      variant,
      onConfirm: async () => {
        try {
          await alunosApi.atualizarMatricula(aluno.id, { matriculaAtiva: !aluno.matriculaAtiva })
          await loadAluno()
          showSuccess(`Matrícula ${aluno.matriculaAtiva ? 'inativada' : 'ativada'} com sucesso!`)
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao atualizar matrícula'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handlePromoverFaixa = () => {
    if (!aluno) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Promover Faixa',
      message: `Tem certeza que deseja promover a faixa de ${aluno.nome}?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          await alunosApi.promoverFaixa(aluno.id)
          await loadAluno()
          showSuccess('Faixa promovida com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao promover faixa'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleRebaixarFaixa = () => {
    if (!aluno) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Rebaixar Faixa',
      message: `Tem certeza que deseja rebaixar a faixa de ${aluno.nome}?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await alunosApi.rebaixarFaixa(aluno.id)
          await loadAluno()
          showSuccess('Faixa rebaixada com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao rebaixar faixa'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handlePromoverGrau = () => {
    if (!aluno) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Promover Grau',
      message: `Tem certeza que deseja promover o grau de ${aluno.nome}?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          await alunosApi.promoverGrau(aluno.id)
          await loadAluno()
          showSuccess('Grau promovido com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao promover grau'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleRebaixarGrau = () => {
    if (!aluno) return
    
    setConfirmModal({
      isOpen: true,
      title: 'Rebaixar Grau',
      message: `Tem certeza que deseja rebaixar o grau de ${aluno.nome}?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await alunosApi.rebaixarGrau(aluno.id)
          await loadAluno()
          showSuccess('Grau rebaixado com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao rebaixar grau'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleSaveEdit = async (dadosAtualizados: EditFormData) => {
    if (!aluno) return

    try {
      // Atualizar data de nascimento se foi alterada
      if (dadosAtualizados.dataNascimento && dadosAtualizados.dataNascimento !== aluno.dataNascimento?.toString().split('T')[0]) {
        await alunosApi.atualizarDataNascimento(aluno.id, {
          dataNascimento: dadosAtualizados.dataNascimento
        })
      }

      // Atualizar data de matrícula se foi alterada
      if (dadosAtualizados.dataMatricula && dadosAtualizados.dataMatricula !== aluno.dataMatricula?.toString().split('T')[0]) {
        await alunosApi.atualizarDataMatricula(aluno.id, {
          dataMatricula: dadosAtualizados.dataMatricula
        })
      }

      // Recarregar dados atualizados do aluno
      await loadAluno()
      showSuccess('Dados atualizados com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar alterações'
      showError(errorMessage)
      throw error
    }
  }

  const closeConfirmModal = () => {
    setConfirmModal(null)
  }

  const getGraduacaoDisplay = (graduacao: any) => {
    if (!graduacao) return 'Não informado'
    return `${graduacao.belt} - ${graduacao.level}º Grau`
  }

  const getGraduacaoColor = (belt: string) => {
    const colors = {
      'BRANCA': 'bg-white border-gray-300 text-gray-800',
      'AZUL': 'bg-blue-600 text-white',
      'ROXA': 'bg-purple-600 text-white',
      'MARROM': 'bg-amber-700 text-white',
      'PRETA': 'bg-gray-900 text-white'
    }
    return colors[belt as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date: string | Date) => {
    if (!date) return 'Não informado'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const canEditStudent = user?.role && ['ADMIN', 'COORDENADOR'].includes(user.role)
  const canPromoteStudent = user?.role && ['ADMIN', 'PROFESSOR'].includes(user.role)

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
              <p className="text-[var(--fh-muted)] mt-1">Este aluno ainda não finalizou o cadastro</p>
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
                  Este aluno foi cadastrado no sistema, mas ainda não realizou a primeira ativação da conta 
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
                    O aluno foi cadastrado por um administrador
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
                    Entre em contato com o aluno
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
                <strong>Dica:</strong> O aluno deve ter recebido um email com as instruções de primeiro acesso. 
                Após a ativação, todos os dados ficarão disponíveis aqui.
              </p>
            </div>
          </div>

          {/* Botão de Voltar */}
          <div className="flex justify-start">
            <button
              onClick={() => navigate('/alunos')}
              className="px-6 py-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:opacity-90 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Lista de Alunos
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!aluno) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Aluno não encontrado</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Não foi possível encontrar os dados deste aluno.</p>
            <Button onClick={() => navigate('/alunos')} variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Lista
            </Button>
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
            onClick={() => navigate('/alunos')}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para alunos
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">{aluno.nome}</h1>
          </div>
        </div>

        {/* Alert for incomplete profile */}
        {(!aluno.telefone || !aluno.endereco || !aluno.dataMatricula) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} />
              <div>
                <p className="font-semibold">Cadastro Incompleto</p>
                <p className="text-sm">
                  {!aluno.telefone && 'Telefone não informado. '}
                  {!aluno.endereco && 'Endereço não informado. '}
                  {!aluno.dataMatricula && 'Data de matrícula não informada.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getGraduacaoColor(aluno.graduacaoAluno?.belt || '')}`}>
            <Award className="inline w-4 h-4 mr-2" />
            {getGraduacaoDisplay(aluno.graduacaoAluno)}
          </span>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            aluno.matriculaAtiva 
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50' 
              : 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50'
          }`}>
            {aluno.matriculaAtiva ? (
              <>
                <ShieldCheck className="inline w-4 h-4 mr-2" />
                Matrícula Ativa
              </>
            ) : (
              <>
                <ShieldOff className="inline w-4 h-4 mr-2" />
                Matrícula Inativa
              </>
            )}
          </span>
        </div>

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
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{aluno.email || 'Não informado'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{aluno.telefone || 'Não informado'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Nascimento
                  </label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{formatDate(aluno.dataNascimento)}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Data de Matrícula
                  </label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{formatDate(aluno.dataMatricula)}</p>
                </div>
                
              </div>
            </div>

            {/* Endereço Detalhado */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-xl font-bold text-[var(--fh-text)] mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--fh-primary)]" />
                Endereço
              </h2>
              {aluno.endereco ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--fh-muted)]">Logradouro</label>
                      <p className="text-[var(--fh-text)] font-medium">{aluno.endereco.logradouro || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--fh-muted)]">Número</label>
                    <p className="text-[var(--fh-text)] font-medium">{aluno.endereco.numero || 'S/N'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--fh-muted)]">Complemento</label>
                    <p className="text-[var(--fh-text)] font-medium">{aluno.endereco.complemento || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--fh-muted)]">Bairro</label>
                    <p className="text-[var(--fh-text)] font-medium">{aluno.endereco.bairro || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--fh-muted)]">Cidade</label>
                    <p className="text-[var(--fh-text)] font-medium">{aluno.endereco.cidade || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--fh-muted)]">CEP</label>
                    <p className="text-[var(--fh-text)] font-medium">{aluno.endereco.cep || 'Não informado'}</p>
                  </div>
                </div>
                
                {/* Endereço Completo em Destaque */}
                <div className="mt-6 p-4 bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)]">
                  <label className="text-sm font-semibold text-[var(--fh-text)] mb-2 block">Endereço Completo</label>
                  <p className="text-[var(--fh-text)] font-medium">
                    {[
                      aluno.endereco.logradouro,
                      aluno.endereco.numero && `Nº ${aluno.endereco.numero}`,
                      aluno.endereco.complemento,
                      aluno.endereco.bairro,
                      aluno.endereco.cidade,
                      aluno.endereco.estado && `- ${aluno.endereco.estado}`,
                      aluno.endereco.cep
                    ].filter(Boolean).join(', ') || 'Endereço não informado'}
                  </p>
                </div>
              </>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-[var(--fh-muted)] mx-auto mb-4" />
                  <p className="text-[var(--fh-text)] font-medium">Endereço não cadastrado</p>
                  <p className="text-[var(--fh-muted)] text-sm mt-2">O aluno ainda não preencheu as informações de endereço</p>
                </div>
              )}
            </div>

            {/* Responsáveis */}
            {aluno.responsaveis && aluno.responsaveis.length > 0 && (
              <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
                <h2 className="text-xl font-bold text-[var(--fh-text)] mb-6 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[var(--fh-primary)]" />
                  Responsáveis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aluno.responsaveis.map((responsavel, index) => (
                    <div key={responsavel.id} className="p-4 bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)]">
                      <h3 className="font-bold text-[var(--fh-text)] mb-3">Responsável {index + 1}</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-semibold text-[var(--fh-muted)]">Nome</label>
                          <p className="text-[var(--fh-text)] font-medium">{responsavel.nome}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-[var(--fh-muted)]">Email</label>
                          <p className="text-[var(--fh-text)] font-medium">{responsavel.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-lg font-bold text-[var(--fh-text)] mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--fh-primary)]" />
                Ações
              </h2>
              
              <div className="space-y-4">
                {canEditStudent && (
                  <>
                    <Button
                      onClick={() => setIsEditModalOpen(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Edit3 className="w-4 h-4 mr-3" />
                      Editar Datas
                    </Button>

                    <Button
                      onClick={handleToggleMatricula}
                      variant={aluno.matriculaAtiva ? 'ghost' : 'outline'}
                      className="w-full justify-start"
                    >
                      {aluno.matriculaAtiva ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-3" />
                          Inativar Matrícula
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 mr-3" />
                          Ativar Matrícula
                        </>
                      )}
                    </Button>
                  </>
                )}

                {canPromoteStudent && (
                  <>
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Graduação</h3>
                      
                      <div className="space-y-2">
                        <Button
                          onClick={handlePromoverFaixa}
                          variant="outline"
                          className="w-full justify-start text-green-700 hover:bg-green-50 border-green-300"
                        >
                          <TrendingUp className="w-4 h-4 mr-3" />
                          Promover Faixa
                        </Button>
                        
                        <Button
                          onClick={handleRebaixarFaixa}
                          variant="ghost"
                          className="w-full justify-start text-orange-700 hover:bg-orange-50"
                        >
                          <TrendingDown className="w-4 h-4 mr-3" />
                          Rebaixar Faixa
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Grau</h3>
                      
                      <div className="space-y-2">
                        <Button
                          onClick={handlePromoverGrau}
                          variant="outline"
                          className="w-full justify-start text-blue-700 hover:bg-blue-50 border-blue-300"
                        >
                          <TrendingUp className="w-4 h-4 mr-3" />
                          Promover Grau
                        </Button>
                        
                        <Button
                          onClick={handleRebaixarGrau}
                          variant="ghost"
                          className="w-full justify-start text-purple-700 hover:bg-purple-50"
                        >
                          <TrendingDown className="w-4 h-4 mr-3" />
                          Rebaixar Grau
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-lg font-bold text-[var(--fh-text)] mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--fh-primary)]" />
                Informações Rápidas
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)]">
                  <div className="flex items-center gap-3 text-sm font-semibold text-[var(--fh-text)]">
                    <Clock className="w-5 h-5" />
                    Tempo na Academia
                  </div>
                  <span className="text-sm font-bold text-[var(--fh-text)] bg-[var(--fh-card)] px-3 py-1 rounded-full border border-[var(--fh-border)]">
                    {aluno.dataMatricula 
                      ? Math.ceil((Date.now() - new Date(aluno.dataMatricula).getTime()) / (1000 * 60 * 60 * 24 * 30)) + ' meses'
                      : 'N/A'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)]">
                  <div className="flex items-center gap-3 text-sm font-semibold text-[var(--fh-text)]">
                    <Award className="w-5 h-5" />
                    Graduação Atual
                  </div>
                  <span className="text-sm font-bold text-[var(--fh-text)] bg-[var(--fh-card)] px-3 py-1 rounded-full border border-[var(--fh-border)]">
                    {aluno.graduacaoAluno?.belt || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isEditModalOpen && (
          <EditAlunoModal
            aluno={aluno}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEdit}
          />
        )}

        {confirmModal && (
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            variant={confirmModal.variant}
          />
        )}
      </div>
    </Layout>
  )
}

export { AlunoDetail }
export default AlunoDetail
