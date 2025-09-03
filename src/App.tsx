import { useState, useEffect } from 'react'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import FichaCadastroPage from './pages/cadastro/FichaCadastroPage'
import Sidebar from './components/layout/Sidebar'
import LoadingScreen from './components/ui/LoadingScreen'

function App() {
  // Estados de controle da aplicação
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'ficha-cadastro'>('dashboard')
  const [isInitializing, setIsInitializing] = useState(true) // Novo estado para controlar a inicialização

  // Hook para verificar se há um token salvo ao carregar a aplicação
  useEffect(() => {
    const checkAuthStatus = () => {
      const savedToken = localStorage.getItem('authToken')
      
      if (savedToken) {
        // Se há um token salvo, restaura a autenticação
        // Tenta recuperar os dados do usuário do localStorage também
        const savedUserData = localStorage.getItem('userData')
        
        if (savedUserData) {
          try {
            const parsedUserData = JSON.parse(savedUserData)
            setUserData(parsedUserData)
          } catch (error) {
            console.error('Erro ao recuperar dados do usuário do localStorage:', error)
            // Se houver erro ao fazer parse, gera dados básicos
            setUserData({ name: 'Usuário', email: 'usuario@exemplo.com' })
          }
        } else {
          // Se não há dados do usuário salvos, gera dados padrão
          setUserData({ name: 'Usuário', email: 'usuario@exemplo.com' })
        }
        
        setIsAuthenticated(true)
        console.log('✅ Autenticação restaurada do localStorage')
      } else {
        console.log('ℹ️ Nenhum token encontrado no localStorage')
      }
      
      setIsInitializing(false) // Finaliza a inicialização
    }

    checkAuthStatus()
  }, [])

  // Função chamada quando o usuário faz login
  const handleLogin = (user: { name: string; email: string }) => {
    setUserData(user)
    // Salva os dados do usuário no localStorage para persistir entre recarregamentos
    localStorage.setItem('userData', JSON.stringify(user))
    setIsLoading(true) // Mostra a tela de loading
  }

  // Função chamada quando a tela de loading termina
  const handleLoadingComplete = () => {
    setIsLoading(false)
    setIsAuthenticated(true) // Autentica o usuário e vai para o dashboard
  }

  // Função de logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsLoading(false)
    setUserData(null)
    setCurrentPage('dashboard')
    // Remove os dados salvos do localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    console.log('🚪 Logout realizado - dados removidos do localStorage')
  }

  // Se ainda está inicializando, mostra uma tela de carregamento simples
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😊</span>
          </div>
          <div className="text-gray-600">Carregando...</div>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado e não estiver carregando, mostra o login
  if (!isAuthenticated && !isLoading) {
    return <LoginPage onLogin={handleLogin} />
  }

  // Se estiver carregando após o login, mostra a tela de loading
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} userName={userData?.name || 'Usuário'} />
  }

  // Se estiver autenticado, mostra o layout principal
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeItem={currentPage} 
        onItemClick={(itemId) => setCurrentPage(itemId as 'dashboard' | 'ficha-cadastro')} 
      />
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentPage === 'dashboard' ? 'Dashboard' : 'Ficha de Cadastro'}
                </h1>
                <p className="text-sm text-gray-600">
                  {currentPage === 'dashboard' 
                    ? 'Bem-vindo ao painel de controle' 
                    : 'Cadastre ou edite as informações de alunos'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{userData?.name || 'Usuário'}</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userData?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'ficha-cadastro' && <FichaCadastroPage />}
        </main>
      </div>
    </div>
  )
}

export default App
