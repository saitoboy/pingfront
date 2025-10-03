import { useState, useEffect } from 'react'
import { 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  User,
  AlertCircle
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { usuarioService } from '../../services/usuarioService'
import EditarTipoUsuarioModal from './EditarTipoUsuarioModal'
import type { UsuarioTipo } from '../../types/api'

interface GerenciarTiposUsuarioPageProps {
  onNavigate?: (page: string) => void
}

export default function GerenciarTiposUsuarioPage({ onNavigate }: GerenciarTiposUsuarioPageProps) {
  const [tiposUsuario, setTiposUsuario] = useState<UsuarioTipo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState<UsuarioTipo | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const tiposData = await usuarioService.buscarTiposUsuario()
      setTiposUsuario(tiposData)
      
      logger.info('✅ Tipos de usuário carregados com sucesso', 'component', {
        tipos: tiposData.length
      })
    } catch (error) {
      logger.error('❌ Erro ao carregar tipos de usuário', 'component', error)
      setError('Erro ao carregar tipos de usuário. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar tipos de usuário
  const tiposFiltrados = tiposUsuario.filter(tipo => {
    const matchSearch = tipo.nome_tipo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  // Navegação
  const handleVoltar = () => {
    if (onNavigate) {
      onNavigate('gerenciar-usuarios')
    }
  }

  // Ações dos tipos
  const handleEditarTipo = (tipo: UsuarioTipo) => {
    setSelectedTipo(tipo)
    setShowEditModal(true)
  }

  const handleExcluirTipo = (tipo: UsuarioTipo) => {
    setSelectedTipo(tipo)
    setShowDeleteModal(true)
  }

  const handleCriarTipo = () => {
    setSelectedTipo(null)
    setShowCreateModal(true)
  }

  const handleConfirmarExclusao = async () => {
    if (!selectedTipo) return

    setIsDeleting(true)
    try {
      await usuarioService.excluirTipoUsuario(selectedTipo.tipo_usuario_id)
      logger.success('✅ Tipo de usuário excluído com sucesso', 'component')
      
      // Recarregar lista
      await carregarDados()
      setShowDeleteModal(false)
      setSelectedTipo(null)
    } catch (error) {
      logger.error('❌ Erro ao excluir tipo de usuário', 'component', error)
      setError('Erro ao excluir tipo de usuário. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTipoEditado = async () => {
    // Recarregar dados após edição/criação
    await carregarDados()
  }

  // Obter cor do tipo de usuário
  const getTipoColor = (nomeTipo: string) => {
    switch (nomeTipo.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'secretario':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'professor':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtros e Busca */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar Tipos de Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nome do tipo..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Tipos */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header da Tabela */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Tipos de Usuário ({tiposFiltrados.length})
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCriarTipo}
                  className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Tipo
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao Carregar</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={carregarDados}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : tiposFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum tipo encontrado' : 'Nenhum tipo de usuário cadastrado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Tente ajustar o termo de busca'
                    : 'Comece criando o primeiro tipo de usuário'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleCriarTipo}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Criar Primeiro Tipo
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {tiposFiltrados.map((tipo) => (
                  <div
                    key={tipo.tipo_usuario_id}
                    className="group relative bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Shield className="w-6 h-6 text-white" />
                        </div>

                        {/* Informações */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              {tipo.nome_tipo.charAt(0).toUpperCase() + tipo.nome_tipo.slice(1)}
                            </h4>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTipoColor(tipo.nome_tipo)}`}>
                              {tipo.nome_tipo.toUpperCase()}
                            </span>
                          </div>
                          
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>ID: {tipo.tipo_usuario_id.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditarTipo(tipo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar tipo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExcluirTipo(tipo)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir tipo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Edição/Criação */}
        {(showEditModal || showCreateModal) && (
          <EditarTipoUsuarioModal
            tipo={selectedTipo}
            isOpen={showEditModal || showCreateModal}
            onClose={() => {
              setShowEditModal(false)
              setShowCreateModal(false)
              setSelectedTipo(null)
            }}
            onSuccess={handleTipoEditado}
          />
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteModal && selectedTipo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir o tipo <strong>{selectedTipo.nome_tipo}</strong>?
                  Esta ação não pode ser desfeita e pode afetar usuários existentes.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarExclusao}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
