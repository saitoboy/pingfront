import api from '../lib/api'
import { logger } from '../lib/logger'

export interface Feriado {
  feriado_id: string
  ano_letivo_id: string
  data: string // YYYY-MM-DD
  descricao: string
  created_at?: string
  updated_at?: string
}

export interface CriarFeriadoDto {
  ano_letivo_id: string
  data: string // YYYY-MM-DD
  descricao: string
}

const BASE = '/feriado'

class FeriadoService {
  static async listarPorAno(ano_letivo_id: string): Promise<Feriado[]> {
    try {
      const response = await api.get(`${BASE}/ano/${ano_letivo_id}`)
      return response.data.dados || []
    } catch (error) {
      logger.error('Erro ao listar feriados', 'service', error)
      throw error
    }
  }

  static async criar(dados: CriarFeriadoDto): Promise<Feriado> {
    try {
      logger.apiRequest('POST', BASE, dados)
      const response = await api.post(BASE, dados)
      return response.data.dados
    } catch (error) {
      logger.error('Erro ao criar feriado', 'service', error)
      throw error
    }
  }

  static async deletar(feriado_id: string): Promise<void> {
    try {
      logger.apiRequest('DELETE', `${BASE}/${feriado_id}`)
      await api.delete(`${BASE}/${feriado_id}`)
    } catch (error) {
      logger.error('Erro ao deletar feriado', 'service', error)
      throw error
    }
  }
}

export default FeriadoService
