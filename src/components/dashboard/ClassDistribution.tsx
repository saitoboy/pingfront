import React from 'react'
import type { AlunosPorTurma } from '../../services/dashboardService'

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
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">📊 Distribuição por Turmas</h3>
        </div>
        <div className="p-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="mb-4 animate-pulse">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getProgressColor = (percentual: number) => {
    if (percentual >= 90) return 'bg-red-500'
    if (percentual >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressTextColor = (percentual: number) => {
    if (percentual >= 90) return 'text-red-600'
    if (percentual >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">📊 Distribuição por Turmas</h3>
      </div>
      <div className="p-6">
        {turmas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">🏫</span>
            <p>Nenhuma turma cadastrada ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {turmas.map((turma, index) => {
              const percentual = Math.min(turma.percentual_ocupacao, 100)
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {turma.turma_nome}
                    </span>
                    <span className={`text-sm font-medium ${getProgressTextColor(percentual)}`}>
                      {turma.total_alunos}/{turma.capacidade} ({percentual}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(percentual)}`}
                      style={{ width: `${percentual}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {turmas.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {turmas.filter(t => t.percentual_ocupacao < 75).length}
                </p>
                <p className="text-xs text-gray-500">Disponíveis</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {turmas.filter(t => t.percentual_ocupacao >= 75 && t.percentual_ocupacao < 90).length}
                </p>
                <p className="text-xs text-gray-500">Quase Cheias</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {turmas.filter(t => t.percentual_ocupacao >= 90).length}
                </p>
                <p className="text-xs text-gray-500">Lotadas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
