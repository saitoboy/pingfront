import React, { useState, useEffect } from 'react'
import { X, Save, User, Mail, Shield, AlertCircle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { logger } from '../../lib/logger'
import { usuarioService } from '../../services/usuarioService'
import type { Usuario, UsuarioTipo } from '../../types/api'

interface EditarUsuarioModalProps {
  usuario: Usuario
  tiposUsuario: UsuarioTipo[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  nome_usuario: string
  email_usuario: string
  tipo_usuario_id: string
  nova_senha: string
  confirmar_senha: string
}

interface FormErrors {
  [key: string]: string
}

export default function EditarUsuarioModal({ 
  usuario, 
  tiposUsuario, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditarUsuarioModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nome_usuario: '',
    email_usuario: '',
    tipo_usuario_id: '',
    nova_senha: '',
    confirmar_senha: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)

  // Inicializar dados do formulário
  useEffect(() => {
    if (usuario && isOpen) {
      setFormData({
        nome_usuario: usuario.nome_usuario || '',
        email_usuario: usuario.email_usuario || '',
        tipo_usuario_id: usuario.tipo_usuario_id || '',
        nova_senha: '',
        confirmar_senha: ''
      })
      setErrors({})
      setSuccess(false)
      setShowNovaSenha(false)
      setShowConfirmarSenha(false)
    }
  }, [usuario, isOpen])

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nome_usuario.trim()) {
      newErrors.nome_usuario = 'Nome é obrigatório'
    } else if (formData.nome_usuario.trim().length < 2) {
      newErrors.nome_usuario = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.email_usuario.trim()) {
      newErrors.email_usuario = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_usuario.trim())) {
      newErrors.email_usuario = 'Email inválido'
    }

    if (!formData.tipo_usuario_id) {
      newErrors.tipo_usuario_id = 'Tipo de usuário é obrigatório'
    }

    if (formData.nova_senha) {
      if (formData.nova_senha.length < 6) {
        newErrors.nova_senha = 'Senha deve ter pelo menos 6 caracteres'
      }
      if (formData.nova_senha !== formData.confirmar_senha) {
        newErrors.confirmar_senha = 'Senhas não conferem'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manipular mudanças nos campos
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      logger.error('❌ Formulário inválido', 'form', errors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      logger.info('✏️ Atualizando usuário...', 'form', { usuario_id: usuario.usuario_id })
      
      const payload: { nome_usuario: string; email_usuario: string; tipo_usuario_id: string; senha_usuario?: string } = {
        nome_usuario: formData.nome_usuario,
        email_usuario: formData.email_usuario,
        tipo_usuario_id: formData.tipo_usuario_id,
      }
      if (formData.nova_senha) payload.senha_usuario = formData.nova_senha

      const resultado = await usuarioService.atualizarUsuario(usuario.usuario_id, payload)
      
      if (resultado.status === 'sucesso') {
        logger.success('✅ Usuário atualizado com sucesso', 'form')
        setSuccess(true)
        
        // Chamar callback de sucesso
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        logger.error(`❌ Erro ao atualizar usuário: ${resultado.mensagem}`, 'form')
        setErrors({ submit: resultado.mensagem })
      }
    } catch (error: any) {
      logger.error('❌ Erro inesperado ao atualizar usuário', 'form', error)
      setErrors({ submit: error.response?.data?.mensagem || 'Erro inesperado ao atualizar usuário' })
    } finally {
      setIsLoading(false)
    }
  }

  // Fechar modal
  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Usuário</h2>
              <p className="text-sm text-gray-600">Atualize as informações do usuário</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {/* Mensagem de Sucesso */}
          {success && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Usuário atualizado com sucesso!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.nome_usuario}
                  onChange={(e) => handleInputChange('nome_usuario', e.target.value)}
                  className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.nome_usuario 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Digite o nome completo"
                  disabled={isLoading}
                />
              </div>
              {errors.nome_usuario && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.nome_usuario}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email_usuario}
                  onChange={(e) => handleInputChange('email_usuario', e.target.value)}
                  className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email_usuario 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Digite o email"
                  disabled={isLoading}
                />
              </div>
              {errors.email_usuario && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email_usuario}
                </p>
              )}
            </div>

            {/* Tipo de Usuário */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Usuário *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={formData.tipo_usuario_id}
                  onChange={(e) => handleInputChange('tipo_usuario_id', e.target.value)}
                  className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.tipo_usuario_id 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Selecione o tipo de usuário</option>
                  {tiposUsuario.map((tipo) => (
                    <option key={tipo.tipo_usuario_id} value={tipo.tipo_usuario_id}>
                      {tipo.nome_tipo.charAt(0).toUpperCase() + tipo.nome_tipo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {errors.tipo_usuario_id && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.tipo_usuario_id}
                </p>
              )}
            </div>

            {/* Redefinir Senha */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Redefinir Senha</p>
              <p className="text-xs text-gray-400 mb-4 -mt-2">Deixe em branco para manter a senha atual.</p>

              {/* Nova Senha */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    value={formData.nova_senha}
                    onChange={(e) => handleInputChange('nova_senha', e.target.value)}
                    className={`block w-full pl-12 pr-12 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.nova_senha
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Nova senha (mín. 6 caracteres)"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNovaSenha(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.nova_senha && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.nova_senha}
                  </p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmarSenha ? 'text' : 'password'}
                    value={formData.confirmar_senha}
                    onChange={(e) => handleInputChange('confirmar_senha', e.target.value)}
                    className={`block w-full pl-12 pr-12 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmar_senha
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Repita a nova senha"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmarSenha(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmar_senha && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmar_senha}
                  </p>
                )}
              </div>
            </div>

            {/* Erro Geral */}
            {errors.submit && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
