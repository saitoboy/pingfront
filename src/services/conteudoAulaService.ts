import api from '../lib/api'
import { logger } from '../lib/logger'

export interface ConteudoAula {
  conteudo_aula_id?: string
  aula_id: string
  descricao: string
  conteudo: string
  created_at?: string
  updated_at?: string
}

export interface ConteudoAulaResponse {
  sucesso: boolean
  mensagem: string
  dados?: ConteudoAula | ConteudoAula[]
  total?: number
}

class ConteudoAulaService {
  /**
   * Listar todos os conteúdos de aula
   */
  static async listarConteudos(): Promise<ConteudoAulaResponse> {
    try {
      logger.info('📚 Listando conteúdos de aula', 'service')
      const response = await api.get('/conteudo-aula')
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao listar conteúdos', 'service', error)
      throw error
    }
  }

  /**
   * Buscar conteúdo por ID
   */
  static async buscarConteudoPorId(conteudoId: string): Promise<ConteudoAulaResponse> {
    try {
      logger.info(`🔍 Buscando conteúdo: ${conteudoId}`, 'service')
      const response = await api.get(`/conteudo-aula/${conteudoId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao buscar conteúdo', 'service', error)
      throw error
    }
  }

  /**
   * Buscar conteúdos por aula
   */
  static async buscarConteudosPorAula(aulaId: string): Promise<ConteudoAulaResponse> {
    try {
      logger.info(`🔍 Buscando conteúdos da aula: ${aulaId}`, 'service')
      const response = await api.get(`/conteudo-aula/aula/${aulaId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao buscar conteúdos por aula', 'service', error)
      throw error
    }
  }

  /**
   * Criar novo conteúdo de aula
   */
  static async criarConteudo(dadosConteudo: {
    aula_id: string
    descricao: string
    conteudo: string
  }): Promise<ConteudoAulaResponse> {
    try {
      logger.info(`📝 Criando conteúdo: ${dadosConteudo.descricao}`, 'service')
      const response = await api.post('/conteudo-aula', dadosConteudo)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao criar conteúdo', 'service', error)
      throw error
    }
  }

  /**
   * Atualizar conteúdo de aula
   */
  static async atualizarConteudo(conteudoId: string, dadosConteudo: {
    descricao?: string
    conteudo?: string
  }): Promise<ConteudoAulaResponse> {
    try {
      logger.info(`📝 Atualizando conteúdo: ${conteudoId}`, 'service')
      const response = await api.put(`/conteudo-aula/${conteudoId}`, dadosConteudo)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao atualizar conteúdo', 'service', error)
      throw error
    }
  }

  /**
   * Deletar conteúdo de aula
   */
  static async deletarConteudo(conteudoId: string): Promise<ConteudoAulaResponse> {
    try {
      logger.info(`🗑️ Deletando conteúdo: ${conteudoId}`, 'service')
      const response = await api.delete(`/conteudo-aula/${conteudoId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao deletar conteúdo', 'service', error)
      throw error
    }
  }
}

export default ConteudoAulaService
