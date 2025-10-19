import api from '../lib/api'
import { logger } from '../lib/logger'

export interface Atividade {
  atividade_id?: string
  titulo: string
  descricao: string
  peso: number
  vale_nota: boolean
  periodo_letivo_id: string
  aula_id: string
  turma_disciplina_professor_id: string
  created_at?: string
  updated_at?: string
}

export interface AtividadeResponse {
  sucesso: boolean
  mensagem: string
  dados?: Atividade | Atividade[]
  total?: number
}

class AtividadeService {
  /**
   * Listar todas as atividades
   */
  static async listarAtividades(): Promise<AtividadeResponse> {
    try {
      logger.info('📋 Listando atividades', 'service')
      const response = await api.get('/atividade')
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao listar atividades', 'service', error)
      throw error
    }
  }

  /**
   * Buscar atividade por ID
   */
  static async buscarAtividadePorId(atividadeId: string): Promise<AtividadeResponse> {
    try {
      logger.info(`🔍 Buscando atividade: ${atividadeId}`, 'service')
      const response = await api.get(`/atividade/${atividadeId}`)
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao buscar atividade por ID', 'service', error)
      throw error
    }
  }

  /**
   * Buscar atividades por aula
   */
  static async buscarAtividadesPorAula(aulaId: string): Promise<AtividadeResponse> {
    try {
      logger.info(`🔍 Buscando atividades da aula: ${aulaId}`, 'service')
      const response = await api.get(`/atividade/aula/${aulaId}`)
      
      logger.info('🔍 Resposta bruta do backend:', 'service', response.data)
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      logger.info('🔍 Data antes da conversão:', 'service', data)
      logger.info('🔍 Data.success existe?', 'service', data.success !== undefined)
      logger.info('🔍 Data.success valor:', 'service', data.success)
      
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
        logger.info('🔍 Convertido success para sucesso:', 'service', data)
        logger.info('🔍 Data.sucesso após conversão:', 'service', data.sucesso)
      }
      
      logger.info('🔍 Dados finais retornados:', 'service', data)
      return data
    } catch (error) {
      logger.error('❌ Erro ao buscar atividades por aula', 'service', error)
      throw error
    }
  }

  /**
   * Criar nova atividade
   */
  static async criarAtividade(dadosAtividade: {
    titulo: string
    descricao: string
    peso: number
    vale_nota: boolean
    periodo_letivo_id: string
    aula_id: string
    turma_disciplina_professor_id: string
  }): Promise<AtividadeResponse> {
    try {
      logger.info(`➕ Criando atividade: ${dadosAtividade.titulo}`, 'service')
      logger.info(`📝 Dados enviados:`, 'service', dadosAtividade)
      const response = await api.post('/atividade', dadosAtividade)
      
      logger.info(`📝 Resposta recebida:`, 'service', response.data)
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao criar atividade', 'service', error)
      logger.error('❌ Service: Tipo do erro:', 'service', typeof error)
      logger.error('❌ Service: Stack do erro:', 'service', error instanceof Error ? error.stack : 'Não é Error')
      throw error
    }
  }

  /**
   * Atualizar atividade
   */
  static async atualizarAtividade(atividadeId: string, dadosAtualizacao: {
    titulo?: string
    descricao?: string
    peso?: number
    vale_nota?: boolean
  }): Promise<AtividadeResponse> {
    try {
      logger.info(`📝 Atualizando atividade: ${atividadeId}`, 'service')
      const response = await api.put(`/atividade/${atividadeId}`, dadosAtualizacao)
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao atualizar atividade', 'service', error)
      throw error
    }
  }

  /**
   * Deletar atividade
   */
  static async deletarAtividade(atividadeId: string): Promise<AtividadeResponse> {
    try {
      logger.info(`🗑️ Deletando atividade: ${atividadeId}`, 'service')
      const response = await api.delete(`/atividade/${atividadeId}`)
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao deletar atividade', 'service', error)
      throw error
    }
  }
}

export default AtividadeService
