import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Search, Filter, X } from 'lucide-react'
import { alunosApi } from '../../api/alunos'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { AlunoResponse, PageResponse } from '../../types'

export default function AlunosList() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showError } = useToast()
  const [alunos, setAlunos] = useState<PageResponse<AlunoResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [graduacaoFilter, setGraduacaoFilter] = useState('')

  const loadAlunos = async (page: number) => {
    setLoading(true)
    try {
      const data = await alunosApi.listar(page, 10)
      setAlunos(data)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Erro ao carregar alunos'
      showError(errorMessage)
      setAlunos(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlunos(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // Filtrar alunos localmente
  const filteredAlunos = React.useMemo(() => {
    if (!alunos?.content) return []
    
    return alunos.content.filter((aluno) => {
      // Filtro de busca
      const matchesSearch = searchTerm === '' || 
        aluno.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.email?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de status
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && aluno.matriculaAtiva) ||
        (statusFilter === 'inactive' && !aluno.matriculaAtiva)

      // Filtro de graduação
      const matchesGraduacao = graduacaoFilter === '' ||
        aluno.graduacaoAluno?.belt?.toLowerCase().includes(graduacaoFilter.toLowerCase())

      return matchesSearch && matchesStatus && matchesGraduacao
    })
  }, [alunos, searchTerm, statusFilter, graduacaoFilter])

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setGraduacaoFilter('')
  }

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || graduacaoFilter !== ''

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowClick = (aluno: AlunoResponse) => {
    navigate(`/alunos/${aluno.id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      render: (aluno: AlunoResponse) => (
        <div className="flex items-center gap-2">
          <span>{aluno.nome}</span>
          {(!aluno.telefone || !aluno.dataMatricula) && (
            <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" title="Cadastro incompleto">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (aluno: AlunoResponse) => aluno.email
    },
    {
      key: 'graduacao',
      label: 'Graduação',
      render: (aluno: AlunoResponse) => {
        if (!aluno.graduacaoAluno) return '-'
        const faixa = aluno.graduacaoAluno.belt || '-'
        const grau = aluno.graduacaoAluno.level || ''
        return (
          <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-300/50 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-400 dark:border-blue-500/50 whitespace-nowrap">
            {faixa} {grau && `(${grau})`}
          </span>
        )
      }
    },
    {
      key: 'telefone',
      label: 'Telefone',
      render: (aluno: AlunoResponse) => aluno.telefone || '-'
    },
    {
      key: 'dataMatricula',
      label: 'Data Matrícula',
      render: (aluno: AlunoResponse) => formatDate(aluno.dataMatricula)
    },
    {
      key: 'matriculaAtiva',
      label: 'Status',
      render: (aluno: AlunoResponse) => (
        aluno.matriculaAtiva ? (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-300/50 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-400 dark:border-green-500/50">
            Ativo
          </span>
        ) : (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-300/50 dark:from-gray-500/20 dark:to-slate-500/20 dark:text-gray-400 dark:border-gray-500/50">
            Inativo
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
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)]">
                Alunos
              </h1>
              <p className="text-[var(--fh-muted)] mt-1">
                Gerenciamento de alunos da academia
              </p>
            </div>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'COORDENADOR') && (
            <button
              onClick={() => navigate('/alunos/novo')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white rounded-xl font-semibold hover:shadow-lg hover:opacity-90 transition-all shadow-md"
            >
              <Plus size={20} />
              Novo Aluno
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
                placeholder="Buscar por nome ou email..."
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
                  Status da Matrícula
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

              <div>
                <label className="block text-sm font-medium text-[var(--fh-text)] mb-2">
                  Graduação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Branca, Azul..."
                  value={graduacaoFilter}
                  onChange={(e) => setGraduacaoFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredAlunos}
          loading={loading}
          emptyMessage={
            hasActiveFilters 
              ? "Nenhum aluno encontrado com os filtros aplicados" 
              : "Nenhum aluno cadastrado"
          }
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        {alunos && alunos.totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={alunos.totalPages}
            totalElements={alunos.totalElements}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </Layout>
  )
}
