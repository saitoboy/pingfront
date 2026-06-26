export interface ProfessorComTurmas {
  professor_id: string;
  usuario_id: string;
  nome_usuario: string;
  email_usuario: string;
  turma_id?: string;
  nome_turma?: string;
  turno?: string;
  sala?: string;
  nome_serie?: string;
  disciplina_id?: string;
  nome_disciplina?: string;
  ano?: number;
  ano_letivo_ativo?: boolean;
}

export type StatusRegistroDiario = 'rascunho' | 'concluido';

export interface AnexoRegistro {
  nome: string; // Nome original do arquivo
  tipo: string; // MIME type (ex.: application/pdf, image/png)
  tamanho: number; // Bytes
  dados: string; // Conteúdo em base64 (data URL)
}

export interface RegistroDiario {
  registro_diario_id?: string;
  turma_disciplina_professor_id: string;
  data_aula: string; // YYYY-MM-DD
  resumo: string; // HTML do editor rico — "o que foi feito"
  conteudo_programatico?: string; // HTML
  metodologia?: string;
  recursos?: string[];
  observacoes?: string; // HTML
  fotos?: string[]; // base64
  anexos?: AnexoRegistro[]; // anexos genéricos (imagem, PDF, outros)
  status: StatusRegistroDiario;
  created_at?: string;
  updated_at?: string;
}

// Registro retornado na visão admin (com dados da turma/disciplina embutidos)
export interface RegistroDiarioComDetalhes {
  registro_diario_id: string;
  turma_disciplina_professor_id: string;
  data_aula: string;
  status: StatusRegistroDiario;
  resumo: string;
  created_at: string;
  updated_at: string;
  nome_disciplina: string;
  nome_turma: string;
  turno: string;
  nome_serie: string;
}
