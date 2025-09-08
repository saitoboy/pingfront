import React from 'react'
import { 
  CheckCircle, 
  User, 
  FileText, 
  Users, 
  Heart, 
  Activity, 
  GraduationCap,
  Edit3
} from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'
import type { Parentesco, Religiao, AnoLetivo, Serie, Turma } from '../../../types/api'

interface Step7Props {
  formData: FormularioFichaCadastro
  parentescos: Parentesco[]
  religioes: Religiao[]
  anosLetivos: AnoLetivo[]
  series: Serie[]
  turmas: Turma[]
}

export const Step7Revisao: React.FC<Step7Props> = ({
  formData,
  parentescos,
  religioes,
  anosLetivos,
  series,
  turmas
}) => {
  // Funções auxiliares para buscar nomes pelos IDs
  const getReligiaoNome = (religiaoId: string) => {
    const religiao = religioes.find(r => r.religiao_id === religiaoId)
    return religiao?.nome_religiao || 'Não informado'
  }

  const getParentescoNome = (parentescoId: string) => {
    const parentesco = parentescos.find(p => p.parentesco_id === parentescoId)
    return parentesco?.nome_parentesco || 'Não informado'
  }

  const getAnoLetivoAno = (anoLetivoId: string) => {
    const anoLetivo = anosLetivos.find(a => a.ano_letivo_id === anoLetivoId)
    return anoLetivo?.ano || 'Não informado'
  }

  const getTurmaNomeCompleto = (turmaId: string) => {
    const turma = turmas.find(t => t.turma_id === turmaId)
    if (!turma) return 'Não informado'
    
    const serie = series.find(s => s.serie_id === turma.serie_id)
    const serieNome = serie?.nome_serie || 'Série não encontrada'
    
    return `${serieNome} ${turma.nome_turma} - ${turma.turno} (Sala: ${turma.sala})`
  }

  // Função para formatar data
  const formatarData = (dataString: string) => {
    if (!dataString) return 'Não informada'
    try {
      const data = new Date(dataString)
      return data.toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  // Função para formatar telefone
  const formatarTelefone = (telefone: string) => {
    if (!telefone) return 'Não informado'
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  // Função para formatar CPF
  const formatarCPF = (cpf: string) => {
    if (!cpf) return 'Não informado'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Função para formatar CEP
  const formatarCEP = (cep: string) => {
    if (!cep) return 'Não informado'
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  return (
    <div className="space-y-6">
      <StepHeader 
        icon={CheckCircle}
        title="Revisão"
        description="Conferir dados antes de salvar"
      />

      {/* Dados Pessoais */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nome Completo</label>
            <p className="text-gray-900">{formData.aluno.nome_aluno} {formData.aluno.sobrenome_aluno}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
            <p className="text-gray-900">{formatarData(formData.aluno.data_nascimento_aluno)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">CPF</label>
            <p className="text-gray-900">{formatarCPF(formData.aluno.cpf_aluno)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">RG</label>
            <p className="text-gray-900">{formData.aluno.rg_aluno || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Naturalidade</label>
            <p className="text-gray-900">{formData.aluno.naturalidade_aluno || 'Não informada'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Religião</label>
            <p className="text-gray-900">{getReligiaoNome(formData.aluno.religiao_id)}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Endereço</label>
            <p className="text-gray-900">{formData.aluno.endereco_aluno}, {formData.aluno.bairro_aluno}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">CEP</label>
            <p className="text-gray-900">{formatarCEP(formData.aluno.cep_aluno)}</p>
          </div>
        </div>
      </div>

      {/* Certidão de Nascimento */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Certidão de Nascimento</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Livro</label>
            <p className="text-gray-900">{formData.certidao.livro_certidao}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Folha</label>
            <p className="text-gray-900">{formData.certidao.folha_certidao}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Termo</label>
            <p className="text-gray-900">{formData.certidao.termo_certidao}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Matrícula</label>
            <p className="text-gray-900">{formData.certidao.matricula_certidao}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Data de Expedição</label>
            <p className="text-gray-900">{formatarData(formData.certidao.data_expedicao_certidao)}</p>
          </div>
          <div className="md:col-span-3">
            <label className="text-sm font-medium text-gray-500">Cartório</label>
            <p className="text-gray-900">{formData.certidao.nome_cartorio_certidao}</p>
          </div>
        </div>
      </div>

      {/* Responsáveis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Responsáveis ({formData.responsaveis.length})</h3>
        </div>
        
        <div className="space-y-6">
          {formData.responsaveis.map((responsavel, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Responsável {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                  <p className="text-gray-900">{responsavel.nome_responsavel} {responsavel.sobrenome_responsavel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CPF</label>
                  <p className="text-gray-900">{formatarCPF(responsavel.cpf_responsavel)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">RG</label>
                  <p className="text-gray-900">{responsavel.rg_responsavel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-gray-900">{formatarTelefone(responsavel.telefone_responsavel)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{responsavel.email_responsavel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Parentesco</label>
                  <p className="text-gray-900">{getParentescoNome(responsavel.parentesco_id)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Grau de Instrução</label>
                  <p className="text-gray-900">{responsavel.grau_instrucao_responsavel || 'Não informado'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dados de Saúde */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Dados de Saúde</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Situação Geral</h4>
            <div className="space-y-1 text-sm">
              <p>Vacinas em dia: <span className="font-medium">{formData.dados_saude.vacinas_em_dia ? 'Sim' : 'Não'}</span></p>
              <p>Dorme bem: <span className="font-medium">{formData.dados_saude.dorme_bem ? 'Sim' : 'Não'}</span></p>
              <p>Alimenta-se bem: <span className="font-medium">{formData.dados_saude.alimenta_se_bem ? 'Sim' : 'Não'}</span></p>
              <p>Usa sanitário sozinho: <span className="font-medium">{formData.dados_saude.uso_sanitario_sozinho ? 'Sim' : 'Não'}</span></p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Condições Especiais</h4>
            <div className="space-y-1 text-sm">
              <p>Histórico de convulsão: <span className="font-medium">{formData.dados_saude.historico_convulsao ? 'Sim' : 'Não'}</span></p>
              <p>Perda esfíncter emocional: <span className="font-medium">{formData.dados_saude.perda_esfincter_emocional ? 'Sim' : 'Não'}</span></p>
              <p>Frequentou outra escola: <span className="font-medium">{formData.dados_saude.frequentou_outra_escola ? 'Sim' : 'Não'}</span></p>
              <p>Gravidez tranquila: <span className="font-medium">{formData.dados_saude.gravidez_tranquila ? 'Sim' : 'Não'}</span></p>
              <p>Tem irmãos: <span className="font-medium">{formData.dados_saude.tem_irmaos ? 'Sim' : 'Não'}</span></p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Tratamentos</h4>
            <div className="space-y-1 text-sm">
              <p>Fonoaudiológico: <span className="font-medium">{formData.dados_saude.fonoaudiologico ? 'Sim' : 'Não'}</span></p>
              <p>Psicopedagógico: <span className="font-medium">{formData.dados_saude.psicopedagogico ? 'Sim' : 'Não'}</span></p>
              <p>Neurológico: <span className="font-medium">{formData.dados_saude.neurologico ? 'Sim' : 'Não'}</span></p>
            </div>
          </div>
        </div>

        {/* Medicações */}
        {(formData.dados_saude.medicacao_febre || 
          formData.dados_saude.medicacao_dor_cabeca || 
          formData.dados_saude.medicacao_dor_barriga ||
          formData.dados_saude.alergia_medicamento ||
          formData.dados_saude.uso_continuo_medicamento ||
          formData.dados_saude.alergias ||
          formData.dados_saude.medicacao_gravidez) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3">Medicações e Alergias</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.dados_saude.medicacao_febre && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Medicação para Febre</label>
                  <p className="text-gray-900">{formData.dados_saude.medicacao_febre}</p>
                </div>
              )}
              {formData.dados_saude.medicacao_dor_cabeca && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Medicação para Dor de Cabeça</label>
                  <p className="text-gray-900">{formData.dados_saude.medicacao_dor_cabeca}</p>
                </div>
              )}
              {formData.dados_saude.medicacao_dor_barriga && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Medicação para Dor de Barriga</label>
                  <p className="text-gray-900">{formData.dados_saude.medicacao_dor_barriga}</p>
                </div>
              )}
              {formData.dados_saude.alergia_medicamento && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Alergia a Medicamentos</label>
                  <p className="text-gray-900">{formData.dados_saude.alergia_medicamento}</p>
                </div>
              )}
              {formData.dados_saude.uso_continuo_medicamento && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Uso Contínuo de Medicamento</label>
                  <p className="text-gray-900">{formData.dados_saude.uso_continuo_medicamento}</p>
                </div>
              )}
              {formData.dados_saude.alergias && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Alergias</label>
                  <p className="text-gray-900">{formData.dados_saude.alergias}</p>
                </div>
              )}
              {formData.dados_saude.medicacao_gravidez && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Medicação na Gravidez</label>
                  <p className="text-gray-900">{formData.dados_saude.medicacao_gravidez}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações sobre parto e tratamentos */}
        {(formData.dados_saude.tipo_parto ||
          formData.dados_saude.outro_tratamento ||
          formData.dados_saude.motivo_tratamento) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3">Informações sobre Parto e Tratamentos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.dados_saude.tipo_parto && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de Parto</label>
                  <p className="text-gray-900">{formData.dados_saude.tipo_parto}</p>
                </div>
              )}
              {formData.dados_saude.outro_tratamento && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Outro Tratamento</label>
                  <p className="text-gray-900">{formData.dados_saude.outro_tratamento}</p>
                </div>
              )}
              {formData.dados_saude.motivo_tratamento && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Motivo do Tratamento</label>
                  <p className="text-gray-900">{formData.dados_saude.motivo_tratamento}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Campos de texto dos dados de saúde */}
        {(formData.dados_saude.necessidades_especiais || 
          formData.dados_saude.restricao_alimentar || 
          formData.dados_saude.problema_saude ||
          formData.dados_saude.observacoes) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3">Informações Gerais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.dados_saude.necessidades_especiais && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Necessidades Especiais</label>
                  <p className="text-gray-900">{formData.dados_saude.necessidades_especiais}</p>
                </div>
              )}
              {formData.dados_saude.restricao_alimentar && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Restrição Alimentar</label>
                  <p className="text-gray-900">{formData.dados_saude.restricao_alimentar}</p>
                </div>
              )}
              {formData.dados_saude.problema_saude && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Problema de Saúde</label>
                  <p className="text-gray-900">{formData.dados_saude.problema_saude}</p>
                </div>
              )}
              {formData.dados_saude.observacoes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Observações</label>
                  <p className="text-gray-900">{formData.dados_saude.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Diagnósticos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Diagnósticos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1 text-sm">
            <p>Cegueira: <span className="font-medium">{formData.diagnostico.cegueira ? 'Sim' : 'Não'}</span></p>
            <p>Baixa visão: <span className="font-medium">{formData.diagnostico.baixa_visao ? 'Sim' : 'Não'}</span></p>
            <p>Surdez: <span className="font-medium">{formData.diagnostico.surdez ? 'Sim' : 'Não'}</span></p>
            <p>Deficiência auditiva: <span className="font-medium">{formData.diagnostico.deficiencia_auditiva ? 'Sim' : 'Não'}</span></p>
            <p>Surdocegueira: <span className="font-medium">{formData.diagnostico.surdocegueira ? 'Sim' : 'Não'}</span></p>
          </div>
          
          <div className="space-y-1 text-sm">
            <p>Deficiência física: <span className="font-medium">{formData.diagnostico.deficiencia_fisica ? 'Sim' : 'Não'}</span></p>
            <p>Deficiência múltipla: <span className="font-medium">{formData.diagnostico.deficiencia_multipla ? 'Sim' : 'Não'}</span></p>
            <p>Deficiência intelectual: <span className="font-medium">{formData.diagnostico.deficiencia_intelectual ? 'Sim' : 'Não'}</span></p>
            <p>Síndrome de Down: <span className="font-medium">{formData.diagnostico.sindrome_down ? 'Sim' : 'Não'}</span></p>
            <p>Altas habilidades: <span className="font-medium">{formData.diagnostico.altas_habilidades ? 'Sim' : 'Não'}</span></p>
          </div>
          
          <div className="space-y-1 text-sm">
            <p>TEA: <span className="font-medium">{formData.diagnostico.tea ? 'Sim' : 'Não'}</span></p>
            <p>Alt. proc. auditivo: <span className="font-medium">{formData.diagnostico.alteracoes_processamento_auditivo ? 'Sim' : 'Não'}</span></p>
            <p>TDAH: <span className="font-medium">{formData.diagnostico.tdah ? 'Sim' : 'Não'}</span></p>
          </div>
        </div>

        {formData.diagnostico.outros_diagnosticos && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-500">Outros Diagnósticos</label>
            <p className="text-gray-900">{formData.diagnostico.outros_diagnosticos}</p>
          </div>
        )}
      </div>

      {/* Matrícula */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Matrícula</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Ano Letivo</label>
            <p className="text-gray-900">{getAnoLetivoAno(formData.matricula.ano_letivo_id)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Turma</label>
            <p className="text-gray-900">{getTurmaNomeCompleto(formData.matricula.turma_id)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Data da Matrícula</label>
            <p className="text-gray-900">{formatarData(formData.matricula.data_matricula)}</p>
          </div>
        </div>
      </div>

      {/* Resumo Final */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Confirmação dos Dados</h4>
            <p className="text-gray-700 mb-4">
              Revise cuidadosamente todas as informações acima. Após clicar em "Finalizar Cadastro", 
              a ficha será processada e o aluno receberá seu Registro de Aluno (RA).
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Edit3 className="h-4 w-4" />
              <span>Utilize os botões de navegação para voltar e editar qualquer informação se necessário.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
