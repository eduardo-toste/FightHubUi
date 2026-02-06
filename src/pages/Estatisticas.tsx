import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Loader2,
  Calendar,
  BarChart3,
  UserCheck,
  CheckCircle
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import useAuth from '../hooks/useAuth'
import dashboardApi, { DashboardResponse } from '../api/dashboard'
import Layout from '../components/Layout'
import { StatCard } from '../components/StatCard'
import { SimpleBarChart, ProgressBar } from '../components/Charts'

const Estatisticas: React.FC = () => {
  const { user, logout } = useAuth()
  const { showError } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar permissões
    if (!user || !['ADMIN', 'COORDENADOR'].includes(user.role)) {
      showError('Acesso negado. Esta página requer permissão de ADMIN ou COORDENADOR.')
      navigate('/home')
      return
    }
    loadDashboard()
  }, [user, navigate, showError])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardApi.buscarDashboard()
      setDashboard(data)
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
      const errorMsg = error.response?.status === 500 
        ? 'O servidor encontrou um erro ao processar as estatísticas. Verifique se o banco de dados está configurado corretamente e possui dados suficientes.'
        : 'Erro ao carregar dados de estatísticas. Tente novamente mais tarde.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-[var(--fh-primary)] mb-4" />
            <p className="text-[var(--fh-muted)]">Carregando estatísticas...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !dashboard) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-2xl">
            <AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erro ao Carregar Estatísticas</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Não foi possível carregar os dados de estatísticas.'}
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Possíveis Causas:</h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                <li>Banco de dados não está conectado ou sem dados</li>
                <li>Erro nas queries SQL do DashboardService</li>
                <li>Permissões insuficientes no banco de dados</li>
              </ul>
            </div>
            <button
              onClick={loadDashboard}
              className="px-6 py-3 bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const { dadosAlunos, dadosTurmas, dadosEngajamento } = dashboard

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--fh-primary)] to-[var(--fh-primary-dark)] flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--fh-text)]">Estatísticas</h1>
            <p className="text-[var(--fh-muted)] mt-1">Visualize métricas e indicadores da academia</p>
          </div>
        </div>

        {/* Seção Alunos */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6 space-y-6">
          <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--fh-primary)]" />
            Alunos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Alunos Ativos"
              value={dadosAlunos.totalAlunosAtivos}
              color="green"
              subtitle="Matrículas ativas"
            />
            <StatCard
              icon={AlertCircle}
              label="Alunos Inativos"
              value={dadosAlunos.totalAlunosInativos}
              color="orange"
              subtitle="Sem atividade"
            />
            <StatCard
              icon={TrendingUp}
              label="Novos (últimos 30 dias)"
              value={dadosAlunos.novosAlunosUltimos30Dias}
              color="purple"
              subtitle="Novas matrículas"
            />
            <StatCard
              icon={Calendar}
              label="Idade Média"
              value={`${dadosAlunos.idadeMediaAlunos} anos`}
              color="indigo"
              subtitle="Dos alunos ativos"
            />
          </div>
        </div>

        {/* Seção Turmas */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6 space-y-6">
          <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--fh-primary)]" />
            Turmas e Aulas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={BookOpen}
              label="Turmas Ativas"
              value={dadosTurmas.totalTurmasAtivas}
              color="blue"
              subtitle="Turmas em operação"
            />
            <StatCard
              icon={AlertCircle}
              label="Turmas Inativas"
              value={dadosTurmas.totalTurmasInativas}
              color="red"
              subtitle="Pausadas/encerradas"
            />
            <StatCard
              icon={BarChart3}
              label="Ocupação Média"
              value={`${Math.round(dadosTurmas.ocupacaoMediaTurmas * 100)}%`}
              color="green"
              subtitle="Das turmas"
            />
            <StatCard
              icon={BarChart3}
              label="Aulas Lotadas"
              value={`${Math.round(dadosTurmas.percentualAulasLotadas * 100)}%`}
              color="orange"
              subtitle="Com limite atingido"
            />
            <StatCard
              icon={Users}
              label="Média de Alunos"
              value={Math.round(dadosTurmas.mediaAlunosPorAula)}
              color="purple"
              subtitle="Por aula"
            />
          </div>
        </div>

        {/* Seção Engajamento */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6 space-y-6">
          <h2 className="text-xl font-bold text-[var(--fh-text)] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[var(--fh-primary)]" />
            Engajamento (Mês Atual)
          </h2>

          {/* Cards de Engajamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Calendar}
              label="Aulas Previstas"
              value={dadosEngajamento.aulasPrevistasNoMes}
              color="blue"
              subtitle="Agendadas"
            />
            <StatCard
              icon={CheckCircle}
              label="Aulas Realizadas"
              value={dadosEngajamento.aulasRealizadasNoMes}
              color="green"
              subtitle="Executadas"
            />
            <StatCard
              icon={AlertCircle}
              label="Aulas Canceladas"
              value={dadosEngajamento.aulasCanceladasNoMes}
              color="red"
              subtitle="Não realizadas"
            />
            <StatCard
              icon={BarChart3}
              label="Taxa de Presença Geral"
              value={`${Math.round(dadosEngajamento.presencaMediaGeralNoMes * 100)}%`}
              color="purple"
              subtitle="Média geral"
            />
          </div>

          {/* Taxa de Presença por Turma */}
          <div className="bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)] p-6">
            <h3 className="text-lg font-semibold text-[var(--fh-text)] mb-4">
              Taxa de Presença por Turma
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--fh-muted)] mb-2">Média de presença</p>
                <p className="text-3xl font-bold text-[var(--fh-text)]">
                  {Math.round(dadosEngajamento.presencaMediaPorTurmaNoMes * 100)}%
                </p>
              </div>
              <div className="w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--fh-border)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--fh-primary)"
                    strokeWidth="8"
                    strokeDasharray={`${Math.round(dadosEngajamento.presencaMediaPorTurmaNoMes * 100) * 2.827} 282.7`}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Top 5 Alunos com Mais Faltas */}
          {dadosEngajamento.top5AlunosComMaisFaltasNoMes.length > 0 && (
            <div className="bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)] p-6">
              <h3 className="text-lg font-semibold text-[var(--fh-text)] mb-4">
                Top 5 Alunos com Mais Faltas
              </h3>
              <div className="space-y-4">
                {dadosEngajamento.top5AlunosComMaisFaltasNoMes.map(
                  (aluno, idx) => (
                    <div key={aluno.alunoId || `aluno-${idx}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 text-red-700 dark:text-red-400 font-semibold">
                          {idx + 1}
                        </div>
                        <span className="font-medium text-[var(--fh-text)]">
                          {aluno.nome}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                        {aluno.faltas} faltas
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Estatisticas
