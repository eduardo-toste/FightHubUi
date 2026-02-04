import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Users2,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  X
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import useAuth from '../hooks/useAuth'
import { aulasApi, AulaResponse } from '../api/aulas'
import inscricoesApi from '../api/inscricoes'
import { Button } from '../components/Button'
import Layout from '../components/Layout'

const AulasProfessor: React.FC = () => {
  const { user, logout } = useAuth()
  const { showError } = useToast()
  const navigate = useNavigate()

  const [aulas, setAulas] = useState<AulaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [inscritos, setInscritos] = useState<Record<string, number>>({})
  const pageSize = 12

  useEffect(() => {
    loadAulasProfessor()
  }, [page])

  const loadAulasProfessor = async () => {
    try {
      setLoading(true)
      const data = await aulasApi.listarAulasProfessor(page, pageSize)
      const aulasList = data.content || data
      setAulas(Array.isArray(aulasList) ? aulasList : [])
      
      // Definir total de páginas se houver paginação
      if (data.totalPages) {
        setTotalPages(data.totalPages)
      } else if (Array.isArray(aulasList)) {
        setTotalPages(1)
      }

      // Carregar contagem de inscritos para cada aula
      if (Array.isArray(aulasList)) {
        const contadores: Record<string, number> = {}
        await Promise.all(
          aulasList.map(async (aula) => {
            try {
              const inscricoesData = await inscricoesApi.buscarPorAula(aula.id, 0, 100)
              const inscricoesList = inscricoesData.content || inscricoesData
              const ativos = (inscricoesList || []).filter((i: any) => i.status === 'INSCRITO').length
              contadores[aula.id] = ativos
            } catch (err) {
              contadores[aula.id] = 0
            }
          })
        )
        setInscritos(contadores)
      }
    } catch (error: any) {
      console.error('Erro ao carregar aulas do professor:', error)
      showError('Erro ao carregar suas aulas')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar aulas localmente
  const filteredAulas = React.useMemo(() => {
    return aulas.filter((aula) => {
      const matchesSearch = 
        (aula.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (aula.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ativas' && aula.ativo) ||
        (statusFilter === 'inativas' && !aula.ativo)

      return matchesSearch && matchesStatus
    })
  }, [aulas, searchTerm, statusFilter])

  const handleAulaClick = (aulaId: string) => {
    navigate(`/aulas/${aulaId}`)
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

  const formatDateShort = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
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

  const AulaCard: React.FC<{ aula: AulaResponse }> = ({ aula }) => {
    return (
      <div 
        onClick={() => handleAulaClick(aula.id)}
        className="group bg-[var(--fh-card)] rounded-2xl shadow-sm border border-[var(--fh-border)] hover:border-[var(--fh-primary)]/50 hover:shadow-xl overflow-hidden transition-all cursor-pointer flex flex-col h-full"
      >
        {/* Header com gradiente */}
        <div className="h-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)]" />
        
        <div className="p-5 flex flex-col flex-1 space-y-4">
          {/* Ícone e Título */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)]/15 to-[var(--fh-primary-dark)]/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-[var(--fh-primary)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--fh-text)] line-clamp-2 group-hover:text-[var(--fh-primary)] transition-colors">
              {aula.titulo}
            </h3>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(aula.status)}
            {aula.ativo ? (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Ativa
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                Inativa
              </span>
            )}
          </div>

          {/* Descrição */}
          {aula.descricao && (
            <p className="text-xs text-[var(--fh-muted)] line-clamp-2">
              {aula.descricao}
            </p>
          )}

          {/* Divisor */}
          <div className="border-t border-[var(--fh-border)]" />

          {/* Informações */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--fh-primary)]" />
              <div>
                <p className="text-xs text-[var(--fh-muted)]">Data e Hora</p>
                <p className="text-sm font-semibold text-[var(--fh-text)]">
                  {formatDateShort(aula.data)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-[var(--fh-primary)]" />
                <div>
                  <p className="text-xs text-[var(--fh-muted)]">Limite</p>
                  <p className="text-sm font-semibold text-[var(--fh-text)]">
                    {aula.limiteAlunos} alunos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-[var(--fh-primary)]" />
                <div>
                  <p className="text-xs text-[var(--fh-muted)]">Inscritos</p>
                  <p className="text-sm font-semibold text-[var(--fh-text)]">
                    {inscritos[aula.id] ?? 0} alunos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão (sempre no final) */}
          <div className="pt-3 mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAulaClick(aula.id)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white rounded-lg font-semibold text-sm hover:shadow-md transition-all group-hover:opacity-90"
            >
              <Eye className="w-4 h-4" />
              Gerenciar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">Minhas Aulas</h1>
              <p className="text-[var(--fh-muted)] mt-1">Gerencie as aulas que você leciona</p>
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
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-text)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
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
          </div>

          {showFilters && (
            <div className="pt-4 border-t border-[var(--fh-border)] space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                  Situação
                </label>
                <div className="flex gap-2">
                  {['all', 'ativas', 'inativas'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-[var(--fh-primary)] text-white'
                          : 'bg-[var(--fh-gray-100)] text-[var(--fh-text)] hover:bg-[var(--fh-gray-200)]'
                      }`}
                    >
                      {status === 'all' && 'Todas'}
                      {status === 'ativas' && 'Ativas'}
                      {status === 'inativas' && 'Inativas'}
                    </button>
                  ))}
                </div>
              </div>

              {(statusFilter !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setSearchTerm('')
                  }}
                  className="flex items-center gap-2 text-sm text-[var(--fh-muted)] hover:text-[var(--fh-primary)] transition-colors"
                >
                  <X size={16} />
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-[var(--fh-primary)]" />
              <p className="text-[var(--fh-muted)]">Carregando aulas...</p>
            </div>
          </div>
        ) : filteredAulas.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAulas.map((aula) => (
                <AulaCard key={aula.id} aula={aula} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 px-4">
                <div className="text-sm text-[var(--fh-muted)]">
                  Página {page + 1} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    variant="secondary"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    variant="secondary"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-[var(--fh-text)] mb-2">
              Nenhuma aula encontrada
            </h2>
            <p className="text-[var(--fh-muted)] mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhuma aula corresponde aos filtros selecionados.'
                : 'Você ainda não tem aulas. Solicite ao administrador para vincular aulas a você.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AulasProfessor
