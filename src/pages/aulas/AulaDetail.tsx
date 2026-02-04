import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit3, 
  BookOpen,
  Calendar,
  Users2,
  Clock,
  User,
  AlertCircle,
  UserPlus,
  UserMinus,
  Search,
  X,
  Check,
  XCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import useAuth from '../../hooks/useAuth'
import { aulasApi, AulaResponse } from '../../api/aulas'
import { alunosApi } from '../../api/alunos'
import { turmasApi, TurmaResponse } from '../../api/turmas'
import inscricoesApi, { InscricaoResponse } from '../../api/inscricoes'
import presencasApi, { PresencaResponse } from '../../api/presencas'
import { Button } from '../../components/Button'
import { ConfirmModal } from '../../components/ConfirmModal'
import Layout from '../../components/Layout'
import TextField from '../../components/TextField'

// Interface para o formulário de edição
interface EditFormData {
  titulo: string
  descricao: string
  data: string
  limiteAlunos: number
}

interface EditAulaModalProps {
  aula: AulaResponse
  isOpen: boolean
  onClose: () => void
  onSave: (dadosAtualizados: EditFormData) => Promise<void>
}

const EditAulaModal: React.FC<EditAulaModalProps> = ({ aula, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<EditFormData>({
    titulo: aula.titulo || '',
    descricao: aula.descricao || '',
    data: aula.data ? aula.data.substring(0, 16) : '',
    limiteAlunos: aula.limiteAlunos || 20
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (aula) {
      setFormData({
        titulo: aula.titulo || '',
        descricao: aula.descricao || '',
        data: aula.data ? aula.data.substring(0, 16) : '',
        limiteAlunos: aula.limiteAlunos || 20
      })
    }
  }, [aula])

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
      <div className="bg-[var(--fh-card)] rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-[var(--fh-border)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fh-text)]">Editar Aula</h2>
            <p className="text-[var(--fh-muted)] mt-1">Atualize as informações da aula</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            id="titulo"
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ex: Treino de Passagem de Guarda"
          />

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-[var(--fh-text)] mb-2">
              Descrição
            </label>
            <textarea
              id="descricao"
              rows={4}
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o conteúdo da aula..."
              className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                Data e Hora
              </label>
              <input
                id="data"
                type="datetime-local"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                className="w-full px-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] transition-all"
              />
            </div>

            <TextField
              id="limiteAlunos"
              label="Limite de Alunos"
              type="number"
              min="1"
              value={formData.limiteAlunos.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, limiteAlunos: parseInt(e.target.value) || 1 }))}
            />
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
    </div>,
    document.body
  )
}

// Modal para vincular turma
interface VincularTurmaModalProps {
  isOpen: boolean
  onClose: () => void
  onVincular: (turmaId: string) => Promise<void>
  turmaAtualId?: string
}

const VincularTurmaModal: React.FC<VincularTurmaModalProps> = ({ 
  isOpen, 
  onClose, 
  onVincular,
  turmaAtualId 
}) => {
  const [turmas, setTurmas] = useState<TurmaResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [vincularLoading, setVincularLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTurmas()
    }
  }, [isOpen])

  const loadTurmas = async () => {
    try {
      setLoading(true)
      const data = await turmasApi.listar(0, 100)
      const list = data.content || data
      // Filtrar apenas turmas ativas
      setTurmas(list.filter((t: TurmaResponse) => t.ativo))
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTurmas = turmas.filter((t) =>
    (t.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (t.horario?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleVincular = async (turmaId: string) => {
    try {
      setVincularLoading(true)
      await onVincular(turmaId)
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
            <h2 className="text-2xl font-bold text-[var(--fh-text)]">Vincular Turma</h2>
            <p className="text-[var(--fh-muted)] mt-1">Selecione uma turma para a aula</p>
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
            placeholder="Buscar por nome ou horário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--fh-border)] rounded-xl focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] transition-all"
          />
        </div>

        {/* Turmas List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--fh-primary)]"></div>
            </div>
          ) : filteredTurmas.length > 0 ? (
            filteredTurmas.map((turma) => (
              <div
                key={turma.id}
                className="p-4 rounded-xl border border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--fh-text)]">{turma.nome}</p>
                    <p className="text-sm text-[var(--fh-muted)]">{turma.horario}</p>
                  </div>
                  <Button
                    onClick={() => handleVincular(turma.id)}
                    disabled={vincularLoading || turma.id === turmaAtualId}
                    variant="primary"
                    className="text-sm px-3 py-1"
                  >
                    {turma.id === turmaAtualId ? 'Atual' : 'Selecionar'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-[var(--fh-muted)]">
              Nenhuma turma encontrada
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

const AulaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { user, logout } = useAuth()
  
  const [aula, setAula] = useState<AulaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isVincularTurmaModalOpen, setIsVincularTurmaModalOpen] = useState(false)
  const [inscricoes, setInscricoes] = useState<InscricaoResponse[]>([])
  const [alunosMap, setAlunosMap] = useState<Record<string, string>>({})
  const [presencas, setPresencas] = useState<PresencaResponse[]>([])
  const [turmaNome, setTurmaNome] = useState<string | null>(null)
  const [turmaHorario, setTurmaHorario] = useState<string | null>(null)
  const [loadingInscricoes, setLoadingInscricoes] = useState(false)
  const [presencaLoading, setPresencaLoading] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
    onConfirm: () => Promise<void>
  } | null>(null)

  useEffect(() => {
    if (id) {
      loadAula()
      loadInscricoes()
    }
  }, [id])

  const loadAula = async () => {
    try {
      setLoading(true)
      const aulaData = await aulasApi.buscarPorId(id!)
      setAula(aulaData)
      // Buscar dados da turma vinculada (nome e horário) para exibir
      if (aulaData?.turmaId) {
        try {
          const turma = await turmasApi.buscarPorId(aulaData.turmaId)
          setTurmaNome(turma?.nome || null)
          setTurmaHorario(turma?.horario || null)
        } catch (err) {
          setTurmaNome(null)
          setTurmaHorario(null)
        }
      } else {
        setTurmaNome(null)
        setTurmaHorario(null)
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao carregar dados da aula'
      showError(errorMessage)
      navigate('/aulas')
    } finally {
      setLoading(false)
    }
  }

  const loadInscricoes = async () => {
    try {
      setLoadingInscricoes(true)
      const [inscricoesData, presencasData] = await Promise.all([
        inscricoesApi.buscarPorAula(id!, 0, 100),
        presencasApi.listarPorAula(id!, 0, 100)
      ])
      
      const inscricoesList = inscricoesData.content || inscricoesData
      // Filtrar apenas inscrições ativas
      const inscricoesAtivas = (inscricoesList || []).filter((i: InscricaoResponse) => i.status === 'INSCRITO')
      const presencasList = presencasData.content || presencasData
      
      setInscricoes(inscricoesAtivas)
      // Buscar nomes dos alunos inscritos (mapear alunoId => nome)
      try {
        const uniqueAlunoIds = Array.from(new Set(inscricoesAtivas.map((i: InscricaoResponse) => i.alunoId)))
        const entries = await Promise.all(uniqueAlunoIds.map(async (alunoId) => {
          try {
            const aluno = await alunosApi.buscarPorId(alunoId)
            return [alunoId, aluno.nome]
          } catch (err) {
            return [alunoId, 'Aluno']
          }
        }))
        const map: Record<string, string> = {}
        entries.forEach(([id, nome]) => { map[id as string] = nome as string })
        setAlunosMap(map)
      } catch (err) {
        // não bloquear render se falhar
        console.error('Erro ao buscar nomes dos alunos:', err)
      }
      setPresencas(presencasList)
    } catch (error: any) {
      console.error('Erro ao carregar inscrições:', error)
    } finally {
      setLoadingInscricoes(false)
    }
  }

  useEffect(() => {
    const handler = (e: any) => {
      const aulaId = e?.detail?.aulaId
      if (!aulaId || aulaId === id) {
        // Recarregar inscrições quando houver atualização relevante
        loadInscricoes()
      }
    }

    window.addEventListener('inscricoesUpdated', handler as EventListener)
    return () => window.removeEventListener('inscricoesUpdated', handler as EventListener)
  }, [id])

  const handleTogglePresenca = async (inscricaoId: string, presente: boolean) => {
    if (!aula) return

    try {
      setPresencaLoading(inscricaoId)
      await presencasApi.atualizarStatus(aula.id, inscricaoId, !presente)
      await loadInscricoes()
      showSuccess(`Presença ${!presente ? 'marcada' : 'desmarcada'} com sucesso!`)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao atualizar presença'
      showError(errorMessage)
    } finally {
      setPresencaLoading(null)
    }
  }

  const handleToggleStatus = () => {
    if (!aula) return
    
    const action = aula.ativo ? 'inativar' : 'ativar'
    const variant = aula.ativo ? 'danger' : 'info'
    
    setConfirmModal({
      isOpen: true,
      title: `${action === 'ativar' ? 'Ativar' : 'Inativar'} Aula`,
      message: `Tem certeza que deseja ${action} a aula "${aula.titulo}"?`,
      variant,
      onConfirm: async () => {
        try {
          await aulasApi.atualizar(aula.id, {
            titulo: aula.titulo,
            descricao: aula.descricao,
            data: aula.data,
            turmaId: aula.turmaId,
            limiteAlunos: aula.limiteAlunos,
            ativo: !aula.ativo
          })
          await loadAula()
          showSuccess(`Aula ${aula.ativo ? 'inativada' : 'ativada'} com sucesso!`)
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao atualizar status'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleChangeStatus = (newStatus: 'DISPONIVEL' | 'AGENDADA' | 'PENDENTE' | 'EM_PROGRESSO' | 'CANCELADA' | 'FINALIZADA') => {
    if (!aula) return

    const statusLabels = {
      'DISPONIVEL': 'Disponível',
      'AGENDADA': 'Agendada',
      'PENDENTE': 'Pendente',
      'EM_PROGRESSO': 'Em Progresso',
      'CANCELADA': 'Cancelada',
      'FINALIZADA': 'Finalizada'
    }

    setConfirmModal({
      isOpen: true,
      title: 'Alterar Status da Aula',
      message: `Deseja alterar o status da aula para "${statusLabels[newStatus]}"?`,
      variant: newStatus === 'CANCELADA' ? 'danger' : 'info',
      onConfirm: async () => {
        try {
          await aulasApi.atualizarStatus(aula.id, { status: newStatus })
          await loadAula()
          showSuccess('Status atualizado com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao atualizar status'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleSaveEdit = async (dadosAtualizados: EditFormData) => {
    if (!aula) return

    try {
      await aulasApi.atualizar(aula.id, {
        titulo: dadosAtualizados.titulo,
        descricao: dadosAtualizados.descricao,
        data: dadosAtualizados.data,
        turmaId: aula.turmaId,
        limiteAlunos: dadosAtualizados.limiteAlunos,
        ativo: aula.ativo
      })

      await loadAula()
      showSuccess('Dados atualizados com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar alterações'
      showError(errorMessage)
      throw error
    }
  }

  const handleVincularTurma = async (turmaId: string) => {
    if (!aula) return

    try {
      await aulasApi.vincularTurma(aula.id, turmaId)
      await loadAula()
      showSuccess('Turma vinculada com sucesso!')
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erro ao vincular turma'
      showError(errorMessage)
      throw error
    }
  }

  const handleDesvincularTurma = () => {
    if (!aula || !aula.turmaId) return

    setConfirmModal({
      isOpen: true,
      title: 'Desvincular Turma',
      message: 'Tem certeza que deseja desvincular a turma desta aula?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await aulasApi.desvincularTurma(aula.id, aula.turmaId!)
          await loadAula()
          showSuccess('Turma desvinculada com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao desvincular turma'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const handleExcluirAula = () => {
    if (!aula) return

    setConfirmModal({
      isOpen: true,
      title: 'Excluir Aula',
      message: `Tem certeza que deseja excluir a aula "${aula.titulo}"? Esta ação não pode ser desfeita.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await aulasApi.excluir(aula.id)
          showSuccess('Aula excluída com sucesso!')
          navigate('/aulas')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao excluir aula'
          showError(errorMessage)
          throw error
        }
      }
    })
  }

  const closeConfirmModal = () => {
    setConfirmModal(null)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'DISPONIVEL': 'bg-gradient-to-r from-sky-500/10 to-cyan-500/10 text-sky-700 border border-sky-300/50 dark:from-sky-500/20 dark:to-cyan-500/20 dark:text-sky-400 dark:border-sky-500/50',
      'AGENDADA': 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-300/50 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-400 dark:border-blue-500/50',
      'PENDENTE': 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-yellow-700 border border-yellow-300/50 dark:from-yellow-500/20 dark:to-amber-500/20 dark:text-yellow-400 dark:border-yellow-500/50',
      'EM_PROGRESSO': 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50',
      'CANCELADA': 'bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-700 border border-red-300/50 dark:from-red-500/20 dark:to-rose-500/20 dark:text-red-400 dark:border-red-500/50',
      'FINALIZADA': 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50'
    }
    const labels = {
      'DISPONIVEL': 'Disponível',
      'AGENDADA': 'Agendada',
      'PENDENTE': 'Pendente',
      'EM_PROGRESSO': 'Em Progresso',
      'CANCELADA': 'Cancelada',
      'FINALIZADA': 'Finalizada'
    }
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const canEdit = user?.role && ['ADMIN', 'PROFESSOR'].includes(user.role)

  if (loading) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="space-y-6">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse mb-2" />
            <div className="h-6 bg-gray-200 rounded-lg w-48 animate-pulse" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!aula) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Aula não encontrada</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Não foi possível encontrar os dados desta aula.</p>
            <Button onClick={() => navigate('/aulas')} variant="primary">
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
            onClick={() => {
              // Redirecionar para a página correta baseado no role
              if (user?.role === 'PROFESSOR') {
                navigate('/aulas-professor')
              } else {
                navigate('/aulas')
              }
            }}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para aulas
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">{aula.titulo}</h1>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge(aula.status)}
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            aula.ativo 
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50' 
              : 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50'
          }`}>
            {aula.ativo ? 'Ativa' : 'Inativa'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da Aula */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <h2 className="text-xl font-bold text-[var(--fh-text)] mb-6 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[var(--fh-primary)]" />
                Informações da Aula
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--fh-muted)]">Descrição</label>
                  <p className="text-[var(--fh-text)] bg-[var(--fh-gray-50)] p-3 rounded-lg whitespace-pre-wrap">
                    {aula.descricao || 'Sem descrição'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data e Hora
                    </label>
                    <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">
                      {formatDate(aula.data)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--fh-muted)] flex items-center gap-2">
                      <Users2 className="w-4 h-4" />
                      Limite de Alunos
                    </label>
                    <p className="text-[var(--fh-text)] font-medium bg-[var(--fh-gray-50)] p-3 rounded-lg">
                      {aula.limiteAlunos} alunos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Turma Vinculada */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-3">
                  <Users2 className="w-5 h-5 text-[var(--fh-primary)]" />
                  Turma
                </h2>
                {canEdit && (
                  <div className="flex gap-2">
                    {aula.turmaId ? (
                      <Button
                        onClick={handleDesvincularTurma}
                        variant="secondary"
                        className="text-sm px-3 py-1"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Desvincular
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsVincularTurmaModalOpen(true)}
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
              
              {aula.turmaId ? (
                <div className="p-4 bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)]">
                  <p className="font-medium text-[var(--fh-text)]">
                    {turmaNome || 'Turma vinculada'}
                  </p>
                  <p className="text-sm text-[var(--fh-muted)] mt-1">
                    {turmaHorario ? `Horário: ${turmaHorario}` : `ID: ${aula.turmaId}`}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--fh-muted)]">
                  <Users2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhuma turma vinculada a esta aula</p>
                </div>
              )}
            </div>

            {/* Alunos Inscritos */}
            <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--fh-primary)]" />
                  Alunos Inscritos
                  {inscricoes.length > 0 && (
                    <span className="text-sm font-normal text-[var(--fh-muted)]">
                      ({inscricoes.length}/{aula.limiteAlunos})
                    </span>
                  )}
                </h2>
              </div>

              {loadingInscricoes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--fh-primary)]" />
                </div>
              ) : inscricoes.length > 0 ? (
                <div className="space-y-2">
                  {inscricoes
                    .filter((insc) => insc.status === 'INSCRITO')
                    .map((inscricao) => {
                      const presenca = presencas.find((p) => p.inscricaoId === inscricao.id)
                      const isLoading = presencaLoading === inscricao.id
                      const alunoNome = presenca?.alunoNome || alunosMap[inscricao.alunoId] || 'Aluno'
                      const alunoInicial = (alunoNome || 'A').charAt(0).toUpperCase()

                      return (
                        <div
                          key={inscricao.id}
                          className="p-4 rounded-xl border border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50 transition-all bg-[var(--fh-gray-50)]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center text-white font-semibold">
                                {alunoInicial}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-[var(--fh-text)]">
                                  {alunoNome}
                                </p>
                                <p className="text-sm text-[var(--fh-muted)]">
                                  Inscrito em {new Date(inscricao.inscritoEm).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>

                            {canEdit && (
                              <div className="flex items-center gap-2">
                                {presenca ? (
                                  <button
                                    onClick={() => handleTogglePresenca(inscricao.id, presenca.presente)}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                      presenca.presente
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : presenca.presente ? (
                                      <>
                                        <Check className="w-4 h-4" />
                                        Presente
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-4 h-4" />
                                        Ausente
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleTogglePresenca(inscricao.id, false)}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 ${
                                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4" />
                                        Marcar Presença
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--fh-muted)]">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum aluno inscrito nesta aula</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions Sidebar */}
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
                      variant={aula.ativo ? 'secondary' : 'primary'}
                      className="w-full justify-center"
                    >
                      {aula.ativo ? 'Inativar Aula' : 'Ativar Aula'}
                    </Button>

                    <div className="pt-3 border-t border-[var(--fh-border)]">
                      <p className="text-sm font-medium text-[var(--fh-text)] mb-3">Alterar Status</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['DISPONIVEL', 'AGENDADA', 'PENDENTE', 'EM_PROGRESSO', 'CANCELADA', 'FINALIZADA'] as const).map((status) => {
                          const statusConfig = {
                            'DISPONIVEL': { label: 'Disponível' },
                            'AGENDADA': { label: 'Agendada' },
                            'PENDENTE': { label: 'Pendente' },
                            'EM_PROGRESSO': { label: 'Em Progresso' },
                            'CANCELADA': { label: 'Cancelada' },
                            'FINALIZADA': { label: 'Finalizada' }
                          }
                          const config = statusConfig[status]
                          const isActive = aula.status === status
                          
                          return (
                            <Button
                              key={status}
                              onClick={() => handleChangeStatus(status)}
                              disabled={isActive}
                              variant="secondary"
                              className={`justify-center text-xs px-2 py-2 ${isActive ? 'ring-2 ring-[var(--fh-primary)] bg-[var(--fh-primary)]/10 font-semibold' : ''}`}
                            >
                              {config.label}
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--fh-border)]">
                      <Button
                        onClick={handleExcluirAula}
                        variant="secondary"
                        className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-600"
                      >
                        Excluir Aula
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditAulaModal
        aula={aula}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      <VincularTurmaModal
        isOpen={isVincularTurmaModalOpen}
        onClose={() => setIsVincularTurmaModalOpen(false)}
        onVincular={handleVincularTurma}
        turmaAtualId={aula.turmaId}
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

export default AulaDetail
