import React from 'react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  onClick: () => void
  bgColor?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">🚀 Ações Rápidas</h3>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group ${
              action.bgColor ? action.bgColor : ''
            }`}
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span className="text-sm font-medium text-gray-900 text-center">
              {action.title}
            </span>
            <span className="text-xs text-gray-500 text-center mt-1">
              {action.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
