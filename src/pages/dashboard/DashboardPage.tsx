import { useState, useEffect } from 'react'
import { Users, GraduationCap, School } from 'lucide-react'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
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
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">📢 Avisos Importantes</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-blue-400">ℹ️</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-blue-900">Sistema Atualizado</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Nova versão do sistema escolar disponível com melhorias na dashboard.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-yellow-900">Lembrete</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Período de matrículas abertas até o final do mês.
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
  )
}
