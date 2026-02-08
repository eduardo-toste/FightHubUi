import React from 'react'
import useAuth from '../hooks/useAuth'
import { useAppNotifications } from '../hooks/useAppNotifications'
import Layout from '../components/Layout'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export default function NotificacoesTest() {
  const { user, logout } = useAuth()
  const {
    notificarSucesso,
    notificarErro,
    notificarAviso,
    notificarInfo,
    notificarAlunoCriado,
    notificarAlunoDeletado
  } = useAppNotifications()

  return (
    <Layout userName={user?.name} userRole={user?.role} onLogout={logout}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)] p-6">
          <h1 className="text-2xl font-bold text-[var(--fh-text)] mb-2">Teste de Notificações</h1>
          <p className="text-[var(--fh-muted)]">Clique nos botões abaixo para disparar notificações</p>
        </div>

        {/* Notificações Genéricas */}
        <div className="bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--fh-text)] mb-4 flex items-center gap-2">
            <CheckCircle size={20} />
            Genéricas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => notificarSucesso('Sucesso!', 'Esta é uma notificação de sucesso')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              🟢 Sucesso
            </button>
            <button
              onClick={() => notificarErro('Erro!', 'Esta é uma notificação de erro')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              🔴 Erro
            </button>
            <button
              onClick={() => notificarAviso('Aviso!', 'Esta é uma notificação de aviso')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              🟡 Aviso
            </button>
            <button
              onClick={() => notificarInfo('Info!', 'Esta é uma notificação de informação')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              🔵 Info
            </button>
          </div>
        </div>

        {/* Notificações de Alunos */}
        <div className="bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--fh-text)] mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Alunos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => notificarAlunoCriado('João Silva')}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition"
            >
              ✅ Aluno Criado
            </button>
            <button
              onClick={() => notificarAlunoDeletado('Maria Santos')}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition"
            >
              ❌ Aluno Deletado
            </button>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📝 Instruções</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>✓ Clique em um botão para disparar uma notificação</li>
            <li>✓ Veja o bell icon no navbar atualizar</li>
            <li>✓ Clique no bell icon para abrir painel</li>
            <li>✓ Teste marcar como lida e deletar</li>
            <li>✓ Sucesso/Aviso/Info desaparecem em 10s</li>
            <li>✓ Erro persiste até fechar manualmente</li>
            <li>✓ Refresh (F5) e notificações permanecem (localStorage)</li>
          </ul>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-xl p-6 font-mono text-xs">
          <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">🐛 Informações de Debug</h3>
          <p className="text-gray-600 dark:text-gray-400">Seu perfil: <span className="font-bold text-[var(--fh-primary)]">{user?.role || 'Não identificado'}</span></p>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Seu nome: <span className="font-bold text-[var(--fh-primary)]">{user?.name || 'Anônimo'}</span></p>
          <p className="text-gray-600 dark:text-gray-400 mt-3">
            Se o bell icon não responde, abra console (F12) e verifique se há erros.
          </p>
        </div>
      </div>
    </Layout>
  )
}
