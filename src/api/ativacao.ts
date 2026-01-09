import api from '../lib/apiClient'

export interface EnderecoData {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface AtivacaoData {
  token: string
  senha: string
  telefone?: string
  endereco?: EnderecoData
}

export const ativacaoApi = {
  ativarConta: async (data: AtivacaoData): Promise<void> => {
    await api.post('/ativar', data)
  }
}
