export type AlunosDashboardResponse = {
  ativos: number;
  inativos: number;
  novos30dias: number;
  idadeMedia: number;
};

export type TurmasDashboardResponse = {
  ativas: number;
  inativas: number;
  ocupacaoMedia: number;
  porcentagemLotadas: number;
  mediaAlunosPorAula: number;
};

export type EngajamentoDashboardResponse = {
  aulasPrevistas: number;
  realizadas: number;
  canceladas: number;
  presenciaMediaGeral: number;
  presenciaPorTurma: number[];
  top5MaisFaltas: Array<{ turma: string; faltas: number }>;
};

export type DashboardResponse = {
  alunos: AlunosDashboardResponse;
  turmas: TurmasDashboardResponse;
  engajamento: EngajamentoDashboardResponse | null;
};

export type AulaItem = {
  id: string;
  title: string;
  date: string;
  turma: string;
  status: 'scheduled' | 'canceled' | 'completed';
};
