import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Search, X } from 'lucide-react'
import { responsaveisApi } from '../../api/responsaveis'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { PageResponse } from '../../types'
import type { ResponsavelResponse } from '../../api/responsaveis'

const formatCPF = (cpf: string | undefined) => {
  if (!cpf) return '—'
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export default function ResponsaveisList() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showError } = useToast()
  const [responsaveis, setResponsaveis] = useState<PageResponse<ResponsavelResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const loadResponsaveis = async (page: number) => {
    setLoading(true)
    try {
      const data = await responsaveisApi.listar(page, 10)
      setResponsaveis(data)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Erro ao carregar responsáveis'
      showError(errorMessage)
      setResponsaveis(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResponsaveis(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const handleRowClick = (responsavel: ResponsavelResponse) => {
    navigate(`/responsaveis/${responsavel.id}`)
  }

  // Filtrar responsáveis localmente
  const filteredResponsaveis = React.useMemo(() => {
    if (!responsaveis?.content) return []
    
    return responsaveis.content.filter((responsavel) => {
      const matchesSearch = searchTerm === '' || 
        responsavel.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        responsavel.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        responsavel.cpf?.includes(searchTerm)

      return matchesSearch
    })
  }, [responsaveis, searchTerm])

  const handleClearFilters = () => {
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm !== ''

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      render: (item: ResponsavelResponse) => (
        <div className="flex items-center gap-2">
          <span>{item.nome}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (item: ResponsavelResponse) => (
        <span className="text-sm text-[var(--fh-text)]">{item.email}</span>
      ),
    },
    {
      key: 'cpf',
      label: 'CPF',
      render: (item: ResponsavelResponse) => (
        <span className="text-sm text-[var(--fh-muted)]">{formatCPF(item.cpf)}</span>
      ),
    },
    {
      key: 'telefone',
      label: 'Telefone',
      render: (item: ResponsavelResponse) => (
        <span className="text-sm">{item.telefone || '—'}</span>
      ),
    },
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
                Responsáveis
              </h1>
              <p className="text-[var(--fh-muted)] mt-1">
                Gerenciamento de responsáveis da academia
              </p>
            </div>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'COORDENADOR') && (
            <button
              onClick={() => navigate('/responsaveis/novo')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white rounded-xl font-semibold hover:shadow-lg hover:opacity-90 transition-all shadow-md"
            >
              <Plus size={20} />
              Novo Responsável
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
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
              />
            </div>
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
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredResponsaveis}
          loading={loading}
          emptyMessage={
            hasActiveFilters 
              ? "Nenhum responsável encontrado com os filtros aplicados" 
              : "Nenhum responsável cadastrado"
          }
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        {responsaveis && responsaveis.totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={responsaveis.totalPages}
            totalElements={responsaveis.totalElements}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </Layout>
  )
}
