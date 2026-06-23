import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Save,
  X,
  ClipboardList,
  Eye,
  Star,
  UserCheck,
  ArrowLeft,
  Camera,
  Lightbulb,
  Target,
  StickyNote,
  CheckCircle2,
  CircleDashed,
  Users,
} from 'lucide-react'
import { logger } from '../../lib/logger'
import frequenciaService from '../../services/frequenciaService'
import atividadeService, { type Atividade } from '../../services/atividadeService'
import periodoLetivoService from '../../services/periodoLetivoService'
import gradeHorarioService from '../../services/gradeHorarioService'
import registroDiarioService from '../../services/registroDiarioService'
import { professorService } from '../../services/professorService'
import { useAuth } from '../../contexts/AuthContext'
import type { AlunoFrequencia } from '../../services/frequenciaService'
import type { RegistroDiario, StatusRegistroDiario } from '../../types/diario'
import RichTextEditor from '../../components/diario/RichTextEditor'
import UploadFotos from '../../components/diario/UploadFotos'

// Recursos didáticos pré-definidos (seleção rápida)
const RECURSOS_DISPONIVEIS = [
  'Quadro / Lousa',
  'Projetor / Datashow',
  'Computador / Internet',
  'Livro didático',
  'Material impresso',
  'Laboratório',
  'Jogos / Material concreto',
  'Áudio / Vídeo',
]

const registroVazio = (turmaDisciplinaProfessorId: string, data: string): RegistroDiario => ({
  turma_disciplina_professor_id: turmaDisciplinaProfessorId,
  data_aula: data,
  resumo: '',
  conteudo_programatico: '',
  metodologia: '',
  recursos: [],
  observacoes: '',
  fotos: [],
  status: 'rascunho',
})

export default function DiarioDiaPage() {
  const { turmaDisciplinaProfessorId, data } = useParams<{ turmaDisciplinaProfessorId: string; data: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  // Dados de contexto
  const [turma, setTurma] = useState<any>(null)
  const [disciplina, setDisciplina] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [horariosDia, setHorariosDia] = useState<string[]>([])

  // Registro diário (relatório do dia)
  const [registro, setRegistro] = useState<RegistroDiario>(
    registroVazio(turmaDisciplinaProfessorId || '', data || '')
  )
  const [registroId, setRegistroId] = useState<string | undefined>(undefined)
  const [salvandoRegistro, setSalvandoRegistro] = useState(false)
  const [ultimoSalvamento, setUltimoSalvamento] = useState<string | null>(null)

  // Frequência (chamada)
  const [showModalPresenca, setShowModalPresenca] = useState(false)
  const [alunosTurma, setAlunosTurma] = useState<AlunoFrequencia[]>([])
  const [loadingPresenca, setLoadingPresenca] = useState(false)
  const [salvandoPresenca, setSalvandoPresenca] = useState(false)

  // Atividades avaliativas
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
    turma_disciplina_professor_id: turmaDisciplinaProfessorId || '',
  })

  useEffect(() => {
    if (turmaDisciplinaProfessorId && data) {
      carregarDados()
      carregarHorariosDia()
      carregarRegistro()
      carregarAtividades()
      carregarPeriodoLetivoAtual()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmaDisciplinaProfessorId, data])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await professorService.listarMinhasTurmas()

      if (response.status === 'sucesso' && response.dados) {
        const turmas = response.dados as any[]
        const vinculacao = turmas.find((t) => t.turma_disciplina_professor_id === turmaDisciplinaProfessorId)

        if (vinculacao) {
          setTurma({
            turma_id: vinculacao.turma_id,
            nome_turma: vinculacao.nome_turma,
            turno: vinculacao.turno,
            sala: vinculacao.sala,
            nome_serie: vinculacao.nome_serie,
            ano: vinculacao.ano,
          })
          setDisciplina({
            disciplina_id: vinculacao.disciplina_id,
            nome_disciplina: vinculacao.nome_disciplina,
          })
        } else {
          logger.error('❌ Vinculação não encontrada', 'component')
          navigate('/meu-diario')
        }
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar dados', 'component', error)
      navigate('/meu-diario')
    } finally {
      setLoading(false)
    }
  }

  const carregarHorariosDia = async () => {
    try {
      if (!data) return
      const diaSemana = new Date(data + 'T00:00:00').getDay()
      const response = await gradeHorarioService.buscarGradesPorVinculacao(turmaDisciplinaProfessorId || '')

      if (response.success && response.data) {
        const grades = Array.isArray(response.data) ? response.data : [response.data]
        setHorariosDia(
          grades.filter((g) => g.dia_semana === diaSemana).map((g) => `${g.hora_inicio} - ${g.hora_fim}`)
        )
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar horários do dia', 'component', error)
    }
  }

  const carregarRegistro = async () => {
    try {
      if (!turmaDisciplinaProfessorId || !data) return
      const response = await registroDiarioService.buscarPorData(turmaDisciplinaProfessorId, data)

      if (response.sucesso && response.dados) {
        const r = response.dados
        setRegistroId(r.registro_diario_id)
        setRegistro({
          turma_disciplina_professor_id: turmaDisciplinaProfessorId,
          data_aula: data,
          resumo: r.resumo || '',
          conteudo_programatico: r.conteudo_programatico || '',
          metodologia: r.metodologia || '',
          recursos: r.recursos || [],
          observacoes: r.observacoes || '',
          fotos: r.fotos || [],
          status: r.status || 'rascunho',
        })
        setUltimoSalvamento(r.updated_at || null)
        logger.success('✅ Registro diário carregado', 'component')
      } else {
        setRegistroId(undefined)
        setRegistro(registroVazio(turmaDisciplinaProfessorId, data))
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar registro diário', 'component', error)
    }
  }

  const carregarAtividades = async () => {
    try {
      if (!turmaDisciplinaProfessorId || !data) return
      const response = await atividadeService.buscarAtividadesPorDataEVinculacao(turmaDisciplinaProfessorId, data)
      if (response.sucesso && response.dados) {
        setAtividades(Array.isArray(response.dados) ? response.dados : [])
      } else {
        setAtividades([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar atividades', 'component', error)
      setAtividades([])
    }
  }

  const carregarPeriodoLetivoAtual = async () => {
    try {
      const response = await periodoLetivoService.buscarPeriodoLetivoAtual()
      if (response.sucesso && response.dados && !Array.isArray(response.dados)) {
        setPeriodoLetivoAtual(response.dados.periodo_letivo_id)
      } else {
        setPeriodoLetivoAtual('')
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar período letivo atual', 'component', error)
      setPeriodoLetivoAtual('')
    }
  }

  const formatarData = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long',
    })

  const formatarHora = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  // ---- Registro diário ----
  const atualizarCampo = <K extends keyof RegistroDiario>(campo: K, valor: RegistroDiario[K]) => {
    setRegistro((prev) => ({ ...prev, [campo]: valor }))
  }

  const toggleRecurso = (recurso: string) => {
    setRegistro((prev) => {
      const atuais = prev.recursos || []
      return {
        ...prev,
        recursos: atuais.includes(recurso) ? atuais.filter((r) => r !== recurso) : [...atuais, recurso],
      }
    })
  }

  const salvarRegistro = async (status: StatusRegistroDiario) => {
    if (!turmaDisciplinaProfessorId || !data) return

    if (!registro.resumo || registro.resumo.replace(/<[^>]*>/g, '').trim() === '') {
      alert('Descreva pelo menos o resumo do que foi feito na aula.')
      return
    }

    try {
      setSalvandoRegistro(true)
      const response = await registroDiarioService.salvar({ ...registro, status })

      if (response.sucesso && response.dados) {
        setRegistroId(response.dados.registro_diario_id)
        setRegistro((prev) => ({ ...prev, status }))
        setUltimoSalvamento(response.dados.updated_at || new Date().toISOString())
        logger.success('✅ Registro salvo com sucesso', 'component')
      } else {
        alert(response.mensagem || 'Erro ao salvar o registro')
      }
    } catch (error: any) {
      logger.error('❌ Erro ao salvar registro', 'component', error)
      alert(error.response?.data?.mensagem || 'Erro ao salvar o registro do dia')
    } finally {
      setSalvandoRegistro(false)
    }
  }

  // ---- Frequência ----
  const handleAbrirPresenca = async () => {
    try {
      if (!turmaDisciplinaProfessorId || !data || !turma?.turma_id || !usuario?.usuario_id) return
      setLoadingPresenca(true)

      const existentes = await frequenciaService.buscarFrequenciasPorProfessorTurmaEData(
        usuario.usuario_id,
        turma.turma_id,
        data
      )

      if (existentes.sucesso && Array.isArray(existentes.dados) && existentes.dados.length > 0) {
        setAlunosTurma(
          existentes.dados.map((freq: any) => ({
            matricula_aluno_id: freq.matricula_aluno_id,
            ra: freq.ra || '',
            nome_aluno: freq.nome_aluno || '',
            sobrenome_aluno: freq.sobrenome_aluno || '',
            presenca: freq.presenca,
            frequencia_id: freq.frequencia_id,
          }))
        )
        setShowModalPresenca(true)
      } else {
        const response = await frequenciaService.buscarAlunosTurma(turma.turma_id)
        if (response.sucesso && response.dados) {
          setAlunosTurma((response.dados as any[]).map((aluno) => ({ ...aluno, presenca: true })))
          setShowModalPresenca(true)
        }
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar dados de presença', 'component', error)
    } finally {
      setLoadingPresenca(false)
    }
  }

  const handleTogglePresenca = (matriculaId: string) => {
    setAlunosTurma((prev) =>
      prev.map((aluno) =>
        aluno.matricula_aluno_id === matriculaId ? { ...aluno, presenca: !aluno.presenca } : aluno
      )
    )
  }

  const handleSalvarPresenca = async () => {
    try {
      if (!data || !turma?.turma_id || !usuario?.usuario_id) return
      setSalvandoPresenca(true)
      const frequencias = alunosTurma.map((aluno) => ({
        matricula_aluno_id: aluno.matricula_aluno_id,
        presenca: aluno.presenca === true,
      }))
      const response = await frequenciaService.registrarFrequenciaLotePorProfessorTurmaEData(
        usuario.usuario_id,
        turma.turma_id,
        data,
        frequencias
      )
      if (response.success || response.sucesso) {
        setShowModalPresenca(false)
        setAlunosTurma([])
        logger.success('✅ Presença registrada com sucesso', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar presença', 'component', error)
    } finally {
      setSalvandoPresenca(false)
    }
  }

  // ---- Atividades ----
  const handleNovaAtividade = () => {
    if (!turmaDisciplinaProfessorId) return
    setFormAtividade({
      titulo: '',
      descricao: '',
      peso: 1,
      vale_nota: false,
      periodo_letivo_id: periodoLetivoAtual,
      aula_id: '',
      turma_disciplina_professor_id: turmaDisciplinaProfessorId,
    })
    setShowFormAtividade(true)
  }

  const handleSalvarAtividade = async () => {
    try {
      if (!turmaDisciplinaProfessorId || !data) return
      if (!formAtividade.titulo.trim() || !formAtividade.descricao.trim()) {
        alert('Título e descrição da atividade são obrigatórios')
        return
      }
      const response = await atividadeService.criarAtividadeComData({
        titulo: formAtividade.titulo,
        descricao: formAtividade.descricao,
        peso: formAtividade.peso,
        vale_nota: formAtividade.vale_nota,
        periodo_letivo_id: formAtividade.periodo_letivo_id,
        turma_disciplina_professor_id: turmaDisciplinaProfessorId,
        data_aula: data,
      })
      if (response.sucesso) {
        setShowFormAtividade(false)
        await carregarAtividades()
        logger.success('✅ Atividade criada com sucesso', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar atividade', 'component', error)
    }
  }

  if (loading || !turma || !disciplina) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando registro do dia...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const concluido = registro.status === 'concluido'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {/* Cabeçalho do dia */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">{formatarData(data)}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> {disciplina.nome_disciplina}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {turma.nome_serie} - {turma.nome_turma} ({turma.turno})
                  </span>
                  {horariosDia.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> {horariosDia.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status */}
              <span
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  concluido ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {concluido ? <CheckCircle2 className="w-4 h-4" /> : <CircleDashed className="w-4 h-4" />}
                {concluido ? 'Concluído' : 'Rascunho'}
              </span>
              <button
                onClick={handleAbrirPresenca}
                disabled={loadingPresenca}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow disabled:opacity-50"
              >
                <UserCheck className="w-5 h-5" />
                <span className="font-medium">{loadingPresenca ? 'Carregando...' : 'Chamada'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Relatório do dia */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Relatório da Aula
          </h3>

          {/* Resumo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Resumo da aula <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">O que foi feito hoje? Descreva o desenvolvimento da aula.</p>
            <RichTextEditor
              value={registro.resumo}
              onChange={(html) => atualizarCampo('resumo', html)}
              placeholder="Ex: Iniciamos o estudo de frações com exemplos do cotidiano..."
              disabled={salvandoRegistro}
            />
          </div>

          {/* Conteúdo programático */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-500" /> Conteúdo programático
            </label>
            <p className="text-xs text-gray-500 mb-2">Tópicos do currículo trabalhados na aula.</p>
            <RichTextEditor
              value={registro.conteudo_programatico || ''}
              onChange={(html) => atualizarCampo('conteudo_programatico', html)}
              placeholder="Ex: Frações equivalentes, simplificação..."
              disabled={salvandoRegistro}
              minHeight={100}
            />
          </div>

          {/* Metodologia */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Metodologia
            </label>
            <input
              type="text"
              value={registro.metodologia || ''}
              onChange={(e) => atualizarCampo('metodologia', e.target.value)}
              disabled={salvandoRegistro}
              placeholder="Ex: Aula expositiva dialogada, trabalho em grupo, prática..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50"
            />
          </div>

          {/* Recursos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Recursos utilizados</label>
            <div className="flex flex-wrap gap-2">
              {RECURSOS_DISPONIVEIS.map((recurso) => {
                const ativo = registro.recursos?.includes(recurso)
                return (
                  <button
                    key={recurso}
                    type="button"
                    onClick={() => toggleRecurso(recurso)}
                    disabled={salvandoRegistro}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors disabled:opacity-50 ${
                      ativo
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {recurso}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-pink-500" /> Fotos da aula
            </label>
            <UploadFotos
              fotos={registro.fotos || []}
              onChange={(fotos) => atualizarCampo('fotos', fotos)}
              disabled={salvandoRegistro}
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <StickyNote className="w-4 h-4 text-gray-500" /> Observações
            </label>
            <p className="text-xs text-gray-500 mb-2">Anotações sobre a turma, ocorrências, pendências, etc.</p>
            <RichTextEditor
              value={registro.observacoes || ''}
              onChange={(html) => atualizarCampo('observacoes', html)}
              placeholder="Ex: Aluno X faltou à avaliação, remarcar..."
              disabled={salvandoRegistro}
              minHeight={100}
            />
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {ultimoSalvamento ? `Última atualização: ${formatarHora(ultimoSalvamento)}` : 'Ainda não salvo'}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => salvarRegistro('rascunho')}
                disabled={salvandoRegistro}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Salvar rascunho
              </button>
              <button
                onClick={() => salvarRegistro('concluido')}
                disabled={salvandoRegistro}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow"
              >
                {salvandoRegistro ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Concluir registro
              </button>
            </div>
          </div>
        </div>

        {/* Atividades avaliativas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-500" />
              Atividades avaliativas
            </h3>
            <button
              onClick={handleNovaAtividade}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova
            </button>
          </div>

          {showFormAtividade && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-5">
              <div className="space-y-4">
                <input
                  type="text"
                  value={formAtividade.titulo}
                  onChange={(e) => setFormAtividade({ ...formAtividade, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Título da atividade"
                />
                <textarea
                  value={formAtividade.descricao}
                  onChange={(e) => setFormAtividade({ ...formAtividade, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descrição da atividade..."
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={formAtividade.vale_nota}
                      onChange={(e) => setFormAtividade({ ...formAtividade, vale_nota: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    Vale nota
                  </label>
                  {formAtividade.vale_nota && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Peso:</span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={formAtividade.peso}
                        onChange={(e) => setFormAtividade({ ...formAtividade, peso: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowFormAtividade(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarAtividade}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </button>
                </div>
              </div>
            </div>
          )}

          {atividades.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma atividade avaliativa neste dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atividades.map((atividade) => (
                <div key={atividade.atividade_id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900">{atividade.titulo}</h5>
                        {atividade.vale_nota && (
                          <span className="px-2 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                            Peso: {atividade.peso}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{atividade.descricao}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {atividade.vale_nota && (
                        <button
                          onClick={() => navigate(`/diario/notas/${atividade.atividade_id}`)}
                          className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors"
                          title="Lançar notas"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setAtividadeSelecionada(atividade)
                          setShowModalAtividade(true)
                        }}
                        className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors"
                        title="Visualizar"
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

        {/* Modal de Presença */}
        {showModalPresenca && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center shadow">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Registrar Presença</h3>
                    <p className="text-sm text-gray-600">
                      {turma.nome_turma} - {formatarData(data)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModalPresenca(false)
                    setAlunosTurma([])
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {alunosTurma.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum aluno encontrado nesta turma</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-5">
                      <button
                        onClick={() => setAlunosTurma((prev) => prev.map((a) => ({ ...a, presenca: true })))}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Todos presentes
                      </button>
                      <button
                        onClick={() => setAlunosTurma((prev) => prev.map((a) => ({ ...a, presenca: false })))}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Todos faltas
                      </button>
                    </div>
                    <div className="space-y-3">
                      {alunosTurma.map((aluno) => {
                        const presente = aluno.presenca === true
                        return (
                          <div
                            key={aluno.matricula_aluno_id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {aluno.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {aluno.nome_aluno} {aluno.sobrenome_aluno || ''}
                                </h4>
                                <p className="text-sm text-gray-600">RA: {aluno.ra || 'N/A'}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleTogglePresenca(aluno.matricula_aluno_id)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                presente
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {presente ? 'Presente' : 'Falta'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total: {alunosTurma.length} • Presentes: {alunosTurma.filter((a) => a.presenca === true).length} •
                  Faltas: {alunosTurma.filter((a) => a.presenca !== true).length}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowModalPresenca(false)
                      setAlunosTurma([])
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarPresenca}
                    disabled={salvandoPresenca}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    {salvandoPresenca ? 'Salvando...' : 'Salvar presença'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de visualização de atividade */}
        {showModalAtividade && atividadeSelecionada && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Detalhes da Atividade</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowModalAtividade(false)
                      setAtividadeSelecionada(null)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{atividadeSelecionada.titulo}</h4>
                <p className="text-gray-600 mb-4">{atividadeSelecionada.descricao}</p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vale nota:</span>
                    <span className={atividadeSelecionada.vale_nota ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {atividadeSelecionada.vale_nota ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  {atividadeSelecionada.vale_nota && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso:</span>
                      <span className="font-medium text-purple-600">{atividadeSelecionada.peso}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
