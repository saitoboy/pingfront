import api from '../lib/api';
import { logger } from '../lib/logger';

// Types
export interface AnoLetivo {
  ano_letivo_id: string;
  ano: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CriarAnoLetivoDto {
  ano: number;
  data_inicio: string; // Formato: YYYY-MM-DD
  data_fim: string; // Formato: YYYY-MM-DD
  ativo?: boolean;
}

// Service
export const anoLetivoService = {
  /**
   * Lista todos os anos letivos
   */
  async listarAnosLetivos(): Promise<AnoLetivo[]> {
    try {
      logger.info('🔍 Buscando anos letivos', 'service');
      logger.apiRequest('GET', '/ano-letivo');

      const response = await api.get('/ano-letivo');

      logger.apiResponse(response.status, '/ano-letivo');
      logger.success(`✅ ${response.data.dados?.length || 0} anos letivos carregados`, 'service');

      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/ano-letivo', error.response?.data);
      logger.error(`Erro ao buscar anos letivos: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Busca ano letivo ativo
   */
  async buscarAnoLetivoAtivo(): Promise<AnoLetivo | null> {
    try {
      logger.info('🔍 Buscando ano letivo ativo', 'service');
      logger.apiRequest('GET', '/ano-letivo/ativo');

      const response = await api.get('/ano-letivo/ativo');

      logger.apiResponse(response.status, '/ano-letivo/ativo');
      
      if (response.data.dados) {
        logger.success(`✅ Ano letivo ativo: ${response.data.dados.ano}`, 'service');
        return response.data.dados;
      }

      logger.info('Nenhum ano letivo ativo encontrado', 'service');
      return null;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/ano-letivo/ativo', error.response?.data);
      logger.error(`Erro ao buscar ano letivo ativo: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Busca ano letivo por ID
   */
  async buscarAnoLetivoPorId(ano_letivo_id: string): Promise<AnoLetivo> {
    try {
      logger.info(`🔍 Buscando ano letivo: ${ano_letivo_id}`, 'service');
      logger.apiRequest('GET', `/ano-letivo/${ano_letivo_id}`);

      const response = await api.get(`/ano-letivo/${ano_letivo_id}`);

      logger.apiResponse(response.status, `/ano-letivo/${ano_letivo_id}`);
      logger.success(`✅ Ano letivo encontrado: ${response.data.dados?.ano}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/ano-letivo/${ano_letivo_id}`, error.response?.data);
      logger.error(`Erro ao buscar ano letivo: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Cria novo ano letivo
   */
  async criarAnoLetivo(dados: CriarAnoLetivoDto): Promise<AnoLetivo> {
    try {
      logger.info(`📝 Criando ano letivo: ${dados.ano}`, 'service');
      logger.apiRequest('POST', '/ano-letivo', dados);

      const response = await api.post('/ano-letivo', dados);

      logger.apiResponse(response.status, '/ano-letivo');
      logger.success(`✅ Ano letivo criado: ${response.data.dados?.ano}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/ano-letivo', error.response?.data);
      logger.error(`Erro ao criar ano letivo: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Atualiza ano letivo existente
   */
  async atualizarAnoLetivo(ano_letivo_id: string, dados: Partial<CriarAnoLetivoDto>): Promise<AnoLetivo> {
    try {
      logger.info(`✏️ Atualizando ano letivo: ${ano_letivo_id}`, 'service');
      logger.apiRequest('PUT', `/ano-letivo/${ano_letivo_id}`, dados);

      const response = await api.put(`/ano-letivo/${ano_letivo_id}`, dados);

      logger.apiResponse(response.status, `/ano-letivo/${ano_letivo_id}`);
      logger.success(`✅ Ano letivo atualizado: ${response.data.dados?.ano}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/ano-letivo/${ano_letivo_id}`, error.response?.data);
      logger.error(`Erro ao atualizar ano letivo: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Deleta ano letivo
   */
  async deletarAnoLetivo(ano_letivo_id: string): Promise<void> {
    try {
      logger.info(`🗑️ Deletando ano letivo: ${ano_letivo_id}`, 'service');
      logger.apiRequest('DELETE', `/ano-letivo/${ano_letivo_id}`);

      const response = await api.delete(`/ano-letivo/${ano_letivo_id}`);

      logger.apiResponse(response.status, `/ano-letivo/${ano_letivo_id}`);
      logger.success(`✅ Ano letivo deletado com sucesso`, 'service');
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/ano-letivo/${ano_letivo_id}`, error.response?.data);
      logger.error(`Erro ao deletar ano letivo: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Ativa um ano letivo (desativa os outros automaticamente)
   */
  async ativarAnoLetivo(ano_letivo_id: string): Promise<AnoLetivo> {
    try {
      logger.info(`✅ Ativando ano letivo: ${ano_letivo_id}`, 'service');
      logger.apiRequest('PATCH', `/ano-letivo/${ano_letivo_id}/ativar`);

      const response = await api.patch(`/ano-letivo/${ano_letivo_id}/ativar`);

      logger.apiResponse(response.status, `/ano-letivo/${ano_letivo_id}/ativar`);
      logger.success(`✅ Ano letivo ativado com sucesso`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/ano-letivo/${ano_letivo_id}/ativar`, error.response?.data);
      logger.error(`Erro ao ativar ano letivo: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  }
};

export default anoLetivoService;
