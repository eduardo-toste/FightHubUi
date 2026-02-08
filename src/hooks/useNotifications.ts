import { useEffect, useCallback } from 'react'
import { useNotification } from '../context/NotificationContext'
import { NotificationType, NotificationCategory } from '../api/notificacoes'

interface UseNotificationsOptions {
  persistir?: boolean // Salvar em localStorage
}

/**
 * Hook para gerenciar notificações 100% no frontend
 * Sem dependência de backend - funciona completamente offline
 */
export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { persistir = true } = options
  const { addNotification, markAsRead, clearNotifications, removeNotification } = useNotification()

  // Restaurar notificações do localStorage ao montar
  useEffect(() => {
    if (!persistir) return

    try {
      const salvas = localStorage.getItem('notificacoes_salvas')
      if (salvas) {
        const notificacoes = JSON.parse(salvas)
        // Pode restaurar se necessário
        console.log('Notificações restauradas:', notificacoes.length)
      }
    } catch (error) {
      console.warn('Erro ao restaurar notificações:', error)
    }
  }, [persistir])

  // Criar notificação local
  const criarNotificacao = useCallback(
    (titulo: string, mensagem: string, tipo: NotificationType = 'info') => {
      addNotification(titulo, mensagem, tipo)

      // Persistir em localStorage
      if (persistir) {
        try {
          const timestamp = new Date().toISOString()
          const notif = {
            id: Date.now().toString(),
            titulo,
            mensagem,
            tipo,
            timestamp,
            lida: false
          }

          const salvas = localStorage.getItem('notificacoes_histrico') || '[]'
          const lista = JSON.parse(salvas)
          lista.unshift(notif)
          
          // Manter apenas últimas 50
          if (lista.length > 50) lista.pop()
          
          localStorage.setItem('notificacoes_histrico', JSON.stringify(lista))
        } catch (error) {
          console.warn('Erro ao salvar notificação:', error)
        }
      }
    },
    [addNotification, persistir]
  )

  // Sucesso
  const sucesso = useCallback(
    (titulo: string, mensagem: string) => {
      criarNotificacao(titulo, mensagem, 'success')
    },
    [criarNotificacao]
  )

  // Erro
  const erro = useCallback(
    (titulo: string, mensagem: string) => {
      criarNotificacao(titulo, mensagem, 'error')
    },
    [criarNotificacao]
  )

  // Aviso
  const aviso = useCallback(
    (titulo: string, mensagem: string) => {
      criarNotificacao(titulo, mensagem, 'warning')
    },
    [criarNotificacao]
  )

  // Informação
  const info = useCallback(
    (titulo: string, mensagem: string) => {
      criarNotificacao(titulo, mensagem, 'info')
    },
    [criarNotificacao]
  )

  return {
    criarNotificacao,
    sucesso,
    erro,
    aviso,
    info,
    markAsRead,
    removeNotification,
    clearNotifications
  }
}

export default useNotifications

