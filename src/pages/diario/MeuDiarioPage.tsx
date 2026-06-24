import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Eye,
  User,
  CalendarDays,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { professorService } from '../../services/professorService'
import gradeHorarioService, { type GradeHorario } from '../../services/gradeHorarioService'
import { useAuth } from '../../contexts/AuthContext'

interface TurmaDisciplina {
  turma_id: string
  nome_turma: string
  turno: string
  sala: string
  nome_serie: string
  disciplina_id: string
  nome_disciplina: string
  ano: number
  ano_letivo_ativo: boolean
  turma_disciplina_professor_id: string
}

interface AulaHoje extends GradeHorario {
  nome_disciplina: string
  nome_turma: string
  nome_serie: string
  turno: string
  sala: string
}

// Data de hoje no formato YYYY-MM-DD (timezone local)
const hojeISO = (): string => {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export default function MeuDiarioPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [turmasDisciplinas, setTurmasDisciplinas] = useState<TurmaDisciplina[]>([])
  const [aulasHoje, setAulasHoje] = useState<AulaHoje[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (usuario) {
      carregarTurmasProfessor()
    } else {
      navigate('/dashboard')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const carregarTurmasProfessor = async () => {
    try {
      setLoading(true)
      const response = await professorService.listarMinhasTurmas()

      if (response.status === 'sucesso' && response.dados) {
        const turmas = response.dados as TurmaDisciplina[]
        setTurmasDisciplinas(turmas)
        await carregarAulasHoje(turmas)
        logger.success(`✅ ${turmas.length} turmas/disciplinas carregadas`, 'component')
      } else {
        setTurmasDisciplinas([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar turmas do professor', 'component', error)
      setTurmasDisciplinas([])
    } finally {
      setLoading(false)
    }
  }

  const carregarAulasHoje = async (turmas: TurmaDisciplina[]) => {
    try {
      const diaSemana = new Date().getDay()
      const grades = await Promise.all(
        turmas.map(async (td) => {
          try {
            const resp = await gradeHorarioService.buscarGradesPorVinculacao(td.turma_disciplina_professor_id)
            const dados = resp.data || (resp as any).dados || []
            const arr: GradeHorario[] = Array.isArray(dados) ? dados : [dados]
            return arr
              .filter((g) => g.dia_semana === diaSemana)
              .map((g) => ({
                ...g,
                nome_disciplina: td.nome_disciplina,
                nome_turma: td.nome_turma,
                nome_serie: td.nome_serie,
                turno: td.turno,
                sala: td.sala,
              }))
          } catch {
            return []
          }
        })
      )
      const todas = grades.flat().sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
      setAulasHoje(todas)
    } catch (error) {
      logger.error('❌ Erro ao carregar aulas de hoje', 'component', error)
      setAulasHoje([])
    }
  }

  // Agrupar disciplinas por turma
  const turmasAgrupadas = turmasDisciplinas.reduce((acc, item) => {
    if (!acc[item.turma_id]) {
      acc[item.turma_id] = {
        turma_id: item.turma_id,
        nome_turma: item.nome_turma,
        turno: item.turno,
        sala: item.sala,
        nome_serie: item.nome_serie,
        ano: item.ano,
        disciplinas: [] as TurmaDisciplina[],
      }
    }
    acc[item.turma_id].disciplinas.push(item)
    return acc
  }, {} as Record<string, any>)

  const totalDisciplinas = turmasDisciplinas.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Meu Diário</h1>
              <p className="text-gray-600 mt-0.5">{usuario?.nome_usuario} • {usuario?.email_usuario}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700">Ativo</span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600">Carregando seu diário...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Aulas de hoje */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-gray-900">Aulas de hoje</h2>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
              </div>

              {aulasHoje.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                  <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma aula programada para hoje na sua grade.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aulasHoje.map((aula, i) => (
                    <button
                      key={(aula.grade_horario_id || '') + i}
                      onClick={() =>
                        navigate(`/diario/dia/${aula.turma_disciplina_professor_id}/${hojeISO()}`)
                      }
                      className="text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          {aula.hora_inicio} - {aula.hora_fim}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="font-bold text-gray-900">{aula.nome_disciplina}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {aula.nome_serie} - {aula.nome_turma} • {aula.turno} • Sala {aula.sala}
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-3">Registrar aula de hoje →</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resumo */}
            {totalDisciplinas > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{Object.keys(turmasAgrupadas).length}</div>
                  <div className="text-sm text-gray-600">Turmas</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalDisciplinas}</div>
                  <div className="text-sm text-gray-600">Disciplinas</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{aulasHoje.length}</div>
                  <div className="text-sm text-gray-600">Aulas hoje</div>
                </div>
              </div>
            )}

            {/* Minhas turmas */}
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Minhas turmas e disciplinas</h2>
            </div>

            {Object.keys(turmasAgrupadas).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma encontrada</h3>
                <p className="text-gray-600">Você não possui turmas alocadas no ano letivo ativo.</p>
                <p className="text-sm text-gray-500 mt-2">Entre em contato com a secretaria para ser alocado.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.values(turmasAgrupadas).map((turma: any) => (
                  <div
                    key={turma.turma_id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                  >
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center shadow">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {turma.nome_serie} - {turma.nome_turma}
                          </h3>
                          <div className="flex items-center gap-4 mt-0.5 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {turma.turno}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> Sala {turma.sala}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {turma.disciplinas.map((disciplina: TurmaDisciplina) => (
                        <div
                          key={disciplina.disciplina_id}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <h5 className="font-semibold text-gray-900 mb-3">{disciplina.nome_disciplina}</h5>
                          <button
                            onClick={() =>
                              navigate(`/diario/materia/${disciplina.turma_disciplina_professor_id}`)
                            }
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Acessar diário
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
