import { NotificationType, NotificationCategory } from '../api/notificacoes'

export interface NotificacaoTemplate {
  titulo: string
  mensagem: string
  tipo: NotificationType
  categoria: NotificationCategory
  perfisAplicaveis: string[] // ADMIN, COORDENADOR, PROFESSOR, ALUNO, RESPONSAVEL
}

/**
 * Templates de notificações para diferentes eventos de negócio
 * Cada template define quais perfis devem receber a notificação
 */
export const NOTIFICACAO_TEMPLATES = {
  // USUÁRIOS
  usuario_novo_cadastro: (nome: string): NotificacaoTemplate => ({
    titulo: 'Novo usuário cadastrado',
    mensagem: `O usuário ${nome} foi cadastrado no sistema com sucesso.`,
    tipo: 'success',
    categoria: 'usuario_criado',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR']
  }),

  usuario_aguardando_ativacao: (nome: string, email: string): NotificacaoTemplate => ({
    titulo: 'Usuário aguardando ativação',
    mensagem: `${nome} (${email}) foi convidado mas ainda não ativou sua conta.`,
    tipo: 'warning',
    categoria: 'usuario_criado',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR']
  }),

  usuario_ativacao_sucesso: (nome: string): NotificacaoTemplate => ({
    titulo: 'Conta ativada com sucesso',
    mensagem: `Bem-vindo ${nome}! Sua conta foi ativada e você pode começar a usar a plataforma.`,
    tipo: 'success',
    categoria: 'usuario_ativado',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL']
  }),

  // AULAS E TURMAS
  aula_nova: (nomeTurma: string, professor: string, data: string): NotificacaoTemplate => ({
    titulo: 'Nova aula agendada',
    mensagem: `Aula de ${nomeTurma} com ${professor} agendada para ${data}.`,
    tipo: 'info',
    categoria: 'aula_criada',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO']
  }),

  aula_cancelada: (nomeTurma: string, data: string): NotificacaoTemplate => ({
    titulo: 'Aula cancelada',
    mensagem: `A aula de ${nomeTurma} agendada para ${data} foi cancelada.`,
    tipo: 'warning',
    categoria: 'aula_cancelada',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO']
  }),

  aula_modificada: (nomeTurma: string, detalhes: string): NotificacaoTemplate => ({
    titulo: 'Aula modificada',
    mensagem: `A aula ${nomeTurma} teve suas informações atualizadas: ${detalhes}`,
    tipo: 'info',
    categoria: 'aula_modificada',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO']
  }),

  turma_nova: (nomeTurma: string, professor: string): NotificacaoTemplate => ({
    titulo: 'Nova turma criada',
    mensagem: `A turma ${nomeTurma} foi criada com ${professor} como professor.`,
    tipo: 'success',
    categoria: 'turma_criada',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR']
  }),

  // INSCRIÇÕES
  inscricao_confirmada: (nomeAula: string): NotificacaoTemplate => ({
    titulo: 'Inscrição confirmada',
    mensagem: `Você foi inscrito com sucesso em ${nomeAula}!`,
    tipo: 'success',
    categoria: 'inscricao_confirmada',
    perfisAplicaveis: ['ALUNO']
  }),

  inscricao_aluno_novo: (nomeAluno: string, nomeTurma: string): NotificacaoTemplate => ({
    titulo: 'Novo aluno inscrito',
    mensagem: `${nomeAluno} se inscreveu em ${nomeTurma}.`,
    tipo: 'info',
    categoria: 'inscricao_confirmada',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR']
  }),

  inscricao_cancelada: (nomeAula: string): NotificacaoTemplate => ({
    titulo: 'Inscrição cancelada',
    mensagem: `Sua inscrição em ${nomeAula} foi cancelada.`,
    tipo: 'warning',
    categoria: 'inscricao_cancelada',
    perfisAplicaveis: ['ALUNO']
  }),

  // PRESENÇAS
  presenca_registrada: (nomeAula: string, status: 'presente' | 'ausente'): NotificacaoTemplate => ({
    titulo: `Presença registrada - ${status === 'presente' ? 'Presente' : 'Ausente'}`,
    mensagem: `Sua presença foi registrada como ${status === 'presente' ? 'presente' : 'ausente'} em ${nomeAula}.`,
    tipo: status === 'presente' ? 'success' : 'warning',
    categoria: 'presenca_registrada',
    perfisAplicaveis: ['ALUNO']
  }),

  presenca_alunos_registrada: (nomeAula: string, quantidade: number): NotificacaoTemplate => ({
    titulo: 'Presenças registradas',
    mensagem: `Presença de ${quantidade} aluno(s) foi registrada para ${nomeAula}.`,
    tipo: 'info',
    categoria: 'presenca_registrada',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR']
  }),

  // ALUNOS
  aluno_promovido: (nomeAluno: string, faixaAntiga: string, faixaNova: string): NotificacaoTemplate => ({
    titulo: 'Aluno promovido',
    mensagem: `${nomeAluno} foi promovido de ${faixaAntiga} para ${faixaNova}! Parabéns!`,
    tipo: 'success',
    categoria: 'aluno_promovido',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO']
  }),

  // MENORES DE IDADE
  menor_pendente_responsavel: (nomeAluno: string): NotificacaoTemplate => ({
    titulo: 'Menor de idade sem responsável vinculado',
    mensagem: `${nomeAluno} é menor de idade e ainda não tem responsável legal vinculado ao sistema.`,
    tipo: 'warning',
    categoria: 'menor_pendente',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR']
  }),

  responsavel_vinculado: (nomeAluno: string, nomeResponsavel: string): NotificacaoTemplate => ({
    titulo: 'Responsável vinculado',
    mensagem: `${nomeResponsavel} foi vinculado como responsável de ${nomeAluno}.`,
    tipo: 'success',
    categoria: 'responsavel_vinculado',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'RESPONSAVEL']
  }),

  // PROFESSORES
  professor_atribuido: (nomeProfessor: string, nomeTurma: string): NotificacaoTemplate => ({
    titulo: 'Novo professor atribuído',
    mensagem: `${nomeProfessor} foi atribuído como professor de ${nomeTurma}.`,
    tipo: 'info',
    categoria: 'professor_atribuido',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR']
  }),

  // SISTEMA
  sistema_manutencao: (descricao: string): NotificacaoTemplate => ({
    titulo: 'Manutenção do sistema',
    mensagem: descricao,
    tipo: 'warning',
    categoria: 'sistema',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL']
  }),

  sistema_mensagem: (titulo: string, mensagem: string): NotificacaoTemplate => ({
    titulo,
    mensagem,
    tipo: 'info',
    categoria: 'sistema',
    perfisAplicaveis: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL']
  })
}

/**
 * Função helper para obter notificações aplicáveis para um perfil específico
 */
export const filtrarNotificacoesPorPerfil = (
  notificacoes: NotificacaoTemplate[],
  perfil: string
): NotificacaoTemplate[] => {
  return notificacoes.filter((n) => n.perfisAplicaveis.includes(perfil))
}

/**
 * Função helper para formatação de datas em notificações
 */
export const formatarDataNotificacao = (data: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(data)
}
