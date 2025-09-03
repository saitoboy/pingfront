import { logger } from '../../lib/logger'

interface MenuItem {
  id: string
  label: string
  icon: string
  active?: boolean
  onClick?: () => void
}

interface SidebarProps {
  activeItem?: string
  onItemClick?: (itemId: string) => void
}

export default function Sidebar({ activeItem = 'dashboard', onItemClick }: SidebarProps) {

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      active: activeItem === 'dashboard',
      onClick: () => handleMenuClick('dashboard')
    },
    {
      id: 'ficha-cadastro',
      label: 'Ficha de Cadastro',
      icon: '👤',
      active: activeItem === 'ficha-cadastro',
      onClick: () => handleMenuClick('ficha-cadastro')
    },
    /*{
      id: 'matriculas',
      label: 'Matrículas',
      icon: '👥',
      active: activeItem === 'matriculas',
      onClick: () => handleMenuClick('matriculas')
    },
    {
      id: 'diario',
      label: 'Diário Escolar',
      icon: '📝',
      active: activeItem === 'diario',
      onClick: () => handleMenuClick('diario')
    },
    {
      id: 'avisos',
      label: 'Avisos',
      icon: '📢',
      active: activeItem === 'avisos',
      onClick: () => handleMenuClick('avisos')
    },
    {
      id: 'auditoria',
      label: 'Auditoria',
      icon: '🔍',
      active: activeItem === 'auditoria',
      onClick: () => handleMenuClick('auditoria')
    },
    {
      id: 'boletim',
      label: 'Boletim',
      icon: '📋',
      active: activeItem === 'boletim',
      onClick: () => handleMenuClick('boletim')
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: '⚙️',
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
    <div className="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xl">😊</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pinguinho de Gente</h2>
            <p className="text-sm text-gray-600">Sistema Escolar</p>
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      <div className="py-4">
        <p className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Menu Principal
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`
                w-full flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200
                ${item.active 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
