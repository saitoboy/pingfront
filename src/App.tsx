import { useState, useEffect } from 'react'
import { LayoutDashboard, UserPlus, Users, School, BookOpen } from 'lucide-react'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import FichaCadastroPage from './pages/cadastro/FichaCadastroPage'
import CriarUsuarioPage from './pages/usuarios/CriarUsuarioPage'
import GerenciarUsuariosPage from './pages/usuarios/GerenciarUsuariosPage'
import GerenciarTiposUsuarioPage from './pages/usuarios/GerenciarTiposUsuarioPage'
import AlocacaoProfessorPage from './pages/alocacao/AlocacaoProfessorPage'
import GestaoEscolarPage from './pages/gestao/GestaoEscolarPage'
import SelecionarProfessorPage from './pages/diario/SelecionarProfessorPage'
import DetalhesAulaPage from './pages/diario/DetalhesAulaPage'
import LancarNotasPage from './pages/diario/LancarNotasPage'
import Sidebar from './components/layout/Sidebar'
import LoadingScreen from './components/ui/LoadingScreen'

function App() {
  // Estados de controle da aplicação
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'ficha-cadastro' | 'gerenciar-usuarios' | 'criar-usuario' | 'gerenciar-tipos-usuario' | 'alocacao-professor' | 'gestao-escolar' | 'diario-escolar' | 'detalhes-aula' | 'lancar-notas'>('dashboard')
  const [isInitializing, setIsInitializing] = useState(true) // Novo estado para controlar a inicialização
  const [aulaData, setAulaData] = useState<any>(null) // Dados da aula selecionada
  const [atividadeData, setAtividadeData] = useState<any>(null) // Dados da atividade selecionada

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

  // Função para obter o ícone da página atual
  const getPageIcon = () => {
    switch (currentPage) {
      case 'dashboard':
        return LayoutDashboard
      case 'ficha-cadastro':
        return UserPlus
      case 'gerenciar-usuarios':
        return Users
      case 'criar-usuario':
        return Users
      case 'gestao-escolar':
        return School
      case 'diario-escolar':
        return BookOpen
      case 'lancar-notas':
        return BookOpen
      default:
        return LayoutDashboard
    }
  }

  // Função para navegação entre páginas
  const handlePageNavigation = (page: string, data?: any) => {
    if (page === 'dashboard' || page === 'ficha-cadastro' || page === 'gerenciar-usuarios' || page === 'criar-usuario' || page === 'gerenciar-tipos-usuario' || page === 'alocacao-professor' || page === 'gestao-escolar' || page === 'diario-escolar' || page === 'detalhes-aula' || page === 'lancar-notas') {
      setCurrentPage(page as any)
      if (data && page === 'detalhes-aula') {
        setAulaData(data)
      }
    } else {
      console.log(`⚠️ Página '${page}' ainda não implementada`)
      // Por enquanto, páginas não implementadas vão para dashboard
      setCurrentPage('dashboard')
    }
  }

  const handleNavegarParaNotas = (atividade: any) => {
    setAtividadeData({
      atividade,
      turma: aulaData?.turma,
      disciplina: aulaData?.disciplina
    })
    setCurrentPage('lancar-notas')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Sidebar Fixa */}
      <Sidebar 
        activeItem={currentPage} 
        onItemClick={(itemId) => setCurrentPage(itemId as any)} 
        onLogout={handleLogout}
      />
      
      {/* Conteúdo Principal com margem para compensar a sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header Moderno Fixo */}
        <header className="sticky top-0 z-30 relative bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
          <div className="relative px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  {(() => {
                    const IconComponent = getPageIcon()
                    return <IconComponent className="w-6 h-6 text-white" />
                  })()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-blue-700 bg-clip-text text-transparent">
                    {currentPage === 'dashboard' ? 'Dashboard' : 
                     currentPage === 'ficha-cadastro' ? 'Ficha de Cadastro' : 
                     currentPage === 'gerenciar-usuarios' ? 'Gerenciar Usuários' : 
                     currentPage === 'criar-usuario' ? 'Criar Usuário' : 
                     currentPage === 'gerenciar-tipos-usuario' ? 'Gerenciar Tipos de Usuário' :
                     currentPage === 'alocacao-professor' ? 'Alocação de Professores' :
                     currentPage === 'gestao-escolar' ? 'Gestão Escolar' :
                     currentPage === 'diario-escolar' ? 'Diário Escolar' : 
                     currentPage === 'detalhes-aula' ? 'Detalhes da Aula' :
                     currentPage === 'lancar-notas' ? 'Lançar Notas' : 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    {currentPage === 'dashboard' 
                      ? 'Bem-vindo ao painel de controle' 
                      : currentPage === 'ficha-cadastro'
                      ? 'Cadastre ou edite as informações de alunos'
                      : currentPage === 'gerenciar-usuarios'
                      ? 'Visualize, edite e gerencie usuários do sistema'
                      : currentPage === 'criar-usuario'
                      ? 'Adicione novos usuários ao sistema'
                      : currentPage === 'gerenciar-tipos-usuario'
                      ? 'Crie, edite e gerencie os tipos de usuário do sistema'
                      : currentPage === 'alocacao-professor'
                      ? 'Gerencie a alocação de professores em disciplinas e turmas'
                      : currentPage === 'gestao-escolar'
                      ? 'Gerencie séries, turmas e disciplinas do sistema'
                      : currentPage === 'diario-escolar'
                      ? 'Visualize e gerencie o diário escolar dos professores'
                      : currentPage === 'detalhes-aula'
                      ? 'Visualize e gerencie os detalhes da aula selecionada'
                      : currentPage === 'lancar-notas'
                      ? 'Lançe notas para a atividade selecionada'
                      : 'Bem-vindo ao painel de controle'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{userData?.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500">{userData?.email || 'usuario@exemplo.com'}</p>
                </div>
                <div className="relative">
                  <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <span className="text-white text-sm font-bold">
                      {userData?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={handlePageNavigation} />}
          {currentPage === 'ficha-cadastro' && <FichaCadastroPage />}
          {currentPage === 'gerenciar-usuarios' && <GerenciarUsuariosPage onNavigate={handlePageNavigation} />}
          {currentPage === 'criar-usuario' && <CriarUsuarioPage onNavigate={handlePageNavigation} />}
          {currentPage === 'gerenciar-tipos-usuario' && <GerenciarTiposUsuarioPage onNavigate={handlePageNavigation} />}
          {currentPage === 'alocacao-professor' && <AlocacaoProfessorPage />}
          {currentPage === 'gestao-escolar' && <GestaoEscolarPage />}
          {currentPage === 'diario-escolar' && <SelecionarProfessorPage onNavigate={handlePageNavigation} />}
          {currentPage === 'detalhes-aula' && aulaData && (
            <DetalhesAulaPage 
              aula={aulaData.aula}
              turma={aulaData.turma}
              disciplina={aulaData.disciplina}
              onVoltar={() => setCurrentPage('diario-escolar')}
              onNavegarParaNotas={handleNavegarParaNotas}
            />
          )}
          {currentPage === 'lancar-notas' && atividadeData && (
            <LancarNotasPage 
              atividade={atividadeData.atividade}
              turma={atividadeData.turma}
              disciplina={atividadeData.disciplina}
              onVoltar={() => setCurrentPage('detalhes-aula')}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
