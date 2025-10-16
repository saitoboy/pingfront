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
