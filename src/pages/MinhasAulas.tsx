import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Users2,
  Check,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  UserPlus,
  UserMinus
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import useAuth from '../hooks/useAuth'
import { aulasApi, AulaResponse } from '../api/aulas'
import inscricoesApi, { InscricaoResponse } from '../api/inscricoes'
import { Button } from '../components/Button'
import { ConfirmModal } from '../components/ConfirmModal'
import Layout from '../components/Layout'

type TabType = 'disponiveis' | 'inscritas'

const MinhasAulas: React.FC = () => {
  const { user, logout } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>('disponiveis')
  const [aulasDisponiveis, setAulasDisponiveis] = useState<AulaResponse[]>([])
  const [minhasInscricoes, setMinhasInscricoes] = useState<InscricaoResponse[]>([])
  const [aulasInscritas, setAulasInscritas] = useState<AulaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
    onConfirm: () => Promise<void>
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  useEffect(() => {
    // Carregar minhas inscrições sempre para verificar status
    loadMinhasInscricoesParaVerificacao()
  }, [])

  const loadMinhasInscricoesParaVerificacao = async () => {
    try {
      const inscricoesData = await inscricoesApi.minhasInscricoes(0, 100)
      const inscricoes = inscricoesData.content || inscricoesData
      const inscricoesAtivas = inscricoes.filter((i: InscricaoResponse) => 
        i.status === 'INSCRITO'
      )
      setMinhasInscricoes(inscricoesAtivas)
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'disponiveis') {
        await loadAulasDisponiveis()
      } else {
        await loadMinhasInscricoes()
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAulasDisponiveis = async () => {
    try {
      const data = await aulasApi.listarAulasAluno(0, 50)
      const aulas = data.content || data
      // Filtrar apenas aulas ativas e disponíveis/agendadas
      const aulasAtivas = aulas.filter((a: AulaResponse) => 
        a.ativo && ['DISPONIVEL', 'AGENDADA'].includes(a.status)
      )
      setAulasDisponiveis(aulasAtivas)
    } catch (error: any) {
      console.error('Erro ao carregar aulas:', error)
      showError('Erro ao carregar aulas disponíveis')
    }
  }

  const loadMinhasInscricoes = async () => {
    try {
      const [inscricoesData, aulasData] = await Promise.all([
        inscricoesApi.minhasInscricoes(0, 50),
        aulasApi.listarAulasAluno(0, 50)
      ])

      const inscricoes = inscricoesData.content || inscricoesData
      const aulas = aulasData.content || aulasData

      // Filtrar apenas inscrições ativas
      const inscricoesAtivas = inscricoes.filter((i: InscricaoResponse) => 
        i.status === 'INSCRITO'
      )

      setMinhasInscricoes(inscricoesAtivas)

      // Filtrar aulas correspondentes às inscrições
      const aulasComInscricao = aulas.filter((a: AulaResponse) =>
        inscricoesAtivas.some((i: InscricaoResponse) => i.aulaId === a.id)
      )
      setAulasInscritas(aulasComInscricao)
    } catch (error: any) {
      console.error('Erro ao carregar inscrições:', error)
      showError('Erro ao carregar suas inscrições')
    }
  }

  const handleInscrever = async (aula: AulaResponse) => {
    // Verificar se já está inscrito
    if (isInscrito(aula.id)) {
      return
    }

    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Inscrição',
      message: `Deseja se inscrever na aula "${aula.titulo}"?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setActionLoading(aula.id)
          const inscricao = await inscricoesApi.inscrever(aula.id)
          
          // Atualizar estado local imediatamente após confirmação
          if (inscricao && inscricao.aulaId) {
            setMinhasInscricoes(prev => [...prev, inscricao])
          } else {
            // Recarregar inscrições se não recebeu resposta esperada
            await loadMinhasInscricoesParaVerificacao()
          }
          
          showSuccess('Inscrição realizada com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao realizar inscrição'
          showError(errorMessage)
        } finally {
          setActionLoading(null)
        }
      }
    })
  }

  const handleCancelar = (aula: AulaResponse) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancelar Inscrição',
      message: `Deseja cancelar sua inscrição na aula "${aula.titulo}"?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(aula.id)
          await inscricoesApi.cancelar(aula.id)
          
          // Remover inscrição do estado local imediatamente
          setMinhasInscricoes(prev => prev.filter(i => i.aulaId !== aula.id))
          setAulasInscritas(prev => prev.filter(a => a.id !== aula.id))
          
          showSuccess('Inscrição cancelada com sucesso!')
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao cancelar inscrição'
          showError(errorMessage)
        } finally {
          setActionLoading(null)
        }
      }
    })
  }

  const closeConfirmModal = () => {
    setConfirmModal(null)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
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
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges] || 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const isInscrito = (aulaId: string) => {
    return minhasInscricoes.some(i => i.aulaId === aulaId && i.status === 'INSCRITO')
  }

  const AulaCard: React.FC<{ aula: AulaResponse; inscrito?: boolean }> = ({ aula, inscrito = false }) => {
    const isLoading = actionLoading === aula.id

    return (
      <div className="bg-[var(--fh-card)] rounded-xl p-6 shadow-sm border border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--fh-text)]">{aula.titulo}</h3>
              {getStatusBadge(aula.status)}
            </div>
          </div>
        </div>

        <p className="text-[var(--fh-muted)] mb-4 line-clamp-2">
          {aula.descricao || 'Sem descrição'}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--fh-muted)]">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(aula.data)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--fh-muted)]">
            <Users2 className="w-4 h-4" />
            <span>Limite: {aula.limiteAlunos} alunos</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--fh-border)]">
          {inscrito ? (
            <Button
              onClick={() => handleCancelar(aula)}
              disabled={isLoading}
              variant="secondary"
              className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserMinus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Cancelando...' : 'Cancelar Inscrição'}
            </Button>
          ) : (
            <Button
              onClick={() => handleInscrever(aula)}
              disabled={isLoading || isInscrito(aula.id)}
              variant="primary"
              className="w-full justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isInscrito(aula.id) ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Inscrevendo...' : isInscrito(aula.id) ? 'Já Inscrito' : 'Inscrever-me'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">Minhas Aulas</h1>
            <p className="text-[var(--fh-muted)]">Veja aulas disponíveis e gerencie suas inscrições</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[var(--fh-border)]">
          <button
            onClick={() => setActiveTab('disponiveis')}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'disponiveis'
                ? 'border-[var(--fh-primary)] text-[var(--fh-primary)]'
                : 'border-transparent text-[var(--fh-muted)] hover:text-[var(--fh-text)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Aulas Disponíveis
            </div>
          </button>
          <button
            onClick={() => setActiveTab('inscritas')}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === 'inscritas'
                ? 'border-[var(--fh-primary)] text-[var(--fh-primary)]'
                : 'border-transparent text-[var(--fh-muted)] hover:text-[var(--fh-text)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Minhas Inscrições
              {minhasInscricoes.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--fh-primary)] text-white">
                  {minhasInscricoes.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--fh-primary)]" />
          </div>
        ) : (
          <div>
            {activeTab === 'disponiveis' && (
              <div>
                {aulasDisponiveis.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aulasDisponiveis.map((aula) => (
                      <AulaCard key={aula.id} aula={aula} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-[var(--fh-gray-100)] rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-[var(--fh-muted)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--fh-text)] mb-2">
                      Nenhuma aula disponível
                    </h3>
                    <p className="text-[var(--fh-muted)]">
                      Não há aulas disponíveis para inscrição no momento
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inscritas' && (
              <div>
                {aulasInscritas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aulasInscritas.map((aula) => (
                      <AulaCard key={aula.id} aula={aula} inscrito />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-[var(--fh-gray-100)] rounded-2xl flex items-center justify-center">
                      <AlertCircle className="w-12 h-12 text-[var(--fh-muted)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--fh-text)] mb-2">
                      Você não tem inscrições
                    </h3>
                    <p className="text-[var(--fh-muted)] mb-6">
                      Acesse a aba "Aulas Disponíveis" para se inscrever em uma aula
                    </p>
                    <Button
                      onClick={() => setActiveTab('disponiveis')}
                      variant="primary"
                    >
                      Ver Aulas Disponíveis
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
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

export default MinhasAulas
