import apiClient from '../lib/apiClient'

export interface InscricaoResponse {
  id: string
  alunoId: string
  aulaId: string
  status: 'INSCRITO' | 'CANCELADO' | 'DESMARCADO'
  inscritoEm: string
}

const inscricoesApi = {
  // Inscrever aluno autenticado em uma aula
  inscrever: async (aulaId: string, alunoId?: string): Promise<InscricaoResponse> => {
    const params = alunoId ? { alunoId } : {}
    const response = await apiClient.post(`/aulas/${aulaId}/inscricoes`, null, { params })
    return response.data
  },

  // Cancelar inscrição do aluno autenticado
  cancelar: async (aulaId: string, alunoId?: string): Promise<void> => {
    const params = alunoId ? { alunoId } : {}
    await apiClient.delete(`/aulas/${aulaId}/inscricoes`, { params })
  },

  // Buscar inscrições por aula (ADMIN, COORDENADOR, PROFESSOR)
  buscarPorAula: async (aulaId: string, page = 0, size = 100): Promise<any> => {
    const response = await apiClient.get(`/aulas/${aulaId}/inscricoes`, {
      params: { page, size }
    })
    return response.data
  },

  // Buscar inscrições de um aluno específico (ADMIN, COORDENADOR, PROFESSOR)
  buscarPorAluno: async (alunoId: string, page = 0, size = 20): Promise<any> => {
    const response = await apiClient.get(`/alunos/${alunoId}/inscricoes`, {
      params: { page, size }
    })
    return response.data
  },

  // Buscar minhas inscrições (ALUNO)
  minhasInscricoes: async (page = 0, size = 20): Promise<any> => {
    const response = await apiClient.get('/aulas/inscricoes/minhas', {
      params: { page, size }
    })
    return response.data
  }
}

export default inscricoesApi
