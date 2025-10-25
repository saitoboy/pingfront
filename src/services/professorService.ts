import api from '../lib/api';
import { logger } from '../lib/logger';
import type { ApiResponse } from '../types/api';
import type { ProfessorComTurmas } from '../types/diario';

export const professorService = {
  // 📋 LISTAR USUÁRIOS DO TIPO PROFESSOR COM TURMAS - Lista usuários do tipo professor com suas turmas e disciplinas
  async listarProfessoresComTurmas(): Promise<ApiResponse<ProfessorComTurmas[]>> {
    try {
      logger.info('📋 Listando usuários do tipo professor com turmas...', 'service');
      logger.apiRequest('GET', '/professor/com-turmas');
      
      const response = await api.get('/professor/com-turmas');
      
      logger.apiResponse(response.status, '/professor/com-turmas');
      logger.success('Usuários do tipo professor com turmas carregados com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Usuários do tipo professor com turmas carregados com sucesso',
        dados: response.data.professores || []
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/professor/com-turmas', error.response?.data);
      logger.error(`Erro ao listar usuários do tipo professor com turmas: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 👤 BUSCAR PROFESSOR POR ID - Buscar professor específico
  async buscarProfessorPorId(professorId: string): Promise<ApiResponse<ProfessorComTurmas>> {
    try {
      logger.info(`👤 Buscando professor: ${professorId}`, 'service');
      logger.apiRequest('GET', `/professor/${professorId}`);
      
      const response = await api.get(`/professor/${professorId}`);
      
      logger.apiResponse(response.status, `/professor/${professorId}`);
      logger.success('Professor encontrado com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Professor encontrado com sucesso',
        dados: response.data.professor
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/professor/${professorId}`, error.response?.data);
      logger.error(`Erro ao buscar professor: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 📚 LISTAR TURMAS DO PROFESSOR - Buscar turmas e disciplinas de um professor específico
  async listarTurmasProfessor(professorId: string): Promise<ApiResponse<any[]>> {
    try {
      logger.info(`📚 Listando turmas do professor: ${professorId}`, 'service');
      logger.apiRequest('GET', `/professor/${professorId}/turmas`);
      
      const response = await api.get(`/professor/${professorId}/turmas`);
      
      logger.apiResponse(response.status, `/professor/${professorId}/turmas`);
      logger.success('Turmas do professor carregadas com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Turmas do professor carregadas com sucesso',
        dados: response.data.turmas || []
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/professor/${professorId}/turmas`, error.response?.data);
      logger.error(`Erro ao listar turmas do professor: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  }
};
