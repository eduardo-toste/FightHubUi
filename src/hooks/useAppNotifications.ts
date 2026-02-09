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
  const notificarUsuarioCriado = (nome?: string, email?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const detalhe = nome ? `${nome}${email ? ` (${email})` : ''}` : ''
      const msg = detalhe ? `${detalhe} foi adicionado ao sistema` : 'Novo usuário adicionado ao sistema'
      addNotification('Novo usuário cadastrado', msg, 'success')
    }
  }

  const notificarUsuarioAtivado = (nome?: string) => {
    if (user?.role === 'ADMIN' || user?.role === 'COORDENADOR') {
      const msg = nome ? `${nome} ativou sua conta com sucesso` : 'Conta ativada com sucesso'
      addNotification('Conta ativada', msg, 'success')
    }
  }

  const notificarUsuarioAtualizado = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const msg = nome ? `${nome} teve suas informações atualizadas` : 'Informações atualizadas com sucesso'
      addNotification('Usuário atualizado', msg, 'success')
    }
  }

  const notificarUsuarioDeletado = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const msg = nome ? `${nome} foi removido do sistema` : 'Usuário removido com sucesso'
      addNotification('Usuário deletado', msg, 'warning')
    }
  }

  const notificarUsuarioErro = (mensagem: string) => {
    addNotification('Erro ao processar usuário', mensagem, 'error')
  }

  // ============= ALUNOS =============
  const notificarAlunoCriado = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      const msg = nome ? `${nome} foi adicionado com sucesso` : 'Aluno cadastrado com sucesso'
      addNotification('Aluno cadastrado', msg, 'success')
    }
  }

  const notificarAlunoAtualizado = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      const msg = nome ? `Informações de ${nome} foram atualizadas` : 'Dados do aluno atualizados com sucesso'
      addNotification('Aluno atualizado', msg, 'success')
    }
  }

  const notificarAlunoDeletado = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const msg = nome ? `${nome} foi removido do sistema` : 'Aluno removido com sucesso'
      addNotification('Aluno deletado', msg, 'warning')
    }
  }

  const notificarAlunoPromovido = (nome?: string, tipo?: string, novaValor?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      let msg = 'Aluno promovido com sucesso!'
      if (nome) {
        msg = novaValor 
          ? `${nome} foi promovido de ${tipo || 'faixa'} para ${novaValor}`
          : `${nome} foi promovido de ${tipo || 'faixa'}!`;
      }
      addNotification('Aluno promovido! 🎉', msg, 'success')
    }
  }

  const notificarAlunoErro = (mensagem: string) => {
    addNotification('Erro ao processar aluno', mensagem, 'error')
  }

  // ============= TURMAS =============
  const notificarTurmaCriada = (nome?: string, professor?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      let msg = 'Turma criada com sucesso'
      if (nome) {
        msg = professor ? `${nome} foi criada com ${professor}` : `${nome} foi criada com sucesso`
      }
      addNotification('Turma criada', msg, 'success')
    }
  }

  const notificarTurmaAtualizada = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      const msg = nome ? `${nome} teve suas informações atualizadas` : 'Turma atualizada com sucesso'
      addNotification('Turma atualizada', msg, 'success')
    }
  }

  const notificarTurmaDeletada = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const msg = nome ? `${nome} foi removida do sistema` : 'Turma removida com sucesso'
      addNotification('Turma deletada', msg, 'warning')
    }
  }

  const notificarTurmaErro = (mensagem: string) => {
    addNotification('Erro ao processar turma', mensagem, 'error')
  }

  // ============= AULAS =============
  const notificarAulaCriada = (titulo?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      const msg = titulo ? `${titulo} foi adicionada com sucesso` : 'Aula criada com sucesso'
      addNotification('Aula criada', msg, 'success')
    }
  }

  const notificarAulaAgendada = (titulo?: string, data?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      let msg = 'Aula agendada com sucesso'
      if (titulo) {
        msg = data ? `${titulo} foi agendada para ${data}` : `${titulo} foi agendada com sucesso`
      }
      addNotification('Aula agendada', msg, 'success')
    }
  }

  const notificarAulaAtualizada = (titulo?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      const msg = titulo ? `${titulo} teve suas informações atualizadas` : 'Aula atualizada com sucesso'
      addNotification('Aula atualizada', msg, 'success')
    }
  }

  const notificarAulaCancelada = (titulo?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      const msg = titulo ? `${titulo} foi cancelada` : 'Aula cancelada com sucesso'
      addNotification('Aula cancelada', msg, 'warning')
    }
  }

  const notificarAulaErro = (mensagem: string) => {
    addNotification('Erro ao processar aula', mensagem, 'error')
  }

  // ============= INSCRIÇÕES =============
  const notificarInscricaoNova = (nomeAluno?: string, nomeTurma?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      let msg = 'Nova inscrição realizada com sucesso'
      if (nomeAluno && nomeTurma) {
        msg = `${nomeAluno} se inscreveu em ${nomeTurma}`
      }
      addNotification('Nova inscrição', msg, 'success')
    }
  }

  const notificarInscricaoCancelada = (nomeAluno?: string, nomeTurma?: string) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      let msg = 'Inscrição cancelada com sucesso'
      if (nomeAluno && nomeTurma) {
        msg = `${nomeAluno} cancelou inscrição em ${nomeTurma}`
      }
      addNotification('Inscrição cancelada', msg, 'warning')
    }
  }

  const notificarInscricaoErro = (mensagem: string) => {
    addNotification('Erro ao processar inscrição', mensagem, 'error')
  }

  // ============= PRESENÇAS =============
  const notificarPresencaRegistrada = (nomeAluno?: string, presente: boolean = true) => {
    const msg = nomeAluno 
      ? `${nomeAluno} foi marcado como ${presente ? 'presente' : 'ausente'}` 
      : `Presença registrada como ${presente ? 'presente' : 'ausente'}`
    addNotification(
      presente ? 'Presente ✓' : 'Ausente ✗',
      msg,
      presente ? 'success' : 'warning'
    )
  }

  const notificarPresencasEmLote = (quantidade?: number, presente: boolean = true) => {
    if (['ADMIN', 'COORDENADOR', 'PROFESSOR'].includes(user?.role || '')) {
      const qtd = quantidade || 0
      const msg = qtd > 0 
        ? `${qtd} aluno(s) foi/foram marcado(s) como ${presente ? 'presente' : 'ausente'}`
        : `Presenças registradas como ${presente ? 'presente' : 'ausente'}`
      addNotification('Presenças registradas', msg, 'success')
    }
  }

  const notificarPresencaErro = (mensagem: string) => {
    addNotification('Erro ao registrar presença', mensagem, 'error')
  }

  // ============= RESPONSÁVEIS =============
  const notificarResponsavelCriado = (nome?: string, email?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const detalhe = nome ? `${nome}${email ? ` (${email})` : ''}` : ''
      const msg = detalhe ? `${detalhe} foi adicionado ao sistema` : 'Responsável cadastrado com sucesso'
      addNotification('Responsável cadastrado', msg, 'success')
    }
  }

  const notificarResponsavelVinculado = (nomeAluno?: string, nomeResponsavel?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      let msg = 'Responsável vinculado com sucesso'
      if (nomeResponsavel && nomeAluno) {
        msg = `${nomeResponsavel} foi vinculado como responsável de ${nomeAluno}`
      } else if (nomeResponsavel) {
        msg = `${nomeResponsavel} foi vinculado como responsável`
      }
      addNotification('Responsável vinculado', msg, 'success')
    }
  }

  const notificarResponsavelDesvinculado = (nomeAluno?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const msg = nomeAluno ? `Responsável de ${nomeAluno} foi removido` : 'Responsável removido com sucesso'
      addNotification('Responsável removido', msg, 'warning')
    }
  }

  const notificarResponsavelErro = (mensagem: string) => {
    addNotification('Erro ao processar responsável', mensagem, 'error')
  }

  // ============= PROFESSORES =============
  const notificarProfessorCriado = (nome?: string, email?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const detalhe = nome ? `${nome}${email ? ` (${email})` : ''}` : ''
      const msg = detalhe ? `${detalhe} foi adicionado ao sistema` : 'Professor cadastrado com sucesso'
      addNotification('Professor cadastrado', msg, 'success')
    }
  }

  const notificarProfessorAtualizado = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const msg = nome ? `Informações de ${nome} foram atualizadas` : 'Professor atualizado com sucesso'
      addNotification('Professor atualizado', msg, 'success')
    }
  }

  const notificarProfessorDeletado = (nome?: string) => {
    if (['ADMIN', 'COORDENADOR'].includes(user?.role || '')) {
      const msg = nome ? `${nome} foi removido do sistema` : 'Professor removido com sucesso'
      addNotification('Professor deletado', msg, 'warning')
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
    notificarAulaCriada,
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
    notificarResponsavelCriado,
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
