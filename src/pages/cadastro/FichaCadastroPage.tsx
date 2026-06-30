import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  SkipForward,
  Upload,
  Download,
  X,
  AlertTriangle,
  FileJson
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { validators } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { cadastroService } from '../../services/cadastroService'
import type {
  Parentesco,
  Religiao,
  AnoLetivo,
  Serie,
  Turma,
  FichaLoteAlunoInput,
  FichaLoteResposta
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
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo_usuario_id === 'admin'

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

  // 📦 Upload em lote
  const [showLoteModal, setShowLoteModal] = useState(false)
  const [isLoteLoading, setIsLoteLoading] = useState(false)
  const [loteResultado, setLoteResultado] = useState<FichaLoteResposta | null>(null)
  const [loteErro, setLoteErro] = useState<string | null>(null)
  const [loteAnoLetivo, setLoteAnoLetivo] = useState('')
  const [loteTurma, setLoteTurma] = useState('')
  const loteInputRef = useRef<HTMLInputElement>(null)

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

  // 📦 Campos obrigatórios esperados pelo backend (POST /ficha-cadastro/lote)
  const CAMPOS_LOTE: (keyof FichaLoteAlunoInput)[] = [
    'nome_aluno', 'sobrenome_aluno', 'data_nascimento_aluno',
    'cpf_aluno', 'rg_aluno', 'naturalidade_aluno',
    'endereco_aluno', 'bairro_aluno', 'cep_aluno'
  ]

  const abrirLoteModal = () => {
    setLoteResultado(null)
    setLoteErro(null)
    setLoteAnoLetivo('')
    setLoteTurma('')
    setShowLoteModal(true)
  }

  const baixarTemplateLote = () => {
    const template: FichaLoteAlunoInput[] = [
      {
        nome_aluno: 'João',
        sobrenome_aluno: 'da Silva',
        data_nascimento_aluno: '2015-03-10',
        cpf_aluno: '12345678901',
        rg_aluno: '1234567',
        naturalidade_aluno: 'São Paulo',
        endereco_aluno: 'Rua das Flores, 123',
        bairro_aluno: 'Centro',
        cep_aluno: '12345678'
      }
    ]
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo-alunos-lote.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleArquivoLote = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (loteInputRef.current) loteInputRef.current.value = ''
    if (!arquivo) return

    if (!loteAnoLetivo || !loteTurma) {
      setLoteErro('Selecione o ano letivo e a turma antes de enviar o arquivo.')
      return
    }

    setLoteErro(null)
    setLoteResultado(null)

    let parsed: unknown
    try {
      const texto = await arquivo.text()
      parsed = JSON.parse(texto)
    } catch {
      setLoteErro('Arquivo não é um JSON válido.')
      return
    }

    // Aceita array direto ou objeto { alunos: [...] }
    const lista = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as any)?.alunos)
        ? (parsed as any).alunos
        : null

    if (!lista) {
      setLoteErro('JSON deve ser um array de alunos ou { "alunos": [...] }.')
      return
    }
    if (lista.length === 0) {
      setLoteErro('Lista de alunos vazia.')
      return
    }
    if (lista.length > 100) {
      setLoteErro(`Máximo 100 alunos por lote. Arquivo tem ${lista.length}.`)
      return
    }

    const errosLocais: string[] = []
    lista.forEach((aluno: any, i: number) => {
      const faltando = CAMPOS_LOTE.filter(c => !aluno?.[c])
      if (faltando.length > 0) {
        errosLocais.push(`Linha ${i + 1}: faltando ${faltando.join(', ')}`)
      }
    })
    if (errosLocais.length > 0) {
      setLoteErro(`Campos obrigatórios faltando:\n${errosLocais.slice(0, 10).join('\n')}${errosLocais.length > 10 ? `\n... +${errosLocais.length - 10}` : ''}`)
      return
    }

    setIsLoteLoading(true)
    try {
      logger.info(`📦 Importando ${lista.length} aluno(s) em lote...`)
      const resp = await cadastroService.processarFichasLote({
        turma_id: loteTurma,
        ano_letivo_id: loteAnoLetivo,
        alunos: lista as FichaLoteAlunoInput[]
      })

      if (resp.dados) {
        setLoteResultado(resp.dados)
      } else {
        setLoteErro(resp.mensagem || 'Erro ao processar lote.')
      }
    } catch (error: any) {
      logger.error('❌ Erro inesperado no upload em lote')
      console.error(error)
      setLoteErro('Erro inesperado ao processar lote. Verifique os logs.')
    } finally {
      setIsLoteLoading(false)
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
      {/* Header: ação de importação em lote — somente ADMIN */}
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <button
            onClick={abrirLoteModal}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar alunos em lote (JSON)
          </button>
        </div>
      )}

      {/* Modal de importação em lote */}
      {isAdmin && showLoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <FileJson className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">Importar alunos em lote</h2>
              </div>
              <button
                onClick={() => setShowLoteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Seleção de ano letivo e turma */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ano Letivo <span className="text-red-500">*</span></label>
                  <select
                    value={loteAnoLetivo}
                    onChange={e => setLoteAnoLetivo(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {anosLetivos.map(a => (
                      <option key={a.ano_letivo_id} value={a.ano_letivo_id}>{a.ano}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Turma <span className="text-red-500">*</span></label>
                  <select
                    value={loteTurma}
                    onChange={e => setLoteTurma(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {[...turmas]
                      .sort((a, b) => {
                        const sA = series.find(s => s.serie_id === a.serie_id)?.nome_serie ?? ''
                        const sB = series.find(s => s.serie_id === b.serie_id)?.nome_serie ?? ''
                        if (sA !== sB) return sA.localeCompare(sB, 'pt-BR', { numeric: true })
                        return a.nome_turma.localeCompare(b.nome_turma, 'pt-BR', { numeric: true })
                      })
                      .map(t => {
                        const serie = series.find(s => s.serie_id === t.serie_id)
                        const id = t.nome_turma.trim().split(/\s+/).pop() || t.nome_turma
                        const label = [serie?.nome_serie, `Turma ${id}`, `(${t.turno})`].filter(Boolean).join(' - ')
                        return (
                          <option key={t.turma_id} value={t.turma_id}>{label}</option>
                        )
                      })
                    }
                  </select>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Envie um arquivo <strong>.json</strong> com um array de alunos. Máximo de{' '}
                <strong>100</strong> por arquivo. Campos obrigatórios por aluno:
              </p>
              <div className="flex flex-wrap gap-1">
                {CAMPOS_LOTE.map(c => (
                  <span key={String(c)} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {String(c)}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={baixarTemplateLote}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar modelo
                </button>

                <button
                  onClick={() => loteInputRef.current?.click()}
                  disabled={isLoteLoading || !loteAnoLetivo || !loteTurma}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar arquivo JSON
                    </>
                  )}
                </button>

                <input
                  ref={loteInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleArquivoLote}
                  className="hidden"
                />
              </div>

              {!loteAnoLetivo || !loteTurma ? (
                <p className="text-xs text-amber-600">Selecione ano letivo e turma para habilitar o upload.</p>
              ) : null}

              {/* Erro de validação/parse */}
              {loteErro && (
                <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <pre className="text-sm text-red-700 whitespace-pre-wrap font-sans">{loteErro}</pre>
                </div>
              )}

              {/* Resultado do processamento */}
              {loteResultado && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-700">{loteResultado.criados.length}</div>
                      <div className="text-xs text-green-600">Importados</div>
                    </div>
                    <div className="flex-1 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-700">{loteResultado.falhas.length}</div>
                      <div className="text-xs text-red-600">Falhas</div>
                    </div>
                  </div>

                  {loteResultado.criados.length > 0 && (
                    <div className="border border-green-200 rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-3 py-2 text-xs font-medium text-green-700 border-b">
                        Alunos importados — RAs gerados
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
                        {loteResultado.criados.map((c) => (
                          <div key={c.aluno_id} className="px-3 py-2 text-sm flex justify-between gap-2">
                            <span className="text-gray-700">{c.nome}</span>
                            <span className="text-green-700 font-mono font-medium">{c.ra}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {loteResultado.falhas.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 border-b">
                        Falhas
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
                        {loteResultado.falhas.map((f, i) => (
                          <div key={i} className="px-3 py-2 text-sm flex justify-between gap-2">
                            <span className="text-gray-600">#{f.indice + 1} · {f.nome}</span>
                            <span className="text-red-600 text-right">{f.motivo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setShowLoteModal(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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
