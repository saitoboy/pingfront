import React, { useState } from 'react'
import { logger } from '../../lib/logger'
import type { UltimosAlunos } from '../../services/dashboardService'
import { Users, Calendar, Sparkles, ArrowRight, UserCircle, X, MapPin, FileText, IdCard, Clock, BookOpen, Building2 } from 'lucide-react'
import api from '../../lib/api'

interface RecentStudentsProps {
  alunos: UltimosAlunos[]
  loading?: boolean
  onViewAll?: () => void
}

interface AlunoCompleto {
  aluno_id: string
  nome_aluno: string
  sobrenome_aluno: string
  data_nascimento_aluno: string
  cpf_aluno: string
  rg_aluno: string
  naturalidade_aluno: string
  endereco_aluno: string
  bairro_aluno: string
  cep_aluno: string
  numero_matricula_aluno?: string
  religiao_id?: string
  certidao_id?: string
  created_at: string
  updated_at: string
  nome_religiao?: string
  livro_certidao?: string
  matricula_certidao?: string
  termo_certidao?: string
  folha_certidao?: string
  data_expedicao_certidao?: string
  nome_cartorio_certidao?: string
}

export const RecentStudents: React.FC<RecentStudentsProps> = ({
  alunos,
  loading = false,
  onViewAll
}) => {
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoCompleto | null>(null)
  const [carregandoAluno, setCarregandoAluno] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)

  // Debug log para verificar os dados recebidos
  React.useEffect(() => {
    logger.debug('🎯 RecentStudents - Dados recebidos:', 'component', {
      alunos,
      alunosLength: alunos.length,
      loading,
      primeiroAluno: alunos[0] || null
    })
  }, [alunos, loading])

  const buscarAlunoCompleto = async (alunoId: string | number) => {
    try {
      setCarregandoAluno(true)
      setErroCarregamento(null)
      
      logger.info(`🔍 Buscando dados completos do aluno: ${alunoId}`, 'component')
      
      const response = await api.get(`/aluno/${alunoId}`)
      
      if (response.data.aluno) {
        setAlunoSelecionado(response.data.aluno)
        logger.success('✅ Dados do aluno carregados com sucesso', 'component')
      } else {
        throw new Error('Dados do aluno não encontrados na resposta')
      }
    } catch (error: any) {
      logger.error('❌ Erro ao buscar dados do aluno', 'component', error)
      setErroCarregamento(error.response?.data?.mensagem || 'Erro ao carregar dados do aluno')
    } finally {
      setCarregandoAluno(false)
    }
  }

  const handleAlunoClick = (aluno: UltimosAlunos) => {
    // Priorizar aluno_id se disponível, caso contrário usar id
    const alunoId = aluno.aluno_id || aluno.id
    if (alunoId) {
      buscarAlunoCompleto(alunoId)
    } else {
      logger.error('ID do aluno não encontrado', 'component', aluno)
      setErroCarregamento('ID do aluno não encontrado')
    }
  }

  const fecharModal = () => {
    setAlunoSelecionado(null)
    setErroCarregamento(null)
  }

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
                onClick={() => handleAlunoClick(aluno)}
                className="group relative flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200"
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
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
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
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Aluno */}
      {(alunoSelecionado || erroCarregamento) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={fecharModal}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal - Fixo */}
            <div className="bg-blue-500 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Detalhes do Aluno</h2>
              <button
                onClick={fecharModal}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal - Com Scroll */}
            <div 
              className="p-6 overflow-y-auto flex-1 scrollbar-orange"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#fb923c #f3f4f6'
              }}
            >
              {carregandoAluno ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                      <UserCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-600">Carregando dados do aluno...</p>
                  </div>
                </div>
              ) : erroCarregamento ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-semibold mb-2">Erro ao carregar dados</p>
                  <p className="text-gray-600 text-sm">{erroCarregamento}</p>
                </div>
              ) : alunoSelecionado ? (
                <div className="space-y-6">
                  {/* Nome e Avatar */}
                  <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                    <div className="w-20 h-20 bg-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {alunoSelecionado.nome_aluno.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {alunoSelecionado.nome_aluno} {alunoSelecionado.sobrenome_aluno}
                      </h3>
                      <p className="text-gray-500 mt-1">
                        {calcularIdade(alunoSelecionado.data_nascimento_aluno)} anos
                      </p>
                    </div>
                  </div>

                  {/* Informações Pessoais */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Informações Pessoais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">Data de Nascimento</span>
                        </div>
                        <p className="text-gray-900">
                          {new Date(alunoSelecionado.data_nascimento_aluno).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <IdCard className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">CPF</span>
                        </div>
                        <p className="text-gray-900">{alunoSelecionado.cpf_aluno}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">RG</span>
                        </div>
                        <p className="text-gray-900">{alunoSelecionado.rg_aluno}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">Naturalidade</span>
                        </div>
                        <p className="text-gray-900">{alunoSelecionado.naturalidade_aluno}</p>
                      </div>

                      {alunoSelecionado.nome_religiao && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-700">Religião</span>
                          </div>
                          <p className="text-gray-900">{alunoSelecionado.nome_religiao}</p>
                        </div>
                      )}

                      {alunoSelecionado.numero_matricula_aluno && (
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-700">Número de Matrícula</span>
                          </div>
                          <p className="text-gray-900 font-mono font-semibold">{alunoSelecionado.numero_matricula_aluno}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Endereço</h4>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Endereço Completo</span>
                      </div>
                      <p className="text-gray-900 mb-1">{alunoSelecionado.endereco_aluno}</p>
                      <p className="text-gray-700 text-sm">
                        {alunoSelecionado.bairro_aluno} - CEP: {alunoSelecionado.cep_aluno}
                      </p>
                    </div>
                  </div>

                  {/* Certidão de Nascimento */}
                  {alunoSelecionado.livro_certidao && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Certidão de Nascimento</h4>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Livro</span>
                            <p className="text-gray-900 font-medium">{alunoSelecionado.livro_certidao}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Matrícula</span>
                            <p className="text-gray-900 font-medium">{alunoSelecionado.matricula_certidao}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Termo</span>
                            <p className="text-gray-900 font-medium">{alunoSelecionado.termo_certidao}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Folha</span>
                            <p className="text-gray-900 font-medium">{alunoSelecionado.folha_certidao}</p>
                          </div>
                          {alunoSelecionado.data_expedicao_certidao && (
                            <div>
                              <span className="text-xs font-semibold text-gray-600">Data de Expedição</span>
                              <p className="text-gray-900 font-medium text-sm">
                                {new Date(alunoSelecionado.data_expedicao_certidao).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          )}
                        </div>
                        {alunoSelecionado.nome_cartorio_certidao && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700">Cartório</span>
                            </div>
                            <p className="text-gray-900 text-sm mt-1">{alunoSelecionado.nome_cartorio_certidao}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Datas do Sistema */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Cadastrado em</span>
                      </div>
                      <p className="text-gray-900 text-sm">
                        {new Date(alunoSelecionado.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Última atualização</span>
                      </div>
                      <p className="text-gray-900 text-sm">
                        {new Date(alunoSelecionado.updated_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
