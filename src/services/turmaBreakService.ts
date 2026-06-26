import api from '../lib/api'
import { logger } from '../lib/logger'

export interface TurmaBreak {
  break_id?: string
  turma_id: string
  dia_semana: number | null // null = todos os dias; 1=Seg … 5=Sex
  tipo: 'lanche' | 'recreio'
  hora_inicio: string
  hora_fim: string
}

interface BreakResponse {
  status: string
  mensagem: string
  dados?: TurmaBreak | TurmaBreak[]
}

const turmaBreakService = {
  async listarPorTurma(turmaId: string): Promise<TurmaBreak[]> {
    try {
      logger.info(`Carregando breaks da turma ${turmaId}`, 'service')
      const resp = await api.get(`/turma-break/turma/${turmaId}`)
      const dados = resp.data?.dados
      return Array.isArray(dados) ? dados : []
    } catch (error) {
      logger.error('Erro ao listar breaks', 'service', error)
      throw error
    }
  },

  async criar(dados: Omit<TurmaBreak, 'break_id'>): Promise<TurmaBreak> {
    try {
      const resp = await api.post('/turma-break', dados)
      return resp.data.dados
    } catch (error) {
      logger.error('Erro ao criar break', 'service', error)
      throw error
    }
  },

  async atualizar(breakId: string, dados: Partial<Omit<TurmaBreak, 'break_id' | 'turma_id'>>): Promise<TurmaBreak> {
    try {
      const resp = await api.put(`/turma-break/${breakId}`, dados)
      return resp.data.dados
    } catch (error) {
      logger.error('Erro ao atualizar break', 'service', error)
      throw error
    }
  },

  async deletar(breakId: string): Promise<void> {
    try {
      await api.delete(`/turma-break/${breakId}`)
    } catch (error) {
      logger.error('Erro ao deletar break', 'service', error)
      throw error
    }
  },
}

export default turmaBreakService
