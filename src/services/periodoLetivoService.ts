import api from '../lib/api'
import { logger } from '../lib/logger'

export interface PeriodoLetivo {
  periodo_letivo_id: string
  bimestre: number
  ano_letivo_id: string
  created_at: string
  updated_at: string
}

export interface PeriodoLetivoResponse {
  sucesso: boolean
  mensagem: string
  dados?: PeriodoLetivo | PeriodoLetivo[]
  total?: number
}

class PeriodoLetivoService {
  /**
   * Buscar período letivo atual
   */
  static async buscarPeriodoLetivoAtual(): Promise<PeriodoLetivoResponse> {
    try {
      logger.info('📅 Buscando período letivo atual', 'service')
      const response = await api.get('/periodo-letivo/atual')
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao buscar período letivo atual', 'service', error)
      throw error
    }
  }

  /**
   * Listar todos os períodos letivos
   */
  static async listarPeriodosLetivos(): Promise<PeriodoLetivoResponse> {
    try {
      logger.info('📅 Listando períodos letivos', 'service')
      const response = await api.get('/periodo-letivo')
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao listar períodos letivos', 'service', error)
      throw error
    }
  }
}

export default PeriodoLetivoService
