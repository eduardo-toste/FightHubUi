import apiClient from '../lib/apiClient'

export interface AlunosDashboardResponse {
  totalAlunosAtivos: number
  totalAlunosInativos: number
  novosAlunosUltimos30Dias: number
  idadeMediaAlunos: number
}

export interface TurmasDashboardResponse {
  totalTurmasAtivas: number
  totalTurmasInativas: number
  ocupacaoMediaTurmas: number
  percentualAulasLotadas: number
  mediaAlunosPorAula: number
}

export interface AlunosFaltasResponse {
  alunoId: string
  nome: string
  faltas: number
}

export interface EngajamentoDashboardResponse {
  aulasPrevistasNoMes: number
  aulasRealizadasNoMes: number
  aulasCanceladasNoMes: number
  presencaMediaGeralNoMes: number
  presencaMediaPorTurmaNoMes: number
  top5AlunosComMaisFaltasNoMes: AlunosFaltasResponse[]
}

export interface DashboardResponse {
  dadosAlunos: AlunosDashboardResponse
  dadosTurmas: TurmasDashboardResponse
  dadosEngajamento: EngajamentoDashboardResponse
}

const dashboardApi = {
  // Buscar dados completos do dashboard (ADMIN, COORDENADOR)
  buscarDashboard: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get('/admin/dashboard')
    return response.data
  }
}

export default dashboardApi
