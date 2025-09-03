// Interface para o formulário de cadastro (usando strings para datas nos inputs)
export interface FormularioFichaCadastro {
  aluno: {
    nome_aluno: string;
    sobrenome_aluno: string;
    data_nascimento_aluno: string;
    cpf_aluno: string;
    rg_aluno: string;
    naturalidade_aluno: string;
    endereco_aluno: string;
    bairro_aluno: string;
    cep_aluno: string;
    religiao_id: string;
  };
  certidao: {
    livro_certidao: string;
    matricula_certidao: string;
    termo_certidao: string;
    folha_certidao: string;
    data_expedicao_certidao: string;
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
    parentesco_id: string;
  }>;
  dados_saude: {
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
    outros_diagnosticos: string;
  };
  matricula: {
    turma_id: string;
    ano_letivo_id: string;
    data_matricula: string;
  };
}
