import api from '../lib/apiClient'
import type { 
  PageResponse,
} from '../types'

export interface ProfessorResponse {
  id: string
  nome: string
  email: string
  cpf?: string
  telefone?: string
  foto?: string
}

export interface ProfessorDetalhadoResponse {
  id: string
  nome: string
  email: string
  cpf?: string
  telefone?: string
  foto?: string
  endereco?: {
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }
}

export interface CriarProfessorRequest {
  nome: string
  email: string
  cpf: string
}

export const professoresApi = {
  // Listar professores com paginação
  listar: async (page = 0, size = 10) => {
    const { data } = await api.get<PageResponse<ProfessorResponse>>('/professores', {
      params: { page, size }
    })
    return data
  },

  // Buscar professor por ID
  buscarPorId: async (id: string) => {
    const { data } = await api.get<ProfessorDetalhadoResponse>(`/professores/${id}`)
    return data
  },

  // Criar novo professor
  criar: async (professor: CriarProfessorRequest) => {
    await api.post('/professores', professor)
  },
}
