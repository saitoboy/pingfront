import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  SkipForward
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { validators } from '../../lib/utils'
import { cadastroService } from '../../services/cadastroService'
import type {
  Parentesco,
  Religiao,
  AnoLetivo,
  Serie,
  Turma
} from '../../types/api'
import {
  Step1DadosPessoais,
  Step3Responsaveis,
  Step5Diagnosticos,
  Step6Matricula,
  Step7Revisao
} from './components'
import type { FormularioFichaCadastro } from './types'
import { WIZARD_STEPS } from './types'

export default function FichaCadastroPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formKey, setFormKey] = useState(Date.now())
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(new Set())

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
      religiao_id: '',
      foto_aluno: undefined
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

  const [parentescos, setParentescos] = useState<Parentesco[]>([])
  const [religioes, setReligioes] = useState<Religiao[]>([])
  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true)

  useEffect(() => {
    carregarDadosDropdowns()
  }, [])

  const carregarDadosDropdowns = async () => {
    try {
      setIsLoadingDropdowns(true);

      const dropdownsData = await cadastroService.carregarTodosDropdowns();

      console.log('🔍 Debug dropdownsData:', dropdownsData);

      setReligioes(dropdownsData.religioes);
      setParentescos(dropdownsData.parentescos);
      setAnosLetivos(dropdownsData.anosLetivos);
      setSeries(dropdownsData.series);
      setTurmas(dropdownsData.turmas);

      console.log('✅ Séries carregadas no state:', dropdownsData.series);

    } catch (error) {
      logger.error('❌ Erro ao carregar dados dos dropdowns');
      console.error(error);

      setReligioes([]);
      setParentescos([]);
      setAnosLetivos([]);
      setSeries([]);
      setTurmas([]);
    } finally {
      setIsLoadingDropdowns(false);
    }
  }

  // Mapeamento das etapas do wizard para os steps originais dos componentes
  // Step 1 → Dados Pessoais (Step1DadosPessoais)
  // Step 2 → Responsáveis (Step3Responsaveis)
  // Step 3 → Diagnósticos (Step5Diagnosticos) - opcional
  // Step 4 → Matrícula (Step6Matricula)
  // Step 5 → Revisão (Step7Revisao)

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Dados Pessoais
        return (
          validators.obrigatorio(formData.aluno.nome_aluno) &&
          validators.obrigatorio(formData.aluno.sobrenome_aluno) &&
          validators.obrigatorio(formData.aluno.data_nascimento_aluno) &&
          validators.dataNascimento(formData.aluno.data_nascimento_aluno) &&
          validators.obrigatorio(formData.aluno.cpf_aluno) &&
          validators.cpf(formData.aluno.cpf_aluno)
        )
      case 2: // Responsáveis
        return (
          formData.responsaveis.length > 0 &&
          formData.responsaveis.every(resp =>
            validators.obrigatorio(resp.nome_responsavel) &&
            validators.obrigatorio(resp.sobrenome_responsavel) &&
            validators.obrigatorio(resp.cpf_responsavel) &&
            validators.cpf(resp.cpf_responsavel) &&
            validators.obrigatorio(resp.telefone_responsavel) &&
            validators.telefone(resp.telefone_responsavel) &&
            validators.obrigatorio(resp.parentesco_id)
          )
        )
      case 3: // Diagnósticos (opcional)
        return true
      case 4: // Matrícula
        return (
          validators.obrigatorio(formData.matricula.turma_id) &&
          validators.obrigatorio(formData.matricula.ano_letivo_id) &&
          validators.obrigatorio(formData.matricula.data_matricula)
        )
      case 5: // Revisão
        return true
      default:
        return false
    }
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= WIZARD_STEPS.length) {
      setCurrentStep(step)
    }
  }

  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      setAttemptedSteps(prev => new Set(prev).add(currentStep))
      logger.warning('Validação falhou no Step ' + currentStep, 'form')
      return
    }

    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetFormulario = () => {
    setFormData({
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
        religiao_id: '',
        foto_aluno: undefined
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

    setFormKey(Date.now())
    setAttemptedSteps(new Set())
  }

  const handleSubmit = async () => {
    if (currentStep !== WIZARD_STEPS.length) return

    setIsLoading(true)
    try {
      logger.info('📝 Processando ficha de cadastro completa...')

      const cleanUuid = (value: string): string | undefined => {
        return value && value.trim() !== '' ? value : undefined
      }

      const dadosCompletos = {
        aluno: {
          ...formData.aluno,
          data_nascimento_aluno: new Date(formData.aluno.data_nascimento_aluno),
          religiao_id: cleanUuid(formData.aluno.religiao_id)
        },
        certidao: {
          ...formData.certidao,
          data_expedicao_certidao: formData.certidao.data_expedicao_certidao
            ? new Date(formData.certidao.data_expedicao_certidao)
            : undefined
        },
        responsaveis: formData.responsaveis.map(resp => ({
          ...resp,
          parentesco_id: cleanUuid(resp.parentesco_id)
        })),
        dados_saude: formData.dados_saude,
        diagnostico: formData.diagnostico,
        matricula: {
          ...formData.matricula,
          data_matricula: new Date(formData.matricula.data_matricula),
          turma_id: cleanUuid(formData.matricula.turma_id),
          ano_letivo_id: cleanUuid(formData.matricula.ano_letivo_id)
        }
      }

      console.log('🔍 Dados preparados para envio:', dadosCompletos)

      const resultado = await cadastroService.processarFichaCadastro(dadosCompletos)

      if (resultado.status === 'sucesso') {
        const raGerado = resultado.dados?.ra_gerado || resultado.dados?.matricula?.ra || 'N/A'
        logger.success(`✅ Ficha de cadastro processada com sucesso! RA: ${raGerado}`)

        resetFormulario()
        setCurrentStep(1)

        setTimeout(() => {
          carregarDadosDropdowns()
        }, 100)

        logger.info('🔄 Formulário resetado e pronto para novo cadastro')

        alert(`🎉 Cadastro realizado com sucesso!\n\nRA gerado: ${raGerado}\n\nO formulário foi limpo e está pronto para um novo cadastro.`)

      } else {
        logger.error(`❌ Erro ao processar ficha: ${resultado.mensagem}`)
        alert(`Erro ao processar cadastro: ${resultado.mensagem}`)
      }

    } catch (error: any) {
      logger.error('❌ Erro inesperado ao processar ficha')
      console.error('Erro completo:', error)
      alert('Erro inesperado ao processar cadastro. Verifique os logs.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderCurrentStep = () => {
    const showErrors = attemptedSteps.has(currentStep)

    switch (currentStep) {
      case 1:
        return (
          <Step1DadosPessoais
            key={`step1-${formKey}`}
            formData={formData}
            setFormData={setFormData}
            showErrors={showErrors}
          />
        )
      case 2:
        return (
          <Step3Responsaveis
            key={`step2-${formKey}`}
            formData={formData}
            setFormData={setFormData}
            parentescos={parentescos}
            isLoadingDropdowns={isLoadingDropdowns}
            showErrors={showErrors}
          />
        )
      case 3:
        return (
          <Step5Diagnosticos
            key={`step3-${formKey}`}
            formData={formData}
            setFormData={setFormData}
            showErrors={showErrors}
          />
        )
      case 4:
        return (
          <Step6Matricula
            key={`step4-${formKey}`}
            formData={formData}
            setFormData={setFormData}
            anosLetivos={anosLetivos}
            series={series}
            turmas={turmas}
            isLoadingDropdowns={isLoadingDropdowns}
            showErrors={showErrors}
          />
        )
      case 5:
        return (
          <Step7Revisao
            key={`step5-${formKey}`}
            formData={formData}
            parentescos={parentescos}
            religioes={religioes}
            anosLetivos={anosLetivos}
            series={series}
            turmas={turmas}
          />
        )
      default:
        return <div>Step não encontrado</div>
    }
  }

  const stepsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (stepsContainerRef.current) {
      const stepElement = stepsContainerRef.current.children[currentStep - 1] as HTMLElement
      if (stepElement) {
        const container = stepsContainerRef.current
        const stepLeft = stepElement.offsetLeft
        const stepWidth = stepElement.offsetWidth
        const containerWidth = container.offsetWidth
        const scrollLeft = stepLeft - (containerWidth / 2) + (stepWidth / 2)

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }, [currentStep])

  const isDiagnosticosStep = currentStep === 3

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Steps Navigation */}
      <div className="mb-8">
        <div
          ref={stepsContainerRef}
          className="
            steps-scroll-container
            flex items-start
            lg:justify-between
            gap-4 sm:gap-6 lg:gap-0
            overflow-x-auto overflow-y-visible
            pb-4
            -mx-4 sm:-mx-6 px-4 sm:px-6
            lg:mx-0 lg:px-0
            scroll-smooth
          "
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center relative flex-shrink-0"
              style={{ minWidth: '80px' }}
            >
              {/* Step Circle */}
              <div
                className={`
                  flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full cursor-pointer transition-all duration-300 mb-2 flex-shrink-0
                  ${currentStep === step.id
                    ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 scale-110'
                    : currentStep > step.id
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }
                `}
                onClick={() => goToStep(step.id)}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  React.createElement(step.icon, {
                    className: "w-5 h-5 sm:w-6 sm:h-6"
                  })
                )}
              </div>

              {/* Step Name */}
              <div className={`
                text-xs sm:text-sm font-medium text-center leading-tight
                ${currentStep === step.id
                  ? 'text-blue-600 font-bold'
                  : currentStep > step.id
                    ? 'text-green-600'
                    : 'text-gray-500'
                }
              `}
              style={{ maxWidth: '90px' }}
              >
                {step.title}
                {step.optional && (
                  <span className="block text-xs font-normal text-gray-400">(Opcional)</span>
                )}
              </div>

              {/* Connector Line - apenas em desktop */}
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={`
                    hidden lg:block absolute top-6 sm:top-7 left-full h-0.5 transition-colors duration-300 -z-10
                    ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                  style={{
                    width: `calc(100% + ${100 / (WIZARD_STEPS.length - 1)}%)`,
                    transform: 'translateX(28px)'
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
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
          {/* Botão "Pular" visível apenas na etapa de Diagnósticos */}
          {isDiagnosticosStep && (
            <button
              onClick={goToNextStep}
              className="flex items-center px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Pular etapa
            </button>
          )}

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
              disabled={currentStep === WIZARD_STEPS.length || (!isDiagnosticosStep && !validateCurrentStep())}
              className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                isDiagnosticosStep || validateCurrentStep()
                  ? 'text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}
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
