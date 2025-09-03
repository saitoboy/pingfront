// ===== TIPOS DE RESPOSTA DA API =====

export interface ApiResponse<T> {
  status: 'sucesso' | 'erro';
  mensagem: string;
  dados?: T;
  meta?: {
    total: number;
    pagina_atual: number;
    por_pagina: number;
    total_paginas: number;
  };
  codigo?: string;
  detalhes?: Record<string, string[]>;
}

// ===== AUTENTICAÇÃO =====

export interface Usuario {
  id: number;
  email: string;
  tipo: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

// ===== ALUNO =====

export interface Aluno {
  id: number;
  nome: string;
  data_nascimento: Date | string;
  cpf?: string;
  rg?: string;
  sexo: 'M' | 'F';
  endereco: string;
  telefone?: string;
  email?: string;
  nome_mae: string;
  nome_pai?: string;
  religiao_id?: number;
  certidao_id?: number;
  dados_saude_id?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

// ===== PROFESSOR =====

export interface Professor {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  especialidade?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

// ===== TURMA =====

export interface Turma {
  id: number;
  nome: string;
  ano_letivo: number;
  serie: string;
  turno: 'matutino' | 'vespertino' | 'noturno';
  capacidade_maxima: number;
  created_at: Date | string;
  updated_at: Date | string;
}

// ===== DISCIPLINA =====

export interface Disciplina {
  id: number;
  nome: string;
  carga_horaria: number;
  descricao?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

// ===== MATRÍCULA =====

export interface Matricula {
  id: number;
  aluno_id: number;
  turma_id: number;
  ano_letivo: number;
  status: 'ativa' | 'inativa' | 'transferida';
  data_matricula: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}

// ===== NOTA =====

export interface Nota {
  id: number;
  aluno_id: number;
  disciplina_id: number;
  bimestre: number;
  nota: number;
  tipo: 'prova' | 'trabalho' | 'participacao';
  data_lancamento: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}

// ===== FREQUÊNCIA =====

export interface Frequencia {
  id: number;
  aluno_id: number;
  disciplina_id: number;
  data_aula: Date | string;
  presente: boolean;
  justificativa?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

// ===== BOLETIM =====

export interface Boletim {
  id: number;
  matricula_id: number;
  bimestre: number;
  ano_letivo: number;
  disciplinas: BoletimDisciplina[];
  created_at: Date | string;
  updated_at: Date | string;
}

export interface BoletimDisciplina {
  disciplina_id: number;
  disciplina_nome: string;
  nota: number;
  frequencia: number;
  situacao: 'Aprovado' | 'Reprovado' | 'Recuperação';
}

// ===== HISTÓRICO ESCOLAR (Módulo Principal) =====

export interface HistoricoEscolar {
  id: number;
  matricula_id: number;
  situacao_final: 'Aprovado' | 'Reprovado' | 'Em Andamento';
  observacoes?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface HistoricoEscolarDisciplina {
  id: number;
  historico_escolar_id: number;
  disciplina_id: number;
  disciplina_nome: string;
  carga_horaria: number;
  media_final: number;
  frequencia_percentual: number;
  situacao: 'Aprovado' | 'Reprovado';
  created_at: Date | string;
  updated_at: Date | string;
}

export interface HistoricoCompleto {
  historico: HistoricoEscolar & {
    aluno_nome: string;
    ano_letivo: number;
    serie_nome: string;
    turma_nome: string;
  };
  disciplinas: HistoricoEscolarDisciplina[];
}

export interface HistoricoRelatorio extends HistoricoCompleto {
  cabecalho: {
    escola: string;
    aluno: string;
    data_geracao: Date | string;
  };
  estatisticas: {
    total_disciplinas: number;
    media_geral: number;
    frequencia_media: number;
    disciplinas_aprovadas: number;
    disciplinas_reprovadas: number;
  };
}

// ===== FILTROS E UTILITÁRIOS =====

export interface FiltrosListagem {
  pagina?: number;
  limite?: number;
  busca?: string;
  ordenar?: string;
  direcao?: 'asc' | 'desc';
}
