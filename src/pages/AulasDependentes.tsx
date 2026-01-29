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
  UserMinus,
  User
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import useAuth from '../hooks/useAuth'
import { aulasApi, AulaResponse } from '../api/aulas'
import inscricoesApi, { InscricaoResponse } from '../api/inscricoes'
import { responsaveisApi, AlunoResponsavelResponse } from '../api/responsaveis'
import { Button } from '../components/Button'
import { ConfirmModal } from '../components/ConfirmModal'
import Layout from '../components/Layout'

type TabType = 'disponiveis' | 'inscritas'

const AulasDependentes: React.FC = () => {
  const { user, logout } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>('disponiveis')
  const [dependentes, setDependentes] = useState<AlunoResponsavelResponse[]>([])
  const [aulasDisponiveis, setAulasDisponiveis] = useState<AulaResponse[]>([])
  const [inscricoesDependentes, setInscricoesDependentes] = useState<InscricaoResponse[]>([])
  const [aulasInscritas, setAulasInscritas] = useState<AulaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedDependente, setSelectedDependente] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
    onConfirm: () => Promise<void>
  } | null>(null)
  const [selectDependenteModal, setSelectDependenteModal] = useState<{
    isOpen: boolean
    aula: AulaResponse | null
  }>({ isOpen: false, aula: null })

  useEffect(() => {
    loadDependentes()
  }, [])

  useEffect(() => {
    if (dependentes.length > 0) {
      loadAllData()
    }
  }, [dependentes])

  useEffect(() => {
    // Apenas muda o loading quando a aba muda (já tem dados em cache)
    setLoading(false)
  }, [activeTab])

  const loadDependentes = async () => {
    try {
      const meusAlunos = await responsaveisApi.obterMeusDependentes()
      setDependentes(meusAlunos)
      
      if (meusAlunos.length === 0) {
        showError('Você não possui dependentes vinculados')
      }
    } catch (error: any) {
      console.error('Erro ao carregar dependentes:', error)
      showError('Erro ao carregar seus dependentes')
    }
  }

  const loadAllData = async () => {
    try {
      setLoading(true)
      // Carregar ambas as abas em paralelo
      await Promise.all([
        loadAulasDisponiveis(),
        loadInscricoesDependentes()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadAulasDisponiveis = async () => {
    try {
      // Para responsável, lista todas as aulas e filtra as ativas/disponíveis
      const data = await aulasApi.listar(0, 50)
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

  const loadInscricoesDependentes = async () => {
    try {
      const [aulasData, inscricoesData] = await Promise.all([
        aulasApi.listar(0, 50),
        responsaveisApi.obterInscricoesDependentes()
      ])

      const aulas = aulasData.content || aulasData
      const todasInscricoes = Array.isArray(inscricoesData) ? inscricoesData : inscricoesData.content || []
      
      // Filtrar apenas inscrições ativas (INSCRITO)
      const inscricoes = todasInscricoes.filter((i: InscricaoResponse) => i.status === 'INSCRITO')

      setInscricoesDependentes(inscricoes)

      // Filtrar aulas correspondentes às inscrições ativas
      const aulasComInscricao = aulas.filter((a: AulaResponse) =>
        inscricoes.some((i: InscricaoResponse) => i.aulaId === a.id)
      )
      setAulasInscritas(aulasComInscricao)
    } catch (error: any) {
      console.error('Erro ao carregar inscrições:', error)
      showError('Erro ao carregar inscrições dos dependentes')
    }
  }

  const handleOpenSelectDependente = (aula: AulaResponse) => {
    setSelectDependenteModal({ isOpen: true, aula })
  }

  const handleInscreverDependente = async (dependenteId: string) => {
    const aula = selectDependenteModal.aula
    if (!aula) return

    const dependente = dependentes.find(d => d.id === dependenteId)
    if (!dependente) return

    setSelectDependenteModal({ isOpen: false, aula: null })

    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Inscrição',
      message: `Deseja inscrever ${dependente.nome} na aula "${aula.titulo}"?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setActionLoading(aula.id)
          const inscricao = await inscricoesApi.inscrever(aula.id, dependenteId)
          
          // Atualizar estado local imediatamente após confirmação
          if (inscricao && inscricao.aulaId) {
            setInscricoesDependentes(prev => [...prev, inscricao])
          } else {
            // Recarregar inscrições se não recebeu resposta esperada
            await loadInscricoesDependentes()
          }
          
          showSuccess(`${dependente.nome} foi inscrito com sucesso!`)
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Erro ao realizar inscrição'
          showError(errorMessage)
        } finally {
          setActionLoading(null)
        }
      }
    })
  }

  const handleCancelar = (aula: AulaResponse, inscricao: InscricaoResponse) => {
    const dependente = dependentes.find(d => d.id === inscricao.alunoId)
    const nomeDependente = dependente?.nome || 'o aluno'

    setConfirmModal({
      isOpen: true,
      title: 'Cancelar Inscrição',
      message: `Deseja cancelar a inscrição de ${nomeDependente} na aula "${aula.titulo}"?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setActionLoading(aula.id)
          await inscricoesApi.cancelar(aula.id, inscricao.alunoId)
          
          // Remover inscrição do estado local e atualizar aulas inscritas
          const novasInscricoes = inscricoesDependentes.filter(i => i.id !== inscricao.id)
          setInscricoesDependentes(novasInscricoes)
          
          // Atualizar aulasInscritas removendo a aula se não tiver mais inscrições
          setAulasInscritas(prev => prev.filter(a => 
            novasInscricoes.some(i => i.aulaId === a.id)
          ))
          
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

  const closeSelectDependenteModal = () => {
    setSelectDependenteModal({ isOpen: false, aula: null })
  }

  const getDependentesDisponiveis = () => {
    if (!selectDependenteModal.aula) return []
    
    // Pegar IDs dos dependentes já inscritos nesta aula
    const dependentesInscritos = inscricoesDependentes
      .filter(i => i.aulaId === selectDependenteModal.aula?.id)
      .map(i => i.alunoId)
    
    // Retornar apenas dependentes não inscritos
    return dependentes.filter(d => !dependentesInscritos.includes(d.id))
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

  const getInscricoesPorAula = (aulaId: string) => {
    return inscricoesDependentes.filter(i => i.aulaId === aulaId && i.status === 'INSCRITO')
  }

  const getNomeDependente = (alunoId: string) => {
    return dependentes.find(d => d.id === alunoId)?.nome || 'Aluno'
  }

  const AulaCard: React.FC<{ aula: AulaResponse }> = ({ aula }) => {
    const isLoading = actionLoading === aula.id
    const inscricoes = getInscricoesPorAula(aula.id)

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
          {inscricoes.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" />
              <span>{inscricoes.length} dependente(s) inscrito(s)</span>
            </div>
          )}
        </div>

        {activeTab === 'disponiveis' ? (
          <div className="pt-4 border-t border-[var(--fh-border)]">
            <Button
              onClick={() => handleOpenSelectDependente(aula)}
              disabled={isLoading || dependentes.length === 0}
              variant="primary"
              className="w-full justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Inscrevendo...' : 'Inscrever Dependente'}
            </Button>
          </div>
        ) : (
          <div className="pt-4 border-t border-[var(--fh-border)] space-y-2">
            {inscricoes.map(inscricao => (
              <div key={inscricao.id} className="flex items-center justify-between p-3 bg-[var(--fh-gray-50)] rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--fh-primary)]" />
                  <span className="text-sm font-medium text-[var(--fh-text)]">
                    {getNomeDependente(inscricao.alunoId)}
                  </span>
                </div>
                <Button
                  onClick={() => handleCancelar(aula, inscricao)}
                  disabled={isLoading}
                  variant="secondary"
                  className="text-sm px-3 py-1 text-red-600 dark:text-red-400"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
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
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">Aulas dos Dependentes</h1>
            <p className="text-[var(--fh-muted)]">Gerencie as inscrições dos seus dependentes em aulas</p>
          </div>
        </div>

        {/* Dependentes Info */}
        {dependentes.length > 0 && (
          <div className="bg-[var(--fh-card)] rounded-xl p-4 shadow-sm border border-[var(--fh-border)]">
            <div className="flex items-center gap-2 text-sm text-[var(--fh-muted)]">
              <Users2 className="w-4 h-4" />
              <span>{dependentes.length} dependente(s): {dependentes.map(d => d.nome).join(', ')}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[var(--fh-border)]">
          <button
            onClick={() => setActiveTab('disponiveis')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'disponiveis'
                ? 'text-[var(--fh-primary)]'
                : 'text-[var(--fh-muted)] hover:text-[var(--fh-text)]'
            }`}
          >
            Aulas Disponíveis
            {activeTab === 'disponiveis' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--fh-primary)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('inscritas')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'inscritas'
                ? 'text-[var(--fh-primary)]'
                : 'text-[var(--fh-muted)] hover:text-[var(--fh-text)]'
            }`}
          >
            Inscrições
            {inscricoesDependentes.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--fh-primary)] text-white">
                {inscricoesDependentes.length}
              </span>
            )}
            {activeTab === 'inscritas' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--fh-primary)]" />
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--fh-primary)]" />
          </div>
        ) : dependentes.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[var(--fh-muted)] opacity-50" />
            <h3 className="text-xl font-semibold text-[var(--fh-text)] mb-2">
              Nenhum dependente vinculado
            </h3>
            <p className="text-[var(--fh-muted)]">
              Você precisa ter dependentes vinculados para gerenciar suas aulas
            </p>
          </div>
        ) : activeTab === 'disponiveis' ? (
          aulasDisponiveis.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-[var(--fh-muted)] opacity-50" />
              <h3 className="text-xl font-semibold text-[var(--fh-text)] mb-2">
                Nenhuma aula disponível
              </h3>
              <p className="text-[var(--fh-muted)]">
                Não há aulas disponíveis para inscrição no momento
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aulasDisponiveis.map(aula => (
                <AulaCard key={aula.id} aula={aula} />
              ))}
            </div>
          )
        ) : (
          aulasInscritas.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-[var(--fh-muted)] opacity-50" />
              <h3 className="text-xl font-semibold text-[var(--fh-text)] mb-2">
                Nenhuma inscrição
              </h3>
              <p className="text-[var(--fh-muted)] mb-4">
                Seus dependentes ainda não estão inscritos em nenhuma aula
              </p>
              <Button
                onClick={() => setActiveTab('disponiveis')}
                variant="primary"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Aulas Disponíveis
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aulasInscritas.map(aula => (
                <AulaCard key={aula.id} aula={aula} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal de Seleção de Dependente */}
      {selectDependenteModal.isOpen && selectDependenteModal.aula && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--fh-card)] rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[var(--fh-text)] mb-4">
              Selecione o Dependente
            </h3>
            <p className="text-[var(--fh-muted)] mb-6">
              Escolha qual dependente deseja inscrever na aula "{selectDependenteModal.aula.titulo}"
            </p>
            
            <div className="space-y-2 mb-6">
              {getDependentesDisponiveis().length > 0 ? (
                getDependentesDisponiveis().map(dependente => (
                  <button
                    key={dependente.id}
                    onClick={() => handleInscreverDependente(dependente.id)}
                    className="w-full p-4 text-left rounded-lg border border-[var(--fh-border)] hover:border-[var(--fh-primary)] hover:bg-[var(--fh-gray-50)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--fh-text)]">{dependente.nome}</p>
                        <p className="text-sm text-[var(--fh-muted)]">{dependente.email}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-[var(--fh-muted)]">Todos os seus dependentes já estão inscritos nesta aula.</p>
                </div>
              )}
            </div>

            <Button
              onClick={closeSelectDependenteModal}
              variant="secondary"
              className="w-full justify-center"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
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
    </Layout>
  )
}

export default AulasDependentes
