import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock,
  Plus,
  Edit,
  Eye,
  Save,
  X,
  CheckCircle
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { aulaService } from '../../services/aulaService'

interface Aula {
  aula_id?: string
  turma_disciplina_professor_id: string
  data_aula: string
  hora_inicio: string
  hora_fim: string
  created_at?: string
  updated_at?: string
}


interface DiarioMateriaPageProps {
  professor: {
    professor_id: string
    nome_usuario: string
    email_usuario: string
  }
  turma: {
    turma_id: string
    nome_turma: string
    turno: string
    sala: string
    nome_serie: string
    ano: number
  }
  disciplina: {
    disciplina_id: string
    nome_disciplina: string
  }
  turmaDisciplinaProfessorId: string
  onNavigate?: (page: string) => void
  onVoltar?: () => void
}

export default function DiarioMateriaPage({ 
  turma, 
  disciplina, 
  turmaDisciplinaProfessorId,
  onNavigate, 
  onVoltar 
}: DiarioMateriaPageProps) {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Aula>({
    turma_disciplina_professor_id: turmaDisciplinaProfessorId,
    data_aula: new Date().toISOString().split('T')[0],
    hora_inicio: '08:00',
    hora_fim: '09:00'
  })

  useEffect(() => {
    carregarAulas()
  }, [turma.turma_id, disciplina.disciplina_id])

  const carregarAulas = async () => {
    try {
      setLoading(true)
      logger.info(`📚 Carregando aulas: ${disciplina.nome_disciplina} - ${turma.nome_turma}`, 'component')
      
      const response = await aulaService.listarAulasPorVinculacao(turmaDisciplinaProfessorId)
      
      if (response.status === 'sucesso' && response.dados) {
        setAulas(response.dados)
        logger.success(`✅ ${response.dados.length} aulas carregadas`, 'component')
      } else {
        logger.error('❌ Erro ao carregar aulas', 'component')
        setAulas([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar aulas', 'component', error)
      setAulas([])
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    if (onVoltar) {
      onVoltar()
    } else if (onNavigate) {
      onNavigate('diario-escolar')
    }
  }

  const handleNovaAula = () => {
    setFormData({
      turma_disciplina_professor_id: turmaDisciplinaProfessorId,
      data_aula: new Date().toISOString().split('T')[0],
      hora_inicio: '08:00',
      hora_fim: '09:00'
    })
    setShowForm(true)
  }

  const handleSalvarAula = async () => {
    try {
      logger.info(`💾 Salvando nova aula: ${formData.data_aula}`, 'component')
      
      const response = await aulaService.criarAula({
        turma_disciplina_professor_id: turmaDisciplinaProfessorId,
        data_aula: formData.data_aula,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim
      })
      
      if (response.status === 'sucesso' && response.dados) {
        setAulas([...aulas, response.dados])
        setShowForm(false)
        logger.success('✅ Aula salva com sucesso', 'component')
      } else {
        logger.error('❌ Erro ao salvar aula', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar aula', 'component', error)
    }
  }

  const handleCancelarAula = () => {
    setShowForm(false)
    setFormData({
      turma_disciplina_professor_id: turmaDisciplinaProfessorId,
      data_aula: new Date().toISOString().split('T')[0],
      hora_inicio: '08:00',
      hora_fim: '09:00'
    })
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Diário da Matéria</h1>
                <p className="text-gray-600 mt-1">{disciplina.nome_disciplina} - {turma.nome_serie} {turma.nome_turma}</p>
              </div>
            </div>
            <button
              onClick={handleNovaAula}
              className="flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Aula
            </button>
          </div>
        </div>

        

        {/* Formulário de Nova Aula */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-green-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Nova Aula</h3>
              <button
                onClick={handleCancelarAula}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Aula
                </label>
                <input
                  type="date"
                  value={formData.data_aula}
                  onChange={(e) => setFormData({...formData, data_aula: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Início
                </label>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fim
                </label>
                <input
                  type="time"
                  value={formData.hora_fim}
                  onChange={(e) => setFormData({...formData, hora_fim: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-2 text-blue-700">
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Informação</span>
              </div>
              <p className="text-blue-600 text-sm mt-2">
                Após criar a aula, você poderá adicionar conteúdos específicos para cada aula.
                Os conteúdos são adicionados separadamente para permitir maior flexibilidade.
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={handleCancelarAula}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarAula}
                className="flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Aula
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando aulas...</p>
            </div>
          </div>
        )}

        {/* Lista de Aulas */}
        {!loading && (
          <div className="space-y-6">
            {aulas.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma aula registrada</h3>
                <p className="text-gray-600 mb-6">Comece adicionando a primeira aula desta disciplina.</p>
                <button
                  onClick={handleNovaAula}
                  className="flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors mx-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Primeira Aula
                </button>
              </div>
            ) : (
              aulas.map((aula) => {
                return (
                  <div key={aula.aula_id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    {/* Header da Aula */}
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              Aula de {formatarData(aula.data_aula)}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{aula.hora_inicio} - {aula.hora_fim}</span>
                              </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <BookOpen className="w-4 h-4" />
                              <span>Conteúdos em breve</span>
                            </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdos da Aula */}
                    <div className="p-6">
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Funcionalidade de conteúdos em desenvolvimento</p>
                        <button className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                          <Plus className="w-4 h-4 mr-2 inline" />
                          Adicionar Conteúdo
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Estatísticas */}
        {!loading && aulas.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{aulas.length}</div>
                <div className="text-sm text-gray-600">Total de Aulas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {aulas.reduce((total, aula) => {
                    const inicio = new Date(`2000-01-01T${aula.hora_inicio}`)
                    const fim = new Date(`2000-01-01T${aula.hora_fim}`)
                    const duracao = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
                    return total + duracao
                  }, 0).toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Horas Ministradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(aulas.map(aula => aula.data_aula)).size}
                </div>
                <div className="text-sm text-gray-600">Dias de Aula</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
