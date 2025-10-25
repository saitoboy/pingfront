import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { logger } from '../../lib/logger'
import { useAuth } from '../../contexts/AuthContext'
import bgAzul from '../../assets/images/bg azul.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para limpar erro quando o usuário digitar
  const clearError = () => {
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      logger.info('🔐 Tentativa de login...')
      
      // Usa o AuthContext para fazer login
      await login(email, password)
      
      logger.success('✅ Login realizado com sucesso!')
      
      // Redireciona para o dashboard
      navigate('/dashboard')
      
    } catch (error: any) {
      logger.error('❌ Erro no login')
      console.log(error)
      
      // Trata diferentes tipos de erro
      if (error.message?.includes('401') || error.message?.includes('credenciais')) {
        setError('Email ou senha incorretos!')
      } else if (error.message?.includes('400')) {
        setError('Dados inválidos fornecidos!')
      } else if (error.message?.includes('500')) {
        setError('Erro interno do servidor. Tente novamente mais tarde.')
      } else if (error.message?.includes('Network') || error.message?.includes('ERR_NETWORK')) {
        setError('Erro de conexão. Verifique se o servidor está rodando.')
      } else {
        setError(error.message || 'Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center overflow-hidden p-8 lg:p-0 relative"
      style={{
        backgroundImage: `url(${bgAzul})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <div className="w-full max-w-3xl flex flex-col gap-8 items-center overflow-hidden relative z-10">
        
        {/* Botão Voltar */}
        <div className="w-full flex justify-start">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à página inicial</span>
          </button>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full">
          {/* Texto de boas-vindas */}
          <div className="text-center mb-8">
            <p className="text-xl text-gray-300 font-medium mb-2">
              Sistema de Gestão Escolar
            </p>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Pinguinho de Gente
            </h1>
          </div>

          {/* Card do formulário */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 lg:p-10 border border-white/20">
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
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError()
                  }}
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
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearError()
                  }}
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
