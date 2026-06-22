import api from '../lib/api'
import { logger } from '../lib/logger'

export interface PeriodoLetivo {
  periodo_letivo_id: string
  bimestre: number
  ano_letivo_id: string
  data_inicio?: string | null
  data_fim?: string | null
  created_at: string
  updated_at: string
}

export interface CriarPeriodoLetivoDto {
  bimestre: number
  ano_letivo_id: string
  data_inicio?: string | null
  data_fim?: string | null
}

export interface AtualizarPeriodoLetivoDto {
  data_inicio?: string | null
  data_fim?: string | null
}

const BASE = '/periodo-letivo'

class PeriodoLetivoService {
  static async listarTodos(): Promise<PeriodoLetivo[]> {
    try {
      const response = await api.get(BASE)
      return response.data.dados || []
    } catch (error) {
      logger.error('Erro ao listar períodos letivos', 'service', error)
      throw error
    }
  }

  static async listarPorAno(ano_letivo_id: string): Promise<PeriodoLetivo[]> {
    try {
      const response = await api.get(`${BASE}/ano/${ano_letivo_id}`)
      return response.data.dados || []
    } catch (error) {
      logger.error('Erro ao listar períodos do ano letivo', 'service', error)
      throw error
    }
  }

  static async buscarAtual(): Promise<PeriodoLetivo | null> {
    try {
      const response = await api.get(`${BASE}/atual`)
      return response.data.dados || null
    } catch (error: any) {
      if (error.response?.status === 404) return null
      logger.error('Erro ao buscar período letivo atual', 'service', error)
      throw error
    }
  }

  static async criar(dados: CriarPeriodoLetivoDto): Promise<PeriodoLetivo> {
    try {
      logger.apiRequest('POST', BASE, dados)
      const response = await api.post(BASE, dados)
      return response.data.dados
    } catch (error) {
      logger.error('Erro ao criar período letivo', 'service', error)
      throw error
    }
  }

  static async criarTodos(ano_letivo_id: string): Promise<PeriodoLetivo[]> {
    try {
      logger.apiRequest('POST', `${BASE}/criar-todos/${ano_letivo_id}`)
      const response = await api.post(`${BASE}/criar-todos/${ano_letivo_id}`)
      return response.data.dados || []
    } catch (error) {
      logger.error('Erro ao criar todos os trimestres', 'service', error)
      throw error
    }
  }

  static async atualizar(periodo_letivo_id: string, dados: AtualizarPeriodoLetivoDto): Promise<PeriodoLetivo> {
    try {
      logger.apiRequest('PUT', `${BASE}/${periodo_letivo_id}`, dados)
      const response = await api.put(`${BASE}/${periodo_letivo_id}`, dados)
      return response.data.dados
    } catch (error) {
      logger.error('Erro ao atualizar período letivo', 'service', error)
      throw error
    }
  }

  static async deletar(periodo_letivo_id: string): Promise<void> {
    try {
      logger.apiRequest('DELETE', `${BASE}/${periodo_letivo_id}`)
      await api.delete(`${BASE}/${periodo_letivo_id}`)
    } catch (error) {
      logger.error('Erro ao deletar período letivo', 'service', error)
      throw error
    }
  }

  static async ativar(periodo_letivo_id: string): Promise<{ total: number }> {
    try {
      logger.apiRequest('POST', `${BASE}/${periodo_letivo_id}/ativar`)
      const response = await api.post(`${BASE}/${periodo_letivo_id}/ativar`)
      return response.data.dados
    } catch (error) {
      logger.error('Erro ao ativar período letivo', 'service', error)
      throw error
    }
  }
}

export default PeriodoLetivoService
