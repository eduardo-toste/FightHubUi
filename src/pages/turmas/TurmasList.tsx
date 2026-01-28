import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users2, Users, Plus, Search, Filter, X } from 'lucide-react'
import { turmasApi } from '../../api/turmas'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { TurmaResponse } from '../../api/turmas'

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export default function TurmasList() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showError } = useToast()
  const [turmas, setTurmas] = useState<PageResponse<TurmaResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const loadTurmas = async (page: number) => {
    setLoading(true)
    try {
      const data = await turmasApi.listar(page, 10)
      setTurmas(data)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Erro ao carregar turmas'
      showError(errorMessage)
      setTurmas(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTurmas(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // Filtrar turmas localmente
  const filteredTurmas = React.useMemo(() => {
    if (!turmas?.content) return []
    
    return turmas.content.filter((turma) => {
      // Filtro de busca
      const matchesSearch = searchTerm === '' || 
        turma.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turma.horario?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de status
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && turma.ativo) ||
        (statusFilter === 'inactive' && !turma.ativo)

      return matchesSearch && matchesStatus
    })
  }, [turmas, searchTerm, statusFilter])

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all'

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowClick = (turma: TurmaResponse) => {
    navigate(`/turmas/${turma.id}`)
  }

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      render: (turma: TurmaResponse) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{turma.nome}</span>
        </div>
      )
    },
    {
      key: 'horario',
      label: 'Horário',
      render: (turma: TurmaResponse) => turma.horario || '-'
    },
    {
      key: 'professor',
      label: 'Professor',
      render: (turma: TurmaResponse) => (
        turma.professorNome ? (
          <span className="text-[var(--fh-text)]">{turma.professorNome}</span>
        ) : (
          <span className="text-[var(--fh-muted)]">Sem professor</span>
        )
      )
    },
    {
      key: 'alunos',
      label: 'Alunos',
      render: (turma: TurmaResponse) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[var(--fh-primary)]" />
          <span className="font-semibold text-[var(--fh-text)]">
            {turma.quantidadeAlunos ?? 0}
          </span>
        </div>
      )
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (turma: TurmaResponse) => (
        turma.ativo ? (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50">
            Ativa
          </span>
        ) : (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50">
            Inativa
          </span>
        )
      )
    }
  ]

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">
                Turmas
              </h1>
              <p className="text-[var(--fh-muted)] mt-1">
                Gerenciamento de turmas da academia
              </p>
            </div>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'COORDENADOR') && (
            <button
              onClick={() => navigate('/turmas/novo')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white rounded-xl font-semibold hover:shadow-lg hover:opacity-90 transition-all shadow-md"
            >
              <Plus size={20} />
              Nova Turma
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
                placeholder="Buscar por nome ou horário..."
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
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-[var(--fh-muted)] hover:text-[var(--fh-text)] hover:bg-[var(--fh-gray-50)] rounded-xl transition-colors"
              >
                <X size={20} />
                Limpar
              </button>
            )}
          </div>

          {/* Filtros Avançados */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--fh-border)]">
              <div>
                <label className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                  Status da Turma
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
                >
                  <option value="all">Todas</option>
                  <option value="active">Ativa</option>
                  <option value="inactive">Inativa</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredTurmas}
          loading={loading}
          emptyMessage={
            hasActiveFilters 
              ? "Nenhuma turma encontrada com os filtros aplicados" 
              : "Nenhuma turma cadastrada"
          }
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        {turmas && turmas.totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={turmas.totalPages}
            totalElements={turmas.totalElements}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </Layout>
  )
}
