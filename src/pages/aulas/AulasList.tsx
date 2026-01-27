import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus, Search, Filter, X } from 'lucide-react'
import { aulasApi, AulaResponse } from '../../api/aulas'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function AulasList() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showError } = useToast()
  const [aulas, setAulas] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const loadAulas = async (page: number) => {
    try {
      setLoading(true)
      const data = await aulasApi.listar(page, 10)
      setAulas(data)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Erro ao carregar aulas'
      showError(errorMessage)
      setAulas(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAulas(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // Filtrar aulas localmente
  const filteredAulas = React.useMemo(() => {
    if (!aulas?.content) return []
    
    return aulas.content.filter((aula: AulaResponse) => {
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleRowClick = (aula: AulaResponse) => {
    navigate(`/aulas/${aula.id}`)
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

  const columns = [
    {
      key: 'titulo',
      label: 'Título',
      render: (aula: AulaResponse) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{aula.titulo}</span>
        </div>
      )
    },
    {
      key: 'data',
      label: 'Data e Hora',
      render: (aula: AulaResponse) => formatDate(aula.data)
    },
    {
      key: 'limiteAlunos',
      label: 'Limite',
      render: (aula: AulaResponse) => (
        <span className="font-semibold">{aula.limiteAlunos} alunos</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (aula: AulaResponse) => getStatusBadge(aula.status)
    },
    {
      key: 'ativo',
      label: 'Situação',
      render: (aula: AulaResponse) => (
        aula.ativo ? (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50">
            Ativa
          </span>
        ) : (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50">
            Inativa
          </span>
        )
      )
    },
  ]

  const canCreateAula = user?.role && ['ADMIN', 'PROFESSOR'].includes(user.role)

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">
                Aulas
              </h1>
              <p className="text-[var(--fh-muted)] mt-1">
                Gerencie as aulas da academia
              </p>
            </div>
          </div>
          {canCreateAula && (
            <button
              onClick={() => navigate('/aulas/novo')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white rounded-xl font-semibold hover:shadow-lg hover:opacity-90 transition-all shadow-md"
            >
              <Plus size={20} />
              Nova Aula
            </button>
          )}
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
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

              {(statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setStatusFilter('all')
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

        {/* Table */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] overflow-hidden">
          <Table
            columns={columns}
            data={filteredAulas}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="Nenhuma aula encontrada"
          />
        </div>

        {/* Pagination */}
        {aulas && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={aulas.totalPages || 0}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </Layout>
  )
}
