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

// ============================================
// USUARIO TYPES
// ============================================
export type Role = 'ADMIN' | 'PROFESSOR' | 'ALUNO' | 'RESPONSAVEL' | 'COORDENADOR';

export interface EnderecoResponse {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface UsuarioResponse {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  role: Role;
  ativo: boolean;
}

export interface UsuarioDetalhadoResponse {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  foto?: string;
  role: Role;
  loginSocial: boolean;
  ativo: boolean;
  endereco?: EnderecoResponse;
}

export interface UpdateRoleRequest {
  role: Role;
}

export interface UpdateStatusRequest {
  usuarioAtivo: boolean;
}

export interface UsuarioUpdateCompletoRequest {
  nome: string;
  email: string;
  foto?: string;
  telefone?: string;
  cpf: string;
  endereco?: EnderecoResponse;
  role: Role;
  ativo: boolean;
}

export interface UsuarioUpdateParcialRequest {
  nome?: string;
  email?: string;
  foto?: string;
  telefone?: string;
  cpf?: string;
  endereco?: EnderecoResponse;
  role?: Role;
  ativo?: boolean;
}

export interface UpdateSenhaRequest {
  senhaAtual: string;
  senhaNova: string;
}

export interface PagedUsuarioResponse {
  content: UsuarioResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ============================================
// ALUNO TYPES
// ============================================
export interface AlunoResponse {
  id: string
  nome: string
  email: string
  telefone?: string
  foto?: string
  dataNascimento: string
  dataMatricula: string
  matriculaAtiva: boolean
  graduacaoAluno?: {
    belt: string
    level?: string
  }
}

export interface AlunoDetalhadoResponse {
  id: string
  nome: string
  email: string
  telefone?: string
  foto?: string
  dataNascimento: string
  dataMatricula: string
  matriculaAtiva: boolean
  graduacaoAluno?: {
    belt: string
    level?: string
  }
  endereco?: EnderecoResponse
  responsaveis: ResponsavelResumoResponse[]
}

export interface ResponsavelResumoResponse {
  id: string
  nome: string
  email: string
}

export interface CriarAlunoRequest {
  nome: string
  email: string
  cpf: string
  dataNascimento: string
  idsResponsaveis?: string[]
}

export interface AlunoUpdateMatriculaRequest {
  matriculaAtiva: boolean
}

export interface AlunoUpdateDataNascimentoRequest {
  dataNascimento: string
}

export interface AlunoUpdateDataMatriculaRequest {
  dataMatricula: string
}

export interface GraduacaoAlunoResponse {
  id: string
  faixa: string
  dataPromocao: string
  observacoes?: string
}

// ============================================
// TURMA TYPES
// ============================================
export interface TurmaResponse {
  id: string
  nome: string
  descricao?: string
  horario: string
  diasSemana: string[]
  capacidadeMaxima: number
  faixaMinima: string
  faixaMaxima: string
  ativa: boolean
  professorNome?: string
  totalAlunos: number
}

// ============================================
// RESPONSAVEL TYPES
// ============================================
export interface ResponsavelResponse {
  id: string
  nomeCompleto: string
  email: string
  cpf: string
  telefone?: string
  parentesco?: string
}

// ============================================
// ENDERECO TYPES
// ============================================
export interface EnderecoResponse {
  id: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface EnderecoRequest {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

// ============================================
// PAGINATION TYPES
// ============================================
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}
