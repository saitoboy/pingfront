import React from 'react'
import { logger } from '../../lib/logger'
import type { UltimosAlunos } from '../../services/dashboardService'

interface RecentStudentsProps {
  alunos: UltimosAlunos[]
  loading?: boolean
  onViewAll?: () => void
}

export const RecentStudents: React.FC<RecentStudentsProps> = ({
  alunos,
  loading = false,
  onViewAll
}) => {
  // Debug log para verificar os dados recebidos
  React.useEffect(() => {
    logger.debug('🎯 RecentStudents - Dados recebidos:', 'component', {
      alunos,
      alunosLength: alunos.length,
      loading,
      primeiroAluno: alunos[0] || null
    })
  }, [alunos, loading])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    
    return idade
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">👥 Últimos Alunos Cadastrados</h3>
        </div>
        <div className="p-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 py-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">👥 Últimos Alunos Cadastrados</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todos →
          </button>
        )}
      </div>
      <div className="p-6">
        {alunos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">👤</span>
            <p>Nenhum aluno cadastrado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alunos.map((aluno) => (
              <div key={aluno.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {aluno.nome.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {aluno.nome} {aluno.sobrenome}
                  </p>
                  <p className="text-xs text-gray-500">
                    {calcularIdade(aluno.data_nascimento)} anos • Cadastrado em {formatDate(aluno.created_at)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Novo
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
