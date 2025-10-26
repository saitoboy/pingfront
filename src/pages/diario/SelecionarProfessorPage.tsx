import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Eye,
  User
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { professorService } from '../../services/professorService'
import type { ProfessorComTurmas } from '../../types/diario'

export default function SelecionarProfessorPage() {
  const navigate = useNavigate()
  const [professores, setProfessores] = useState<ProfessorComTurmas[]>([])
  const [professoresFiltrados, setProfessoresFiltrados] = useState<ProfessorComTurmas[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar professores ao montar o componente
  useEffect(() => {
    carregarProfessores()
  }, [])

  // Filtrar professores quando o termo de busca mudar
  useEffect(() => {
    filtrarProfessores()
  }, [professores, searchTerm])

  const carregarProfessores = async () => {
    try {
      setLoading(true)
      logger.info('📋 Carregando usuários do tipo professor com turmas...', 'component')
      
      const response = await professorService.listarProfessoresComTurmas()
      
      if (response.status === 'sucesso' && response.dados) {
        setProfessores(response.dados)
        logger.success(`✅ ${response.dados.length} usuários do tipo professor carregados`, 'component')
      } else {
        logger.error('❌ Erro ao carregar usuários do tipo professor', 'component')
        setProfessores([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar usuários do tipo professor', 'component', error)
      setProfessores([])
    } finally {
      setLoading(false)
    }
  }

  const filtrarProfessores = () => {
    let filtrados = [...professores]

    // Filtro por termo de busca (nome do professor)
    if (searchTerm) {
      filtrados = filtrados.filter(prof => 
        prof.nome_usuario.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setProfessoresFiltrados(filtrados)
  }

  const handleProfessorClick = (professor: ProfessorComTurmas) => {
    logger.info(`👤 Professor selecionado: ${professor.nome_usuario}`, 'component')
    // Navega para a página do diário do professor
    navigate(`/diario/professor/${professor.usuario_id}`)
  }

  // Agrupar professores únicos (sem duplicatas)
  const professoresUnicos = professoresFiltrados.reduce((acc, prof) => {
    if (!acc.find(p => p.professor_id === prof.professor_id)) {
      acc.push(prof)
    }
    return acc
  }, [] as ProfessorComTurmas[])


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">


        {/* Busca */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Buscar Professor</h3>
          </div>
          
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome do professor..."
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Deixe em branco para exibir todos os professores
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando professores...</p>
            </div>
          </div>
        )}

        {/* Lista de Professores */}
        {!loading && (
          <div className="space-y-4">
            {professoresUnicos.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum professor com turmas no ano letivo ativo</h3>
                <p className="text-gray-600">Não há professores alocados em turmas do ano letivo atual.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Professores com Turmas Ativas</h3>
                  <p className="text-sm text-gray-600">Selecione um professor para visualizar seu diário escolar</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {professoresUnicos.map((professor) => (
                    <div key={professor.professor_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{professor.nome_usuario}</h4>
                            <p className="text-sm text-gray-600">{professor.email_usuario}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">Ano Letivo {professor.ano} - Ativo</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleProfessorClick(professor)}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Diário
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        
      </div>
    </div>
  )
}
