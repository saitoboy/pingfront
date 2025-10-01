import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgColor: string
  trend?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  loading?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  trend,
  loading = false
}) => {
  const getTrendColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      case 'neutral':
        return 'text-blue-600 bg-blue-50'
    }
  }

  const getTrendIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return TrendingUp
      case 'negative':
        return TrendingDown
      case 'neutral':
        return Minus
    }
  }

  // Extrai o gradiente do iconBgColor para usar no card
  const getGradientClass = (bgClass: string) => {
    if (bgClass.includes('blue')) return 'from-blue-500 to-blue-600'
    if (bgClass.includes('green')) return 'from-green-500 to-green-600'
    if (bgClass.includes('purple')) return 'from-purple-500 to-purple-600'
    if (bgClass.includes('orange')) return 'from-orange-500 to-orange-600'
    return 'from-blue-500 to-blue-600'
  }

  if (loading) {
    return (
      <div className="relative bg-white rounded-2xl shadow-lg p-6 animate-pulse overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full blur-3xl opacity-30 -mr-16 -mt-16"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="h-10 bg-gray-200 rounded w-20 mb-2"></div>
            </div>
            <div className={`w-14 h-14 ${iconBgColor} rounded-xl`}></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  const TrendIcon = trend ? getTrendIcon(trend.type) : null

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden border border-gray-100 hover:scale-105 cursor-pointer">
      {/* Elemento decorativo de fundo */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getGradientClass(iconBgColor)} rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-30 transition-opacity duration-300`}></div>
      
      {/* Borda animada no hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
        <div className="w-full h-full bg-white rounded-2xl"></div>
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {value}
            </p>
          </div>
          <div className={`w-14 h-14 bg-gradient-to-br ${getGradientClass(iconBgColor)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        
        {trend && (
          <div className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${getTrendColor(trend.type)}`}>
            {TrendIcon && <TrendIcon className="w-3 h-3" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  )
}
