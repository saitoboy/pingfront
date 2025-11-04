import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  ClipboardList,
  Clock,
  TrendingUp,
  Eye,
  School
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardProfessorService, type DashboardProfessorStats, type ProximaAula, type TurmaResumo } from '../../services/dashboardProfessorService'
import { StatCard } from '../../components/dashboard/StatCard'

export default function DashboardProfessorPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [stats, setStats] = useState<DashboardProfessorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    carregarDadosDashboard()
  }, [])

  const carregarDadosDashboard = async () => {
    try {
      logger.info('📊 Carregando dados da dashboard do professor...', 'component')
      setLoading(true)
      setError(null)

      const statsData = await dashboardProfessorService.buscarEstatisticas()
      setStats(statsData)

      logger.info('✅ Dados da dashboard do professor carregados com sucesso', 'component', {
        stats: statsData
      })
    } catch (error) {
      logger.error('❌ Erro ao carregar dados da dashboard do professor', 'component', error)
      setError('Erro ao carregar dados da dashboard. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatarHora = (hora: string) => {
    return hora.substring(0, 5) // Formato HH:MM
  }

  const handleAcessarDiario = (turmaDisciplinaProfessorId: string) => {
    navigate(`/diario/materia/${turmaDisciplinaProfessorId}`)
  }

  const handleAcessarMeuDiario = () => {
    navigate('/meu-diario')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Meu Dashboard</h1>
                  <p className="text-gray-600 mt-1">
                    Bem-vindo, {usuario?.nome_usuario}!
                  </p>
                </div>
              </div>
              <button
                onClick={handleAcessarMeuDiario}
                className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Meu Diário
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5 shadow-lg animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold text-red-800">Erro ao Carregar Dados</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Minhas Turmas"
            value={stats?.totalTurmas || 0}
            icon={School}
            iconBgColor="bg-blue-500"
            trend={{
              value: "Turmas ativas",
              type: "neutral"
            }}
            loading={loading}
          />
          
          <StatCard
            title="Disciplinas"
            value={stats?.totalDisciplinas || 0}
            icon={BookOpen}
            iconBgColor="bg-green-500"
            trend={{
              value: "Disciplinas lecionadas",
              type: "neutral"
            }}
            loading={loading}
          />
          
          <StatCard
            title="Aulas Ministradas"
            value={stats?.totalAulas || 0}
            icon={Calendar}
            iconBgColor="bg-purple-500"
            trend={{
              value: "Total de aulas",
              type: "neutral"
            }}
            loading={loading}
          />
          
          <StatCard
            title="Atividades"
            value={stats?.totalAtividades || 0}
            icon={ClipboardList}
            iconBgColor="bg-orange-500"
            trend={{
              value: `${stats?.atividadesAvaliativas || 0} avaliativas`,
              type: "neutral"
            }}
            loading={loading}
          />
        </div>

        {/* Seções Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Próximas Aulas */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Próximas Aulas</h3>
                </div>
                <span className="text-sm text-gray-600">Próximos 5 dias</span>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                </div>
              ) : stats?.proximasAulas && stats.proximasAulas.length > 0 ? (
                <div className="space-y-4">
                  {stats.proximasAulas.map((aula: ProximaAula) => (
                    <div
                      key={aula.aula_id}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{aula.nome_disciplina}</h4>
                              <p className="text-sm text-gray-600">
                                {aula.nome_serie} - {aula.nome_turma}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatarData(aula.data_aula)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatarHora(aula.hora_inicio)} - {formatarHora(aula.hora_fim)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma aula agendada nos próximos 5 dias</p>
                </div>
              )}
            </div>
          </div>

          {/* Resumo das Turmas */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <School className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Minhas Turmas</h3>
                </div>
                <button
                  onClick={handleAcessarMeuDiario}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todas
                </button>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                </div>
              ) : stats?.turmasResumo && stats.turmasResumo.length > 0 ? (
                <div className="space-y-4">
                  {stats.turmasResumo.slice(0, 5).map((turma: TurmaResumo) => (
                    <div
                      key={`${turma.turma_id}-${turma.disciplina_id}`}
                      className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleAcessarDiario(turma.turma_disciplina_professor_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{turma.nome_disciplina}</h4>
                              <p className="text-sm text-gray-600">
                                {turma.nome_serie} - {turma.nome_turma}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{turma.total_aulas} aulas</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClipboardList className="w-4 h-4" />
                              <span>{turma.total_atividades} atividades</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma turma encontrada</p>
                  <p className="text-sm text-gray-400 mt-2">Entre em contato com a secretaria para ser alocado em turmas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Ações Rápidas</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleAcessarMeuDiario}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">Meu Diário</h4>
                  <p className="text-sm text-gray-600">Acessar diário escolar</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/meu-diario')}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">Minhas Turmas</h4>
                  <p className="text-sm text-gray-600">Ver todas as turmas</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/meu-diario')}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">Atividades</h4>
                  <p className="text-sm text-gray-600">Gerenciar atividades</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

