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

// ===== ENUMS E TIPOS =====

export type TipoUsuario = 'admin' | 'secretario' | 'professor';

// ===== AUTENTICAÇÃO =====

export interface Usuario {
  usuario_id: string;
  nome_usuario: string;
  email_usuario: string;
  senha_usuario?: string;
  tipo_usuario_id: TipoUsuario;
  created_at: Date;
  updated_at: Date;
}

export interface UsuarioTipo {
  tipo_usuario_id: string;
  nome_tipo: TipoUsuario;
  created_at: Date;
  updated_at: Date;
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
  aluno_id: string;
  nome_aluno: string;
  sobrenome_aluno: string;
  data_nascimento_aluno: Date;
  cpf_aluno: string;
  rg_aluno: string;
  naturalidade_aluno: string;
  endereco_aluno: string;
  bairro_aluno: string;
  cep_aluno: string;
  religiao_id: string;
  certidao_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Religiao {
  religiao_id: string;
  nome_religiao: string;
  created_at: Date;
  updated_at: Date;
}

export interface CertidaoNascimento {
  certidao_id: string;
  livro_certidao: string;
  matricula_certidao: string;
  termo_certidao: string;
  folha_certidao: string;
  data_expedicao_certidao: Date;
  nome_cartorio_certidao: string;
  created_at: Date;
  updated_at: Date;
}

// ===== RESPONSÁVEIS E PARENTESCO =====

export interface Parentesco {
  parentesco_id: string;
  nome_parentesco: string;
  created_at: Date;
  updated_at: Date;
}

export interface Responsavel {
  responsavel_id: string;
  aluno_id: string;
  telefone_responsavel: string;
  nome_responsavel: string;
  sobrenome_responsavel: string;
  rg_responsavel: string;
  cpf_responsavel: string;
  grau_instrucao_responsavel: string;
  email_responsavel: string;
  parentesco_id: string;
  created_at: Date;
  updated_at: Date;
}

// ===== DADOS DE SAÚDE =====

export interface DadosSaude {
  dados_saude_id: string;
  aluno_id: string;
  necessidades_especiais: string;
  vacinas_em_dia: boolean;
  dorme_bem: boolean;
  alimenta_se_bem: boolean;
  uso_sanitario_sozinho: boolean;
  restricao_alimentar: string;
  problema_saude: string;
  alergia_medicamento: string;
  uso_continuo_medicamento: string;
  alergias: string;
  medicacao_febre: string;
  medicacao_dor_cabeca: string;
  medicacao_dor_barriga: string;
  historico_convulsao: boolean;
  perda_esfincter_emocional: boolean;
  frequentou_outra_escola: boolean;
  tipo_parto: string;
  gravidez_tranquila: boolean;
  medicacao_gravidez: string;
  tem_irmaos: boolean;
  fonoaudiologico: boolean;
  psicopedagogico: boolean;
  neurologico: boolean;
  outro_tratamento: string;
  motivo_tratamento: string;
  observacoes: string;
  created_at: Date;
  updated_at: Date;
}

export interface Diagnostico {
  diagnostico_id: string;
  aluno_id: string;
  cegueira: boolean;
  baixa_visao: boolean;
  surdez: boolean;
  deficiencia_auditiva: boolean;
  surdocegueira: boolean;
  deficiencia_fisica: boolean;
  deficiencia_multipla: boolean;
  deficiencia_intelectual: boolean;
  sindrome_down: boolean;
  altas_habilidades: boolean;
  tea: boolean;
  alteracoes_processamento_auditivo: boolean;
  tdah: boolean;
  outros_diagnosticos: string;
  created_at: Date;
  updated_at: Date;
}

// ===== PROFESSOR =====

export interface Professor {
  professor_id: string;
  usuario_id: string;
  created_at: Date;
  updated_at: Date;
}

// ===== ANO LETIVO, SÉRIE E TURMA =====

export interface AnoLetivo {
  ano_letivo_id: string;
  ano: number;
  data_inicio: Date;
  data_fim: Date;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Serie {
  serie_id: string;
  nome_serie: string;
  created_at: Date;
  updated_at: Date;
}

export interface Turma {
  turma_id: string;
  serie_id: string;
  ano_letivo_id: string;
  nome_turma: string;
  turno: string;
  sala: string;
  created_at: Date;
  updated_at: Date;
}

// ===== MATRÍCULA =====

export interface MatriculaAluno {
  matricula_aluno_id: string;
  ra: string;
  aluno_id: string;
  turma_id: string;
  ano_letivo_id: string;
  data_matricula: Date;
  data_saida?: Date;
  motivo_saida?: string;
  status: 'ativo' | 'transferido' | 'concluido' | 'cancelado';
  created_at: Date;
  updated_at: Date;
}

// ===== DISCIPLINAS E AULAS =====

export interface Disciplina {
  disciplina_id: string;
  nome_disciplina: string;
  created_at: Date;
  updated_at: Date;
}

export interface TurmaDisciplinaProfessor {
  turma_disciplina_professor_id: string;
  turma_id: string;
  disciplina_id: string;
  professor_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Aula {
  aula_id: string;
  turma_disciplina_professor_id: string;
  data_aula: Date;
  hora_inicio: string;
  hora_fim: string;
  created_at: Date;
  updated_at: Date;
}

export interface ConteudoAula {
  conteudo_aula_id: string;
  aula_id: string;
  descricao: string;
  conteudo: string;
  created_at: Date;
  updated_at: Date;
}

// ===== AVALIAÇÕES =====

export interface PeriodoLetivo {
  periodo_letivo_id: string;
  bimestre: number;
  ano_letivo_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Atividade {
  atividade_id: string;
  titulo: string;
  descricao: string;
  peso: number;
  vale_nota: boolean;
  periodo_letivo_id: string;
  aula_id: string;
  turma_disciplina_professor_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Nota {
  nota_id: string;
  atividade_id: string;
  matricula_aluno_id: string;
  valor: number;
  created_at: Date;
  updated_at: Date;
}

export interface Frequencia {
  frequencia_id: string;
  aula_id: string;
  matricula_aluno_id: string;
  presenca: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MediaDisciplinaBimestre {
  media_disciplina_bimestre_id: string;
  matricula_aluno_id: string;
  turma_disciplina_professor_id: string;
  periodo_letivo_id: string;
  valor_media: number;
  origem: 'manual' | 'calculada';
  observacao: string;
  created_at: Date;
  updated_at: Date;
}

// ===== BOLETIM =====

export interface Boletim {
  boletim_id: string;
  matricula_aluno_id: string;
  periodo_letivo_id: string;
  observacoes_gerais?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BoletimDisciplina {
  boletim_disciplina_id: string;
  boletim_id: string;
  turma_disciplina_professor_id: string;
  media_bimestre: number;
  faltas_bimestre: number;
  observacoes_disciplina?: string;
  created_at: Date;
  updated_at: Date;
}

// ===== HISTÓRICO ESCOLAR =====

export interface HistoricoEscolar {
  historico_escolar_id: string;
  matricula_aluno_id: string;
  ano_letivo_id: string;
  situacao_final: 'aprovado' | 'reprovado' | 'aprovado_conselho' | 'transferido' | 'em_andamento';
  observacoes_finais?: string;
  data_conclusao?: Date;
  media_geral_anual?: number;
  total_disciplinas_cursadas: number;
  disciplinas_aprovadas: number;
  disciplinas_reprovadas: number;
  created_at: Date;
  updated_at: Date;
}

export interface HistoricoEscolarDisciplina {
  historico_disciplina_id: string;
  historico_escolar_id: string;
  turma_disciplina_professor_id: string;
  media_final_disciplina: number;
  total_faltas_disciplina: number;
  situacao_disciplina: 'aprovado' | 'reprovado' | 'recuperacao' | 'em_andamento';
  observacoes_disciplina?: string;
  created_at: Date;
  updated_at: Date;
}

// ===== FICHA DE CADASTRO COMPLETA =====

export interface FichaCadastroCompleta {
  aluno: {
    nome_aluno: string;
    sobrenome_aluno: string;
    data_nascimento_aluno: Date;
    cpf_aluno: string;
    rg_aluno: string;
    naturalidade_aluno: string;
    endereco_aluno: string;
    bairro_aluno: string;
    cep_aluno: string;
    religiao_id?: string; // Opcional, pode ser undefined se não selecionado
  };
  certidao: {
    livro_certidao: string;
    matricula_certidao: string;
    termo_certidao: string;
    folha_certidao: string;
    data_expedicao_certidao: Date;
    nome_cartorio_certidao: string;
  };
  responsaveis: Array<{
    nome_responsavel: string;
    sobrenome_responsavel: string;
    telefone_responsavel: string;
    rg_responsavel: string;
    cpf_responsavel: string;
    grau_instrucao_responsavel: string;
    email_responsavel: string;
    parentesco_id?: string; // Opcional, pode ser undefined se não selecionado
  }>;
  dados_saude: {
    necessidades_especiais?: string;
    vacinas_em_dia: boolean;
    dorme_bem: boolean;
    alimenta_se_bem: boolean;
    uso_sanitario_sozinho: boolean;
    restricao_alimentar?: string;
    problema_saude?: string;
    alergia_medicamento?: string;
    uso_continuo_medicamento?: string;
    alergias?: string;
    medicacao_febre?: string;
    medicacao_dor_cabeca?: string;
    medicacao_dor_barriga?: string;
    historico_convulsao: boolean;
    perda_esfincter_emocional: boolean;
    frequentou_outra_escola: boolean;
    tipo_parto?: string;
    gravidez_tranquila: boolean;
    medicacao_gravidez?: string;
    tem_irmaos: boolean;
    fonoaudiologico: boolean;
    psicopedagogico: boolean;
    neurologico: boolean;
    outro_tratamento?: string;
    motivo_tratamento?: string;
    observacoes?: string;
  };
  diagnostico: {
    cegueira: boolean;
    baixa_visao: boolean;
    surdez: boolean;
    deficiencia_auditiva: boolean;
    surdocegueira: boolean;
    deficiencia_fisica: boolean;
    deficiencia_multipla: boolean;
    deficiencia_intelectual: boolean;
    sindrome_down: boolean;
    altas_habilidades: boolean;
    tea: boolean;
    alteracoes_processamento_auditivo: boolean;
    tdah: boolean;
    outros_diagnosticos?: string;
  };
  matricula: {
    turma_id?: string; // Opcional, pode ser undefined se não selecionado
    ano_letivo_id?: string; // Opcional, pode ser undefined se não selecionado
    data_matricula: Date;
  };
}

// ===== RESPOSTA DA FICHA DE CADASTRO =====

export interface FichaCadastroResposta {
  aluno: Aluno;
  certidao: CertidaoNascimento;
  responsaveis: Responsavel[];
  dados_saude: DadosSaude;
  diagnostico: Diagnostico;
  matricula: MatriculaAluno;
  ra_gerado: string;
}

// ===== FILTROS E UTILITÁRIOS =====

export interface FiltrosListagem {
  pagina?: number;
  limite?: number;
  busca?: string;
  ordenar?: string;
  direcao?: 'asc' | 'desc';
}
