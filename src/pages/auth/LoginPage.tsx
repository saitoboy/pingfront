import { useState } from 'react'
import { logger } from '../../lib/logger'
import api from '../../lib/api'

interface LoginPageProps {
  onLogin?: (userData: { name: string; email: string }) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
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
        alert('Email ou senha incorretos!')
      } else if (error.response?.status === 400) {
        alert('Dados inválidos fornecidos!')
      } else if (error.response?.status === 500) {
        alert('Erro interno do servidor. Verifique o console para mais detalhes.')
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        alert('Erro de conexão. Verifique se o servidor está rodando na porta 3003.')
      } else {
        alert(`Erro desconhecido: ${error.response?.status || error.message}`)
      }
      
      logger.error('🔍 Erro detalhado:')
      console.log(error.response?.data || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-2xl">😊</span>
          </div>
        </div>
        
        {/* Título */}
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Sistema de Gestão Escolar
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pinguinho de Gente
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <div className="mb-6">
            <h3 className="text-center text-lg font-medium text-gray-900 mb-2">
              Acesso ao Sistema
            </h3>
            <p className="text-center text-sm text-gray-600">
              Entre com suas credenciais para acessar o sistema.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@edu.muriae.mg.gov.br"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center text-xs text-gray-500">
              © 2024 Escola Pinguinho de Gente. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
