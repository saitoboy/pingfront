import { useState, useEffect } from 'react'
import { Users, GraduationCap, School, Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { logger } from '../../lib/logger'
import { dashboardService, type DashboardStats, type UltimosAlunos, type AlunosPorTurma } from '../../services/dashboardService'
import { StatCard } from '../../components/dashboard/StatCard'
import { QuickActions } from '../../components/dashboard/QuickActions'
import { RecentStudents } from '../../components/dashboard/RecentStudents'
import { ClassDistribution } from '../../components/dashboard/ClassDistribution'

interface DashboardPageProps {
  onNavigate?: (page: string) => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [ultimosAlunos, setUltimosAlunos] = useState<UltimosAlunos[]>([])
  const [distribuicaoTurmas, setDistribuicaoTurmas] = useState<AlunosPorTurma[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para navegar para outras páginas
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page)
    } else {
      logger.info(`Navegação para ${page} não implementada`, 'component')
    }
  }

  // Configuração das ações rápidas
  const quickActions = [
    {
      id: 'matriculas',
      title: 'Nova Matrícula',
      description: 'Cadastrar novo aluno',
      icon: '👥',
      onClick: () => handleNavigate('ficha-cadastro'),
      bgColor: 'hover:bg-blue-50'
    },
    {
      id: 'alunos',
      title: 'Gerenciar Alunos',
      description: 'Ver e editar alunos',
      icon: '📝',
      onClick: () => handleNavigate('alunos'),
      bgColor: 'hover:bg-green-50'
    },
    {
      id: 'turmas',
      title: 'Turmas',
      description: 'Organizar turmas',
      icon: '🏫',
      onClick: () => handleNavigate('turmas'),
      bgColor: 'hover:bg-purple-50'
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      description: 'Visualizar relatórios',
      icon: '📊',
      onClick: () => handleNavigate('relatorios'),
      bgColor: 'hover:bg-yellow-50'
    }
  ]

  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        logger.info('📊 Carregando dados da dashboard...', 'component')
        setLoading(true)
        setError(null)

        // Carregar dados em paralelo
        const [statsData, alunosData, turmasData] = await Promise.all([
          dashboardService.buscarEstatisticas(),
          dashboardService.buscarUltimosAlunos(4),
          dashboardService.buscarAlunosPorTurma()
        ])

        setStats(statsData)
        setUltimosAlunos(alunosData)
        setDistribuicaoTurmas(turmasData)

        logger.info('✅ Dados da dashboard carregados com sucesso', 'component', {
          stats: statsData,
          ultimosAlunos: alunosData,
          ultimosAlunosLength: alunosData.length,
          distribuicaoTurmas: turmasData
        })
      } catch (error) {
        logger.error('❌ Erro ao carregar dados da dashboard', 'component', error)
        setError('Erro ao carregar dados da dashboard. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    carregarDadosDashboard()
  }, [])

  const handleViewAllStudents = () => {
    handleNavigate('alunos')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total de Alunos"
            value={stats?.totalAlunos || 0}
            icon={Users}
            iconBgColor="bg-blue-500"
            trend={{
              value: "Alunos matriculados",
              type: "neutral"
            }}
            loading={loading}
          />
          
          <StatCard
            title="Professores"
            value={stats?.totalProfessores || 0}
            icon={GraduationCap}
            iconBgColor="bg-green-500"
            trend={{
              value: "Corpo docente ativo",
              type: "neutral"
            }}
            loading={loading}
          />
          
          <StatCard
            title="Turmas Ativas"
            value={stats?.totalTurmas || 0}
            icon={School}
            iconBgColor="bg-purple-500"
            trend={{
              value: "Ano letivo atual",
              type: "neutral"
            }}
            loading={loading}
          />
        </div>

        {/* Seções Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Ações Rápidas */}
          <div className="lg:col-span-1">
            <QuickActions actions={quickActions} />
          </div>

          {/* Últimos Alunos */}
          <div className="lg:col-span-2">
            <RecentStudents
              alunos={ultimosAlunos}
              loading={loading}
              onViewAll={handleViewAllStudents}
            />
          </div>
        </div>

        {/* Distribuição de Turmas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ClassDistribution
            turmas={distribuicaoTurmas}
            loading={loading}
          />

          {/* Avisos/Notificações */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Avisos Importantes</h3>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                  <div className="h-20 bg-gray-200 rounded-xl"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="group relative bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative flex">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <Info className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-blue-900 mb-1">Sistema Atualizado</h4>
                        <p className="text-sm text-blue-700">
                          Nova versão do sistema escolar disponível com melhorias na dashboard e performance otimizada.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative flex">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-amber-900 mb-1">Período de Matrículas</h4>
                        <p className="text-sm text-amber-700">
                          Matrículas abertas até o final do mês. Não perca o prazo para garantir a vaga!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group relative bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative flex">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-green-900 mb-1">Backup Realizado</h4>
                        <p className="text-sm text-green-700">
                          Backup automático dos dados realizado com sucesso. Seus dados estão seguros!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
