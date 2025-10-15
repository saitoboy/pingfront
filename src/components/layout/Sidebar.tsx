import { logger } from '../../lib/logger'
import { LayoutDashboard, UserPlus, Settings, LogOut, BookUser, School } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Icone from '../../assets/images/icone.png'

interface MenuItem {
  id: string
  label: string
  icon: LucideIcon
  active?: boolean
  onClick?: () => void
  badge?: number
}

interface SidebarProps {
  activeItem?: string
  onItemClick?: (itemId: string) => void
  onLogout?: () => void
}

export default function Sidebar({ activeItem = 'dashboard', onItemClick, onLogout }: SidebarProps) {

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: activeItem === 'dashboard',
      onClick: () => handleMenuClick('dashboard')
    },
    {
      id: 'ficha-cadastro',
      label: 'Ficha de Cadastro',
      icon: UserPlus,
      active: activeItem === 'ficha-cadastro',
      onClick: () => handleMenuClick('ficha-cadastro')
    },
    {
      id: 'alocacao-professor',
      label: 'Alocação de Professores',
      icon: BookUser,
      active: activeItem === 'alocacao-professor',
      onClick: () => handleMenuClick('alocacao-professor')
    },
    {
      id: 'gestao-escolar',
      label: 'Gestão Escolar',
      icon: School,
      active: activeItem === 'gestao-escolar',
      onClick: () => handleMenuClick('gestao-escolar')
    },
    {
      id: 'gerenciar-usuarios',
      label: 'Gerenciar Usuários',
      icon: Settings,
      active: activeItem === 'gerenciar-usuarios',
      onClick: () => handleMenuClick('gerenciar-usuarios')
    },
    /*{
      id: 'matriculas',
      label: 'Matrículas',
      icon: GraduationCap,
      active: activeItem === 'matriculas',
      onClick: () => handleMenuClick('matriculas')
    },
    {
      id: 'diario',
      label: 'Diário Escolar',
      icon: BookOpen,
      active: activeItem === 'diario',
      onClick: () => handleMenuClick('diario')
    },
    {
      id: 'avisos',
      label: 'Avisos',
      icon: Bell,
      active: activeItem === 'avisos',
      onClick: () => handleMenuClick('avisos'),
      badge: 3
    },
    {
      id: 'auditoria',
      label: 'Auditoria',
      icon: Search,
      active: activeItem === 'auditoria',
      onClick: () => handleMenuClick('auditoria')
    },
    {
      id: 'boletim',
      label: 'Boletim',
      icon: ClipboardList,
      active: activeItem === 'boletim',
      onClick: () => handleMenuClick('boletim')
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      active: activeItem === 'configuracoes',
      onClick: () => handleMenuClick('configuracoes')
    }*/
  ]

  const handleMenuClick = (itemId: string) => {
    logger.info(`🔄 Navegando para: ${itemId}`)
    if (onItemClick) {
      onItemClick(itemId)
    }
  }

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-blue-500 shadow-2xl z-40 overflow-y-auto flex flex-col">
      {/* Efeito de brilho no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400"></div>
      
      {/* Logo/Header */}
      <div className="p-6 border-b border-blue-300/40 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <img 
                src={Icone} 
                alt="Ícone do sistema" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-blue-700 animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Pinguinho de Gente</h2>
            <p className="text-sm text-blue-100">Sistema Escolar</p>
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      <div className="py-6 px-3 flex-1">
        <p className="px-3 text-xs font-semibold text-blue-100 uppercase tracking-wider mb-4 flex items-center">
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
          Menu Principal
        </p>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`
                  group relative w-full flex items-center px-4 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl
                  ${item.active 
                    ? 'bg-white text-blue-700 shadow-lg shadow-blue-600/30 scale-105' 
                    : 'text-blue-50 hover:bg-white/20 hover:text-white hover:translate-x-1'
                  }
                `}
              >
                {/* Indicador ativo à esquerda */}
                {item.active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-r-full"></div>
                )}
                
                {/* Ícone */}
                <div className={`
                  mr-3 transition-all duration-300
                  ${item.active ? 'text-blue-600' : 'text-blue-200 group-hover:text-white'}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Label */}
                <span className="flex-1 text-left">{item.label}</span>
                
                {/* Badge (se houver) */}
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                
                {/* Efeito de brilho no hover */}
                <div className={`
                  absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${item.active ? 'hidden' : ''}
                `}></div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Botão de Sair */}
      <div className="mt-auto p-4 bg-gradient-to-t from-blue-700/30 to-transparent flex-shrink-0">
        <button
          onClick={onLogout}
          className="group w-full bg-white/10  backdrop-blur-sm rounded-xl p-2 border border-white/20 hover:border-red-400 transition-all duration-300 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white group-hover:text-white transition-colors">Sair do Sistema</p>
              <p className="text-xs text-blue-100 group-hover:text-red-100 transition-colors">Encerrar sessão</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
