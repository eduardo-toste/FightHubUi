import api from '../lib/apiClient';

export interface ResponsavelResponse {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  dataNascimento: string;
}

export const responsaveisApi = {
  // Listar todos os responsáveis com paginação
  listar: async (page: number = 0, size: number = 10) => {
    const res = await api.get('/responsaveis', {
      params: { page, size },
    });
    return res.data;
  },

  // Obter responsável por ID
  buscarPorId: async (id: string) => {
    const res = await api.get(`/responsaveis/${id}`);
    return res.data;
  },

  // Vincular aluno ao responsável
  vincularAluno: async (responsavelId: string, alunoId: string) => {
    const res = await api.patch(
      `/responsaveis/${responsavelId}/alunos/${alunoId}`
    );
    return res.data;
  },

  // Desvincula aluno do responsável
  desvinculaAluno: async (responsavelId: string, alunoId: string) => {
    const res = await api.delete(
      `/responsaveis/${responsavelId}/alunos/${alunoId}`
    );
    return res.data;
  },
};
