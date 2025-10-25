import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Mail, 
  Lock, 
  User, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Save
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { validators } from '../../lib/utils'
import { usuarioService } from '../../services/usuarioService'
import type { UsuarioTipo } from '../../types/api'

interface FormData {
  nome_usuario: string
  email_usuario: string
  senha_usuario: string
  confirmar_senha: string
  tipo_usuario_id: string
}

export default function CriarUsuarioPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    nome_usuario: '',
    email_usuario: '',
    senha_usuario: '',
    confirmar_senha: '',
    tipo_usuario_id: ''
  })
  
  const [tiposUsuario, setTiposUsuario] = useState<UsuarioTipo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  // Carregar tipos de usuário
  useEffect(() => {
    carregarTiposUsuario()
  }, [])

  const carregarTiposUsuario = async () => {
    try {
      setIsLoadingDropdowns(true)
      const tipos = await usuarioService.buscarTiposUsuario()
      setTiposUsuario(tipos)
      logger.info('✅ Tipos de usuário carregados com sucesso', 'component', { count: tipos.length })
    } catch (error) {
      logger.error('❌ Erro ao carregar tipos de usuário', 'component', error)
      setTiposUsuario([])
    } finally {
      setIsLoadingDropdowns(false)
    }
  }

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Nome
    if (!validators.obrigatorio(formData.nome_usuario)) {
      newErrors.nome_usuario = 'Nome é obrigatório'
    }

    // Email
    if (!validators.obrigatorio(formData.email_usuario)) {
      newErrors.email_usuario = 'Email é obrigatório'
    } else if (!validators.email(formData.email_usuario)) {
      newErrors.email_usuario = 'Email inválido'
    }

    // Senha
    if (!validators.obrigatorio(formData.senha_usuario)) {
      newErrors.senha_usuario = 'Senha é obrigatória'
    } else if (formData.senha_usuario.length < 6) {
      newErrors.senha_usuario = 'Senha deve ter pelo menos 6 caracteres'
    }

    // Confirmar senha
    if (!validators.obrigatorio(formData.confirmar_senha)) {
      newErrors.confirmar_senha = 'Confirmação de senha é obrigatória'
    } else if (formData.senha_usuario !== formData.confirmar_senha) {
      newErrors.confirmar_senha = 'Senhas não coincidem'
    }

    // Tipo de usuário
    if (!validators.obrigatorio(formData.tipo_usuario_id)) {
      newErrors.tipo_usuario_id = 'Tipo de usuário é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Limpar erros quando o usuário digitar
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      logger.warning('Formulário inválido', 'form')
      return
    }

    setIsLoading(true)
    setSuccess(false)

    try {
      logger.info('👤 Criando novo usuário...', 'form')
      
      const dadosUsuario = {
        nome_usuario: formData.nome_usuario,
        email_usuario: formData.email_usuario,
        senha_usuario: formData.senha_usuario,
        tipo_usuario_id: formData.tipo_usuario_id
      }

      const resultado = await usuarioService.criarUsuario(dadosUsuario)

      if (resultado.status === 'sucesso') {
        logger.success('✅ Usuário criado com sucesso!', 'form')
        setSuccess(true)
        
        // Limpar formulário
        setFormData({
          nome_usuario: '',
          email_usuario: '',
          senha_usuario: '',
          confirmar_senha: '',
          tipo_usuario_id: ''
        })
        
        
      } else {
        logger.error(`❌ Erro ao criar usuário: ${resultado.mensagem}`, 'form')
        setErrors({ submit: resultado.mensagem })
      }
    } catch (error: any) {
      logger.error('❌ Erro inesperado ao criar usuário', 'form', error)
      setErrors({ submit: error.response?.data?.mensagem || 'Erro inesperado ao criar usuário' })
    } finally {
      setIsLoading(false)
    }
  }

  // Navegação
  const handleVoltar = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Mensagem de Sucesso */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-5 shadow-lg animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold text-green-800">Usuário Criado com Sucesso!</h3>
                <p className="text-sm text-green-700 mt-1">
                  O novo usuário foi adicionado ao sistema e já pode fazer login.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Layout com duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card de Orientações - Esquerda */}
          <div className="space-y-6">
            <div className="">
              <div className="flex items-center space-x-3 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Orientações</h2>
                  <p className="text-gray-600">Siga estas diretrizes para criar usuários</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Informações Gerais */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    Informações Gerais
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Preencha todos os campos obrigatórios marcados com *</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>O email deve ser único no sistema</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Escolha o tipo de usuário apropriado</span>
                    </li>
                  </ul>
                </div>

                {/* Dicas de Segurança */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-orange-600 mr-2" />
                    Dicas de Segurança
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Use senhas fortes com pelo menos 8 caracteres</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Combine letras, números e símbolos</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Evite informações pessoais óbvias</span>
                    </li>
                  </ul>
                </div>

                
              </div>
            </div>
          </div>

          {/* Formulário - Direita */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header do Card */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Dados do Usuário</h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="nome_usuario" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nome_usuario"
                    type="text"
                    value={formData.nome_usuario}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, nome_usuario: e.target.value }))
                      clearError('nome_usuario')
                    }}
                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.nome_usuario ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Digite o nome completo"
                  />
                </div>
                {errors.nome_usuario && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.nome_usuario}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email_usuario" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email_usuario"
                    type="email"
                    value={formData.email_usuario}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email_usuario: e.target.value }))
                      clearError('email_usuario')
                    }}
                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email_usuario ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="usuario@escola.com"
                  />
                </div>
                {errors.email_usuario && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email_usuario}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="senha_usuario" className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="senha_usuario"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha_usuario}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, senha_usuario: e.target.value }))
                      clearError('senha_usuario')
                    }}
                    className={`block w-full pl-12 pr-12 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.senha_usuario ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.senha_usuario && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.senha_usuario}
                  </p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmar_senha" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmar_senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmar_senha}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, confirmar_senha: e.target.value }))
                      clearError('confirmar_senha')
                    }}
                    className={`block w-full pl-12 pr-12 py-3 border-2 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmar_senha ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Digite a senha novamente"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmar_senha && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmar_senha}
                  </p>
                )}
              </div>

              {/* Tipo de Usuário */}
              <div>
                <label htmlFor="tipo_usuario_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Usuário *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="tipo_usuario_id"
                    value={formData.tipo_usuario_id}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, tipo_usuario_id: e.target.value }))
                      clearError('tipo_usuario_id')
                    }}
                    disabled={isLoadingDropdowns}
                    className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.tipo_usuario_id ? 'border-red-300' : 'border-gray-200'
                    } ${isLoadingDropdowns ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">
                      {isLoadingDropdowns ? 'Carregando tipos...' : 'Selecione o tipo de usuário'}
                    </option>
                    {tiposUsuario.map((tipo) => (
                      <option key={tipo.tipo_usuario_id} value={tipo.tipo_usuario_id}>
                        {tipo.nome_tipo.charAt(0).toUpperCase() + tipo.nome_tipo.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.tipo_usuario_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.tipo_usuario_id}
                  </p>
                )}
              </div>

              {/* Erro de submissão */}
              {errors.submit && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-sm text-red-800 font-medium">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={handleVoltar}
                  className="flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-8 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Criar Usuário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
