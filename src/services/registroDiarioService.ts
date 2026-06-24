import api from '../lib/api'
import { logger } from '../lib/logger'
import type { RegistroDiario, RegistroDiarioComDetalhes } from '../types/diario'

export interface RegistroDiarioResponse {
  sucesso: boolean
  mensagem: string
  dados?: RegistroDiario | null
  total?: number
}

export interface RegistroDiarioListaResponse {
  sucesso: boolean
  mensagem: string
  dados?: RegistroDiario[]
  total?: number
}

export interface RegistroDiarioAdminResponse {
  sucesso: boolean
  mensagem: string
  dados?: RegistroDiarioComDetalhes[]
  total?: number
}

const registroDiarioService = {
  // Buscar o registro de um dia específico (único por vinculação + data)
  async buscarPorData(vinculacaoId: string, data: string): Promise<RegistroDiarioResponse> {
    try {
      logger.info(`🔍 Buscando registro diário: ${vinculacaoId} - ${data}`, 'service')
      const response = await api.get(`/registro-diario/data/${vinculacaoId}/${data}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao buscar registro diário', 'service', error)
      throw error
    }
  },

  // Listar todos os registros de uma vinculação (timeline / calendário)
  async listarPorVinculacao(vinculacaoId: string): Promise<RegistroDiarioListaResponse> {
    try {
      logger.info(`📚 Listando registros da vinculação: ${vinculacaoId}`, 'service')
      const response = await api.get(`/registro-diario/vinculacao/${vinculacaoId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao listar registros da vinculação', 'service', error)
      throw error
    }
  },

  // Listar registros de um professor (visão admin)
  async listarPorProfessor(professorId: string): Promise<RegistroDiarioAdminResponse> {
    try {
      logger.info(`📋 Listando registros do professor: ${professorId}`, 'service')
      const response = await api.get(`/registro-diario/professor/${professorId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao listar registros do professor', 'service', error)
      throw error
    }
  },

  // Criar ou atualizar o registro do dia (upsert)
  async salvar(dados: RegistroDiario): Promise<RegistroDiarioResponse> {
    try {
      logger.info(`💾 Salvando registro diário: ${dados.data_aula}`, 'service')
      const response = await api.post('/registro-diario', dados)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao salvar registro diário', 'service', error)
      throw error
    }
  },

  // Deletar registro
  async deletar(registroId: string): Promise<RegistroDiarioResponse> {
    try {
      logger.info(`🗑️ Deletando registro diário: ${registroId}`, 'service')
      const response = await api.delete(`/registro-diario/${registroId}`)
      return response.data
    } catch (error) {
      logger.error('❌ Erro ao deletar registro diário', 'service', error)
      throw error
    }
  },
}

export default registroDiarioService
