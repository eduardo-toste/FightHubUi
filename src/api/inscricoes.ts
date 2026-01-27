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
  inscrever: async (aulaId: string): Promise<void> => {
    await apiClient.post(`/aulas/${aulaId}/inscricoes`)
  },

  // Cancelar inscrição do aluno autenticado
  cancelar: async (aulaId: string): Promise<void> => {
    await apiClient.delete(`/aulas/${aulaId}/inscricoes`)
  },

  // Buscar inscrições por aula (ADMIN, COORDENADOR, PROFESSOR)
  buscarPorAula: async (aulaId: string, page = 0, size = 100): Promise<any> => {
    const response = await apiClient.get(`/aulas/${aulaId}/inscricoes`, {
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
