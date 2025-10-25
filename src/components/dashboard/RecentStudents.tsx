import React from 'react'
import { logger } from '../../lib/logger'
import type { UltimosAlunos } from '../../services/dashboardService'
import { Users, Calendar, Sparkles, ArrowRight, UserCircle } from 'lucide-react'

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
      month: 'short',
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

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-orange-400 to-orange-600'
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="p-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Últimos Alunos Cadastrados</h3>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="group flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-800 font-semibold transition-colors"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        {alunos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Nenhum aluno cadastrado ainda</p>
            <p className="text-sm text-gray-400 mt-1">Os novos cadastros aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alunos.map((aluno, index) => (
              <div 
                key={aluno.id} 
                className="group relative flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-purple-200"
              >
                {/* Avatar com gradiente */}
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(index)} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white font-bold text-lg">
                      {aluno.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>

                {/* Informações do aluno */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                    {aluno.nome} {aluno.sobrenome}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{calcularIdade(aluno.data_nascimento)} anos</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{formatDate(aluno.created_at)}</span>
                    </span>
                  </div>
                </div>

                {/* Badge "Novo" */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md">
                    Novo
                  </span>
                </div>

                {/* Seta no hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
