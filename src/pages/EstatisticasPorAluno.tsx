import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import useAuth from '../hooks/useAuth'
import { alunosApi } from '../api/alunos'
import inscricoesApi from '../api/inscricoes'
import presencasApi, { PresencaResponse } from '../api/presencas'
import Layout from '../components/Layout'
import { StatCard } from '../components/StatCard'
import { Button } from '../components/Button'

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
  status: 'INSCRITO' | 'CANCELADO' | 'DESMARCADO'
  inscritoEm: string
}

const EstatisticasPorAluno: React.FC = () => {
  const { alunoId } = useParams<{ alunoId: string }>()
  const navigate = useNavigate()
  const { showError } = useToast()
  const { user, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [aluno, setAluno] = useState<AlunoWithStats | null>(null)
  const [inscricoes, setInscricoes] = useState<InscricaoComAula[]>([])
  const [presencas, setPresencas] = useState<PresencaResponse[]>([])
  const [stats, setStats] = useState({
    totalInscricoes: 0,
    totalPresencas: 0,
    totalFaltas: 0,
    taxaPresenca: 0
  })

  useEffect(() => {
    if (alunoId) {
      loadAlunoStats()
    }
  }, [alunoId])

  const loadAlunoStats = async () => {
    if (!alunoId) return

    try {
      setLoading(true)

      // Carregar dados do aluno
      const alunoData = await alunosApi.buscarPorId(alunoId)
      setAluno({
        id: alunoData.id,
        nome: alunoData.nome,
        email: alunoData.email || 'N/A',
        matriculaAtiva: alunoData.matriculaAtiva,
        dataMatricula: alunoData.dataMatricula,
        dataNascimento: alunoData.dataNascimento,
        faixa: alunoData.graduacaoAluno?.belt
      })

      // IMPORTANTE: Não existem endpoints específicos no backend para:
      // - GET /alunos/:id/inscricoes (todas as inscrições de um aluno)
      // - GET /alunos/:id/presencas (todas as presenças de um aluno)
      // 
      // Os endpoints disponíveis são:
      // - GET /aulas/:id/inscricoes (inscrições de uma aula específica)
      // - GET /aulas/:id/presencas (presenças de uma aula específica)
      // - GET /aulas/me/presencas (presenças do usuário logado - role ALUNO)
      //
      // Para implementar esta funcionalidade, seria necessário criar novos endpoints no backend
      console.warn('Endpoints necessários para visualizar dados de outro aluno:', {
        inscricoes: `GET /alunos/${alunoId}/inscricoes`,
        presencas: `GET /alunos/${alunoId}/presencas`
      })

      setInscricoes([])
      setPresencas([])
      setStats({
        totalInscricoes: 0,
        totalPresencas: 0,
        totalFaltas: 0,
        taxaPresenca: 0
      })
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas do aluno:', error)
      showError('Erro ao carregar dados do aluno')
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

  if (!aluno) {
    return (
      <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-600 dark:text-red-400 mb-4" />
            <p className="text-[var(--fh-muted)]">Aluno não encontrado</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/estatisticas-alunos')}
          className="flex items-center gap-2 text-[var(--fh-primary)] hover:text-[var(--fh-primary-dark)] font-medium"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {/* Cabeçalho com informações do aluno */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--fh-text)] mb-2">{aluno.nome}</h1>
              <p className="text-[var(--fh-muted)]">{aluno.email}</p>
              <div className="flex gap-4 mt-4 text-sm">
                <span className="text-[var(--fh-muted)]">
                  <strong className="text-[var(--fh-text)]">Matrícula:</strong> {aluno.dataMatricula ? new Date(aluno.dataMatricula).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
                <span className={`font-semibold ${aluno.matriculaAtiva ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {aluno.matriculaAtiva ? '✓ Ativa' : '✗ Inativa'}
                </span>
              </div>
            </div>
            {aluno.faixa && (
              <div className="text-center">
                <p className="text-sm text-[var(--fh-muted)] mb-2">Faixa Atual</p>
                <div className="px-4 py-2 bg-[var(--fh-primary)]/10 text-[var(--fh-primary)] rounded-lg font-semibold">
                  {aluno.faixa}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="bg-[var(--fh-card)] rounded-xl shadow-sm border border-[var(--fh-border)] p-6 space-y-6">
          <h2 className="text-xl font-bold text-[var(--fh-text)]">Estatísticas Gerais</h2>
          
          {/* Aviso sobre dados não disponíveis */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Dados Não Disponíveis
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Para visualizar as estatísticas completas deste aluno, é necessário criar os seguintes endpoints no backend:
                </p>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1 list-disc list-inside">
                  <li><code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">GET /alunos/{alunoId}/inscricoes</code></li>
                  <li><code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">GET /alunos/{alunoId}/presencas</code></li>
                </ul>
              </div>
            </div>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inscricoes.map((inscricao) => (
                <div
                  key={inscricao.id}
                  className="bg-[var(--fh-gray-50)] rounded-xl border border-[var(--fh-border)] p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-[var(--fh-text)] mb-2">
                    {inscricao.aulaTitulo}
                  </h3>
                  <p className="text-sm text-[var(--fh-muted)]">
                    Inscrito em:{' '}
                    {new Date(inscricao.inscritoEm).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full font-semibold">
                      {inscricao.status}
                    </span>
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
      </div>
    </Layout>
  )
}

export default EstatisticasPorAluno
