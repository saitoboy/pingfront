import api from '../lib/api'
import { logger } from '../lib/logger'

// Função utilitária para converter resposta do backend
const converterRespostaBackend = (data: any) => {
  if (data.success !== undefined) {
    data.sucesso = data.success
    delete data.success
  }
  if (data.message !== undefined) {
    data.mensagem = data.message
    delete data.message
  }
  if (data.data !== undefined) {
    data.dados = data.data
    delete data.data
  }
  return data
}

export interface Nota {
  nota_id?: string
  atividade_id: string
  matricula_aluno_id: string
  valor: number
  created_at?: string
  updated_at?: string
}

export interface NotaResponse {
  sucesso: boolean
  mensagem: string
  dados?: Nota | Nota[]
  total?: number
  // Campos do backend em inglês (para compatibilidade)
  success?: boolean
  message?: string
  data?: Nota | Nota[]
}

export interface AlunoNota {
  matricula_aluno_id: string
  ra: string
  nome_aluno: string
  sobrenome_aluno: string
  nota?: number
  nota_id?: string
}

class NotaService {
  /**
   * Listar todas as notas
   */
  static async listarNotas(): Promise<NotaResponse> {
    try {
      logger.info('📊 Listando notas', 'service')
      const response = await api.get('/nota')
      
      return converterRespostaBackend(response.data)
    } catch (error) {
      logger.error('❌ Erro ao listar notas', 'service', error)
      throw error
    }
  }

  /**
   * Buscar nota por ID
   */
  static async buscarNotaPorId(notaId: string): Promise<NotaResponse> {
    try {
      logger.info(`🔍 Buscando nota: ${notaId}`, 'service')
      const response = await api.get(`/nota/${notaId}`)
      
      return converterRespostaBackend(response.data)
    } catch (error) {
      logger.error('❌ Erro ao buscar nota por ID', 'service', error)
      throw error
    }
  }

  /**
   * Buscar notas por atividade
   */
  static async buscarNotasPorAtividade(atividadeId: string): Promise<NotaResponse> {
    try {
      logger.info(`🔍 Buscando notas da atividade: ${atividadeId}`, 'service')
      const response = await api.get(`/nota/atividade/${atividadeId}`)
      
      return converterRespostaBackend(response.data)
    } catch (error) {
      logger.error('❌ Erro ao buscar notas por atividade', 'service', error)
      throw error
    }
  }

  /**
   * Buscar alunos da turma para lançar notas
   */
  static async buscarAlunosTurma(turmaId: string): Promise<NotaResponse> {
    try {
      logger.info(`👥 Buscando alunos da turma: ${turmaId}`, 'service')
      const response = await api.get(`/matricula-aluno/turma/${turmaId}`)
      
      return converterRespostaBackend(response.data)
    } catch (error) {
      logger.error('❌ Erro ao buscar alunos da turma', 'service', error)
      throw error
    }
  }

  /**
   * Criar nova nota
   */
  static async criarNota(dadosNota: {
    atividade_id: string
    matricula_aluno_id: string
    valor: number
  }): Promise<NotaResponse> {
    try {
      logger.info(`➕ Criando nota: ${dadosNota.valor} para aluno ${dadosNota.matricula_aluno_id}`, 'service')
      const response = await api.post('/nota', dadosNota)
      
      return converterRespostaBackend(response.data)
    } catch (error) {
      logger.error('❌ Erro ao criar nota', 'service', error)
      throw error
    }
  }

  /**
   * Lançar notas em lote para uma atividade
   */
  static async lancarNotasLote(atividadeId: string, notas: Array<{
    matricula_aluno_id: string
    valor: number
  }>): Promise<NotaResponse> {
    try {
      logger.info(`📊 Lançando notas em lote para atividade: ${atividadeId}`, 'service')
      const response = await api.post('/nota/lote', {
        atividade_id: atividadeId,
        notas: notas
      })
      
      return converterRespostaBackend(response.data)
    } catch (error) {
      logger.error('❌ Erro ao lançar notas em lote', 'service', error)
      throw error
    }
  }

  /**
   * Atualizar nota
   */
  static async atualizarNota(notaId: string, dadosAtualizacao: {
    valor: number
  }): Promise<NotaResponse> {
    try {
      logger.info(`📝 Atualizando nota: ${notaId}`, 'service')
      const response = await api.put(`/nota/${notaId}`, dadosAtualizacao)
      
      return converterRespostaBackend(response.data)
    } catch (error) {
      logger.error('❌ Erro ao atualizar nota', 'service', error)
      throw error
    }
  }

  /**
   * Deletar nota
   */
  static async deletarNota(notaId: string): Promise<NotaResponse> {
    try {
      logger.info(`🗑️ Deletando nota: ${notaId}`, 'service')
      const response = await api.delete(`/nota/${notaId}`)
      
      return converterRespostaBackend(response.data)
    } catch (error) {
      logger.error('❌ Erro ao deletar nota', 'service', error)
      throw error
    }
  }
}

export default NotaService
