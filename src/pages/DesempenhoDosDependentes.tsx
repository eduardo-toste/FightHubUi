import React, { useState, useEffect } from 'react'
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import useAuth from '../hooks/useAuth'
import { alunosApi } from '../api/alunos'
import { responsaveisApi, AlunoResponsavelResponse } from '../api/responsaveis'
import inscricoesApi from '../api/inscricoes'
import presencasApi, { PresencaResponse } from '../api/presencas'
import Layout from '../components/Layout'
import { StatCard } from '../components/StatCard'

interface AlunoWithStats {
  id: string
  nome: string
  email: string
  matriculaAtiva: boolean
  dataMatricula: string
  dataNascimento: string
  faixa?: string
}

interface InscricaoComAula {
  id: string
  aulaId: string
  aulaTitulo: string
  aulaDescricao: string
  aulaData: string
  turmaNome: string
  limiteAlunos: number
  status: 'INSCRITO' | 'CANCELADO' | 'DESMARCADO'
  inscritoEm: string
}

const DesempenhoDosDependentes: React.FC = () => {
  const { showError } = useToast()
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [dependentes, setDependentes] = useState<AlunoResponsavelResponse[]>([])
  const [dependenteSelecionado, setDependenteSelecionado] = useState<AlunoWithStats | null>(null)
  const [inscricoes, setInscricoes] = useState<InscricaoComAula[]>([])
  const [presencas, setPresencas] = useState<PresencaResponse[]>([])
  const [stats, setStats] = useState({
    totalInscricoes: 0,
    totalPresencas: 0,
    totalFaltas: 0,
    taxaPresenca: 0
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loadingDependente, setLoadingDependente] = useState(false)

  useEffect(() => {
    loadDependentes()
  }, [])

  const loadDependentes = async () => {
    try {
      setLoading(true)
      const dependentes = await responsaveisApi.obterMeusDependentes()
      setDependentes(dependentes)
      
      if (dependentes.length > 0) {
        // Selecionar o primeiro dependente automaticamente
        await loadDependente(dependentes[0].id)
      }
    } catch (error: any) {
      console.error('Erro ao carregar dependentes:', error)
      showError('Erro ao carregar seus dependentes')
    } finally {
      setLoading(false)
    }
  }

  const loadDependente = async (alunoId: string) => {
    try {
      setLoadingDependente(true)
      setIsDropdownOpen(false)

      // Carregar dados do aluno
      const alunoData = await alunosApi.buscarPorId(alunoId)
      setDependenteSelecionado({
        id: alunoData.id,
        nome: alunoData.nome,
        email: alunoData.email || 'N/A',
        matriculaAtiva: alunoData.matriculaAtiva,
        dataMatricula: alunoData.dataMatricula,
        dataNascimento: alunoData.dataNascimento,
        faixa: alunoData.graduacaoAluno?.belt
      })

      // Carregar inscrições
      const inscricoesData = await inscricoesApi.buscarPorAluno(alunoId, 0, 1000)
      const inscricoesList = inscricoesData.content || inscricoesData || []
      setInscricoes(inscricoesList)

      // Carregar presenças
      const presencasData = await presencasApi.listarPorAluno(alunoId, 0, 1000)
      const presencasList = presencasData.content || presencasData || []
      setPresencas(presencasList)

      // Calcular estatísticas
      const totalInscricoes = inscricoesList.length
      const totalPresencas = presencasList.filter((p: any) => p.presente).length
      const totalFaltas = presencasList.filter((p: any) => !p.presente).length
      const taxaPresenca = totalPresencas + totalFaltas > 0 
        ? Math.round((totalPresencas / (totalPresencas + totalFaltas)) * 100)
        : 0

      setStats({
        totalInscricoes,
        totalPresencas,
        totalFaltas,
        taxaPresenca
      })
    } catch (error: any) {
      console.error('Erro ao carregar desempenho do dependente:', error)
      showError('Erro ao carregar dados do dependente')
      setDependenteSelecionado(null)
    } finally {
      setLoadingDependente(false)
    }
  }

  if (loading) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-[var(--fh-primary)] mb-4" />
            <p className="text-[var(--fh-muted)]">Carregando dependentes...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (dependentes.length === 0) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-yellow-600 dark:text-yellow-400 mb-4" />
            <p className="text-[var(--fh-muted)]">Você não possui dependentes vinculados</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Seletor de Dependente */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
          <h2 className="text-lg font-bold text-[var(--fh-text)] mb-4">Selecione um dependente</h2>
          
          <div className="relative w-full md:w-96">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--fh-border)] bg-[var(--fh-gray-50)] text-[var(--fh-body)] hover:border-[var(--fh-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--fh-primary)]/20 flex items-center justify-between transition-all"
            >
              <span className="font-medium">
                {dependenteSelecionado?.nome || 'Selecione um dependente'}
              </span>
              <ChevronDown 
                size={20} 
                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-full bg-[var(--fh-card)] border border-[var(--fh-border)] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {dependentes.map((dependente) => (
                  <button
                    key={dependente.id}
                    onClick={() => loadDependente(dependente.id)}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--fh-border)] transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <p className="font-medium text-[var(--fh-text)]">{dependente.nome}</p>
                    <p className="text-sm text-[var(--fh-muted)]">{dependente.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loadingDependente ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-[var(--fh-primary)] mb-4" />
              <p className="text-[var(--fh-muted)]">Carregando dados...</p>
            </div>
          </div>
        ) : dependenteSelecionado ? (
          <>
            {/* Cabeçalho com informações do dependente */}
            <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--fh-text)] mb-2">{dependenteSelecionado.nome}</h1>
                  <p className="text-[var(--fh-muted)]">{dependenteSelecionado.email}</p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <span className="text-[var(--fh-muted)]">
                      <strong className="text-[var(--fh-text)]">Matrícula:</strong> {dependenteSelecionado.dataMatricula ? new Date(dependenteSelecionado.dataMatricula).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                    <span className={`font-semibold ${dependenteSelecionado.matriculaAtiva ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {dependenteSelecionado.matriculaAtiva ? '✓ Ativa' : '✗ Inativa'}
                    </span>
                  </div>
                </div>
                {dependenteSelecionado.faixa && (
                  <div className="text-center">
                    <p className="text-sm text-[var(--fh-muted)] mb-2">Faixa Atual</p>
                    <div className="px-4 py-2 bg-[var(--fh-primary)]/10 text-[var(--fh-primary)] rounded-lg font-semibold">
                      {dependenteSelecionado.faixa}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas Gerais */}
            <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6 space-y-6">
              <h2 className="text-xl font-bold text-[var(--fh-text)]">Estatísticas Gerais</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="Inscrições Ativas"
                  value={stats.totalInscricoes}
                  color="blue"
                  subtitle="Aulas"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Presenças"
                  value={stats.totalPresencas}
                  color="green"
                  subtitle="Total de presenças"
                />
                <StatCard
                  icon={XCircle}
                  label="Faltas"
                  value={stats.totalFaltas}
                  color="red"
                  subtitle="Total de faltas"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Taxa de Presença"
                  value={`${stats.taxaPresenca}%`}
                  color="purple"
                  subtitle="Média de presença"
                />
              </div>
            </div>

            {/* Inscrições */}
            <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6 space-y-6">
              <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--fh-primary)]" />
                Inscrições Ativas ({inscricoes.length})
              </h2>

              {inscricoes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {inscricoes.map((inscricao) => (
                    <div
                      key={inscricao.id}
                      className="bg-[var(--fh-card)] border-2 border-[var(--fh-border)] rounded-lg p-2 shadow-lg hover:shadow-xl hover:border-[var(--fh-primary)] transition-all"
                    >
                      <h3 className="font-semibold text-[var(--fh-text)] mb-1 line-clamp-2">
                        {inscricao.aulaTitulo}
                      </h3>
                      
                      <div className="space-y-0.5 text-sm">
                        <p className="text-[var(--fh-muted)]">
                          <span className="font-medium text-[var(--fh-text)]">Turma:</span> {inscricao.turmaNome}
                        </p>
                        <p className="text-[var(--fh-muted)]">
                          <span className="font-medium text-[var(--fh-text)]">Data:</span>{' '}
                          {new Date(inscricao.aulaData).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-[var(--fh-muted)]">
                          <span className="font-medium text-[var(--fh-text)]">Limite:</span> {inscricao.limiteAlunos} alunos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--fh-muted)]">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma inscrição ativa</p>
                </div>
              )}
            </div>

            {/* Histórico de Presenças */}
            <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6 space-y-6">
              <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--fh-primary)]" />
                Histórico de Presenças ({presencas.length})
              </h2>

              {presencas.length > 0 ? (
                <div className="bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--fh-gray-50)] border-b border-[var(--fh-border)]">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--fh-text)]">
                            Aula
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--fh-text)]">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--fh-text)]">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {presencas.map((presenca) => (
                          <tr
                            key={presenca.id}
                            className="border-b border-[var(--fh-border)] hover:bg-[var(--fh-gray-50)]"
                          >
                            <td className="px-6 py-4 text-sm text-[var(--fh-text)]">
                              {presenca.aulaTitulo}
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--fh-muted)]">
                              {new Date(presenca.dataRegistro).toLocaleDateString(
                                'pt-BR'
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {presenca.presente ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold">
                                  <CheckCircle2 size={16} /> Presente
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 font-semibold">
                                  <XCircle size={16} /> Ausente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--fh-muted)]">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum histórico de presenças</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  )
}

export default DesempenhoDosDependentes
