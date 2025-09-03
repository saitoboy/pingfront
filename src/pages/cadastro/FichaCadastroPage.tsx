import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { cadastroService } from '../../services/cadastroService'
import type { 
  Parentesco, 
  Religiao, 
  AnoLetivo, 
  Turma 
} from '../../types/api'
import {
  Step1DadosPessoais,
  Step2CertidaoNascimento,
  Step3Responsaveis,
  Step4DadosSaude,
  Step5Diagnosticos,
  Step6Matricula,
  Step7Revisao
} from './components'
import type { FormularioFichaCadastro } from './types'
import { WIZARD_STEPS } from './types'

export default function FichaCadastroPage() {
  // Estado do wizard
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Estado principal do formulário
  const [formData, setFormData] = useState<FormularioFichaCadastro>({
    aluno: {
      nome_aluno: '',
      sobrenome_aluno: '',
      data_nascimento_aluno: '',
      cpf_aluno: '',
      rg_aluno: '',
      naturalidade_aluno: '',
      endereco_aluno: '',
      bairro_aluno: '',
      cep_aluno: '',
      religiao_id: ''
    },
    certidao: {
      livro_certidao: '',
      matricula_certidao: '',
      termo_certidao: '',
      folha_certidao: '',
      data_expedicao_certidao: '',
      nome_cartorio_certidao: ''
    },
    responsaveis: [{
      nome_responsavel: '',
      sobrenome_responsavel: '',
      telefone_responsavel: '',
      rg_responsavel: '',
      cpf_responsavel: '',
      grau_instrucao_responsavel: '',
      email_responsavel: '',
      parentesco_id: ''
    }],
    dados_saude: {
      necessidades_especiais: '',
      vacinas_em_dia: false,
      dorme_bem: false,
      alimenta_se_bem: false,
      uso_sanitario_sozinho: false,
      restricao_alimentar: '',
      problema_saude: '',
      alergia_medicamento: '',
      uso_continuo_medicamento: '',
      alergias: '',
      medicacao_febre: '',
      medicacao_dor_cabeca: '',
      medicacao_dor_barriga: '',
      historico_convulsao: false,
      perda_esfincter_emocional: false,
      frequentou_outra_escola: false,
      tipo_parto: '',
      gravidez_tranquila: false,
      medicacao_gravidez: '',
      tem_irmaos: false,
      fonoaudiologico: false,
      psicopedagogico: false,
      neurologico: false,
      outro_tratamento: '',
      motivo_tratamento: '',
      observacoes: ''
    },
    diagnostico: {
      cegueira: false,
      baixa_visao: false,
      surdez: false,
      deficiencia_auditiva: false,
      surdocegueira: false,
      deficiencia_fisica: false,
      deficiencia_multipla: false,
      deficiencia_intelectual: false,
      sindrome_down: false,
      altas_habilidades: false,
      tea: false,
      alteracoes_processamento_auditivo: false,
      tdah: false,
      outros_diagnosticos: ''
    },
    matricula: {
      turma_id: '',
      ano_letivo_id: '',
      data_matricula: new Date().toISOString().split('T')[0]
    }
  })

  // Estados para dropdowns
  const [parentescos, setParentescos] = useState<Parentesco[]>([])
  const [religioes, setReligioes] = useState<Religiao[]>([])
  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true)

  // Carregar dados dos dropdowns
  useEffect(() => {
    carregarDadosDropdowns()
  }, [])

  const carregarDadosDropdowns = async () => {
    try {
      setIsLoadingDropdowns(true);
      
      const dropdownsData = await cadastroService.carregarTodosDropdowns();
      
      // Definir os estados com os dados carregados
      setReligioes(dropdownsData.religioes);
      setParentescos(dropdownsData.parentescos);
      setAnosLetivos(dropdownsData.anosLetivos);
      setTurmas(dropdownsData.turmas);
      
    } catch (error) {
      logger.error('❌ Erro ao carregar dados dos dropdowns');
      console.error(error);
      
      // Limpar todos os arrays em caso de erro
      setReligioes([]);
      setParentescos([]);
      setAnosLetivos([]);
      setTurmas([]);
    } finally {
      setIsLoadingDropdowns(false);
    }
  }

  // Navegação do wizard
  const goToStep = (step: number) => {
    if (step >= 1 && step <= WIZARD_STEPS.length) {
      setCurrentStep(step)
    }
  }

  const goToNextStep = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Submissão final
  const handleSubmit = async () => {
    if (currentStep !== 7) return

    setIsLoading(true)
    try {
      logger.info('📝 Processando ficha de cadastro completa...')

      // Preparar dados para envio
      const dadosCompletos = {
        aluno: {
          ...formData.aluno,
          data_nascimento_aluno: new Date(formData.aluno.data_nascimento_aluno)
        },
        certidao: {
          ...formData.certidao,
          data_expedicao_certidao: new Date(formData.certidao.data_expedicao_certidao)
        },
        responsaveis: formData.responsaveis,
        dados_saude: formData.dados_saude,
        diagnostico: formData.diagnostico,
        matricula: {
          ...formData.matricula,
          data_matricula: new Date(formData.matricula.data_matricula)
        }
      }

      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Dados enviados:', dadosCompletos)

      logger.success('✅ Ficha de cadastro processada com sucesso! RA: 2025001')
    } catch (error) {
      logger.error('❌ Erro ao processar ficha')
    } finally {
      setIsLoading(false)
    }
  }

  // Render do step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1DadosPessoais 
            formData={formData} 
            setFormData={setFormData} 
            religioes={religioes} 
            isLoadingDropdowns={isLoadingDropdowns} 
          />
        )
      case 2:
        return (
          <Step2CertidaoNascimento 
            formData={formData} 
            setFormData={setFormData} 
          />
        )
      case 3:
        return (
          <Step3Responsaveis 
            formData={formData}
            setFormData={setFormData}
            parentescos={parentescos}
            isLoadingDropdowns={isLoadingDropdowns}
          />
        )
      case 4:
        return (
          <Step4DadosSaude 
            formData={formData} 
            setFormData={setFormData} 
          />
        )
      case 5:
        return (
          <Step5Diagnosticos 
            formData={formData} 
            setFormData={setFormData} 
          />
        )
      case 6:
        return (
          <Step6Matricula 
            formData={formData}
            setFormData={setFormData}
            anosLetivos={anosLetivos}
            turmas={turmas}
            isLoadingDropdowns={isLoadingDropdowns}
          />
        )
      case 7:
        return (
          <Step7Revisao 
            formData={formData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )
      default:
        return <div>Step não encontrado</div>
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Steps Navigation - Ícones com nomes embaixo */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          {WIZARD_STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Step Circle */}
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-300 mb-2
                  ${currentStep === step.id 
                    ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' 
                    : currentStep > step.id 
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }
                `}
                onClick={() => goToStep(step.id)}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  React.createElement(step.icon, {
                    className: "w-5 h-5"
                  })
                )}
              </div>
              
              {/* Step Name */}
              <div className={`text-xs font-medium text-center max-w-20 leading-tight ${
                currentStep === step.id 
                  ? 'text-blue-600' 
                  : currentStep > step.id
                    ? 'text-green-600'
                    : 'text-gray-500'
              }`}>
                {step.title}
              </div>

              {/* Connector Line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div 
                  className={`
                    absolute top-5 left-full w-full h-0.5 transition-colors duration-300 -z-10
                    ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                  style={{ 
                    width: `calc(100% + ${100 / (WIZARD_STEPS.length - 1)}%)`,
                    transform: 'translateX(20px)'
                  }} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar - Embaixo dos ícones */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2 relative overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${(currentStep / WIZARD_STEPS.length) * 100}%` 
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">Início</span>
            <span className="text-xs font-medium text-gray-600">
              {currentStep} de {WIZARD_STEPS.length}
            </span>
            <span className="text-xs text-gray-500">Finalizar</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8 min-h-[500px]">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={goToPrevStep}
          disabled={currentStep === 1}
          className="flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </button>

        <div className="flex space-x-3">
          {currentStep === WIZARD_STEPS.length ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center px-8 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar Cadastro
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goToNextStep}
              disabled={currentStep === WIZARD_STEPS.length}
              className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
