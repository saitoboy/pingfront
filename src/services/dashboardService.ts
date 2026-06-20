import api from '../lib/api'
import { logger } from '../lib/logger'

export interface DashboardStats {
  totalAlunos: number
  totalProfessores: number
  totalTurmas: number
  estatisticasAlunos?: {
    totalAtivos: number
    totalInativos: number
    crescimentoMensal?: number
  }
}

export interface UltimosAlunos {
  id: number | string
  aluno_id?: string // ID original do aluno para busca na API
  nome: string
  sobrenome: string
  data_nascimento: string
  created_at: string
}

export interface AlunosPorTurma {
  turma_nome: string
  serie_nome?: string
  total_alunos: number
  capacidade: number
  percentual_ocupacao: number
}

export const dashboardService = {
  // Buscar estatísticas gerais
  async buscarEstatisticas(): Promise<DashboardStats> {
    try {
      logger.info('📊 Buscando estatísticas da dashboard...', 'service')
      
      // Buscar dados de diferentes endpoints em paralelo
      const [alunosResponse, professoresResponse, turmasResponse, estatisticasResponse] = await Promise.all([
        api.get('/aluno'),
        api.get('/professor'),
        api.get('/turma'),
        api.get('/aluno/estatisticas/geral').catch(() => null) // Pode falhar se não existir
      ])

      logger.debug('🔍 Debug alunosResponse', 'service', alunosResponse.data)
      logger.debug('🔍 Debug professoresResponse', 'service', professoresResponse.data)
      logger.debug('🔍 Debug turmasResponse', 'service', turmasResponse.data)

      // Processar resposta dos alunos - pode vir em formatos diferentes
      let totalAlunos = 0
      if (alunosResponse.data.meta?.total) {
        totalAlunos = alunosResponse.data.meta.total
      } else if (alunosResponse.data.dados && Array.isArray(alunosResponse.data.dados)) {
        totalAlunos = alunosResponse.data.dados.length
      } else if (Array.isArray(alunosResponse.data)) {
        totalAlunos = alunosResponse.data.length
      } else if (alunosResponse.data.total) {
        totalAlunos = alunosResponse.data.total
      }

      // Processar resposta dos professores
      let totalProfessores = 0
      if (professoresResponse.data.meta?.total) {
        totalProfessores = professoresResponse.data.meta.total
      } else if (professoresResponse.data.dados && Array.isArray(professoresResponse.data.dados)) {
        totalProfessores = professoresResponse.data.dados.length
      } else if (Array.isArray(professoresResponse.data)) {
        totalProfessores = professoresResponse.data.length
      } else if (professoresResponse.data.total) {
        totalProfessores = professoresResponse.data.total
      }

      // Processar resposta das turmas
      let totalTurmas = 0
      if (turmasResponse.data.meta?.total) {
        totalTurmas = turmasResponse.data.meta.total
      } else if (turmasResponse.data.dados && Array.isArray(turmasResponse.data.dados)) {
        totalTurmas = turmasResponse.data.dados.length
      } else if (turmasResponse.data.turmas && Array.isArray(turmasResponse.data.turmas)) {
        totalTurmas = turmasResponse.data.turmas.length
      } else if (Array.isArray(turmasResponse.data)) {
        totalTurmas = turmasResponse.data.length
      } else if (turmasResponse.data.total) {
        totalTurmas = turmasResponse.data.total
      }

      // Buscar estatísticas específicas de alunos se disponível
      const estatisticasAlunos = estatisticasResponse?.data?.dados || estatisticasResponse?.data || null

      const stats: DashboardStats = {
        totalAlunos,
        totalProfessores,
        totalTurmas,
        estatisticasAlunos: estatisticasAlunos ? {
          totalAtivos: estatisticasAlunos.totalAtivos || totalAlunos,
          totalInativos: estatisticasAlunos.totalInativos || 0,
          crescimentoMensal: estatisticasAlunos.crescimentoMensal || null
        } : undefined
      }

      logger.info('✅ Estatísticas carregadas', 'service', stats)
      return stats
    } catch (error) {
      logger.error('❌ Erro ao buscar estatísticas', 'service', error)
      throw error
    }
  },

  // Buscar últimos alunos cadastrados
  async buscarUltimosAlunos(limit = 5): Promise<UltimosAlunos[]> {
    try {
      logger.info('👥 INICIANDO buscarUltimosAlunos...', 'service', { limit })
      
      // Buscar dos alunos 
      const alunosResponse = await api.get(`/aluno`)
      
      logger.info('🌐 API RESPONSE recebida:', 'service', { 
        status: alunosResponse.status,
        hasData: !!alunosResponse.data,
        hasDados: !!alunosResponse.data?.dados
      })
      
      logger.debug('🔍 Debug buscarUltimosAlunos response:', 'service', {
        status: alunosResponse.status,
        data: alunosResponse.data,
        dataType: typeof alunosResponse.data,
        isArray: Array.isArray(alunosResponse.data)
      })
      
      let alunos = []
      
      // Processar resposta da API de alunos
      if (alunosResponse.data.dados && Array.isArray(alunosResponse.data.dados)) {
        alunos = alunosResponse.data.dados
        logger.debug('📋 Usando alunosResponse.data.dados', 'service', alunos.slice(0, 2))
      } else if (alunosResponse.data.alunos && Array.isArray(alunosResponse.data.alunos)) {
        alunos = alunosResponse.data.alunos
        logger.debug('📋 Usando alunosResponse.data.alunos', 'service', alunos.slice(0, 2))
      } else if (Array.isArray(alunosResponse.data)) {
        alunos = alunosResponse.data
        logger.debug('📋 Usando alunosResponse.data direto', 'service', alunos.slice(0, 2))
      } else if (alunosResponse.data.data && Array.isArray(alunosResponse.data.data)) {
        alunos = alunosResponse.data.data
        logger.debug('📋 Usando alunosResponse.data.data', 'service', alunos.slice(0, 2))
      } else {
        logger.error('⚠️ Formato de resposta não reconhecido para alunos', 'service', {
          dataKeys: Object.keys(alunosResponse.data),
          sampleData: alunosResponse.data
        })
        alunos = []
      }
      
      logger.debug('🔍 Debug alunos encontrados:', 'service', { 
        quantidade: alunos.length, 
        primeiros3: alunos.slice(0, 3),
        campos: alunos.length > 0 ? Object.keys(alunos[0]) : []
      })
      
      // Verificar se há alunos com created_at
      const alunosComData = alunos.filter((aluno: any) => aluno.created_at || aluno.data_cadastro)
      logger.debug('🔍 Alunos com data:', 'service', { 
        total: alunos.length, 
        comCreatedAt: alunos.filter((a: any) => a.created_at).length,
        comDataCadastro: alunos.filter((a: any) => a.data_cadastro).length,
        comQualquerData: alunosComData.length,
        exemploAluno: alunos[0] || null
      })
      
      // Se não houver alunos com data, usar todos os alunos disponíveis
      let alunosParaProcessar = alunosComData.length > 0 ? alunosComData : alunos
      
      logger.debug('🔧 Alunos para processar:', 'service', {
        quantidade: alunosParaProcessar.length,
        primeiros2: alunosParaProcessar.slice(0, 2)
      })
      
      // Se ainda não há alunos, retornar array vazio
      if (alunosParaProcessar.length === 0) {
        logger.debug('⚠️ Nenhum aluno encontrado para processar', 'service')
        return []
      }
      
      // Limitar ao número solicitado e ordenar por data de criação (mais recente primeiro)
      const alunosProcessados = alunosParaProcessar
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || a.data_cadastro || new Date()).getTime()
          const dateB = new Date(b.created_at || b.data_cadastro || new Date()).getTime()
          return dateB - dateA
        })
        .slice(0, limit)
        .map((aluno: any) => {
          const alunoProcessado = {
            id: aluno.id || aluno.aluno_id || Math.random(),
            aluno_id: aluno.aluno_id || aluno.id, // Preservar aluno_id original para busca
            nome: aluno.nome || aluno.nome_aluno || aluno.first_name || 'Nome não informado',
            sobrenome: aluno.sobrenome || aluno.sobrenome_aluno || aluno.last_name || '',
            data_nascimento: aluno.data_nascimento || aluno.data_nascimento_aluno || aluno.birth_date || '2000-01-01',
            created_at: aluno.created_at || aluno.data_cadastro || new Date().toISOString()
          }
          
          logger.debug('👤 Aluno processado:', 'service', alunoProcessado)
          return alunoProcessado
        })
      
      logger.info(`✅ ${alunosProcessados.length} últimos alunos processados`, 'service', { 
        alunosProcessados: alunosProcessados.map((a: UltimosAlunos) => ({ id: a.id, nome: a.nome }))
      })
      return alunosProcessados
    } catch (error) {
      logger.error('❌ Erro ao buscar últimos alunos', 'service', error)
      // Retornar array vazio em caso de erro em vez de fazer throw
      return []
    }
  },

  // Buscar distribuição de alunos por turma
  async buscarAlunosPorTurma(): Promise<AlunosPorTurma[]> {
    try {
      logger.info('📊 Buscando distribuição de alunos por turma...', 'service')
      
      // Buscar turmas e séries em paralelo
      const [turmasResponse, seriesResponse] = await Promise.all([
        api.get('/turma'),
        api.get('/serie')
      ])
      
      // Processar resposta das turmas
      let turmas = []
      if (turmasResponse.data.dados && Array.isArray(turmasResponse.data.dados)) {
        turmas = turmasResponse.data.dados
      } else if (turmasResponse.data.turmas && Array.isArray(turmasResponse.data.turmas)) {
        turmas = turmasResponse.data.turmas
      } else if (Array.isArray(turmasResponse.data)) {
        turmas = turmasResponse.data
      } else {
        logger.error('⚠️ Formato de resposta não reconhecido para turmas', 'service', turmasResponse.data)
        turmas = []
      }
      
      // Processar resposta das séries
      let series = []
      if (seriesResponse.data.dados && Array.isArray(seriesResponse.data.dados)) {
        series = seriesResponse.data.dados
      } else if (seriesResponse.data.series && Array.isArray(seriesResponse.data.series)) {
        series = seriesResponse.data.series
      } else if (Array.isArray(seriesResponse.data)) {
        series = seriesResponse.data
      } else {
        logger.error('⚠️ Formato de resposta não reconhecido para séries', 'service', seriesResponse.data)
        series = []
      }
      
      logger.debug('🔍 Dados encontrados:', 'service', { 
        quantidadeTurmas: turmas.length,
        quantidadeSeries: series.length,
        primeiraTurma: turmas[0] || null,
        primeiraSerie: series[0] || null
      })
      
      // Criar mapa de séries para facilitar lookup
      const seriesMap = new Map()
      series.forEach((serie: any) => {
        const serieId = serie.id || serie.serie_id
        const nomeSerie = serie.nome || serie.nome_serie || serie.text || `${serie.id || serie.serie_id}° Ano`
        if (serieId) {
          seriesMap.set(serieId, nomeSerie)
        }
      })
      
      // Para cada turma, buscar quantidade de alunos matriculados
      const turmasComAlunos = await Promise.all(
        turmas.map(async (turma: any) => {
          try {
            const turmaId = turma.id || turma.turma_id
            const serieId = turma.serie_id
            // O nome_turma já vem completo do banco (ex: "3º Ano A"), não precisa concatenar com série
            const nomeTurma = turma.nome_turma || turma.nome || 'Turma sem nome'
            
            // Buscar matrículas desta turma
            const matriculasResponse = await api.get(`/matricula-aluno/turma/${turmaId}`)
            
            let totalAlunos = 0
            if (matriculasResponse.data.dados && Array.isArray(matriculasResponse.data.dados)) {
              totalAlunos = matriculasResponse.data.dados.length
            } else if (matriculasResponse.data.matriculas && Array.isArray(matriculasResponse.data.matriculas)) {
              totalAlunos = matriculasResponse.data.matriculas.length
            } else if (Array.isArray(matriculasResponse.data)) {
              totalAlunos = matriculasResponse.data.length
            } else if (matriculasResponse.data.total) {
              totalAlunos = matriculasResponse.data.total
            }
            
            const capacidade = turma.capacidade_maxima || turma.capacidade || turma.max_alunos || 30

            logger.debug('🎯 Turma processada:', 'service', {
              turmaId,
              serieId,
              nomeTurma,
              totalAlunos,
              capacidade
            })

            return {
              turma_nome: nomeTurma,
              serie_nome: seriesMap.get(serieId),
              total_alunos: totalAlunos,
              capacidade: capacidade,
              percentual_ocupacao: Math.round((totalAlunos / capacidade) * 100)
            }
          } catch (error) {
            // Se der erro ao buscar matrículas da turma, retorna valores padrão
            const turmaId = turma.id || turma.turma_id
            // O nome_turma já vem completo do banco, não precisa concatenar com série
            const nomeTurma = turma.nome_turma || turma.nome || 'Turma sem nome'
            const capacidade = turma.capacidade_maxima || turma.capacidade || turma.max_alunos || 30

            logger.error('❌ Erro ao buscar matrículas da turma', 'service', { turmaId, error })

            return {
              turma_nome: nomeTurma,
              serie_nome: seriesMap.get(turma.serie_id),
              total_alunos: 0,
              capacidade: capacidade,
              percentual_ocupacao: 0
            }
          }
        })
      )
      
      logger.info(`✅ Distribuição de ${turmasComAlunos.length} turmas carregada`, 'service', { 
        turmas: turmasComAlunos.slice(0, 3)
      })
      return turmasComAlunos
    } catch (error) {
      logger.error('❌ Erro ao buscar distribuição por turmas', 'service', error)
      throw error
    }
  },

  // Buscar matrículas recentes
  async buscarMatriculasRecentes(limit = 10) {
    try {
      logger.info('📋 Buscando matrículas recentes...', 'service')
      
      const response = await api.get(`/matricula-aluno?limite=${limit}&ordenar=created_at&direcao=desc`)
      const matriculas = response.data.dados || []
      
      logger.info(`✅ ${matriculas.length} matrículas recentes carregadas`, 'service')
      return matriculas
    } catch (error) {
      logger.error('❌ Erro ao buscar matrículas recentes', 'service', error)
      throw error
    }
  }
}
