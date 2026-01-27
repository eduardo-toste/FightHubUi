import api from '../lib/apiClient';

export interface AulaResponse {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  turmaId?: string;
  limiteAlunos: number;
  status: 'DISPONIVEL' | 'AGENDADA' | 'PENDENTE' | 'EM_PROGRESSO' | 'CANCELADA' | 'FINALIZADA'
  ativo: boolean;
}

export interface AulaRequest {
  titulo: string;
  descricao: string;
  data: string;
  turmaId?: string;
  limiteAlunos: number;
}

export interface AulaUpdateCompletoRequest {
  titulo: string;
  descricao: string;
  data: string;
  turmaId?: string;
  limiteAlunos: number;
  ativo: boolean;
}

export interface AulaUpdateStatusRequest {
  status: 'DISPONIVEL' | 'AGENDADA' | 'PENDENTE' | 'EM_PROGRESSO' | 'CANCELADA' | 'FINALIZADA'
}

export const aulasApi = {
  // Listar todas as aulas com paginação
  listar: async (page: number = 0, size: number = 10) => {
    const res = await api.get('/aulas', {
      params: { page, size },
    });
    return res.data;
  },

  // Listar aulas disponíveis para o aluno autenticado
  listarAulasAluno: async (page: number = 0, size: number = 10) => {
    const res = await api.get('/aulas/alunos', {
      params: { page, size },
    });
    return res.data;
  },

  // Listar aulas disponíveis para o professor autenticado
  listarAulasProfessor: async (page: number = 0, size: number = 10) => {
    const res = await api.get('/aulas/professores', {
      params: { page, size },
    });
    return res.data;
  },

  // Obter aula por ID
  buscarPorId: async (id: string) => {
    const res = await api.get(`/aulas/${id}`);
    return res.data;
  },

  // Criar nova aula
  criar: async (aula: AulaRequest) => {
    const res = await api.post('/aulas', aula);
    return res.data;
  },

  // Atualizar aula completa
  atualizar: async (id: string, aula: AulaUpdateCompletoRequest) => {
    const res = await api.put(`/aulas/${id}`, aula);
    return res.data;
  },

  // Atualizar apenas status
  atualizarStatus: async (id: string, request: AulaUpdateStatusRequest) => {
    const res = await api.patch(`/aulas/${id}/status`, request);
    return res.data;
  },

  // Vincular turma à aula
  vincularTurma: async (aulaId: string, turmaId: string) => {
    await api.patch(`/aulas/${aulaId}/turmas/${turmaId}`);
  },

  // Desvincular turma da aula
  desvincularTurma: async (aulaId: string, turmaId: string) => {
    await api.delete(`/aulas/${aulaId}/turmas/${turmaId}`);
  },

  // Excluir aula
  excluir: async (id: string) => {
    await api.delete(`/aulas/${id}`);
  },
};
