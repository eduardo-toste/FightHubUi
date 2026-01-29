import api from '../lib/apiClient';

export interface ResponsavelResponse {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  dataNascimento: string;
}

export interface EnderecoResponse {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface AlunoResponsavelResponse {
  id: string;
  nome: string;
  email: string;
  cpf: string;
}

export interface ResponsavelDetalhadoResponse {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  foto?: string;
  endereco?: EnderecoResponse;
  alunos?: AlunoResponsavelResponse[];
}

export interface CriarResponsavelRequest {
  nome: string;
  email: string;
  cpf: string;
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

  // Criar novo responsável
  criar: async (responsavel: CriarResponsavelRequest) => {
    await api.post('/responsaveis', responsavel);
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

  // Obter meus dependentes (responsável autenticado)
  obterMeusDependentes: async (): Promise<AlunoResponsavelResponse[]> => {
    const res = await api.get('/responsaveis/me');
    const responsavel = res.data as ResponsavelDetalhadoResponse;
    return responsavel.alunos || [];
  },

  // Obter inscrições dos dependentes
  obterInscricoesDependentes: async () => {
    const res = await api.get('/responsaveis/me/inscricoes');
    return res.data;
  },
};
