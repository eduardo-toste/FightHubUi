import apiClient from '../lib/apiClient'

export interface PresencaResponse {
  id: string
  presente: boolean
  inscricaoId: string
  alunoId: string
  alunoNome: string
  aulaId: string
  aulaTitulo: string
  dataRegistro: string
}

export interface PresencaRequest {
  presente: boolean
}

const presencasApi = {
  // Atualizar status de presença por inscrição (ADMIN, PROFESSOR)
  atualizarStatus: async (
    aulaId: string,
    inscricaoId: string,
    presente: boolean
  ): Promise<void> => {
    await apiClient.patch(`/aulas/${aulaId}/presencas/inscricao/${inscricaoId}`, {
      presente
    })
  },

  // Listar presenças por aula (ADMIN, PROFESSOR)
  listarPorAula: async (aulaId: string, page = 0, size = 100): Promise<any> => {
    const response = await apiClient.get(`/aulas/${aulaId}/presencas`, {
      params: { page, size }
    })
    return response.data
  },

  // Listar minhas presenças (ALUNO)
  minhasPresencas: async (page = 0, size = 20): Promise<any> => {
    const response = await apiClient.get('/aulas/me/presencas', {
      params: { page, size }
    })
    return response.data
  }
}

export default presencasApi
