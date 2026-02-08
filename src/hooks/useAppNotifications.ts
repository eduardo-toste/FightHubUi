/**
 * Serviço de Notificações de Aplicação
 * Gerencia quando e como disparar notificações no painel
 * 
 * Tira notificações de todas as operações importantes:
 * - Criar usuários, alunos, turmas, aulas
 * - Editar/atualizar dados
 * - Deletar itens
 * - Registrar presenças
 * - Inscrições
 * - Erros e avisos
 */

import { useNotification } from '../context/NotificationContext'
import useAuth from './useAuth'

/**
 * Hook para disparar notificações contextualizadas
 * Centraliza toda a lógica de quando notificar o usuário
 */
export const useAppNotifications = () => {
  const { addNotification } = useNotification()
  const { user } = useAuth()

  // ============= USUÁRIOS =============
  const notificarUsuarioCriado = (nome: string, email: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Novo usuário cadastrado', `${nome} (${email}) foi adicionado ao sistema`, 'success')
    }
  }

  const notificarUsuarioAtivado = (nome: string) => {
    if (user?.role === 'ADMIN' || user?.role === 'COORDENADOR') {
      addNotification('Conta ativada', `${nome} ativou sua conta com sucesso`, 'success')
    }
  }

  const notificarUsuarioAtualizado = (nome: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Usuário atualizado', `${nome} teve suas informações atualizadas`, 'success')
    }
  }

  const notificarUsuarioDeletado = (nome: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Usuário deletado', `${nome} foi removido do sistema`, 'warning')
    }
  }

  const notificarUsuarioErro = (mensagem: string) => {
    addNotification('Erro ao processar usuário', mensagem, 'error')
  }

  // ============= ALUNOS =============
  const notificarAlunoCriado = (nome: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification('Aluno cadastrado', `${nome} foi adicionado com sucesso`, 'success')
    }
  }

  const notificarAlunoAtualizado = (nome: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification('Aluno atualizado', `Informações de ${nome} foram atualizadas`, 'success')
    }
  }

  const notificarAlunoDeletado = (nome: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Aluno deletado', `${nome} foi removido do sistema`, 'warning')
    }
  }

  const notificarAlunoPromovido = (nome: string, tipo: string, novaValor?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      const msg = novaValor 
        ? `${nome} foi promovido de ${tipo} para ${novaValor}`
        : `${nome} foi promovido de ${tipo}!`;
      addNotification(
        'Aluno promovido! 🎉',
        msg,
        'success'
      )
    }
  }

  const notificarAlunoErro = (mensagem: string) => {
    addNotification('Erro ao processar aluno', mensagem, 'error')
  }

  // ============= TURMAS =============
  const notificarTurmaCriada = (nome: string, professor: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Turma criada', `${nome} foi criada com ${professor} como professor`, 'success')
    }
  }

  const notificarTurmaAtualizada = (nome: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification('Turma atualizada', `${nome} teve suas informações atualizadas`, 'success')
    }
  }

  const notificarTurmaDeletada = (nome: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Turma deletada', `${nome} foi removida do sistema`, 'warning')
    }
  }

  const notificarTurmaErro = (mensagem: string) => {
    addNotification('Erro ao processar turma', mensagem, 'error')
  }

  // ============= AULAS =============
  const notificarAulaAgendada = (titulo: string, data: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification('Aula agendada', `${titulo} foi agendada para ${data}`, 'success')
    }
  }

  const notificarAulaAtualizada = (titulo: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification('Aula atualizada', `${titulo} teve suas informações atualizadas`, 'success')
    }
  }

  const notificarAulaCancelada = (titulo: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification('Aula cancelada', `${titulo} foi cancelada`, 'warning')
    }
  }

  const notificarAulaErro = (mensagem: string) => {
    addNotification('Erro ao processar aula', mensagem, 'error')
  }

  // ============= INSCRIÇÕES =============
  const notificarInscricaoNova = (nomeAluno: string, nomeTurma: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification('Nova inscrição', `${nomeAluno} se inscreveu em ${nomeTurma}`, 'success')
    }
  }

  const notificarInscricaoCancelada = (nomeAluno: string, nomeTurma: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification('Inscrição cancelada', `${nomeAluno} cancelou inscrição em ${nomeTurma}`, 'warning')
    }
  }

  const notificarInscricaoErro = (mensagem: string) => {
    addNotification('Erro ao processar inscrição', mensagem, 'error')
  }

  // ============= PRESENÇAS =============
  const notificarPresencaRegistrada = (nomeAluno: string, presente: boolean) => {
    addNotification(
      presente ? 'Presente ✓' : 'Ausente ✗',
      `${nomeAluno} foi marcado como ${presente ? 'presente' : 'ausente'}`,
      presente ? 'success' : 'warning'
    )
  }

  const notificarPresencasEmLote = (quantidade: number, presente: boolean) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      addNotification(
        'Presenças registradas',
        `${quantidade} aluno(s) foi/foram marcado(s) como ${presente ? 'presente' : 'ausente'}`,
        'success'
      )
    }
  }

  const notificarPresencaErro = (mensagem: string) => {
    addNotification('Erro ao registrar presença', mensagem, 'error')
  }

  // ============= RESPONSÁVEIS =============
  const notificarResponsavelVinculado = (nomeAluno: string, nomeResponsavel: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification(
        'Responsável vinculado',
        `${nomeResponsavel} foi vinculado como responsável de ${nomeAluno}`,
        'success'
      )
    }
  }

  const notificarResponsavelDesvinculado = (nomeAluno: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Responsável removido', `Responsável de ${nomeAluno} foi removido`, 'warning')
    }
  }

  const notificarResponsavelErro = (mensagem: string) => {
    addNotification('Erro ao processar responsável', mensagem, 'error')
  }

  // ============= PROFESSORES =============
  const notificarProfessorCriado = (nome: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Professor cadastrado', `${nome} foi adicionado ao sistema`, 'success')
    }
  }

  const notificarProfessorAtualizado = (nome: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Professor atualizado', `Informações de ${nome} foram atualizadas`, 'success')
    }
  }

  const notificarProfessorDeletado = (nome: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      addNotification('Professor deletado', `${nome} foi removido do sistema`, 'warning')
    }
  }

  const notificarProfessorErro = (mensagem: string) => {
    addNotification('Erro ao processar professor', mensagem, 'error')
  }

  // ============= OPERAÇÕES GENÉRICAS =============
  const notificarSucesso = (titulo: string, mensagem: string) => {
    addNotification(titulo, mensagem, 'success')
  }

  const notificarInfo = (titulo: string, mensagem: string) => {
    addNotification(titulo, mensagem, 'info')
  }

  const notificarAviso = (titulo: string, mensagem: string) => {
    addNotification(titulo, mensagem, 'warning')
  }

  const notificarErro = (titulo: string, mensagem: string) => {
    addNotification(titulo, mensagem, 'error')
  }

  return {
    // Usuários
    notificarUsuarioCriado,
    notificarUsuarioAtivado,
    notificarUsuarioAtualizado,
    notificarUsuarioDeletado,
    notificarUsuarioErro,
    
    // Alunos
    notificarAlunoCriado,
    notificarAlunoAtualizado,
    notificarAlunoDeletado,
    notificarAlunoPromovido,
    notificarAlunoErro,
    
    // Turmas
    notificarTurmaCriada,
    notificarTurmaAtualizada,
    notificarTurmaDeletada,
    notificarTurmaErro,
    
    // Aulas
    notificarAulaAgendada,
    notificarAulaAtualizada,
    notificarAulaCancelada,
    notificarAulaErro,
    
    // Inscrições
    notificarInscricaoNova,
    notificarInscricaoCancelada,
    notificarInscricaoErro,
    
    // Presenças
    notificarPresencaRegistrada,
    notificarPresencasEmLote,
    notificarPresencaErro,
    
    // Responsáveis
    notificarResponsavelVinculado,
    notificarResponsavelDesvinculado,
    notificarResponsavelErro,
    
    // Professores
    notificarProfessorCriado,
    notificarProfessorAtualizado,
    notificarProfessorDeletado,
    notificarProfessorErro,
    
    // Genéricas
    notificarSucesso,
    notificarInfo,
    notificarAviso,
    notificarErro
  }
}

export default useAppNotifications
