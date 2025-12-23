import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Clock,
  ArrowLeft,
  Grid3x3,
  Plus,
  Trash2,
  X,
  Save
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { professorService } from '../../services/professorService'
import gradeHorarioService, { type GradeHorario } from '../../services/gradeHorarioService'
import type { ProfessorComTurmas } from '../../types/diario'

interface TurmaDisciplina {
  turma_id: string;
  nome_turma: string;
  turno: string;
  sala: string;
  nome_serie: string;
  disciplina_id: string;
  nome_disciplina: string;
  ano: number;
  ano_letivo_ativo: boolean;
  turma_disciplina_professor_id: string;
}

interface GradeComDetalhes extends GradeHorario {
  nome_disciplina: string;
  nome_turma: string;
  nome_serie: string;
  turno: string;
  sala: string;
  nomeDia: string;
  abreviacaoDia: string;
}

export default function DiarioProfessorPage() {
  const { professorId } = useParams<{ professorId: string }>()
  const navigate = useNavigate()
  const [professor, setProfessor] = useState<ProfessorComTurmas | null>(null)
  const [grades, setGrades] = useState<GradeComDetalhes[]>([])
  const [turmasDisciplinas, setTurmasDisciplinas] = useState<TurmaDisciplina[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [deletando, setDeletando] = useState<string | null>(null)
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    turma_disciplina_professor_id: '',
    dia_semana: 1,
    hora_inicio: '',
    hora_fim: ''
  })

  useEffect(() => {
    if (professorId) {
      carregarProfessor()
    }
  }, [professorId])

  useEffect(() => {
    if (professorId && professor) {
      carregarGradesProfessor()
    }
  }, [professorId, professor])

  const carregarProfessor = async () => {
    try {
      setLoading(true)
      logger.info(`👤 Carregando dados do professor: ${professorId}`, 'component')
      
      const response = await professorService.listarProfessoresComTurmas()
      
      if (response.status === 'sucesso' && response.dados) {
        const professorEncontrado = response.dados.find(p => p.usuario_id === professorId)
        if (professorEncontrado) {
          setProfessor(professorEncontrado)
          logger.success(`✅ Professor carregado: ${professorEncontrado.nome_usuario}`, 'component')
        } else {
          logger.error('❌ Professor não encontrado', 'component')
          navigate('/diario')
        }
      } else {
        logger.error('❌ Erro ao carregar professor', 'component')
        navigate('/diario')
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar professor', 'component', error)
      navigate('/diario')
    } finally {
      setLoading(false)
    }
  }

  const carregarGradesProfessor = async () => {
    try {
      setLoading(true)
      logger.info(`📅 Carregando grades do professor: ${professorId}`, 'component')
      
      // Buscar todas as turmas/disciplinas do professor primeiro
      // O professorId é o usuario_id, que é usado como professor_id na tabela turma_disciplina_professor
      const turmasResponse = await professorService.listarTurmasProfessor(professorId || '')
      
      if (turmasResponse.status === 'sucesso' && turmasResponse.dados) {
        const turmas = turmasResponse.dados as TurmaDisciplina[]
        setTurmasDisciplinas(turmas)
        
        // Buscar grades de todas as vinculações
        const gradesPromises = turmas.map(async (td) => {
          try {
            const gradesResponse = await gradeHorarioService.buscarGradesPorVinculacao(td.turma_disciplina_professor_id)
            
            // A API retorna { status: 'sucesso', dados: [...] } ou { success: true, data: [...] }
            const grades = gradesResponse.dados || gradesResponse.data || []
            const gradesArray = Array.isArray(grades) ? grades : [grades]
            
            if (gradesArray.length > 0) {
              return gradesArray.map((grade: GradeHorario) => ({
                ...grade,
                nome_disciplina: td.nome_disciplina,
                nome_turma: td.nome_turma,
                nome_serie: td.nome_serie,
                turno: td.turno,
                sala: td.sala,
                nomeDia: gradeHorarioService.getNomeDiaSemana(grade.dia_semana),
                abreviacaoDia: gradeHorarioService.getAbreviacaoDiaSemana(grade.dia_semana)
              }))
            }
            return []
          } catch (error) {
            logger.error(`❌ Erro ao carregar grades da vinculação ${td.turma_disciplina_professor_id}`, 'component', error)
            return []
          }
        })
        
        const gradesArrays = await Promise.all(gradesPromises)
        const todasGrades = gradesArrays.flat()
        
        // Ordenar por dia da semana e hora
        todasGrades.sort((a, b) => {
          if (a.dia_semana !== b.dia_semana) {
            return a.dia_semana - b.dia_semana
          }
          return a.hora_inicio.localeCompare(b.hora_inicio)
        })
        
        setGrades(todasGrades)
        logger.success(`✅ ${todasGrades.length} horários carregados`, 'component')
      } else {
        logger.warning('⚠️ Nenhuma turma encontrada para o professor', 'component')
        setGrades([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar grades do professor', 'component', error)
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  // Agrupar grades por dia da semana
  const gradesPorDia = grades.reduce((acc, grade) => {
    if (!acc[grade.dia_semana]) {
      acc[grade.dia_semana] = []
    }
    acc[grade.dia_semana].push(grade)
    return acc
  }, {} as Record<number, GradeComDetalhes[]>)


  // Obter data do próximo dia da semana
  const getProximaDataDoDia = (diaSemana: number): string => {
    const hoje = new Date()
    const diaAtual = hoje.getDay()
    let diasParaAdicionar = diaSemana - diaAtual
    
    if (diasParaAdicionar < 0) {
      diasParaAdicionar += 7 // Próxima semana
    } else if (diasParaAdicionar === 0) {
      diasParaAdicionar = 0 // Hoje
    }
    
    const proximaData = new Date(hoje)
    proximaData.setDate(hoje.getDate() + diasParaAdicionar)
    
    return proximaData.toISOString().split('T')[0]
  }

  // Abrir modal para adicionar grade
  const handleAbrirModal = () => {
    setFormData({
      turma_disciplina_professor_id: '',
      dia_semana: 1,
      hora_inicio: '',
      hora_fim: ''
    })
    setModalAberto(true)
  }

  // Fechar modal
  const handleFecharModal = () => {
    setModalAberto(false)
    setFormData({
      turma_disciplina_professor_id: '',
      dia_semana: 1,
      hora_inicio: '',
      hora_fim: ''
    })
  }

  // Salvar nova grade
  const handleSalvarGrade = async () => {
    if (!formData.turma_disciplina_professor_id || !formData.hora_inicio || !formData.hora_fim) {
      alert('Por favor, preencha todos os campos')
      return
    }

    try {
      setSalvando(true)
      logger.info('📝 Criando nova grade de horário', 'component')
      
      const response = await gradeHorarioService.criarGrade({
        turma_disciplina_professor_id: formData.turma_disciplina_professor_id,
        dia_semana: formData.dia_semana,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim
      })

      if ((response as any).status === 'sucesso' || response.success) {
        logger.success('✅ Grade criada com sucesso', 'component')
        handleFecharModal()
        // Recarregar grades
        await carregarGradesProfessor()
      } else {
        throw new Error((response as any).mensagem || response.message || 'Erro ao criar grade')
      }
    } catch (error: any) {
      logger.error('❌ Erro ao criar grade', 'component', error)
      alert(error.response?.data?.mensagem || error.message || 'Erro ao criar grade de horário')
    } finally {
      setSalvando(false)
    }
  }

  // Deletar grade
  const handleDeletarGrade = async (gradeId: string) => {
    if (!confirm('Tem certeza que deseja remover esta matéria da grade?')) {
      return
    }

    try {
      setDeletando(gradeId)
      logger.info(`🗑️ Deletando grade: ${gradeId}`, 'component')
      
      const response = await gradeHorarioService.deletarGrade(gradeId)

      if ((response as any).status === 'sucesso' || response.success) {
        logger.success('✅ Grade deletada com sucesso', 'component')
        // Recarregar grades
        await carregarGradesProfessor()
      } else {
        throw new Error((response as any).mensagem || response.message || 'Erro ao deletar grade')
      }
    } catch (error: any) {
      logger.error('❌ Erro ao deletar grade', 'component', error)
      alert(error.response?.data?.mensagem || error.message || 'Erro ao deletar grade de horário')
    } finally {
      setDeletando(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header com Botão Voltar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { navigate(`/diario/calendario/${professorId}`) }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>Ver Calendário</span>
              </button>
              <button
                onClick={handleAbrirModal}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Matéria</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {(loading || !professor) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando grades de horários...</p>
            </div>
          </div>
        )}

        {/* Grades por Dia */}
        {!loading && professor && (
          <div className="space-y-6">
            {Object.keys(gradesPorDia).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <Grid3x3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma grade de horários cadastrada</h3>
                <p className="text-gray-600">Este professor ainda não possui grades de horários cadastradas.</p>
                <p className="text-sm text-gray-500 mt-2">Entre em contato com a secretaria para cadastrar os horários.</p>
              </div>
            ) : (
              // Ordenar dias da semana (1=Segunda até 6=Sábado, 0=Domingo)
              [1, 2, 3, 4, 5, 6, 0].map(dia => {
                const gradesDoDia = gradesPorDia[dia] || []
                if (gradesDoDia.length === 0) return null
                
                const nomeDia = gradeHorarioService.getNomeDiaSemana(dia)
                const proximaData = getProximaDataDoDia(dia)
                
                return (
                  <div key={dia} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Header do Dia */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{nomeDia}</h3>
                          <p className="text-sm text-gray-600">Próxima data: {new Date(proximaData + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Horários do Dia */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {gradesDoDia.map((grade, index) => (
                          <div 
                            key={grade.grade_horario_id || index}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{grade.nome_disciplina}</h4>
                                    <p className="text-sm text-gray-600">
                                      {grade.nome_serie} - {grade.nome_turma} • {grade.turno} • Sala {grade.sala}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-13 flex items-center space-x-2 text-sm text-gray-700">
                                  <span className="font-medium">{grade.hora_inicio}</span>
                                  <span>-</span>
                                  <span className="font-medium">{grade.hora_fim}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => grade.grade_horario_id && handleDeletarGrade(grade.grade_horario_id)}
                                disabled={deletando === grade.grade_horario_id}
                                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remover matéria da grade"
                              >
                                {deletando === grade.grade_horario_id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }).filter(Boolean)
            )}
          </div>
        )}

        {/* Estatísticas */}
        {!loading && Object.keys(gradesPorDia).length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Grade</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(gradesPorDia).length}</div>
                <div className="text-sm text-gray-600">Dias com Aula</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{grades.length}</div>
                <div className="text-sm text-gray-600">Total de Horários</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(grades.map(g => g.turma_disciplina_professor_id)).size}
                </div>
                <div className="text-sm text-gray-600">Disciplinas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(grades.map(g => g.nome_turma)).size}
                </div>
                <div className="text-sm text-gray-600">Turmas</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Adicionar Grade */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Adicionar Matéria à Grade</h2>
                <button
                  onClick={handleFecharModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={salvando}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulário */}
              <div className="p-6 space-y-4">
                {/* Seleção de Turma/Disciplina */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turma / Disciplina *
                  </label>
                  <select
                    value={formData.turma_disciplina_professor_id}
                    onChange={(e) => setFormData({ ...formData, turma_disciplina_professor_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={salvando}
                    required
                  >
                    <option value="">Selecione uma turma/disciplina</option>
                    {turmasDisciplinas.map((td) => (
                      <option key={td.turma_disciplina_professor_id} value={td.turma_disciplina_professor_id}>
                        {td.nome_disciplina} - {td.nome_serie} {td.nome_turma} ({td.turno})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dia da Semana */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia da Semana *
                  </label>
                  <select
                    value={formData.dia_semana}
                    onChange={(e) => setFormData({ ...formData, dia_semana: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={salvando}
                    required
                  >
                    <option value={0}>Domingo</option>
                    <option value={1}>Segunda-feira</option>
                    <option value={2}>Terça-feira</option>
                    <option value={3}>Quarta-feira</option>
                    <option value={4}>Quinta-feira</option>
                    <option value={5}>Sexta-feira</option>
                    <option value={6}>Sábado</option>
                  </select>
                </div>

                {/* Horário */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Início *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={salvando}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de Fim *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_fim}
                      onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={salvando}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  onClick={handleFecharModal}
                  disabled={salvando}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarGrade}
                  disabled={salvando}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {salvando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
