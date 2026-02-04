import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit3, 
  Clock,
  Users,
  User,
  UserPlus,
  UserMinus,
  Search,
  X
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import useAuth from '../../hooks/useAuth'
import { turmasApi, TurmaResponse } from '../../api/turmas'
import { professoresApi, ProfessorResponse } from '../../api/professores'
import { alunosApi } from '../../api/alunos'
import type { AlunoResponse } from '../../types'
import { Button } from '../../components/Button'
import { ConfirmModal } from '../../components/ConfirmModal'
import Layout from '../../components/Layout'
import TextField from '../../components/TextField'

// Interface para detalhes completos da turma (com professor e alunos vinculados)
interface TurmaDetalhada extends TurmaResponse {
  professor?: {
    id: string
    nome: string
    email: string
  }
  alunos?: Array<{
    id: string
    nome: string
    email: string
  }>
}

// Interface para o formulário de edição
interface EditFormData {
  nome: string
  horario: string
}

interface EditTurmaModalProps {
  turma: TurmaDetalhada
  isOpen: boolean
  onClose: () => void
  onSave: (dadosAtualizados: EditFormData) => Promise<void>
}

const EditTurmaModal: React.FC<EditTurmaModalProps> = ({ turma, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<EditFormData>({
    nome: turma.nome || '',
    horario: turma.horario || ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (turma) {
      setFormData({
        nome: turma.nome || '',
        horario: turma.horario || ''
      })
    }
  }, [turma])

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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[var(--fh-card)] rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-[var(--fh-border)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fh-text)]">Editar Turma</h2>
            <p className="text-[var(--fh-muted)] mt-1">Atualize as informações da turma</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            id="nome"
            label="Nome da Turma"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: Iniciante Manhã"
          />

          <TextField
            id="horario"
            label="Horário"
            value={formData.horario}
            onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
            placeholder="Ex: Segunda e Quarta - 08:00 às 09:00"
          />

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
    </div>,
    document.body
  )
}

// Modal para vincular professor
interface VincularProfessorModalProps {
  isOpen: boolean
  onClose: () => void
  onVincular: (professorId: string) => Promise<void>
  professorAtualId?: string
}

const VincularProfessorModal: React.FC<VincularProfessorModalProps> = ({ 
  isOpen, 
  onClose, 
  onVincular,
  professorAtualId 
}) => {
  const [professores, setProfessores] = useState<ProfessorResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [vincularLoading, setVincularLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadProfessores()
    }
  }, [isOpen])

  const loadProfessores = async () => {
    try {
      setLoading(true)
      const data = await professoresApi.listar(0, 100)
      const list = data.content || data
      setProfessores(list)
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProfessores = professores.filter((p) =>
    (p.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleVincular = async (professorId: string) => {
    try {
      setVincularLoading(true)
      await onVincular(professorId)
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setVincularLoading(false)
    }
  }

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[var(--fh-card)] rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl border border-[var(--fh-border)] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fh-text)]">Vincular Professor</h2>
            <p className="text-[var(--fh-muted)] mt-1">Selecione um professor para a turma</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--fh-gray-100)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--fh-muted)]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] transition-all"
          />
        </div>

        {/* Professores List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fh-primary)]"></div>
            </div>
          ) : filteredProfessores.length > 0 ? (
            filteredProfessores.map((professor) => (
              <div
                key={professor.id}
                className="p-4 rounded-xl border border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--fh-text)]">{professor.nome}</p>
                    <p className="text-sm text-[var(--fh-muted)]">{professor.email}</p>
                  </div>
                  <Button
                    onClick={() => handleVincular(professor.id)}
                    disabled={vincularLoading || professor.id === professorAtualId}
                    variant="primary"
                    className="text-sm px-3 py-1"
                  >
                    {professor.id === professorAtualId ? 'Atual' : 'Selecionar'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-[var(--fh-muted)]">
              Nenhum professor encontrado
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Modal para vincular alunos
interface VincularAlunosModalProps {
  isOpen: boolean
  onClose: () => void
  onVincular: (alunoId: string) => Promise<void>
  alunosVinculados: string[]
}

const VincularAlunosModal: React.FC<VincularAlunosModalProps> = ({ 
  isOpen, 
  onClose, 
  onVincular,
  alunosVinculados 
}) => {
  const [alunos, setAlunos] = useState<AlunoResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [vincularLoading, setVincularLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAlunos()
    }
  }, [isOpen])

  const loadAlunos = async () => {
    try {
      setLoading(true)
      const data = await alunosApi.listar(0, 100)
      const list = data.content || data
      setAlunos(list)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAlunos = alunos
    .filter((a) => !alunosVinculados.includes(a.id))
    .filter((a) =>
      (a.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (a.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

  const handleVincular = async (alunoId: string) => {
    try {
      setVincularLoading(true)
      await onVincular(alunoId)
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setVincularLoading(false)
    }
  }

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[var(--fh-card)] rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl border border-[var(--fh-border)] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fh-text)]">Vincular Aluno</h2>
            <p className="text-[var(--fh-muted)] mt-1">Selecione um aluno para adicionar à turma</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--fh-gray-100)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--fh-muted)]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] transition-all"
          />
        </div>

        {/* Alunos List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fh-primary)]"></div>
            </div>
          ) : filteredAlunos.length > 0 ? (
            filteredAlunos.map((aluno) => (
              <div
                key={aluno.id}
                className="p-4 rounded-xl border border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--fh-text)]">{aluno.nome}</p>
                    <p className="text-sm text-[var(--fh-muted)]">{aluno.email}</p>
                  </div>
                  <Button
                    onClick={() => handleVincular(aluno.id)}
                    disabled={vincularLoading}
                    variant="primary"
                    className="text-sm px-3 py-1"
                  >
                    Selecionar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-[var(--fh-muted)]">
              {alunosVinculados.length > 0 && alunos.length > 0 
                ? 'Todos os alunos já estão vinculados'
                : 'Nenhum aluno encontrado'}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

const TurmaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { user, logout } = useAuth()
  
  const [turma, setTurma] = useState<TurmaDetalhada | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isVincularProfessorModalOpen, setIsVincularProfessorModalOpen] = useState(false)
  const [isVincularAlunosModalOpen, setIsVincularAlunosModalOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
    onConfirm: () => Promise<void>
  } | null>(null)

  useEffect(() => {
    if (id) {
      loadTurma()
    }
  }, [id])

  const loadTurma = async () => {
    try {
      setLoading(true)
      const [turmaData, alunosData] = await Promise.all([
        turmasApi.buscarPorId(id!),
        alunosApi.listar(0, 1000)
      ])

      const todosAlunos = alunosData.content || alunosData
      // Filtrar alunos que possuem esta turma na lista de turmaIds
      const alunosVinculados = todosAlunos.filter((aluno: any) => 
        aluno.turmaIds && aluno.turmaIds.includes(id)
      )

      setTurma({
        ...turmaData,
        alunos: alunosVinculados.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          email: a.email
        }))
      } as TurmaDetalhada)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao carregar dados da turma'
      showError(errorMessage)
      navigate('/turmas')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = () => {
    if (!turma) return
    
    const action = turma.ativo ? 'inativar' : 'ativar'
    const variant = turma.ativo ? 'danger' : 'info'
    
    setConfirmModal({
      isOpen: true,
      title: `${action === 'ativar' ? 'Ativar' : 'Inativar'} Turma`,
      message: `Tem certeza que deseja ${action} a turma ${turma.nome}?`,
      variant,
      onConfirm: async () => {
        try {
          await turmasApi.atualizarStatus(turma.id, { ativo: !turma.ativo })
          await loadTurma()
          showSuccess(`Turma ${turma.ativo ? 'inativada' : 'ativada'} com sucesso!`)
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao atualizar status'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleSaveEdit = async (dadosAtualizados: EditFormData) => {
    if (!turma) return

    try {
      await turmasApi.atualizar(turma.id, {
        nome: dadosAtualizados.nome,
        horario: dadosAtualizados.horario,
        professorId: turma.professorId,
        ativo: turma.ativo
      })

      await loadTurma()
      showSuccess('Dados atualizados com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar alterações'
      showError(errorMessage)
      throw error
    }
  }

  const handleVincularProfessor = async (professorId: string) => {
    if (!turma) return

    try {
      await turmasApi.vincularProfessor(turma.id, professorId)
      await loadTurma()
      showSuccess('Professor vinculado com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao vincular professor'
      showError(errorMessage)
      throw error
    }
  }

  const handleDesvincularProfessor = () => {
    if (!turma || !turma.professorId) return

    setConfirmModal({
      isOpen: true,
      title: 'Desvincular Professor',
      message: 'Tem certeza que deseja desvincular o professor desta turma?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await turmasApi.desvincularProfessor(turma.id, turma.professorId!)
          await loadTurma()
          showSuccess('Professor desvinculado com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao desvincular professor'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleVincularAluno = async (alunoId: string) => {
    if (!turma) return

    try {
      await turmasApi.vincularAluno(turma.id, alunoId)
      await loadTurma()
      showSuccess('Aluno vinculado com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao vincular aluno'
      showError(errorMessage)
      throw error
    }
  }

  const handleDesvincularAluno = (alunoId: string, alunoNome: string) => {
    if (!turma) return

    setConfirmModal({
      isOpen: true,
      title: 'Desvincular Aluno',
      message: `Tem certeza que deseja desvincular ${alunoNome} desta turma?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          await turmasApi.desvincularAluno(turma.id, alunoId)
          await loadTurma()
          showSuccess('Aluno desvinculado com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao desvincular aluno'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleExcluirTurma = () => {
    if (!turma) return

    setConfirmModal({
      isOpen: true,
      title: 'Excluir Turma',
      message: `Tem certeza que deseja excluir a turma "${turma.nome}"? Esta ação não pode ser desfeita.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await turmasApi.excluir(turma.id)
          showSuccess('Turma excluída com sucesso!')
          navigate('/turmas')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao excluir turma'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const closeConfirmModal = () => {
    setConfirmModal(null)
  }

  const canEdit = user?.role && ['ADMIN', 'COORDENADOR'].includes(user.role)

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
                  <div className="space-y-4">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
                <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
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

  if (!turma) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Turma não encontrada</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Não foi possível encontrar os dados desta turma.</p>
            <Button onClick={() => navigate('/turmas')} variant="primary">
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
            onClick={() => navigate('/turmas')}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para turmas
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">{turma.nome}</h1>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            turma.ativo 
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50' 
              : 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50'
          }`}>
            {turma.ativo ? 'Turma Ativa' : 'Turma Inativa'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da Turma */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-xl font-bold text-[var(--fh-text)] mb-6 flex items-center gap-3">
                <Users className="w-5 h-5 text-[var(--fh-primary)]" />
                Informações da Turma
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Nome
                  </label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{turma.nome || 'Não informado'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário
                  </label>
                  <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">{turma.horario || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Professor Vinculado */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--fh-primary)]" />
                  Professor
                </h2>
                {canEdit && (
                  <div className="flex gap-2">
                    {turma.professorId ? (
                      <Button
                        onClick={handleDesvincularProfessor}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Desvincular
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsVincularProfessorModalOpen(true)}
                        variant="primary"
                        className="text-sm px-3 py-1"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Vincular
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {turma.professor || turma.professorId ? (
                <div className="p-4 bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)]">
                  <p className="font-medium text-[var(--fh-text)]">
                    {turma.professor?.nome || (turma as any).professorNome || 'Professor vinculado'}
                  </p>
                  {turma.professor?.email && (
                    <p className="text-sm text-[var(--fh-muted)] mt-1">{turma.professor.email}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--fh-muted)]">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum professor vinculado a esta turma</p>
                </div>
              )}
            </div>

            {/* Alunos Vinculados */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-3">
                  <Users className="w-5 h-5 text-[var(--fh-primary)]" />
                  Alunos ({turma.alunos?.length || 0})
                </h2>
                {canEdit && (
                  <Button
                    onClick={() => setIsVincularAlunosModalOpen(true)}
                    variant="primary"
                    className="text-sm px-3 py-1"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Vincular Aluno
                  </Button>
                )}
              </div>
              
              {turma.alunos && turma.alunos.length > 0 ? (
                <div className="space-y-2">
                  {turma.alunos.map((aluno) => (
                    <div
                      key={aluno.id}
                      className="p-4 bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-[var(--fh-text)]">{aluno.nome}</p>
                        <p className="text-sm text-[var(--fh-muted)]">{aluno.email}</p>
                      </div>
                      {canEdit && (
                        <Button
                          onClick={() => handleDesvincularAluno(aluno.id, aluno.nome)}
                          variant="secondary"
                          className="text-sm px-3 py-1"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--fh-muted)]">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum aluno vinculado a esta turma</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions Sidebar - Apenas para Admin/Coordenador */}
          {canEdit && (
            <div className="space-y-6">
              <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
                <h3 className="text-lg font-bold text-[var(--fh-text)] mb-6">Ações</h3>
                
                <div className="space-y-3">
                  {canEdit && (
                    <>
                      <Button
                        onClick={() => setIsEditModalOpen(true)}
                        variant="primary"
                        className="w-full justify-center"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar Informações
                      </Button>

                      <Button
                        onClick={handleToggleStatus}
                        variant={turma.ativo ? 'secondary' : 'primary'}
                        className="w-full justify-center"
                      >
                        {turma.ativo ? 'Inativar Turma' : 'Ativar Turma'}
                      </Button>

                      <div className="pt-3 border-t border-[var(--fh-border)]">
                        <Button
                          onClick={handleExcluirTurma}
                          variant="secondary"
                          className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-600"
                        >
                          Excluir Turma
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditTurmaModal
        turma={turma}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      <VincularProfessorModal
        isOpen={isVincularProfessorModalOpen}
        onClose={() => setIsVincularProfessorModalOpen(false)}
        onVincular={handleVincularProfessor}
        professorAtualId={turma.professorId}
      />

      <VincularAlunosModal
        isOpen={isVincularAlunosModalOpen}
        onClose={() => setIsVincularAlunosModalOpen(false)}
        onVincular={handleVincularAluno}
        alunosVinculados={turma.alunos?.map(a => a.id) || []}
      />

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          variant={confirmModal.variant}
          onConfirm={async () => {
            await confirmModal.onConfirm()
            closeConfirmModal()
          }}
          onClose={closeConfirmModal}
        />
      )}
    </Layout>
  )
}

export default TurmaDetail
