import React from 'react'
import { Zap, ArrowRight } from 'lucide-react'

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

const getGradientByIndex = (index: number) => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-yellow-500'
  ]
  return gradients[index % gradients.length]
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Ações Rápidas</h3>
        </div>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="group relative flex flex-col items-center p-5 rounded-xl border-2 border-gray-200 hover:border-transparent transition-all duration-300 overflow-hidden hover:scale-105 hover:shadow-xl"
          >
            {/* Gradiente de fundo no hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradientByIndex(index)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            {/* Brilho animado */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>

            {/* Conteúdo */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-300 group-hover:rotate-12">
                {action.icon}
              </div>
              <span className="text-sm font-bold text-gray-900 group-hover:text-white text-center transition-colors duration-300 mb-1">
                {action.title}
              </span>
              <span className="text-xs text-gray-600 group-hover:text-white/90 text-center transition-colors duration-300">
                {action.description}
              </span>
              
              {/* Seta no hover */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
