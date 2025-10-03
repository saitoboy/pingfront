import React from 'react'
import type { AlunosPorTurma } from '../../services/dashboardService'
import { School, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface ClassDistributionProps {
  turmas: AlunosPorTurma[]
  loading?: boolean
}

export const ClassDistribution: React.FC<ClassDistributionProps> = ({
  turmas,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="mb-6 animate-pulse">
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getProgressGradient = (percentual: number) => {
    if (percentual >= 90) return 'from-red-400 to-red-600'
    if (percentual >= 75) return 'from-yellow-400 to-orange-500'
    return 'from-green-400 to-emerald-500'
  }

  const getProgressTextColor = (percentual: number) => {
    if (percentual >= 90) return 'text-red-600'
    if (percentual >= 75) return 'text-orange-600'
    return 'text-green-600'
  }

  const getStatusIcon = (percentual: number) => {
    if (percentual >= 90) return <AlertCircle className="w-4 h-4 text-red-600" />
    if (percentual >= 75) return <TrendingUp className="w-4 h-4 text-orange-600" />
    return <CheckCircle className="w-4 h-4 text-green-600" />
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
            <School className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Distribuição por Turmas</h3>
        </div>
      </div>
      <div className="p-6">
        {turmas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <School className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Nenhuma turma cadastrada ainda</p>
            <p className="text-sm text-gray-400 mt-1">As turmas aparecerão aqui quando criadas</p>
          </div>
        ) : (
          <div className="space-y-5">
            {turmas.map((turma, index) => {
              const percentual = Math.min(turma.percentual_ocupacao, 100)
              
              return (
                <div key={index} className="group space-y-3 p-4 rounded-xl ">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(percentual)}
                      <span className="text-sm font-bold text-gray-900">
                        {turma.turma_nome}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${getProgressTextColor(percentual)} flex items-center space-x-1`}>
                      <span>{turma.total_alunos}/{turma.capacidade}</span>
                      <span className="text-xs">({percentual}%)</span>
                    </span>
                  </div>
                  
                  {/* Barra de progresso moderna */}
                  <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 bg-gradient-to-r ${getProgressGradient(percentual)} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                      style={{ width: `${percentual}%` }}
                    >
                      {/* Efeito de brilho animado */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                    
                    {/* Marcadores de threshold */}
                    <div className="absolute top-0 left-[75%] w-0.5 h-3 bg-gray-400 opacity-30"></div>
                    <div className="absolute top-0 left-[90%] w-0.5 h-3 bg-gray-400 opacity-30"></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {turmas.length > 0 && (
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {turmas.filter(t => t.percentual_ocupacao < 75).length}
                </p>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Disponíveis</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">
                  {turmas.filter(t => t.percentual_ocupacao >= 75 && t.percentual_ocupacao < 90).length}
                </p>
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Quase Cheias</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 border border-red-200">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-red-600 mb-1">
                  {turmas.filter(t => t.percentual_ocupacao >= 90).length}
                </p>
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Lotadas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
