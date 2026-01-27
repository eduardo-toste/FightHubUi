import api from '../lib/apiClient';

export interface TurmaResponse {
  id: string;
  nome: string;
  horario: string;
  professorId?: string;
  ativo: boolean;
  quantidadeAlunos?: number;
}

export interface TurmaRequest {
  nome: string;
  horario: string;
  professorId?: string;
}

export interface TurmaUpdateCompletoRequest {
  nome: string;
  horario: string;
  professorId?: string;
  ativo: boolean;
}

export interface TurmaUpdateStatusRequest {
  ativo: boolean;
}

export const turmasApi = {
  // Listar todas as turmas com paginação
  listar: async (page: number = 0, size: number = 10) => {
    const res = await api.get('/turmas', {
      params: { page, size },
    });
    return res.data;
  },

  // Obter turma por ID
  buscarPorId: async (id: string) => {
    const res = await api.get(`/turmas/${id}`);
    return res.data;
  },

  // Criar nova turma
  criar: async (turma: TurmaRequest) => {
    await api.post('/turmas', turma);
  },

  // Atualizar turma completa
  atualizar: async (id: string, turma: TurmaUpdateCompletoRequest) => {
    const res = await api.put(`/turmas/${id}`, turma);
    return res.data;
  },

  // Atualizar status da turma
  atualizarStatus: async (id: string, status: TurmaUpdateStatusRequest) => {
    const res = await api.patch(`/turmas/${id}/status`, status);
    return res.data;
  },

  // Excluir turma
  excluir: async (id: string) => {
    await api.delete(`/turmas/${id}`);
  },

  // Vincular professor à turma
  vincularProfessor: async (turmaId: string, professorId: string) => {
    const res = await api.patch(`/turmas/${turmaId}/professores/${professorId}`);
    return res.data;
  },

  // Desvincular professor da turma
  desvincularProfessor: async (turmaId: string, professorId: string) => {
    const res = await api.delete(`/turmas/${turmaId}/professores/${professorId}`);
    return res.data;
  },

  // Vincular aluno à turma
  vincularAluno: async (turmaId: string, alunoId: string) => {
    const res = await api.patch(`/turmas/${turmaId}/alunos/${alunoId}`);
    return res.data;
  },

  // Desvincular aluno da turma
  desvincularAluno: async (turmaId: string, alunoId: string) => {
    const res = await api.delete(`/turmas/${turmaId}/alunos/${alunoId}`);
    return res.data;
  },
};
