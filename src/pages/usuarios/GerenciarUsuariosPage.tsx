import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  User,
  Mail,
  Calendar,
  AlertCircle,
  Shield
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { usuarioService } from '../../services/usuarioService'
import EditarUsuarioModal from './EditarUsuarioModal'
import type { Usuario, UsuarioTipo } from '../../types/api'

interface UsuarioComTipo extends Usuario {
  tipo_usuario_nome?: string
}

export default function GerenciarUsuariosPage() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<UsuarioComTipo[]>([])
  const [tiposUsuario, setTiposUsuario] = useState<UsuarioTipo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioComTipo | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Carregar usuários e tipos em paralelo
      const [usuariosData, tiposData] = await Promise.all([
        usuarioService.listarUsuarios(),
        usuarioService.buscarTiposUsuario()
      ])

      setUsuarios(usuariosData.dados || [])
      setTiposUsuario(tiposData)
      
      logger.info('✅ Dados carregados com sucesso', 'component', {
        usuarios: usuariosData.dados?.length || 0,
        tipos: tiposData.length
      })
    } catch (error) {
      logger.error('❌ Erro ao carregar dados', 'component', error)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchSearch = usuario.nome_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       usuario.email_usuario.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = !filterTipo || usuario.tipo_usuario_id === filterTipo
    return matchSearch && matchTipo
  })

  const handleCriarUsuario = () => {
    navigate('/usuarios/criar')
  }

  // Ações dos usuários
  const handleEditarUsuario = (usuario: UsuarioComTipo) => {
    setSelectedUsuario(usuario)
    setShowEditModal(true)
  }

  const handleExcluirUsuario = (usuario: UsuarioComTipo) => {
    setSelectedUsuario(usuario)
    setShowDeleteModal(true)
  }

  const handleConfirmarExclusao = async () => {
    if (!selectedUsuario) return

    setIsDeleting(true)
    try {
      await usuarioService.excluirUsuario(selectedUsuario.usuario_id)
      logger.success('✅ Usuário excluído com sucesso', 'component')
      
      // Recarregar lista
      await carregarDados()
      setShowDeleteModal(false)
      setSelectedUsuario(null)
    } catch (error) {
      logger.error('❌ Erro ao excluir usuário', 'component', error)
      setError('Erro ao excluir usuário. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUsuarioEditado = async () => {
    // Recarregar dados após edição
    await carregarDados()
  }

  // Obter nome do tipo de usuário
  const getTipoNome = (tipoId: string) => {
    const tipo = tiposUsuario.find(t => t.tipo_usuario_id === tipoId)
    return tipo ? tipo.nome_tipo.charAt(0).toUpperCase() + tipo.nome_tipo.slice(1) : 'Desconhecido'
  }

  // Obter cor do tipo de usuário
  const getTipoColor = (tipoId: string) => {
    const tipo = tiposUsuario.find(t => t.tipo_usuario_id === tipoId)
    switch (tipo?.nome_tipo) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar Usuários
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
                  placeholder="Nome ou email..."
                />
              </div>
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filtrar por Tipo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Todos os tipos</option>
                  {Array.isArray(tiposUsuario) && tiposUsuario.map((tipo) => (
                    <option key={tipo.tipo_usuario_id} value={tipo.tipo_usuario_id}>
                      {tipo.nome_tipo.charAt(0).toUpperCase() + tipo.nome_tipo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>



        {/* Lista de Usuários */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header da Tabela */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Usuários ({usuariosFiltrados.length})
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/usuarios/tipos')}
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Gerenciar Tipos
                </button>
                <button
                  onClick={handleCriarUsuario}
                  className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
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
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || filterTipo ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterTipo 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando o primeiro usuário do sistema'
                  }
                </p>
                {!searchTerm && !filterTipo && (
                  <button
                    onClick={handleCriarUsuario}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Criar Primeiro Usuário
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {usuariosFiltrados.map((usuario) => (
                  <div
                    key={usuario.usuario_id}
                    className="group relative bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>

                        {/* Informações */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              {usuario.nome_usuario}
                            </h4>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTipoColor(usuario.tipo_usuario_id)}`}>
                              {getTipoNome(usuario.tipo_usuario_id)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{usuario.email_usuario}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Criado em {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditarUsuario(usuario)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar usuário"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExcluirUsuario(usuario)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir usuário"
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

        {/* Modal de Edição */}
        {showEditModal && selectedUsuario && (
          <EditarUsuarioModal
            usuario={selectedUsuario}
            tiposUsuario={tiposUsuario}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedUsuario(null)
            }}
            onSuccess={handleUsuarioEditado}
          />
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteModal && selectedUsuario && (
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
                  Tem certeza que deseja excluir o usuário <strong>{selectedUsuario.nome_usuario}</strong>?
                  Esta ação não pode ser desfeita.
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
