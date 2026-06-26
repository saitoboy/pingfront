import { useState, useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Camera,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { usuarioService } from '../../services/usuarioService'
import EditarUsuarioModal from './EditarUsuarioModal'
import type { Usuario, UsuarioTipo } from '../../types/api'

interface UsuarioComTipo extends Usuario {
  tipo_usuario_nome?: string
}

type SortField = 'nome_usuario' | 'email_usuario' | 'tipo_usuario_id' | 'created_at'
type SortDir = 'asc' | 'desc'

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
  const [sortField, setSortField] = useState<SortField>('nome_usuario')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [fotoTargetId, setFotoTargetId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [usuariosData, tiposData] = await Promise.all([
        usuarioService.listarUsuarios(),
        usuarioService.buscarTiposUsuario()
      ])
      setUsuarios(usuariosData.dados || [])
      setTiposUsuario(tiposData)
      logger.info('Dados carregados', 'component', {
        usuarios: usuariosData.dados?.length || 0,
        tipos: tiposData.length
      })
    } catch (err) {
      logger.error('Erro ao carregar dados', 'component', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getTipoNome = (tipoId: string) => {
    const tipo = tiposUsuario.find(t => t.tipo_usuario_id === tipoId)
    return tipo ? tipo.nome_tipo.charAt(0).toUpperCase() + tipo.nome_tipo.slice(1) : 'Desconhecido'
  }

  const getTipoConfig = (tipoId: string) => {
    const tipo = tiposUsuario.find(t => t.tipo_usuario_id === tipoId)
    switch (tipo?.nome_tipo) {
      case 'admin':      return { badge: 'bg-red-100 text-red-700 border-red-200',     dot: 'bg-red-500' }
      case 'secretario': return { badge: 'bg-blue-100 text-blue-700 border-blue-200',  dot: 'bg-blue-500' }
      case 'professor':  return { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' }
      default:           return { badge: 'bg-gray-100 text-gray-700 border-gray-200',  dot: 'bg-gray-400' }
    }
  }

  const isProfessor = (tipoId: string) =>
    tiposUsuario.find(t => t.tipo_usuario_id === tipoId)?.nome_tipo === 'professor'

  const compare = (a: UsuarioComTipo, b: UsuarioComTipo): number => {
    let result = 0
    switch (sortField) {
      case 'nome_usuario':   result = a.nome_usuario.localeCompare(b.nome_usuario); break
      case 'email_usuario':  result = a.email_usuario.localeCompare(b.email_usuario); break
      case 'tipo_usuario_id': result = getTipoNome(a.tipo_usuario_id).localeCompare(getTipoNome(b.tipo_usuario_id)); break
      case 'created_at':     result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
    }
    return sortDir === 'asc' ? result : -result
  }

  const usuariosFiltrados = usuarios
    .filter(u => {
      const matchSearch =
        u.nome_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email_usuario.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = !filterTipo || u.tipo_usuario_id === filterTipo
      return matchSearch && matchTipo
    })
    .sort(compare)

  const contadores = {
    total:     usuarios.length,
    admin:     usuarios.filter(u => tiposUsuario.find(t => t.tipo_usuario_id === u.tipo_usuario_id)?.nome_tipo === 'admin').length,
    secretario:usuarios.filter(u => tiposUsuario.find(t => t.tipo_usuario_id === u.tipo_usuario_id)?.nome_tipo === 'secretario').length,
    professor: usuarios.filter(u => tiposUsuario.find(t => t.tipo_usuario_id === u.tipo_usuario_id)?.nome_tipo === 'professor').length,
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

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
      logger.info('Usuário excluído', 'component')
      await carregarDados()
      setShowDeleteModal(false)
      setSelectedUsuario(null)
    } catch (err) {
      logger.error('Erro ao excluir usuário', 'component', err)
      setError('Erro ao excluir usuário. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUsuarioEditado = async () => {
    await carregarDados()
  }

  const handleFotoClick = (usuarioId: string) => {
    setFotoTargetId(usuarioId)
    fileInputRef.current?.click()
  }

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !fotoTargetId) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setFotos(prev => ({ ...prev, [fotoTargetId]: ev.target!.result as string }))
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setFotoTargetId(null)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-gray-300" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-600" />
      : <ChevronDown className="w-3 h-3 text-blue-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',        count: contadores.total,      color: 'from-blue-600 to-purple-600' },
            { label: 'Admins',       count: contadores.admin,      color: 'from-red-500 to-red-600' },
            { label: 'Secretários',  count: contadores.secretario, color: 'from-blue-500 to-blue-600' },
            { label: 'Professores',  count: contadores.professor,  color: 'from-green-500 to-green-600' },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className={`w-8 h-8 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-2`}>
                <Users className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Buscar por nome ou email..."
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: '', label: 'Todos' },
                ...tiposUsuario.map(t => ({
                  value: t.tipo_usuario_id,
                  label: t.nome_tipo.charAt(0).toUpperCase() + t.nome_tipo.slice(1)
                }))
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilterTipo(value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                    filterTipo === value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Usuários</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {usuariosFiltrados.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/usuarios/criar')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Usuário
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={carregarDados}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Tentar Novamente
              </button>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700">
                {searchTerm || filterTipo ? 'Nenhum resultado encontrado' : 'Nenhum usuário cadastrado'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || filterTipo ? 'Ajuste os filtros de busca' : 'Crie o primeiro usuário do sistema'}
              </p>
              {!searchTerm && !filterTipo && (
                <button
                  onClick={() => navigate('/usuarios/criar')}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Usuário
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th
                      className="px-6 py-3 text-left cursor-pointer select-none group"
                      onClick={() => handleSort('nome_usuario')}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                          Usuário
                        </span>
                        <SortIcon field="nome_usuario" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer select-none group"
                      onClick={() => handleSort('email_usuario')}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                          Email
                        </span>
                        <SortIcon field="email_usuario" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer select-none group"
                      onClick={() => handleSort('tipo_usuario_id')}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                          Tipo
                        </span>
                        <SortIcon field="tipo_usuario_id" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer select-none group hidden md:table-cell"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                          Criado em
                        </span>
                        <SortIcon field="created_at" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usuariosFiltrados.map((usuario) => {
                    const cfg = getTipoConfig(usuario.tipo_usuario_id)
                    const foto = fotos[usuario.usuario_id]
                    const ehProfessor = isProfessor(usuario.tipo_usuario_id)
                    return (
                      <tr
                        key={usuario.usuario_id}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              {foto ? (
                                <img
                                  src={foto}
                                  alt={usuario.nome_usuario}
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm ring-2 ring-white">
                                  <span className="text-white text-xs font-bold">
                                    {usuario.nome_usuario.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              {ehProfessor && (
                                <button
                                  onClick={() => handleFotoClick(usuario.usuario_id)}
                                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Alterar foto do professor"
                                >
                                  <Camera className="w-2.5 h-2.5 text-gray-500" />
                                </button>
                              )}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">
                              {usuario.nome_usuario}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {usuario.email_usuario}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {getTipoNome(usuario.tipo_usuario_id)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 hidden md:table-cell">
                          {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditarUsuario(usuario)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar usuário"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirUsuario(usuario)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Input oculto para upload de foto (professores) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFotoChange}
        />

        {/* Modal de Edição */}
        {showEditModal && selectedUsuario && (
          <EditarUsuarioModal
            usuario={selectedUsuario}
            tiposUsuario={tiposUsuario}
            isOpen={showEditModal}
            onClose={() => { setShowEditModal(false); setSelectedUsuario(null) }}
            onSuccess={handleUsuarioEditado}
          />
        )}

        {/* Modal de Exclusão */}
        {showDeleteModal && selectedUsuario && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Confirmar Exclusão</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6 pl-13">
                Excluir o usuário <strong>{selectedUsuario.nome_usuario}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarExclusao}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
