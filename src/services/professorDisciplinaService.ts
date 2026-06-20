import api from '../lib/api';
import { logger } from '../lib/logger';
import type { Disciplina } from './disciplinaService';

/**
 * Service de habilitação professor↔disciplina:
 * define quais disciplinas cada professor pode lecionar.
 * Obs: professor_id = usuario_id (mesma convenção da alocação).
 */
export const professorDisciplinaService = {
  /**
   * Lista as disciplinas que um professor está habilitado a lecionar.
   */
  async listarDisciplinasDoProfessor(professor_id: string): Promise<Disciplina[]> {
    try {
      logger.info(`🔍 Buscando disciplinas do professor: ${professor_id}`, 'service');
      logger.apiRequest('GET', `/professor-disciplina/professor/${professor_id}`);

      const response = await api.get(`/professor-disciplina/professor/${professor_id}`);

      logger.apiResponse(response.status, `/professor-disciplina/professor/${professor_id}`);
      logger.success(`✅ ${response.data.dados?.length || 0} disciplinas habilitadas`, 'service');

      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/professor-disciplina/professor', error.response?.data);
      logger.error(`Erro ao buscar disciplinas do professor: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Lista os ids dos professores que já têm o pacote base completo.
   */
  async listarProfessoresComPacoteBase(): Promise<string[]> {
    try {
      logger.apiRequest('GET', '/professor-disciplina/status-pacote-base');
      const response = await api.get('/professor-disciplina/status-pacote-base');
      logger.apiResponse(response.status, '/professor-disciplina/status-pacote-base');
      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/professor-disciplina/status-pacote-base', error.response?.data);
      logger.error(`Erro ao listar professores com pacote base: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Aplica o pacote de disciplinas base a vários professores de uma vez
   * (adiciona sem remover o que eles já têm).
   */
  async aplicarPacoteBase(professor_ids: string[]): Promise<{ professores: number; disciplinas_base: number; vinculos_adicionados: number }> {
    try {
      logger.info(`📝 Aplicando pacote base a ${professor_ids.length} professores`, 'service');
      logger.apiRequest('POST', '/professor-disciplina/aplicar-base', { professor_ids });

      const response = await api.post('/professor-disciplina/aplicar-base', { professor_ids });

      logger.apiResponse(response.status, '/professor-disciplina/aplicar-base');
      logger.success('✅ Pacote base aplicado', 'service');

      return response.data.dados;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/professor-disciplina/aplicar-base', error.response?.data);
      logger.error(`Erro ao aplicar pacote base: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  /**
   * Define (substitui) o conjunto de disciplinas de um professor.
   */
  async definirDisciplinasDoProfessor(professor_id: string, disciplina_ids: string[]): Promise<Disciplina[]> {
    try {
      logger.info(`📝 Definindo ${disciplina_ids.length} disciplinas para o professor: ${professor_id}`, 'service');
      logger.apiRequest('PUT', `/professor-disciplina/professor/${professor_id}`, { disciplina_ids });

      const response = await api.put(`/professor-disciplina/professor/${professor_id}`, { disciplina_ids });

      logger.apiResponse(response.status, `/professor-disciplina/professor/${professor_id}`);
      logger.success('✅ Habilitações atualizadas', 'service');

      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/professor-disciplina/professor', error.response?.data);
      logger.error(`Erro ao definir disciplinas do professor: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  }
};

export default professorDisciplinaService;
