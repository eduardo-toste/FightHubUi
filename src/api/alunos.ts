import api from '../lib/apiClient'
import type { 
  AlunoResponse, 
  AlunoDetalhadoResponse, 
  CriarAlunoRequest,
  PageResponse,
  AlunoUpdateMatriculaRequest,
  AlunoUpdateDataNascimentoRequest,
  AlunoUpdateDataMatriculaRequest
} from '../types'

export const alunosApi = {
  // Listar alunos com paginação
  listar: async (page = 0, size = 10) => {
    const { data } = await api.get<PageResponse<AlunoResponse>>('/alunos', {
      params: { page, size, sort: 'nomeCompleto,asc' }
    })
    return data
  },

  // Buscar aluno por ID
  buscarPorId: async (id: string) => {
    const { data } = await api.get<AlunoDetalhadoResponse>(`/alunos/${id}`)
    return data
  },

  // Criar novo aluno
  criar: async (aluno: CriarAlunoRequest) => {
    await api.post('/alunos', aluno)
  },

  // Atualizar status de matrícula
  atualizarMatricula: async (id: string, request: AlunoUpdateMatriculaRequest) => {
    await api.patch(`/alunos/${id}/matricula`, request)
  },

  // Atualizar data de nascimento
  atualizarDataNascimento: async (id: string, request: AlunoUpdateDataNascimentoRequest) => {
    await api.patch(`/alunos/${id}/data-nascimento`, request)
  },

  // Atualizar data de matrícula
  atualizarDataMatricula: async (id: string, request: AlunoUpdateDataMatriculaRequest) => {
    await api.patch(`/alunos/${id}/data-matricula`, request)
  },

  // Promover faixa
  promoverFaixa: async (id: string) => {
    await api.patch(`/alunos/${id}/promover/faixa`)
  }
}
