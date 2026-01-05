import { DashboardResponse } from '../types';

const data: DashboardResponse = {
  alunos: {
    ativos: 120,
    inativos: 12,
    novos30dias: 8,
    idadeMedia: 28,
  },
  turmas: {
    ativas: 8,
    inativas: 2,
    ocupacaoMedia: 0.75,
    porcentagemLotadas: 0.2,
    mediaAlunosPorAula: 12,
  },
  engajamento: {
    aulasPrevistas: 40,
    realizadas: 36,
    canceladas: 2,
    presenciaMediaGeral: 0.82,
    presenciaPorTurma: [0.9, 0.8, 0.7],
    top5MaisFaltas: [],
  },
};

export default {
  getDashboard: async (): Promise<DashboardResponse> => {
    // simulate network
    await new Promise((r) => setTimeout(r, 400));
    return data;
  },
};
