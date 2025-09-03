import { logger } from '../../lib/logger'

export default function DashboardPage() {
  logger.info('📊 Carregando Dashboard...')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-gray-900">234</p>
              <p className="text-xs text-green-600">+12% em relação ao mês anterior</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📚</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Frequência Média</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
              <p className="text-xs text-green-600">+3% em relação ao mês anterior</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avisos Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-xs text-red-600">-2 em relação ao mês anterior</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seções do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Últimos Avisos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">⚠️ Últimos Avisos</h3>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Comunicado Importante</h4>
              <p className="text-sm text-gray-700 mb-2">
                Reunião de pais e mestres marcada para o próximo sábado, dia 10/04, às 9h. 
                Sua presença é fundamental para o acompanhamento do desenvolvimento dos alunos.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Acessar →
              </button>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-2xl mb-2">👥</span>
              <span className="text-sm font-medium text-gray-900">Matrículas</span>
              <span className="text-xs text-gray-500">Gerenciar alunos e matrículas</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-2xl mb-2">📝</span>
              <span className="text-sm font-medium text-gray-900">Diário Escolar</span>
              <span className="text-xs text-gray-500">Registrar frequência e notas</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-2xl mb-2">📢</span>
              <span className="text-sm font-medium text-gray-900">Avisos</span>
              <span className="text-xs text-gray-500">Enviar comunicados</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-2xl mb-2">⚙️</span>
              <span className="text-sm font-medium text-gray-900">Configurações</span>
              <span className="text-xs text-gray-500">Ajustar sistema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
