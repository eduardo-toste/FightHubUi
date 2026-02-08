import apiClient from '../lib/apiClient'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 
  | 'usuario_criado' 
  | 'usuario_ativado'
  | 'aula_criada'
  | 'aula_modificada'
  | 'aula_cancelada'
  | 'inscricao_confirmada'
  | 'inscricao_cancelada'
  | 'presenca_registrada'
  | 'turma_criada'
  | 'professor_atribuido'
  | 'aluno_promovido'
  | 'responsavel_vinculado'
  | 'menor_pendente'
  | 'sistema'

export interface NotificacaoResponse {
  id: string
  usuarioId: string
  titulo: string
  mensagem: string
  tipo: NotificationType
  categoria: NotificationCategory
  lida: boolean
  criadoEm: string
  atualizadoEm?: string
  dados?: Record<string, any>
}

export interface CriarNotificacaoRequest {
  usuarioId: string
  titulo: string
  mensagem: string
  tipo: NotificationType
  categoria: NotificationCategory
  dados?: Record<string, any>
}

export interface PageableNotificacoes {
  content: NotificacaoResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  empty: boolean
  first: boolean
  last: boolean
}

const notificacoesApi = {
  // Listar notificações do usuário logado com paginação
  listarMinhas: async (page = 0, size = 20, apenasNaoLidas = false): Promise<PageableNotificacoes> => {
    try {
      const response = await apiClient.get('/notificacoes/minhas', {
        params: { page, size, apenasNaoLidas }
      })
      return response.data
    } catch (error) {
      console.warn('Erro ao listar notificações:', error)
      return { 
        content: [], 
        totalElements: 0, 
        totalPages: 0, 
        size, 
        number: page, 
        empty: true, 
        first: true, 
        last: true 
      }
    }
  },

  // Buscar notificação por ID
  buscarPorId: async (id: string): Promise<NotificacaoResponse | null> => {
    try {
      const response = await apiClient.get(`/notificacoes/${id}`)
      return response.data
    } catch (error) {
      console.warn('Erro ao buscar notificação:', error)
      return null
    }
  },

  // Marcar como lida
  marcarComoLida: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/notificacoes/${id}/marcar-lida`)
    } catch (error) {
      console.warn('Erro ao marcar notificação como lida:', error)
    }
  },

  // Marcar todas como lidas
  marcarTodasComoLidas: async (): Promise<void> => {
    try {
      await apiClient.patch('/notificacoes/marcar-todas-lidas')
    } catch (error) {
      console.warn('Erro ao marcar todas as notificações como lidas:', error)
    }
  },

  // Deletar notificação
  deletar: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/notificacoes/${id}`)
    } catch (error) {
      console.warn('Erro ao deletar notificação:', error)
    }
  },

  // Limpar todas as notificações
  limparTodas: async (): Promise<void> => {
    try {
      await apiClient.delete('/notificacoes')
    } catch (error) {
      console.warn('Erro ao limpar notificações:', error)
    }
  },

  // Contar não lidas
  contarNaoLidas: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/notificacoes/contar-nao-lidas')
      return response.data.count || 0
    } catch (error) {
      console.warn('Erro ao contar notificações não lidas:', error)
      return 0
    }
  },

  // Criar notificação (ADMIN apenas)
  criar: async (dados: CriarNotificacaoRequest): Promise<NotificacaoResponse | null> => {
    try {
      const response = await apiClient.post('/notificacoes', dados)
      return response.data
    } catch (error) {
      console.warn('Erro ao criar notificação:', error)
      return null
    }
  }
}

export default notificacoesApi
