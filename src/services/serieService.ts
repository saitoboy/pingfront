import api from '../lib/api';
import { logger } from '../lib/logger';

// Types
export interface Serie {
  serie_id: string;
  nome_serie: string;
  created_at?: string;
  updated_at?: string;
}

export interface CriarSerieDto {
  nome_serie: string;
}

// Service
export const serieService = {
  /**
   * Lista todas as séries
   */
  async listarSeries(): Promise<Serie[]> {
    try {
      logger.info('🔍 Buscando todas as séries', 'service');
      logger.apiRequest('GET', '/serie');

      const response = await api.get('/serie');

      logger.apiResponse(response.status, '/serie');
      logger.success(`✅ ${response.data.dados?.length || 0} séries carregadas`, 'service');

      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/serie', error.response?.data);
      logger.error(`Erro ao buscar séries: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Busca série por ID
   */
  async buscarSeriePorId(serie_id: string): Promise<Serie> {
    try {
      logger.info(`🔍 Buscando série: ${serie_id}`, 'service');
      logger.apiRequest('GET', `/serie/${serie_id}`);

      const response = await api.get(`/serie/${serie_id}`);

      logger.apiResponse(response.status, `/serie/${serie_id}`);
      logger.success(`✅ Série encontrada: ${response.data.dados?.nome_serie}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/serie/${serie_id}`, error.response?.data);
      logger.error(`Erro ao buscar série: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Cria nova série
   */
  async criarSerie(dados: CriarSerieDto): Promise<Serie> {
    try {
      logger.info(`📝 Criando série: ${dados.nome_serie}`, 'service');
      logger.apiRequest('POST', '/serie', dados);

      const response = await api.post('/serie', dados);

      logger.apiResponse(response.status, '/serie');
      logger.success(`✅ Série criada: ${response.data.dados?.nome_serie}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/serie', error.response?.data);
      logger.error(`Erro ao criar série: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Atualiza série existente
   */
  async atualizarSerie(serie_id: string, dados: Partial<CriarSerieDto>): Promise<Serie> {
    try {
      logger.info(`✏️ Atualizando série: ${serie_id}`, 'service');
      logger.apiRequest('PUT', `/serie/${serie_id}`, dados);

      const response = await api.put(`/serie/${serie_id}`, dados);

      logger.apiResponse(response.status, `/serie/${serie_id}`);
      logger.success(`✅ Série atualizada: ${response.data.dados?.nome_serie}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/serie/${serie_id}`, error.response?.data);
      logger.error(`Erro ao atualizar série: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Deleta série
   */
  async deletarSerie(serie_id: string): Promise<void> {
    try {
      logger.info(`🗑️ Deletando série: ${serie_id}`, 'service');
      logger.apiRequest('DELETE', `/serie/${serie_id}`);

      const response = await api.delete(`/serie/${serie_id}`);

      logger.apiResponse(response.status, `/serie/${serie_id}`);
      logger.success(`✅ Série deletada com sucesso`, 'service');
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/serie/${serie_id}`, error.response?.data);
      logger.error(`Erro ao deletar série: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  }
};

export default serieService;
