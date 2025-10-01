import { useState } from 'react'
import { Mail, Lock, Sparkles, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { logger } from '../../lib/logger'
import api from '../../lib/api'
import pinguinhoImage from '../../assets/images/pinguinho2.png'

interface LoginPageProps {
  onLogin?: (userData: { name: string; email: string }) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      logger.info('🔐 Tentativa de login via API...')
      
      // Log dos dados que estão sendo enviados (SEM SENHA!)
      logger.info('📤 Dados sendo enviados:')
      console.log({ email: email, senha: '***OCULTA***' })
      
      // Chamada real para a API de login
      const response = await api.post('/auth/login', {
        email: email,
        senha: password
      })

      logger.info('📥 Resposta da API:')
      console.log(response.data)

      // Debug: vamos ver os campos individualmente
      logger.info('🔍 Debug da resposta:')
      console.log('Token existe?', !!response.data.token)
      console.log('Usuario_id existe?', !!response.data.usuario_id)

      // Verifica se o login foi bem-sucedido (se retornou token)
      if (response.data.token) {
        logger.info('✅ Condição de sucesso passou! Processando login...')
        
        // Salva o token no localStorage
        localStorage.setItem('authToken', response.data.token)
        
        // Extrai os dados do usuário da resposta
        const nomeFromEmail = email.split('@')[0].replace(/[^a-zA-Z]/g, '')
        const nomeCapitalizado = nomeFromEmail.charAt(0).toUpperCase() + nomeFromEmail.slice(1).toLowerCase()
        
        const userData = {
          name: response.data.nome_usuario || 
                response.data.nome || 
                response.data.name || 
                nomeCapitalizado,
          email: email, // Usa o email digitado
          id: response.data.usuario_id || 'temp-id'
        }
        
        logger.success('✅ Login realizado com sucesso via API!')
        logger.info('👤 Dados do usuário:')
        console.log(userData)
        
        // Chama a função de callback se foi fornecida
        if (onLogin) {
          logger.info('🚀 Chamando callback onLogin...')
          onLogin(userData)
        } else {
          logger.warning('⚠️ Callback onLogin não foi fornecido!')
        }
      } else {
        logger.error('❌ Falha na condição de sucesso!')
        logger.error('Token:', response.data.token)
        logger.error('Usuario_id:', response.data.usuario_id)
      }
    } catch (error: any) {
      logger.error('❌ Erro no login via API')
      
      // Logs detalhados para debug
      logger.error('🔍 Status do erro:')
      console.log(error.response?.status)
      logger.error('🔍 Dados do erro:')
      console.log(error.response?.data)
      logger.error('🔍 Headers:')
      console.log(error.response?.headers)
      logger.error('🔍 Erro completo:')
      console.log(error)
      
      // Trata diferentes tipos de erro da API
      if (error.response?.status === 401) {
        setError('Email ou senha incorretos!')
      } else if (error.response?.status === 400) {
        setError('Dados inválidos fornecidos!')
      } else if (error.response?.status === 500) {
        setError('Erro interno do servidor. Tente novamente mais tarde.')
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        setError('Erro de conexão. Verifique se o servidor está rodando.')
      } else {
        setError(`Erro desconhecido: ${error.response?.status || error.message}`)
      }
      
      logger.error('🔍 Erro detalhado:')
      console.log(error.response?.data || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden p-8 lg:p-0">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center overflow-hidden">
        {/* Lado Esquerdo - Mascote */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8">
          <div className="relative">
            {/* Elementos decorativos */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
            
            {/* Mascote */}
            <div className="relative z-10">
              <img 
                src={pinguinhoImage} 
                alt="Mascote Pinguinho" 
                className="w-full max-h-[90vh] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full">
          {/* Texto de boas-vindas */}
          <div className="text-center m-8">
            <p className="text-xl text-gray-600 font-medium">
              Sistema de Gestão Escolar
            </p>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight pb-2">
              Pinguinho de Gente
            </h1>
          </div>

          {/* Card do formulário */}
          <div className="bg-white rounded-3xl shadow-sm p-8 lg:p-10 border border-gray-100">
          {/* Header do card */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta!
            </h2>
            <p className="text-gray-600">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
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
            </div>

            {/* Link esqueceu senha */}
            <div className="flex items-center justify-end">
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            {/* Botão de login */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              © 2025 Escola Pinguinho de Gente
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">
              Todos os direitos reservados
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
