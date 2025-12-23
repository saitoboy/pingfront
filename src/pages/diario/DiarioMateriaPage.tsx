import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Calendar, 
  Clock,
  Plus,
  Eye,
  ArrowLeft,
  Grid3x3
} from 'lucide-react'
import { logger } from '../../lib/logger'
import gradeHorarioService, { type GradeHorario } from '../../services/gradeHorarioService'
import { professorService } from '../../services/professorService'

interface GradeHorarioComDia extends GradeHorario {
  nomeDia: string
  abreviacaoDia: string
}

export default function DiarioMateriaPage() {
  const { turmaDisciplinaProfessorId } = useParams<{ turmaDisciplinaProfessorId: string }>()
  const navigate = useNavigate()
  const [turma, setTurma] = useState<any>(null)
  const [disciplina, setDisciplina] = useState<any>(null)
  const [gradeHorarios, setGradeHorarios] = useState<GradeHorarioComDia[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (turmaDisciplinaProfessorId) {
      carregarDadosMateria()
      carregarGradeHorarios()
    }
  }, [turmaDisciplinaProfessorId])

  const carregarDadosMateria = async () => {
    try {
      setLoading(true)
      logger.info(`📚 Carregando dados da matéria: ${turmaDisciplinaProfessorId}`, 'component')
      
      // Buscar turmas do professor e encontrar a vinculação específica
      const response = await professorService.listarMinhasTurmas()
      
      if (response.status === 'sucesso' && response.dados) {
        const turmas = response.dados as any[]
        const vinculacao = turmas.find(t => t.turma_disciplina_professor_id === turmaDisciplinaProfessorId)
        
        if (vinculacao) {
          setTurma({
            turma_id: vinculacao.turma_id,
            nome_turma: vinculacao.nome_turma,
            turno: vinculacao.turno,
            sala: vinculacao.sala,
            nome_serie: vinculacao.nome_serie,
            ano: vinculacao.ano
          })
          
          setDisciplina({
            disciplina_id: vinculacao.disciplina_id,
            nome_disciplina: vinculacao.nome_disciplina
          })
          
          logger.success('✅ Dados da matéria carregados', 'component')
        } else {
          logger.error('❌ Vinculação não encontrada', 'component')
          navigate('/diario')
        }
      } else {
        logger.error('❌ Erro ao carregar dados da matéria', 'component')
        navigate('/diario')
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar dados da matéria', 'component', error)
      navigate('/diario')
    } finally {
      setLoading(false)
    }
  }

  const carregarGradeHorarios = async () => {
    try {
      logger.info(`📅 Carregando grade de horários: ${turmaDisciplinaProfessorId}`, 'component')
      
      const response = await gradeHorarioService.buscarGradesPorVinculacao(turmaDisciplinaProfessorId || '')
      
      if (response.success && response.data) {
        const grades = Array.isArray(response.data) ? response.data : [response.data]
        const gradesComDia = grades.map(grade => ({
          ...grade,
          nomeDia: gradeHorarioService.getNomeDiaSemana(grade.dia_semana),
          abreviacaoDia: gradeHorarioService.getAbreviacaoDiaSemana(grade.dia_semana)
        }))
        
        // Ordenar por dia da semana e hora
        gradesComDia.sort((a, b) => {
          if (a.dia_semana !== b.dia_semana) {
            return a.dia_semana - b.dia_semana
          }
          return a.hora_inicio.localeCompare(b.hora_inicio)
        })
        
        setGradeHorarios(gradesComDia)
        logger.success(`✅ ${gradesComDia.length} horários carregados`, 'component')
      } else {
        logger.warning('⚠️ Nenhuma grade de horários encontrada', 'component')
        setGradeHorarios([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar grade de horários', 'component', error)
      setGradeHorarios([])
    }
  }

  const handleSelecionarData = (data: string) => {
    setDataSelecionada(data)
    navigate(`/diario/dia/${turmaDisciplinaProfessorId}/${data}`)
  }

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long'
    })
  }

  // Agrupar horários por dia da semana
  const horariosPorDia = gradeHorarios.reduce((acc, grade) => {
    if (!acc[grade.dia_semana]) {
      acc[grade.dia_semana] = []
    }
    acc[grade.dia_semana].push(grade)
    return acc
  }, {} as Record<number, GradeHorarioComDia[]>)

  // Obter dia da semana da data selecionada
  const getDiaSemanaDaData = (data: string): number => {
    const date = new Date(data + 'T00:00:00')
    return date.getDay()
  }

  // Verificar se há horário na data selecionada
  const temHorarioNaData = (data: string): boolean => {
    const diaSemana = getDiaSemanaDaData(data)
    return horariosPorDia[diaSemana] && horariosPorDia[diaSemana].length > 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Diário da Matéria</h1>
                <p className="text-gray-600 mt-1">
                  {disciplina?.nome_disciplina} - {turma?.nome_serie} {turma?.nome_turma}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando grade de horários...</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {/* Grade de Horários */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Grid3x3 className="w-6 h-6 mr-3 text-blue-500" />
                  Grade de Horários
                </h2>
              </div>

              {gradeHorarios.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma grade de horários cadastrada</h3>
                  <p className="text-gray-600">Entre em contato com a secretaria para cadastrar os horários desta disciplina.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {[1, 2, 3, 4, 5, 6, 0].map(dia => {
                    const horarios = horariosPorDia[dia] || []
                    const nomeDia = gradeHorarioService.getAbreviacaoDiaSemana(dia)
                    
                    return (
                      <div key={dia} className="border border-gray-200 rounded-xl p-4">
                        <h3 className="font-bold text-gray-900 mb-3 text-center">{nomeDia}</h3>
                        {horarios.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center">Sem aula</p>
                        ) : (
                          <div className="space-y-2">
                            {horarios.map((grade, index) => (
                              <div
                                key={grade.grade_horario_id || index}
                                className="bg-blue-50 rounded-lg p-2 text-center"
                              >
                                <div className="text-xs font-medium text-blue-700">
                                  {grade.hora_inicio} - {grade.hora_fim}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Seletor de Data */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-green-500" />
                Selecionar Data
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escolha uma data para registrar o diário
                  </label>
                  <input
                    type="date"
                    value={dataSelecionada}
                    onChange={(e) => setDataSelecionada(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {dataSelecionada && (
                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Data selecionada:</p>
                          <p className="text-lg font-semibold text-gray-900">{formatarData(dataSelecionada)}</p>
                        </div>
                        {temHorarioNaData(dataSelecionada) ? (
                          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700">Tem aula</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium text-yellow-700">Sem horário</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelecionarData(dataSelecionada)}
                      className="w-full flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Acessar Diário do Dia
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <BookOpen className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Como usar o diário por dia</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Selecione uma data no calendário acima</li>
                    <li>• Clique em "Acessar Diário do Dia" para registrar frequência, atividades e conteúdos</li>
                    <li>• O sistema usa a grade de horários para identificar os dias com aula</li>
                    <li>• Você pode registrar o diário mesmo em dias sem horário cadastrado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
