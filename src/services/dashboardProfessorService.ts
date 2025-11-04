import api from '../lib/api'
import { logger } from '../lib/logger'
import { professorService } from './professorService'

export interface DashboardProfessorStats {
  totalTurmas: number
  totalDisciplinas: number
  totalAulas: number
  totalAtividades: number
  atividadesAvaliativas: number
  proximasAulas: ProximaAula[]
  turmasResumo: TurmaResumo[]
}

export interface ProximaAula {
  aula_id: string
  data_aula: string
  hora_inicio: string
  hora_fim: string
  nome_turma: string
  nome_disciplina: string
  nome_serie: string
}

export interface TurmaResumo {
  turma_id: string
  nome_turma: string
  nome_serie: string
  disciplina_id: string
  nome_disciplina: string
  total_aulas: number
  total_atividades: number
  turma_disciplina_professor_id: string
}

export const dashboardProfessorService = {
  // Buscar estatísticas do professor logado
  async buscarEstatisticas(): Promise<DashboardProfessorStats> {
    try {
      logger.info('📊 Buscando estatísticas do professor...', 'service')
      
      // Buscar turmas do professor
      const turmasResponse = await professorService.listarMinhasTurmas()
      const turmas = turmasResponse.dados || []
      
      logger.info(`📚 ${turmas.length} turmas encontradas`, 'service')
      
      // Buscar aulas e atividades de todas as turmas
      const turmasDisciplinasIds = turmas.map((t: any) => t.turma_disciplina_professor_id)
      
      // Buscar aulas de todas as vinculações em paralelo
      const aulasPromises = turmasDisciplinasIds.map(async (id: string) => {
        try {
          const response = await api.get(`/aula/vinculacao/${id}`)
          return response.data.aulas || []
        } catch (error) {
          logger.error(`Erro ao buscar aulas da vinculação ${id}`, 'service', error)
          return []
        }
      })
      
      const aulasArrays = await Promise.all(aulasPromises)
      const todasAulas = aulasArrays.flat()
      
      // Buscar atividades de todas as aulas
      const atividadesPromises = todasAulas.map(async (aula: any) => {
        try {
          const response = await api.get(`/atividade/aula/${aula.aula_id}`)
          return Array.isArray(response.data.data) ? response.data.data : []
        } catch (error) {
          logger.error(`Erro ao buscar atividades da aula ${aula.aula_id}`, 'service', error)
          return []
        }
      })
      
      const atividadesArrays = await Promise.all(atividadesPromises)
      const todasAtividades = atividadesArrays.flat()
      
      // Agrupar turmas únicas
      const turmasUnicas = new Map()
      turmas.forEach((t: any) => {
        const key = `${t.turma_id}-${t.disciplina_id}`
        if (!turmasUnicas.has(key)) {
          turmasUnicas.set(key, {
            turma_id: t.turma_id,
            nome_turma: t.nome_turma,
            nome_serie: t.nome_serie,
            disciplina_id: t.disciplina_id,
            nome_disciplina: t.nome_disciplina,
            turma_disciplina_professor_id: t.turma_disciplina_professor_id
          })
        }
      })
      
      // Calcular estatísticas por turma/disciplina
      const turmasResumo: TurmaResumo[] = Array.from(turmasUnicas.values()).map((turma: any) => {
        const aulasDaTurma = todasAulas.filter((a: any) => {
          const turmaDisciplina = turmas.find((t: any) => 
            t.turma_disciplina_professor_id === a.turma_disciplina_professor_id
          )
          return turmaDisciplina && 
                 turmaDisciplina.turma_id === turma.turma_id && 
                 turmaDisciplina.disciplina_id === turma.disciplina_id
        })
        
        const atividadesDaTurma = todasAtividades.filter((at: any) => {
          return aulasDaTurma.some((a: any) => a.aula_id === at.aula_id)
        })
        
        return {
          ...turma,
          total_aulas: aulasDaTurma.length,
          total_atividades: atividadesDaTurma.length
        }
      })
      
      // Filtrar próximas aulas (próximos 5 dias)
      const hoje = new Date()
      const proximos5Dias = new Date()
      proximos5Dias.setDate(hoje.getDate() + 5)
      
      const proximasAulas: ProximaAula[] = todasAulas
        .filter((aula: any) => {
          const dataAula = new Date(aula.data_aula)
          return dataAula >= hoje && dataAula <= proximos5Dias
        })
        .sort((a: any, b: any) => {
          const dataA = new Date(a.data_aula).getTime()
          const dataB = new Date(b.data_aula).getTime()
          return dataA - dataB
        })
        .slice(0, 5)
        .map((aula: any) => {
          const turmaDisciplina = turmas.find((t: any) => 
            t.turma_disciplina_professor_id === aula.turma_disciplina_professor_id
          )
          return {
            aula_id: aula.aula_id,
            data_aula: aula.data_aula,
            hora_inicio: aula.hora_inicio,
            hora_fim: aula.hora_fim,
            nome_turma: turmaDisciplina?.nome_turma || 'Turma não encontrada',
            nome_disciplina: turmaDisciplina?.nome_disciplina || 'Disciplina não encontrada',
            nome_serie: turmaDisciplina?.nome_serie || ''
          }
        })
      
      const atividadesAvaliativas = todasAtividades.filter((at: any) => at.vale_nota === true).length
      
      const stats: DashboardProfessorStats = {
        totalTurmas: turmasUnicas.size,
        totalDisciplinas: turmas.length,
        totalAulas: todasAulas.length,
        totalAtividades: todasAtividades.length,
        atividadesAvaliativas,
        proximasAulas,
        turmasResumo
      }
      
      logger.info('✅ Estatísticas do professor carregadas', 'service', stats)
      return stats
    } catch (error) {
      logger.error('❌ Erro ao buscar estatísticas do professor', 'service', error)
      throw error
    }
  }
}

