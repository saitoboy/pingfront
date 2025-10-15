import api from '../lib/api';
import { logger } from '../lib/logger';

// Types
export interface Disciplina {
  disciplina_id: string;
  nome_disciplina: string;
  created_at?: string;
  updated_at?: string;
}

export interface CriarDisciplinaDto {
  nome_disciplina: string;
}

// Service
export const disciplinaService = {
  /**
   * Lista todas as disciplinas
   */
  async listarDisciplinas(): Promise<Disciplina[]> {
    try {
      logger.info('🔍 Buscando todas as disciplinas', 'service');
      logger.apiRequest('GET', '/disciplina');

      const response = await api.get('/disciplina');

      logger.apiResponse(response.status, '/disciplina');
      logger.success(`✅ ${response.data.dados?.length || 0} disciplinas carregadas`, 'service');

      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/disciplina', error.response?.data);
      logger.error(`Erro ao buscar disciplinas: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Busca disciplina por ID
   */
  async buscarDisciplinaPorId(disciplina_id: string): Promise<Disciplina> {
    try {
      logger.info(`🔍 Buscando disciplina: ${disciplina_id}`, 'service');
      logger.apiRequest('GET', `/disciplinas/${disciplina_id}`);

      const response = await api.get(`/disciplinas/${disciplina_id}`);

      logger.apiResponse(response.status, `/disciplinas/${disciplina_id}`);
      logger.success(`✅ Disciplina encontrada: ${response.data.dados?.nome_disciplina}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/disciplinas/${disciplina_id}`, error.response?.data);
      logger.error(`Erro ao buscar disciplina: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Cria nova disciplina
   */
  async criarDisciplina(dados: CriarDisciplinaDto): Promise<Disciplina> {
    try {
      logger.info(`📝 Criando disciplina: ${dados.nome_disciplina}`, 'service');
      logger.apiRequest('POST', '/disciplina', dados);

      const response = await api.post('/disciplina', dados);

      logger.apiResponse(response.status, '/disciplina');
      logger.success(`✅ Disciplina criada: ${response.data.dados?.nome_disciplina}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/disciplina', error.response?.data);
      logger.error(`Erro ao criar disciplina: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Atualiza disciplina existente
   */
  async atualizarDisciplina(disciplina_id: string, dados: Partial<CriarDisciplinaDto>): Promise<Disciplina> {
    try {
      logger.info(`✏️ Atualizando disciplina: ${disciplina_id}`, 'service');
      logger.apiRequest('PUT', `/disciplinas/${disciplina_id}`, dados);

      const response = await api.put(`/disciplinas/${disciplina_id}`, dados);

      logger.apiResponse(response.status, `/disciplinas/${disciplina_id}`);
      logger.success(`✅ Disciplina atualizada: ${response.data.dados?.nome_disciplina}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/disciplinas/${disciplina_id}`, error.response?.data);
      logger.error(`Erro ao atualizar disciplina: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Deleta disciplina
   */
  async deletarDisciplina(disciplina_id: string): Promise<void> {
    try {
      logger.info(`🗑️ Deletando disciplina: ${disciplina_id}`, 'service');
      logger.apiRequest('DELETE', `/disciplinas/${disciplina_id}`);

      const response = await api.delete(`/disciplinas/${disciplina_id}`);

      logger.apiResponse(response.status, `/disciplinas/${disciplina_id}`);
      logger.success(`✅ Disciplina deletada com sucesso`, 'service');
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/disciplinas/${disciplina_id}`, error.response?.data);
      logger.error(`Erro ao deletar disciplina: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  }
};

export default disciplinaService;
