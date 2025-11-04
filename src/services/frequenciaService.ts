import api from '../lib/api'
import { logger } from '../lib/logger'

export interface Frequencia {
  frequencia_id?: string
  aula_id: string
  matricula_aluno_id: string
  presenca: boolean
  created_at?: string
  updated_at?: string
}

export interface AlunoFrequencia {
  matricula_aluno_id: string
  ra: string
  nome_aluno: string
  sobrenome_aluno: string
  presenca?: boolean
  frequencia_id?: string
}

export interface FrequenciaResponse {
  success: boolean
  message: string
  data?: Frequencia | Frequencia[] | AlunoFrequencia[]
  total?: number
  // Manter compatibilidade com versões antigas
  sucesso?: boolean
  mensagem?: string
  dados?: Frequencia | Frequencia[] | AlunoFrequencia[]
}

class FrequenciaService {
  /**
   * Listar todas as frequências
   */
  static async listarFrequencias(): Promise<FrequenciaResponse> {
    try {
      logger.info('📋 Listando frequências', 'service')
      const response = await api.get('/frequencia')
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao listar frequências', 'service', error)
      throw error
    }
  }

  /**
   * Buscar frequências por aula
   */
  static async buscarFrequenciasPorAula(aulaId: string): Promise<FrequenciaResponse> {
    try {
      logger.info(`🔍 Buscando frequências da aula: ${aulaId}`, 'service')
      const response = await api.get(`/frequencia/aula/${aulaId}`)
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao buscar frequências por aula', 'service', error)
      throw error
    }
  }

  /**
   * Buscar alunos de uma turma para presença
   */
  static async buscarAlunosTurma(turmaId: string): Promise<FrequenciaResponse> {
    try {
      logger.info(`👥 Buscando alunos da turma: ${turmaId}`, 'service')
      const response = await api.get(`/matricula-aluno/turma/${turmaId}`)
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao buscar alunos da turma', 'service', error)
      throw error
    }
  }

  /**
   * Buscar alunos matriculados em uma aula específica
   */
  static async buscarAlunosPorAula(aulaId: string): Promise<FrequenciaResponse> {
    try {
      logger.info(`👥 Buscando alunos da aula: ${aulaId}`, 'service')
      const response = await api.get(`/matricula-aluno/aula/${aulaId}`)
      
      // Converter success para sucesso para manter consistência
      const data = response.data
      if (data.success !== undefined) {
        data.sucesso = data.success
        delete data.success
      }
      
      return data
    } catch (error) {
      logger.error('❌ Erro ao buscar alunos da aula', 'service', error)
      throw error
    }
  }

  /**
   * Criar frequência individual
   */
  static async criarFrequencia(dadosFrequencia: {
    aula_id: string
    matricula_aluno_id: string
    presenca: boolean
  }): Promise<FrequenciaResponse> {
    try {
      logger.info(`📝 Criando frequência: ${dadosFrequencia.matricula_aluno_id}`, 'service')
      const response = await api.post('/frequencia', dadosFrequencia)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao criar frequência', 'service', error)
      throw error
    }
  }

  /**
   * Registrar frequência em lote
   */
  static async registrarFrequenciaLote(aulaId: string, frequencias: Array<{
    matricula_aluno_id: string
    presenca: boolean
  }>): Promise<FrequenciaResponse> {
    try {
      logger.info(`📝 Registrando frequência em lote para aula: ${aulaId}`, 'service')
      const response = await api.post('/frequencia/lote', {
        aula_id: aulaId,
        frequencias
      })
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao registrar frequência em lote', 'service', error)
      throw error
    }
  }

  /**
   * Atualizar frequência
   */
  static async atualizarFrequencia(frequenciaId: string, presenca: boolean): Promise<FrequenciaResponse> {
    try {
      logger.info(`📝 Atualizando frequência: ${frequenciaId}`, 'service')
      const response = await api.put(`/frequencia/${frequenciaId}`, { presenca })
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao atualizar frequência', 'service', error)
      throw error
    }
  }

  /**
   * Deletar frequência
   */
  static async deletarFrequencia(frequenciaId: string): Promise<FrequenciaResponse> {
    try {
      logger.info(`🗑️ Deletando frequência: ${frequenciaId}`, 'service')
      const response = await api.delete(`/frequencia/${frequenciaId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao deletar frequência', 'service', error)
      throw error
    }
  }
}

export default FrequenciaService
