import api from '../lib/api';
import { logger } from '../lib/logger';

// Types
export interface Turma {
  turma_id: string;
  nome_turma: string;
  ano_letivo_id: string;
  serie_id: string;
  turno: 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL';
  sala?: string;
  capacidade_maxima?: number;
  created_at?: string;
  updated_at?: string;
  // Campos extras do JOIN
  ano_letivo?: number;
  nome_serie?: string;
}

export interface CriarTurmaDto {
  nome_turma: string;
  ano_letivo_id: string;
  serie_id: string;
  turno: 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL';
  sala?: string;
  capacidade_maxima?: number;
}

// Service
export const turmaService = {
  /**
   * Lista todas as turmas
   */
  async listarTurmas(): Promise<Turma[]> {
    try {
      logger.info('🔍 Buscando todas as turmas', 'service');
      logger.apiRequest('GET', '/turma');

      const response = await api.get('/turma');

      logger.apiResponse(response.status, '/turma');
      logger.success(`✅ ${response.data.dados?.length || 0} turmas carregadas`, 'service');

      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/turma', error.response?.data);
      logger.error(`Erro ao buscar turmas: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Busca turma por ID
   */
  async buscarTurmaPorId(turma_id: string): Promise<Turma> {
    try {
      logger.info(`🔍 Buscando turma: ${turma_id}`, 'service');
      logger.apiRequest('GET', `/turma/${turma_id}`);

      const response = await api.get(`/turma/${turma_id}`);

      logger.apiResponse(response.status, `/turma/${turma_id}`);
      logger.success(`✅ Turma encontrada: ${response.data.dados?.nome_turma}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/turmas/${turma_id}`, error.response?.data);
      logger.error(`Erro ao buscar turma: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Busca turmas por série
   */
  async buscarTurmasPorSerie(serie_id: string): Promise<Turma[]> {
    try {
      logger.info(`🔍 Buscando turmas da série: ${serie_id}`, 'service');
      logger.apiRequest('GET', `/turma/serie/${serie_id}`);

      const response = await api.get(`/turma/serie/${serie_id}`);

      logger.apiResponse(response.status, `/turma/serie/${serie_id}`);
      logger.success(`✅ ${response.data.dados?.length || 0} turmas encontradas`, 'service');

      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/turma/serie/${serie_id}`, error.response?.data);
      logger.error(`Erro ao buscar turmas por série: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Busca turmas por ano letivo
   */
  async buscarTurmasPorAnoLetivo(ano_letivo_id: string): Promise<Turma[]> {
    try {
      logger.info(`🔍 Buscando turmas do ano letivo: ${ano_letivo_id}`, 'service');
      logger.apiRequest('GET', `/turma/ano-letivo/${ano_letivo_id}`);

      const response = await api.get(`/turma/ano-letivo/${ano_letivo_id}`);

      logger.apiResponse(response.status, `/turma/ano-letivo/${ano_letivo_id}`);
      logger.success(`✅ ${response.data.dados?.length || 0} turmas encontradas`, 'service');

      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/turma/ano-letivo/${ano_letivo_id}`, error.response?.data);
      logger.error(`Erro ao buscar turmas por ano letivo: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Cria nova turma
   */
  async criarTurma(dados: CriarTurmaDto): Promise<Turma> {
    try {
      logger.info(`📝 Criando turma: ${dados.nome_turma}`, 'service');
      logger.apiRequest('POST', '/turma', dados);

      const response = await api.post('/turma', dados);

      logger.apiResponse(response.status, '/turma');
      logger.success(`✅ Turma criada: ${response.data.dados?.nome_turma}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/turma', error.response?.data);
      logger.error(`Erro ao criar turma: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Atualiza turma existente
   */
  async atualizarTurma(turma_id: string, dados: Partial<CriarTurmaDto>): Promise<Turma> {
    try {
      logger.info(`✏️ Atualizando turma: ${turma_id}`, 'service');
      logger.apiRequest('PUT', `/turma/${turma_id}`, dados);

      const response = await api.put(`/turma/${turma_id}`, dados);

      logger.apiResponse(response.status, `/turma/${turma_id}`);
      logger.success(`✅ Turma atualizada: ${response.data.dados?.nome_turma}`, 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/turmas/${turma_id}`, error.response?.data);
      logger.error(`Erro ao atualizar turma: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Deleta turma
   */
  async deletarTurma(turma_id: string): Promise<void> {
    try {
      logger.info(`🗑️ Deletando turma: ${turma_id}`, 'service');
      logger.apiRequest('DELETE', `/turma/${turma_id}`);

      const response = await api.delete(`/turma/${turma_id}`);

      logger.apiResponse(response.status, `/turma/${turma_id}`);
      logger.success(`✅ Turma deletada com sucesso`, 'service');
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/turmas/${turma_id}`, error.response?.data);
      logger.error(`Erro ao deletar turma: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  }
};

export default turmaService;
