import React, { useState, useEffect } from 'react'
import {
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
  Users
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import useAuth from '../hooks/useAuth'
import { alunosApi } from '../api/alunos'
import Layout from '../components/Layout'
import Input from '../components/Input'

interface AlunoItem {
  id: string
  nome: string
  email: string
  matriculaAtiva: boolean
  dataNascimento?: string
  dataMatricula?: string
}

const EstatisticasAlunos: React.FC = () => {
  const navigate = useNavigate()
  const { showError } = useToast()
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [alunos, setAlunos] = useState<AlunoItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    // Verificar permissões
    if (!user || !['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user.role)) {
      showError('Acesso negado')
      navigate('/home')
      return
    }
    loadAlunos()
  }, [page, user, navigate, showError])

  const loadAlunos = async () => {
    try {
      setLoading(true)
      const data = await alunosApi.listar(page, 20)
      const alunosList = data.content || data
      setAlunos(
        (alunosList || [])
          .filter((aluno: any) => aluno.matriculaAtiva === true)
          .map((aluno: any) => ({
            id: aluno.id,
            nome: aluno.nome,
            email: aluno.email || '',
            matriculaAtiva: aluno.matriculaAtiva,
            dataNascimento: aluno.dataNascimento,
            dataMatricula: aluno.dataMatricula
          }))
      )
      if (data.totalPages !== undefined) {
        setTotalPages(data.totalPages)
      } else {
        setTotalPages(1)
      }
    } catch (error: any) {
      console.error('Erro ao carregar alunos:', error)
      showError('Erro ao carregar lista de alunos')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    if (value.trim()) {
      try {
        setSearching(true)
        const data = await alunosApi.listar(0, 100)
        const alunosList = data.content || data
        const filtered = (alunosList || []).filter(
          (aluno: any) =>
            aluno.matriculaAtiva === true &&
            (aluno.nome.toLowerCase().includes(value.toLowerCase()) ||
              (aluno.email && aluno.email.toLowerCase().includes(value.toLowerCase())))
        )
        setAlunos(
          filtered.map((aluno: any) => ({
            id: aluno.id,
            nome: aluno.nome,
            email: aluno.email || '',
            matriculaAtiva: aluno.matriculaAtiva,
            dataNascimento: aluno.dataNascimento,
            dataMatricula: aluno.dataMatricula
          }))
        )
      } catch (error: any) {
        console.error('Erro ao buscar alunos:', error)
        showError('Erro ao buscar alunos')
      } finally {
        setSearching(false)
      }
    } else {
      setPage(0)
      loadAlunos()
    }
  }

  if (loading && !searching) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-[var(--fh-primary)] mb-4" />
            <p className="text-[var(--fh-muted)]">Carregando alunos...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">Desempenho dos Alunos</h1>
            <p className="text-[var(--fh-muted)] mt-1">Visualize estatísticas e desempenho de cada aluno</p>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fh-muted)]" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] placeholder:text-[var(--fh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 focus:border-[var(--fh-primary)] transition-all"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fh-muted)] animate-spin" />
            )}
          </div>
        </div>

        {/* Lista de Alunos */}
        {alunos.length > 0 ? (
          <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--fh-gray-50)] border-b border-[var(--fh-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--fh-text)]">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--fh-text)]">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--fh-text)]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--fh-text)]">
                      Matrícula
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno) => (
                    <tr
                      key={aluno.id}
                      onClick={() => navigate(`/estatisticas-alunos/${aluno.id}`)}
                      className="border-b border-[var(--fh-border)] hover:bg-[var(--fh-gray-50)] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-[var(--fh-text)]">
                        {aluno.nome}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--fh-muted)]">
                        {aluno.email || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {aluno.matriculaAtiva ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                            ✓ Ativa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-semibold">
                            ✗ Inativa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--fh-muted)]">
                        {aluno.dataMatricula
                          ? new Date(aluno.dataMatricula).toLocaleDateString(
                              'pt-BR'
                            )
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum aluno encontrado com estes critérios' : 'Nenhum aluno disponível'}
            </p>
          </div>
        )}

        {/* Paginação */}
        {!searchTerm && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-gray-600">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default EstatisticasAlunos
