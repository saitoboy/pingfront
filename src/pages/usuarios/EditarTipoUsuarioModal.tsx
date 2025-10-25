import React, { useState, useEffect } from 'react'
import { X, Save, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { logger } from '../../lib/logger'
import { usuarioService } from '../../services/usuarioService'
import type { UsuarioTipo } from '../../types/api'

interface EditarTipoUsuarioModalProps {
  tipo?: UsuarioTipo | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  nome_tipo: string
}

interface FormErrors {
  [key: string]: string
}

export default function EditarTipoUsuarioModal({ 
  tipo, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditarTipoUsuarioModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nome_tipo: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const isEditing = !!tipo

  // Inicializar dados do formulário
  useEffect(() => {
    if (isOpen) {
      if (tipo) {
        setFormData({
          nome_tipo: tipo.nome_tipo || ''
        })
      } else {
        setFormData({
          nome_tipo: ''
        })
      }
      setErrors({})
      setSuccess(false)
    }
  }, [tipo, isOpen])

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nome_tipo.trim()) {
      newErrors.nome_tipo = 'Nome do tipo é obrigatório'
    } else if (formData.nome_tipo.trim().length < 2) {
      newErrors.nome_tipo = 'Nome deve ter pelo menos 2 caracteres'
    } else if (!/^[a-z_]+$/.test(formData.nome_tipo.trim())) {
      newErrors.nome_tipo = 'Nome deve conter apenas letras minúsculas e underscore'
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
      if (isEditing && tipo) {
        logger.info('✏️ Atualizando tipo de usuário...', 'form', { tipo_id: tipo.tipo_usuario_id })
        
        const resultado = await usuarioService.atualizarTipoUsuario(tipo.tipo_usuario_id, formData)
        
        if (resultado.status === 'sucesso') {
          logger.success('✅ Tipo de usuário atualizado com sucesso', 'form')
          setSuccess(true)
        } else {
          logger.error(`❌ Erro ao atualizar tipo: ${resultado.mensagem}`, 'form')
          setErrors({ submit: resultado.mensagem })
        }
      } else {
        logger.info('➕ Criando novo tipo de usuário...', 'form')
        
        const resultado = await usuarioService.criarTipoUsuario(formData)
        
        if (resultado.status === 'sucesso') {
          logger.success('✅ Tipo de usuário criado com sucesso', 'form')
          setSuccess(true)
        } else {
          logger.error(`❌ Erro ao criar tipo: ${resultado.mensagem}`, 'form')
          setErrors({ submit: resultado.mensagem })
        }
      }
      
      // Chamar callback de sucesso
      if (success || (!errors.submit && !isLoading)) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      }
    } catch (error: any) {
      logger.error('❌ Erro inesperado ao salvar tipo', 'form', error)
      setErrors({ submit: error.response?.data?.mensagem || 'Erro inesperado ao salvar tipo' })
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
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Tipo de Usuário' : 'Novo Tipo de Usuário'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualize as informações do tipo' : 'Crie um novo tipo de usuário'}
              </p>
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
                    {isEditing ? 'Tipo atualizado com sucesso!' : 'Tipo criado com sucesso!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Tipo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.nome_tipo}
                  onChange={(e) => handleInputChange('nome_tipo', e.target.value.toLowerCase())}
                  className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.nome_tipo 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Ex: admin, professor, secretario"
                  disabled={isLoading}
                />
              </div>
              {errors.nome_tipo && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.nome_tipo}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use apenas letras minúsculas e underscore. Ex: admin, professor, secretario
              </p>
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
                className="px-6 py-3 text-white bg-blue-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {isEditing ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Salvar Alterações' : 'Criar Tipo'}
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
