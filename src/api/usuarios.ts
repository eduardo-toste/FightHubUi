import api from '../lib/apiClient'
import { getBaseUrl } from '../lib/env'
import type { UsuarioDetalhadoResponse } from '../types'

export const usuariosApi = {
  // Obter dados do usuário logado
  obterPerfil: async () => {
    const { data } = await api.get<UsuarioDetalhadoResponse>('/usuarios/me')
    return data
  },

  // Atualizar foto de perfil
  uploadFoto: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const { data } = await api.patch<{ profileImageUrl: string }>(
      '/usuarios/me/foto',
      formData
    )
    // Retorna a URL da resposta
    return data.profileImageUrl
  },

  // Remover foto de perfil
  removerFoto: async () => {
    await api.delete('/usuarios/me/foto')
  },

  // Construir URL completa da foto
  getPhotoUrl: (photoPath?: string | null): string | undefined => {
    if (!photoPath) return undefined
    
    // Se já é uma URL completa, retorna como está
    if (photoPath.startsWith('http')) {
      return photoPath
    }
    
    // Se é um caminho relativo, constrói a URL completa
    const baseUrl = getBaseUrl()
    if (baseUrl) {
      // Remove barras duplicadas
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
      const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`
      return `${cleanBase}${cleanPath}`
    }
    
    return undefined
  },
}

