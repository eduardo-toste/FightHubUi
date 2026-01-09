import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Search, Filter } from 'lucide-react'
import { alunosApi } from '../../api/alunos'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import type { AlunoResponse, PageResponse } from '../../types'

export default function AlunosList() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [alunos, setAlunos] = useState<PageResponse<AlunoResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const loadAlunos = async (page: number) => {
    setLoading(true)
    try {
      const data = await alunosApi.listar(page, 10)
      setAlunos(data)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlunos(currentPage)
  }, [currentPage])

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
      label: 'Nome'
    },
    {
      key: 'email',
      label: 'Email'
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          aluno.matriculaAtiva 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {aluno.matriculaAtiva ? 'Ativa' : 'Inativa'}
        </span>
      )
    }
  ]

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--fh-text)]">Alunos</h1>
              <p className="text-sm text-[var(--fh-muted)]">Gerenciamento de alunos da academia</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/alunos/novo')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Novo Aluno
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[var(--fh-card)] rounded-lg border border-[var(--fh-border)] p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fh-muted)]" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[var(--fh-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)] focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-[var(--fh-border)] rounded-lg hover:bg-[var(--fh-bg)] transition-colors">
              <Filter size={20} />
              Filtros
            </button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={alunos?.content || []}
          loading={loading}
          emptyMessage="Nenhum aluno cadastrado"
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
