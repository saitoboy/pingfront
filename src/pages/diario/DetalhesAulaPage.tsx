import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Calendar, 
  Clock,
  Plus,
  Save,
  X,
  FileText,
  Trash2,
  Users,
  ClipboardList,
  Eye,
  Star,
  UserCheck,
  ArrowLeft
} from 'lucide-react'
import { logger } from '../../lib/logger'
import conteudoAulaService from '../../services/conteudoAulaService'
import frequenciaService from '../../services/frequenciaService'
import atividadeService, { type Atividade } from '../../services/atividadeService'
import periodoLetivoService from '../../services/periodoLetivoService'
import { aulaService } from '../../services/aulaService'
import type { AlunoFrequencia } from '../../services/frequenciaService'

interface Aula {
  aula_id?: string
  turma_disciplina_professor_id: string
  data_aula: string
  hora_inicio: string
  hora_fim: string
  created_at?: string
  updated_at?: string
}


interface ConteudoAula {
  conteudo_aula_id?: string
  aula_id: string
  descricao: string
  conteudo: string
  created_at?: string
  updated_at?: string
}

export default function DetalhesAulaPage() {
  const { aulaId } = useParams<{ aulaId: string }>()
  const navigate = useNavigate()
  
  // Estados para dados da aula
  const [aula, setAula] = useState<Aula | null>(null)
  const [turma, setTurma] = useState<any>(null)
  const [disciplina, setDisciplina] = useState<any>(null)
  const [professor, setProfessor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados existentes
  const [conteudos, setConteudos] = useState<ConteudoAula[]>([])
  const [showFormConteudo, setShowFormConteudo] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [conteudoParaExcluir, setConteudoParaExcluir] = useState<ConteudoAula | null>(null)
  const [showModalPresenca, setShowModalPresenca] = useState(false)
  const [alunosTurma, setAlunosTurma] = useState<AlunoFrequencia[]>([])
  const [loadingPresenca, setLoadingPresenca] = useState(false)
  const [salvandoPresenca, setSalvandoPresenca] = useState(false)
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [showFormAtividade, setShowFormAtividade] = useState(false)
  const [showModalAtividade, setShowModalAtividade] = useState(false)
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<Atividade | null>(null)
  const [periodoLetivoAtual, setPeriodoLetivoAtual] = useState<string>('')
  const [formAtividade, setFormAtividade] = useState<Atividade>({
    titulo: '',
    descricao: '',
    peso: 1,
    vale_nota: false,
    periodo_letivo_id: '',
    aula_id: '',
    turma_disciplina_professor_id: ''
  })
  const [formConteudo, setFormConteudo] = useState<ConteudoAula>({
    aula_id: '',
    descricao: '',
    conteudo: ''
  })

  // Carregar dados da aula
  useEffect(() => {
    if (aulaId) {
      carregarDadosAula()
    }
  }, [aulaId])

  // Carregar conteúdos e atividades quando aula estiver disponível
  useEffect(() => {
    if (aula?.aula_id) {
      logger.info('🔄 useEffect executado', 'component')
      logger.info('🔄 Aula ID:', 'component', aula.aula_id)
      carregarConteudos()
      carregarAtividades()
      carregarPeriodoLetivoAtual()
    }
  }, [aula?.aula_id])

  const carregarDadosAula = async () => {
    try {
      setLoading(true)
      logger.info(`📚 Carregando dados da aula: ${aulaId}`, 'component')
      
      // 1. Buscar dados básicos da aula (rota que já funciona)
      const aulaResponse = await aulaService.buscarAulaPorId(aulaId || '')
      
      if (aulaResponse.status !== 'sucesso' || !aulaResponse.dados) {
        throw new Error('Aula não encontrada')
      }
      
      const aula = aulaResponse.dados
      logger.info('📊 Dados da aula obtidos:', 'component', aula)
      
      // 2. Configurar dados da aula
      setAula({
        aula_id: aula.aula_id,
        turma_disciplina_professor_id: aula.turma_disciplina_professor_id,
        data_aula: aula.data_aula,
        hora_inicio: aula.hora_inicio,
        hora_fim: aula.hora_fim,
        created_at: aula.created_at,
        updated_at: aula.updated_at
      })
      
      // 3. Configurar dados simulados da vinculação (turma, disciplina, professor)
      // Como a API de vinculação não existe ainda, vamos usar dados simulados
      logger.info('📊 Configurando dados simulados da vinculação', 'component')
      
      setTurma({
        turma_id: 'temp-turma-id',
        nome_turma: 'Turma A',
        turno: 'Manhã',
        sala: 'Sala 101',
        nome_serie: '1º Ano',
        ano: 2025
      })
      
      setDisciplina({
        disciplina_id: 'temp-disciplina-id',
        nome_disciplina: 'Matemática'
      })
      
      setProfessor({
        professor_id: 'temp-professor-id',
        nome_usuario: 'Professor Teste',
        email_usuario: 'professor@teste.com'
      })
      
      logger.success('✅ Dados simulados da vinculação configurados', 'component')
      
      // 4. Atualizar forms com dados da aula
      setFormAtividade(prev => ({
        ...prev,
        aula_id: aulaId || '',
        turma_disciplina_professor_id: aula.turma_disciplina_professor_id
      }))
      
      setFormConteudo(prev => ({
        ...prev,
        aula_id: aulaId || ''
      }))
      
      logger.success('✅ Dados da aula carregados com sucesso', 'component')
      logger.info('📊 Dados configurados:', 'component', {
        aula: aula.aula_id,
        vinculacao: aula.turma_disciplina_professor_id,
        data: aula.data_aula,
        horario: `${aula.hora_inicio} - ${aula.hora_fim}`
      })
      
    } catch (error) {
      logger.error('❌ Erro ao carregar dados da aula', 'component', error)
      navigate('/diario')
    } finally {
      setLoading(false)
    }
  }


  const carregarConteudos = async () => {
    try {
      if (!aula?.aula_id) return
      logger.info(`📚 Carregando conteúdos da aula: ${aula!.aula_id}`, 'component')
      const response = await conteudoAulaService.buscarConteudosPorAula(aula!.aula_id)
      
      if (response.sucesso && response.dados) {
        setConteudos(Array.isArray(response.dados) ? response.dados : [])
        logger.success(`✅ ${Array.isArray(response.dados) ? response.dados.length : 0} conteúdos carregados`, 'component')
      } else {
        logger.error('❌ Erro ao carregar conteúdos', 'component')
        setConteudos([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar conteúdos', 'component', error)
      setConteudos([])
    }
  }

  const carregarAtividades = async () => {
    try {
      if (!aula?.aula_id) return
      logger.info(`📋 Carregando atividades da aula: ${aula!.aula_id}`, 'component')
      const response = await atividadeService.buscarAtividadesPorAula(aula!.aula_id)
      
      if (response.sucesso && response.dados) {
        const atividadesArray = Array.isArray(response.dados) ? response.dados : []
        setAtividades(atividadesArray)
        logger.success(`✅ ${atividadesArray.length} atividades carregadas`, 'component')
      } else {
        logger.error('❌ Erro ao carregar atividades', 'component')
        setAtividades([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar atividades', 'component', error)
      setAtividades([])
    }
  }

  const carregarPeriodoLetivoAtual = async () => {
    try {
      logger.info('📅 Carregando período letivo atual', 'component')
      const response = await periodoLetivoService.buscarPeriodoLetivoAtual()
      
      logger.info('📅 Resposta do período letivo:', 'component', response)
      
      if (response.sucesso && response.dados && !Array.isArray(response.dados)) {
        setPeriodoLetivoAtual(response.dados.periodo_letivo_id)
        logger.success(`✅ Período letivo atual carregado: ${response.dados.bimestre}º bimestre`, 'component')
        logger.info(`📅 Período letivo ID: ${response.dados.periodo_letivo_id}`, 'component')
      } else {
        logger.error('❌ Erro ao carregar período letivo atual', 'component')
        logger.error('❌ Response:', 'component', response)
        setPeriodoLetivoAtual('')
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar período letivo atual', 'component', error)
      setPeriodoLetivoAtual('')
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleNovaConteudo = () => {
    if (!aula) return
    setFormConteudo({
      aula_id: aula.aula_id || '',
      descricao: '',
      conteudo: ''
    })
    setShowFormConteudo(true)
  }

  const handleSalvarConteudo = async () => {
    try {
      logger.info(`💾 Salvando conteúdo: ${formConteudo.descricao}`, 'component')
      
      const response = await conteudoAulaService.criarConteudo({
        aula_id: formConteudo.aula_id,
        descricao: formConteudo.descricao,
        conteudo: formConteudo.conteudo
      })
      
      if (response.sucesso && response.dados) {
        await carregarConteudos() // Recarregar a lista
        setShowFormConteudo(false)
        setFormConteudo({
          aula_id: aula?.aula_id || '',
          descricao: '',
          conteudo: ''
        })
        logger.success('✅ Conteúdo adicionado com sucesso', 'component')
      } else {
        logger.error('❌ Erro ao salvar conteúdo', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar conteúdo', 'component', error)
    }
  }

  const handleCancelarConteudo = () => {
    setShowFormConteudo(false)
    setFormConteudo({
      aula_id: aula?.aula_id || '',
      descricao: '',
      conteudo: ''
    })
  }

  const handleExcluirConteudo = (conteudo: ConteudoAula) => {
    setConteudoParaExcluir(conteudo)
    setShowConfirmDelete(true)
  }

  const confirmarExclusao = async () => {
    if (!conteudoParaExcluir) return

    try {
      logger.info(`🗑️ Excluindo conteúdo: ${conteudoParaExcluir.conteudo_aula_id}`, 'component')
      
      const response = await conteudoAulaService.deletarConteudo(conteudoParaExcluir.conteudo_aula_id || '')
      
      if (response.sucesso) {
        await carregarConteudos() // Recarregar a lista
        logger.success('✅ Conteúdo removido com sucesso', 'component')
      } else {
        logger.error('❌ Erro ao excluir conteúdo', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao excluir conteúdo', 'component', error)
    } finally {
      setShowConfirmDelete(false)
      setConteudoParaExcluir(null)
    }
  }

  const cancelarExclusao = () => {
    setShowConfirmDelete(false)
    setConteudoParaExcluir(null)
  }


  const handleFecharPresenca = () => {
    setShowModalPresenca(false)
    setAlunosTurma([])
  }

  const handleTogglePresenca = (matriculaId: string) => {
    setAlunosTurma(prev => prev.map(aluno => 
      aluno.matricula_aluno_id === matriculaId 
        ? { ...aluno, presenca: !aluno.presenca }
        : aluno
    ))
  }

  const handleSalvarPresenca = async () => {
    try {
      setSalvandoPresenca(true)
      logger.info(`💾 Salvando presença para aula: ${aula?.aula_id}`, 'component')
      
      const frequencias = alunosTurma.map(aluno => ({
        matricula_aluno_id: aluno.matricula_aluno_id,
        presenca: aluno.presenca === true
      }))
      
      const response = await frequenciaService.registrarFrequenciaLote(aula?.aula_id || '', frequencias)
      console.log(response);
      
      if (response.success) {
        setShowModalPresenca(false)
        setAlunosTurma([])
        logger.success('✅ Presença registrada com sucesso', 'component')
      } else {
        logger.error('❌ Erro ao salvar presença', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar presença', 'component', error)
    } finally {
      setSalvandoPresenca(false)
    }
  }

  const handleMarcarTodosPresentes = () => {
    setAlunosTurma(prev => prev.map(aluno => ({ ...aluno, presenca: true })))
  }

  const handleMarcarTodosFaltas = () => {
    setAlunosTurma(prev => prev.map(aluno => ({ ...aluno, presenca: false })))
  }

  // Funções para atividades
  const handleNovaAtividade = () => {
    if (!aula) return
    logger.info('📝 Criando nova atividade', 'component')
    logger.info('📝 Período letivo atual:', 'component', periodoLetivoAtual)
    logger.info('📝 Aula ID:', 'component', aula.aula_id)
    logger.info('📝 Turma disciplina professor ID:', 'component', aula.turma_disciplina_professor_id)
    
    setFormAtividade({
      titulo: '',
      descricao: '',
      peso: 1,
      vale_nota: false,
      periodo_letivo_id: periodoLetivoAtual,
      aula_id: aula.aula_id || '',
      turma_disciplina_professor_id: aula.turma_disciplina_professor_id
    })
    setShowFormAtividade(true)
  }

  const handleSalvarAtividade = async () => {
    try {
      logger.info('💾 Salvando nova atividade', 'component')
      logger.info('💾 Dados do formulário:', 'component', formAtividade)
      
      if (!formAtividade.titulo.trim()) {
        logger.error('❌ Título da atividade é obrigatório', 'component')
        return
      }
      
      if (!formAtividade.descricao.trim()) {
        logger.error('❌ Descrição da atividade é obrigatória', 'component')
        return
      }
      
      if (formAtividade.vale_nota && formAtividade.peso <= 0) {
        logger.error('❌ Peso deve ser maior que zero quando vale nota', 'component')
        return
      }

      logger.info('💾 Enviando dados para o service:', 'component', {
        titulo: formAtividade.titulo,
        descricao: formAtividade.descricao,
        peso: formAtividade.peso,
        vale_nota: formAtividade.vale_nota,
        periodo_letivo_id: formAtividade.periodo_letivo_id,
        aula_id: formAtividade.aula_id,
        turma_disciplina_professor_id: formAtividade.turma_disciplina_professor_id
      })

      const response = await atividadeService.criarAtividade({
        titulo: formAtividade.titulo,
        descricao: formAtividade.descricao,
        peso: formAtividade.peso,
        vale_nota: formAtividade.vale_nota,
        periodo_letivo_id: formAtividade.periodo_letivo_id,
        aula_id: formAtividade.aula_id,
        turma_disciplina_professor_id: formAtividade.turma_disciplina_professor_id
      })

      if (response.sucesso) {
        setShowFormAtividade(false)
        setFormAtividade({
          titulo: '',
          descricao: '',
          peso: 1,
          vale_nota: false,
          periodo_letivo_id: '',
          aula_id: aula?.aula_id || '',
          turma_disciplina_professor_id: aula?.turma_disciplina_professor_id || ''
        })
        await carregarAtividades()
        logger.success('✅ Atividade criada com sucesso', 'component')
      } else {
        logger.error('❌ Erro ao criar atividade', 'component', response.mensagem)
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar atividade', 'component', error)
    }
  }

  const handleCancelarAtividade = () => {
    setShowFormAtividade(false)
    setFormAtividade({
      titulo: '',
      descricao: '',
      peso: 1,
      vale_nota: false,
      periodo_letivo_id: periodoLetivoAtual,
      aula_id: aula?.aula_id || '',
      turma_disciplina_professor_id: aula?.turma_disciplina_professor_id || ''
    })
  }

  const handleVisualizarAtividade = (atividade: Atividade) => {
    setAtividadeSelecionada(atividade)
    setShowModalAtividade(true)
  }

  const handleFecharModalAtividade = () => {
    setShowModalAtividade(false)
    setAtividadeSelecionada(null)
  }

  // Funções para notas
  const handleAbrirNotas = (atividade: Atividade) => {
    navigate(`/diario/notas/${atividade.atividade_id}`)
  }

  if (loading || !aula) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes da aula...</p>
        </div>
      </div>
    )
  }

  // Garantir que aula não é null após a verificação
  if (!aula) return null


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/diario')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Diário</span>
          </button>
        </div>

        {/* Informações da Aula */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Aula de {formatarData(aula!.data_aula)}
                </h2>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{aula!.hora_inicio} - {aula!.hora_fim}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>{turma?.nome_turma} - {turma?.turno}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <BookOpen className="w-5 h-5" />
                    <span>{disciplina?.nome_disciplina}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="text-sm">Prof. {professor?.nome_usuario}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botão de Presença */}
            <button
              onClick={async () => {
                try {
                  setLoadingPresenca(true)
                  if (!aula!.aula_id) return
                  logger.info(`👥 Carregando frequências da aula: ${aula!.aula_id}`, 'component')
                  
                  // Buscar frequências da aula diretamente
                  const frequenciasExistentes = await frequenciaService.buscarFrequenciasPorAula(aula!.aula_id)
                  
                  if (frequenciasExistentes.sucesso && frequenciasExistentes.data && (frequenciasExistentes.data as any[]).length > 0) {
                    // Se já existem frequências, usar os dados que vêm da API
                    logger.info('📊 Dados brutos da API:', 'component', frequenciasExistentes.data)
                    
                    const alunosComPresenca = (frequenciasExistentes.data as any[]).map(freq => ({
                      matricula_aluno_id: freq.matricula_aluno_id,
                      ra: freq.ra,
                      nome_aluno: freq.nome_aluno,
                      sobrenome_aluno: freq.sobrenome_aluno,
                      presenca: freq.presenca,
                      frequencia_id: freq.frequencia_id
                    }))
                    
                    logger.info('📊 Dados processados:', 'component', alunosComPresenca)
                    
                    setAlunosTurma(alunosComPresenca)
                    setShowModalPresenca(true)
                    logger.success(`✅ ${alunosComPresenca.length} frequências carregadas`, 'component')
                    logger.info('📊 Dados dos alunos:', 'component', alunosComPresenca)
                  } else {
                    // Se não há frequências, buscar alunos matriculados nesta aula específica
                    logger.info(`👥 Buscando alunos matriculados na aula: ${aula!.aula_id}`, 'component')
                    
                    const response = await frequenciaService.buscarAlunosPorAula(aula!.aula_id)
                    
                    if (response.sucesso && response.dados) {
                      // Todos começam como presentes
                      const alunosComPresenca = (response.dados as any[]).map(aluno => ({
                        ...aluno,
                        presenca: true
                      }))
                      
                      setAlunosTurma(alunosComPresenca)
                      setShowModalPresenca(true)
                      logger.success(`✅ ${alunosComPresenca.length} alunos carregados para nova chamada`, 'component')
                      logger.info('📊 Dados dos alunos (nova chamada):', 'component', alunosComPresenca)
                    } else {
                      logger.error('❌ Erro ao carregar alunos da aula', 'component')
                    }
                  }
                } catch (error) {
                  logger.error('❌ Erro ao carregar dados de presença', 'component', error)
                } finally {
                  setLoadingPresenca(false)
                }
              }}
              disabled={loadingPresenca}
              className="flex items-center space-x-3 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-medium">{loadingPresenca ? 'Carregando...' : 'Chamada'}</span>
            </button>
          </div>
        </div>

        {/* Seções da Aula */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Conteúdos da Aula */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-500" />
                  Conteúdos da Aula
                </h3>
                <button
                  onClick={handleNovaConteudo}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Conteúdo
                </button>
              </div>

              {/* Formulário de Novo Conteúdo */}
              {showFormConteudo && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Novo Conteúdo</h4>
                    <button
                      onClick={handleCancelarConteudo}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descrição do Conteúdo
                        </label>
                        <input
                          type="text"
                          value={formConteudo.descricao}
                          onChange={(e) => setFormConteudo({...formConteudo, descricao: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: Introdução à Matemática"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conteúdo Detalhado
                        </label>
                        <textarea
                          value={formConteudo.conteudo}
                          onChange={(e) => setFormConteudo({...formConteudo, conteudo: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Descreva detalhadamente o conteúdo da aula..."
                        />
                      </div>
                    
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={handleCancelarConteudo}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSalvarConteudo}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Conteúdo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Conteúdos */}
              {conteudos.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum conteúdo adicionado ainda</p>
                  <p className="text-sm text-gray-400">Clique em "Adicionar Conteúdo" para começar</p>
                </div>
                ) : (
                  <div className="space-y-4">
                    {conteudos.map((conteudo) => (
                      <div key={conteudo.conteudo_aula_id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">{conteudo.descricao}</h5>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{conteudo.conteudo}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              Criado em: {new Date(conteudo.created_at || '').toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleExcluirConteudo(conteudo)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Excluir conteúdo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Seção de Atividades */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ClipboardList className="w-6 h-6 mr-3 text-purple-500" />
                Atividades da Aula
              </h3>
              <button
                onClick={handleNovaAtividade}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </button>
            </div>

            {/* Formulário de Nova Atividade */}
            {showFormAtividade && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-purple-800 mb-4">Nova Atividade</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título da Atividade
                    </label>
                    <input
                      type="text"
                      value={formAtividade.titulo}
                      onChange={(e) => setFormAtividade({...formAtividade, titulo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: Exercícios de Matemática"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição da Atividade
                    </label>
                    <textarea
                      value={formAtividade.descricao}
                      onChange={(e) => setFormAtividade({...formAtividade, descricao: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Descreva detalhadamente a atividade..."
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="vale_nota"
                        checked={formAtividade.vale_nota}
                        onChange={(e) => setFormAtividade({...formAtividade, vale_nota: e.target.checked})}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="vale_nota" className="ml-2 text-sm font-medium text-gray-700">
                        Vale nota
                      </label>
                    </div>
                    
                    {formAtividade.vale_nota && (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Peso da Atividade
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={formAtividade.peso}
                          onChange={(e) => setFormAtividade({...formAtividade, peso: parseFloat(e.target.value) || 0})}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="1.0"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={handleCancelarAtividade}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSalvarAtividade}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Atividade
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Atividades */}
            {atividades.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma atividade adicionada ainda</p>
                <p className="text-sm text-gray-400">Clique em "Nova Atividade" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {atividades.map((atividade) => (
                  <div key={atividade.atividade_id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-semibold text-gray-900">{atividade.titulo}</h5>
                          {atividade.vale_nota && (
                            <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                              Peso: {atividade.peso}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{atividade.descricao}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            Criado em: {new Date(atividade.created_at || '').toLocaleDateString('pt-BR')}
                          </span>
                          {atividade.vale_nota ? (
                            <span className="text-green-600 font-medium">✓ Vale nota</span>
                          ) : (
                            <span className="text-gray-500">Não vale nota</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {atividade.vale_nota && (
                          <button 
                            onClick={() => handleAbrirNotas(atividade)}
                            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                            title="Lançar notas"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleVisualizarAtividade(atividade)}
                          className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                          title="Visualizar atividade"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar com outras funcionalidades */}
          <div className="space-y-6">
            



          </div>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {showConfirmDelete && conteudoParaExcluir && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
                    <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    Tem certeza que deseja excluir o conteúdo:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 mb-1">{conteudoParaExcluir.descricao}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{conteudoParaExcluir.conteudo}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={cancelarExclusao}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarExclusao}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Presença */}
        {showModalPresenca && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header do Modal */}
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Registrar Presença</h3>
                      <p className="text-sm text-gray-600">
                        {turma.nome_turma} - {formatarData(aula.data_aula)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleFecharPresenca}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {alunosTurma.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhum aluno encontrado nesta turma</p>
                  </div>
                ) : (
                  <>
                    {/* Botões de Ação Rápida */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <button
                        onClick={handleMarcarTodosPresentes}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Marcar Todos Presentes
                      </button>
                      <button
                        onClick={handleMarcarTodosFaltas}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Marcar Todos Faltas
                      </button>
                    </div>

                    {/* Lista de Alunos */}
                    <div className="space-y-3">
                      {alunosTurma.map((aluno) => {
                        const isPresente = aluno.presenca === true;
                        const labelPresenca = isPresente ? 'Presente' : 'Falta';

                        return (
                          <div
                            key={aluno.matricula_aluno_id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {aluno.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {aluno.nome_aluno || 'Nome não informado'} {aluno.sobrenome_aluno || ''}
                                </h4>
                                <p className="text-sm text-gray-600">RA: {aluno.ra || 'N/A'}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleTogglePresenca(aluno.matricula_aluno_id)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                isPresente
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {labelPresenca}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                  </>
                )}
              </div>

              {/* Footer do Modal */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total: {alunosTurma.length} alunos | 
                    Presentes: {alunosTurma.filter(a => a.presenca === true).length} | 
                    Faltas: {alunosTurma.filter(a => a.presenca !== true).length}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleFecharPresenca}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSalvarPresenca}
                      disabled={salvandoPresenca}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />
                      {salvandoPresenca ? 'Salvando...' : 'Salvar Presença'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização de Atividade */}
        {showModalAtividade && atividadeSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Detalhes da Atividade</h3>
                      <p className="text-sm text-gray-600">Visualização completa da atividade</p>
                    </div>
                  </div>
                  <button
                    onClick={handleFecharModalAtividade}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{atividadeSelecionada.titulo}</h4>
                    <p className="text-gray-600">{atividadeSelecionada.descricao}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Informações da Atividade</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vale nota:</span>
                          <span className={atividadeSelecionada.vale_nota ? "text-green-600 font-medium" : "text-gray-500"}>
                            {atividadeSelecionada.vale_nota ? "Sim" : "Não"}
                          </span>
                        </div>
                        {atividadeSelecionada.vale_nota && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Peso:</span>
                            <span className="font-medium text-purple-600">{atividadeSelecionada.peso}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Criado em:</span>
                          <span className="text-gray-900">
                            {new Date(atividadeSelecionada.created_at || '').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Status</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">Atividade ativa</span>
                        </div>
                        {atividadeSelecionada.vale_nota && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-600">Incluída no cálculo de notas</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleFecharModalAtividade}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

