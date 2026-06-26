import api from '../lib/api'
import { logger } from '../lib/logger'

export interface GradeHorario {
  grade_horario_id?: string
  turma_disciplina_professor_id: string
  dia_semana: number // 0=Domingo, 1=Segunda, ..., 6=Sábado
  hora_inicio: string // Formato HH:MM
  hora_fim: string // Formato HH:MM
  observacao?: string | null
  created_at?: string
  updated_at?: string
}

export interface GradeHorarioResponse {
  success: boolean
  message: string
  data?: GradeHorario | GradeHorario[]
  sucesso?: boolean
  mensagem?: string
  dados?: GradeHorario | GradeHorario[]
}

class GradeHorarioService {
  /**
   * Listar todas as grades de horário
   */
  static async listarGrades(): Promise<GradeHorarioResponse> {
    try {
      logger.info('📅 Listando grades de horário', 'service')
      const response = await api.get('/grade-horario')
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao listar grades de horário', 'service', error)
      throw error
    }
  }

  /**
   * Buscar grade por ID
   */
  static async buscarGradePorId(gradeId: string): Promise<GradeHorarioResponse> {
    try {
      logger.info(`🔍 Buscando grade: ${gradeId}`, 'service')
      const response = await api.get(`/grade-horario/${gradeId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao buscar grade por ID', 'service', error)
      throw error
    }
  }

  /**
   * Buscar grades por vinculação
   */
  static async buscarGradesPorVinculacao(vinculacaoId: string): Promise<GradeHorarioResponse> {
    try {
      logger.info(`🔍 Buscando grades da vinculação: ${vinculacaoId}`, 'service')
      const response = await api.get(`/grade-horario/vinculacao/${vinculacaoId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao buscar grades por vinculação', 'service', error)
      throw error
    }
  }

  /**
   * Buscar grades por professor
   */
  static async buscarGradesPorProfessor(professorId: string): Promise<GradeHorarioResponse> {
    try {
      logger.info(`🔍 Buscando grades do professor: ${professorId}`, 'service')
      const response = await api.get(`/grade-horario/professor/${professorId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao buscar grades por professor', 'service', error)
      throw error
    }
  }

  /**
   * Criar nova grade de horário
   */
  static async criarGrade(dadosGrade: Omit<GradeHorario, 'grade_horario_id' | 'created_at' | 'updated_at'> & { observacao?: string | null }): Promise<GradeHorarioResponse> {
    try {
      logger.info(`📝 Criando grade: ${dadosGrade.dia_semana} ${dadosGrade.hora_inicio}-${dadosGrade.hora_fim}`, 'service')
      const response = await api.post('/grade-horario', dadosGrade)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao criar grade', 'service', error)
      throw error
    }
  }

  /**
   * Criar múltiplas grades em lote
   */
  static async criarGradesEmLote(grades: Array<Omit<GradeHorario, 'grade_horario_id' | 'created_at' | 'updated_at'>>): Promise<GradeHorarioResponse> {
    try {
      logger.info(`📝 Criando ${grades.length} grades em lote`, 'service')
      const response = await api.post('/grade-horario/lote', { grades })
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao criar grades em lote', 'service', error)
      throw error
    }
  }

  /**
   * Atualizar grade de horário
   */
  static async atualizarGrade(gradeId: string, dadosAtualizacao: Partial<Omit<GradeHorario, 'grade_horario_id' | 'turma_disciplina_professor_id' | 'created_at' | 'updated_at'>>): Promise<GradeHorarioResponse> {
    try {
      logger.info(`📝 Atualizando grade: ${gradeId}`, 'service')
      const response = await api.put(`/grade-horario/${gradeId}`, dadosAtualizacao)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao atualizar grade', 'service', error)
      throw error
    }
  }

  /**
   * Deletar grade de horário
   */
  static async deletarGrade(gradeId: string): Promise<GradeHorarioResponse> {
    try {
      logger.info(`🗑️ Deletando grade: ${gradeId}`, 'service')
      const response = await api.delete(`/grade-horario/${gradeId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao deletar grade', 'service', error)
      throw error
    }
  }

  /**
   * Deletar todas as grades de uma vinculação
   */
  static async deletarGradesPorVinculacao(vinculacaoId: string): Promise<GradeHorarioResponse> {
    try {
      logger.info(`🗑️ Deletando grades da vinculação: ${vinculacaoId}`, 'service')
      const response = await api.delete(`/grade-horario/vinculacao/${vinculacaoId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao deletar grades por vinculação', 'service', error)
      throw error
    }
  }

  /**
   * Obter nome do dia da semana
   */
  static getNomeDiaSemana(dia: number): string {
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    return dias[dia] || 'Desconhecido'
  }

  /**
   * Obter abreviação do dia da semana
   */
  static getAbreviacaoDiaSemana(dia: number): string {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return dias[dia] || '?'
  }
}

export default GradeHorarioService

