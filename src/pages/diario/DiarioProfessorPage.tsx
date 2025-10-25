import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock,
  GraduationCap,
  Users,
  Eye
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { professorService } from '../../services/professorService'
import type { ProfessorComTurmas } from '../../types/diario'
import DiarioMateriaPage from './DiarioMateriaPage'

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

export default function DiarioProfessorPage() {
  const { professorId } = useParams<{ professorId: string }>()
  const navigate = useNavigate()
  const [professor, setProfessor] = useState<ProfessorComTurmas | null>(null)
  const [turmasDisciplinas, setTurmasDisciplinas] = useState<TurmaDisciplina[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (professorId) {
      carregarProfessor()
    }
  }, [professorId])

  useEffect(() => {
    if (professor) {
      carregarTurmasProfessor()
    }
  }, [professor])

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

  const carregarTurmasProfessor = async () => {
    try {
      setLoading(true)
      logger.info(`📚 Carregando turmas do professor: ${professor?.nome_usuario}`, 'component')
      
      const response = await professorService.listarTurmasProfessor(professor?.professor_id || '')
      
      if (response.status === 'sucesso' && response.dados) {
        setTurmasDisciplinas(response.dados)
        logger.success(`✅ ${response.dados.length} turmas/disciplinas carregadas`, 'component')
      } else {
        logger.error('❌ Erro ao carregar turmas do professor', 'component')
        setTurmasDisciplinas([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar turmas do professor', 'component', error)
      setTurmasDisciplinas([])
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    navigate('/diario')
  }

  // Agrupar turmas e disciplinas
  const turmasAgrupadas = turmasDisciplinas.reduce((acc, item) => {
    const turmaKey = item.turma_id
    if (!acc[turmaKey]) {
      acc[turmaKey] = {
        turma_id: item.turma_id,
        nome_turma: item.nome_turma,
        turno: item.turno,
        sala: item.sala,
        nome_serie: item.nome_serie,
        ano: item.ano,
        ano_letivo_ativo: item.ano_letivo_ativo,
        disciplinas: []
      }
    }
    acc[turmaKey].disciplinas.push({
      disciplina_id: item.disciplina_id,
      nome_disciplina: item.nome_disciplina
    })
    return acc
  }, {} as Record<string, any>)

  const handleAcessarDiario = (turma: any, disciplina: any) => {
    logger.info(`📝 Acessando diário: ${disciplina.nome_disciplina} - ${turma.nome_turma}`, 'component')
    
    // Buscar o ID da alocação para esta turma/disciplina
    const alocacao = turmasDisciplinas.find(td => 
      td.turma_id === turma.turma_id && td.disciplina_id === disciplina.disciplina_id
    )
    
    if (alocacao) {
      // Navega para a página do diário da matéria
      navigate(`/diario/materia/${alocacao.turma_disciplina_professor_id}`)
    } else {
      logger.error('❌ Alocação não encontrada para esta turma/disciplina', 'component')
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Informações do Professor */}
        {professor && (
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{professor.nome_usuario}</h2>
                <p className="text-gray-600">{professor.email_usuario}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {(loading || !professor) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados do professor...</p>
            </div>
          </div>
        )}

        {/* Lista de Turmas e Disciplinas */}
        {!loading && professor && (
          <div className="space-y-6">
            {Object.keys(turmasAgrupadas).length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma encontrada</h3>
                <p className="text-gray-600">Este professor não possui turmas alocadas no ano letivo ativo.</p>
              </div>
            ) : (
              Object.values(turmasAgrupadas).map((turma) => (
                <div key={turma.turma_id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  {/* Header da Turma */}
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{turma.nome_serie} - {turma.nome_turma}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{turma.turno}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Sala {turma.sala}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disciplinas da Turma */}
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                      Disciplinas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {turma.disciplinas.map((disciplina: any) => (
                        <div key={disciplina.disciplina_id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-gray-900">{disciplina.nome_disciplina}</h5>
                            <span className="text-xs text-gray-500">{disciplina.carga_horaria}</span>
                          </div>
                          <button
                            onClick={() => handleAcessarDiario(turma, disciplina)}
                            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Acessar Diário
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Estatísticas */}
        {!loading && Object.keys(turmasAgrupadas).length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(turmasAgrupadas).length}</div>
                <div className="text-sm text-gray-600">Turmas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(turmasAgrupadas).reduce((total, turma) => total + turma.disciplinas.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Disciplinas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{professor?.ano || new Date().getFullYear()}</div>
                <div className="text-sm text-gray-600">Ano Letivo</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
