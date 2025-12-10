import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  School, 
  BookOpen,
  GraduationCap,
  Settings
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';

// Mapeamento de rotas para títulos e ícones
const routeConfig: Record<string, { title: string; description: string; icon: any }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Bem-vindo ao painel de controle',
    icon: LayoutDashboard
  },
  '/ficha-cadastro': {
    title: 'Ficha de Cadastro',
    description: 'Cadastre ou edite as informações de alunos',
    icon: UserPlus
  },
  '/fichas-cadastro': {
    title: 'Fichas de Cadastro',
    description: 'Visualize e gerencie todas as fichas de cadastro',
    icon: UserPlus
  },
  '/usuarios/gerenciar': {
    title: 'Gerenciar Usuários',
    description: 'Visualize, edite e gerencie usuários do sistema',
    icon: Users
  },
  '/usuarios/criar': {
    title: 'Criar Usuário',
    description: 'Adicione novos usuários ao sistema',
    icon: Users
  },
  '/usuarios/tipos': {
    title: 'Gerenciar Tipos de Usuário',
    description: 'Crie, edite e gerencie os tipos de usuário do sistema',
    icon: Settings
  },
  '/alocacao-professor': {
    title: 'Alocação de Professores',
    description: 'Gerencie a alocação de professores em disciplinas e turmas',
    icon: GraduationCap
  },
  '/gestao-escolar': {
    title: 'Gestão Escolar',
    description: 'Gerencie séries, turmas e disciplinas do sistema',
    icon: School
  },
  '/diario': {
    title: 'Diário Escolar',
    description: 'Visualize e gerencie o diário escolar dos professores',
    icon: BookOpen
  },
  '/meu-diario': {
    title: 'Meu Diário Escolar',
    description: 'Gerencie seu próprio diário escolar',
    icon: BookOpen
  },
};

// Função para encontrar a configuração da rota mais próxima
function findRouteConfig(pathname: string): { title: string; description: string; icon: any } {
  // Verifica se há uma correspondência exata
  if (routeConfig[pathname]) {
    return routeConfig[pathname];
  }

  // Para rotas dinâmicas, encontra o padrão correspondente
  if (pathname.startsWith('/diario/aula/')) {
    return {
      title: 'Detalhes da Aula',
      description: 'Visualize e gerencie os detalhes da aula selecionada',
      icon: BookOpen
    };
  }

  if (pathname.startsWith('/diario/notas/')) {
    return {
      title: 'Lançar Notas',
      description: 'Lançe notas para a atividade selecionada',
      icon: BookOpen
    };
  }

  // Fallback padrão
  return {
    title: 'Dashboard',
    description: 'Bem-vindo ao painel de controle',
    icon: LayoutDashboard
  };
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  // Obtém a configuração da rota atual
  const currentRoute = findRouteConfig(location.pathname);
  const IconComponent = currentRoute.icon;

  // Mapeia o pathname para o activeItem da Sidebar
  const getActiveItem = () => {
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname === '/ficha-cadastro' || location.pathname === '/fichas-cadastro') return 'ficha-cadastro';
    if (location.pathname === '/usuarios/gerenciar') return 'gerenciar-usuarios';
    if (location.pathname === '/usuarios/criar') return 'criar-usuario';
    if (location.pathname === '/usuarios/tipos') return 'gerenciar-tipos-usuario';
    if (location.pathname === '/alocacao-professor') return 'alocacao-professor';
    if (location.pathname === '/gestao-escolar') return 'gestao-escolar';
    if (location.pathname === '/meu-diario') return 'meu-diario';
    if (location.pathname.startsWith('/diario')) return 'diario-escolar';
    return 'dashboard';
  };

  // Handler para navegação da sidebar
  const handleSidebarClick = (itemId: string) => {
    const routeMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'ficha-cadastro': '/fichas-cadastro',
      'gerenciar-usuarios': '/usuarios/gerenciar',
      'criar-usuario': '/usuarios/criar',
      'gerenciar-tipos-usuario': '/usuarios/tipos',
      'alocacao-professor': '/alocacao-professor',
      'gestao-escolar': '/gestao-escolar',
      'diario-escolar': '/diario',
      'meu-diario': '/meu-diario',
    };

    const path = routeMap[itemId];
    if (path) {
      navigate(path);
    }
  };

  // Handler de logout
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Sidebar Fixa */}
      <Sidebar 
        activeItem={getActiveItem()} 
        onItemClick={handleSidebarClick} 
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
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-blue-700 bg-clip-text text-transparent">
                    {currentRoute.title}
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    {currentRoute.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    {usuario?.nome_usuario || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {usuario?.email_usuario || 'usuario@exemplo.com'}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <span className="text-white text-sm font-bold">
                      {usuario?.nome_usuario
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'U'}
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

