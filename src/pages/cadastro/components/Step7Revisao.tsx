import React from 'react'
import {
  CheckCircle,
  User,
  Users,
  Activity,
  GraduationCap,
  Edit3
} from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'
import type { Parentesco, AnoLetivo, Serie, Turma } from '../../../types/api'

interface Step7Props {
  formData: FormularioFichaCadastro
  parentescos: Parentesco[]
  religioes: never[]
  anosLetivos: AnoLetivo[]
  series: Serie[]
  turmas: Turma[]
}

export const Step7Revisao: React.FC<Step7Props> = ({
  formData,
  parentescos,
  anosLetivos,
  series,
  turmas
}) => {
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

  const formatarData = (dataString: string) => {
    if (!dataString) return 'Não informada'
    try {
      return new Date(dataString).toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  const formatarTelefone = (telefone: string) => {
    if (!telefone) return 'Não informado'
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const formatarCPF = (cpf: string) => {
    if (!cpf) return 'Não informado'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const temAlgumDiagnostico = Object.entries(formData.diagnostico).some(([key, value]) => {
    if (key === 'outros_diagnosticos') return typeof value === 'string' && value.trim() !== ''
    return value === true
  })

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

        <div className="flex items-start gap-6">
          {/* Foto do aluno */}
          {formData.aluno.foto_aluno && (
            <div className="flex-shrink-0">
              <img
                src={formData.aluno.foto_aluno}
                alt="Foto do aluno"
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-200"
              />
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <p className="text-gray-900">{formatarTelefone(responsavel.telefone_responsavel)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Parentesco</label>
                  <p className="text-gray-900">{getParentescoNome(responsavel.parentesco_id)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnósticos — só exibe se algum estiver marcado */}
      {temAlgumDiagnostico && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Diagnósticos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1 text-sm">
              {formData.diagnostico.cegueira && <p>• Cegueira</p>}
              {formData.diagnostico.baixa_visao && <p>• Baixa Visão</p>}
              {formData.diagnostico.surdez && <p>• Surdez</p>}
              {formData.diagnostico.deficiencia_auditiva && <p>• Deficiência Auditiva</p>}
              {formData.diagnostico.surdocegueira && <p>• Surdocegueira</p>}
              {formData.diagnostico.alteracoes_processamento_auditivo && <p>• Alt. Processamento Auditivo</p>}
            </div>

            <div className="space-y-1 text-sm">
              {formData.diagnostico.deficiencia_fisica && <p>• Deficiência Física</p>}
              {formData.diagnostico.deficiencia_multipla && <p>• Deficiência Múltipla</p>}
              {formData.diagnostico.deficiencia_intelectual && <p>• Deficiência Intelectual</p>}
              {formData.diagnostico.sindrome_down && <p>• Síndrome de Down</p>}
            </div>

            <div className="space-y-1 text-sm">
              {formData.diagnostico.altas_habilidades && <p>• Altas Habilidades/Superdotação</p>}
              {formData.diagnostico.tea && <p>• TEA</p>}
              {formData.diagnostico.tdah && <p>• TDAH</p>}
            </div>
          </div>

          {formData.diagnostico.outros_diagnosticos && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-500">Outros Diagnósticos</label>
              <p className="text-gray-900">{formData.diagnostico.outros_diagnosticos}</p>
            </div>
          )}
        </div>
      )}

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
