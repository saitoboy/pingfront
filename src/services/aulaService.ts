import api from '../lib/api'
import { logger } from '../lib/logger'

interface Aula {
  aula_id?: string
  turma_disciplina_professor_id: string
  data_aula: string
  hora_inicio: string
  hora_fim: string
  created_at?: string
  updated_at?: string
}

interface ApiResponse<T> {
  status: 'sucesso' | 'erro'
  mensagem: string
  dados?: T
  aula?: T
  aulas?: T[]
  total?: number
}

export const aulaService = {
  // 📚 LISTAR AULAS POR VINCULAÇÃO - Buscar aulas de uma turma/disciplina específica
  async listarAulasPorVinculacao(turmaDisciplinaProfessorId: string): Promise<ApiResponse<Aula[]>> {
    try {
      logger.info(`📚 Listando aulas da vinculação: ${turmaDisciplinaProfessorId}`, 'service');
      logger.apiRequest('GET', `/aula/vinculacao/${turmaDisciplinaProfessorId}`);
      
      const response = await api.get(`/aula/vinculacao/${turmaDisciplinaProfessorId}`);
      
      logger.apiResponse(response.status, `/aula/vinculacao/${turmaDisciplinaProfessorId}`);
      logger.success('Aulas da vinculação carregadas com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Aulas carregadas com sucesso',
        dados: response.data.aulas || [],
        total: response.data.total || 0
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/aula/vinculacao/${turmaDisciplinaProfessorId}`, error.response?.data);
      logger.error(`Erro ao listar aulas: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 📝 CRIAR NOVA AULA - Criar uma nova aula
  async criarAula(aula: Omit<Aula, 'aula_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Aula>> {
    try {
      logger.info(`📝 Criando nova aula: ${aula.data_aula} ${aula.hora_inicio}-${aula.hora_fim}`, 'service');
      logger.apiRequest('POST', '/aula');
      
      const response = await api.post('/aula', aula);
      
      logger.apiResponse(response.status, '/aula');
      logger.success('Aula criada com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Aula criada com sucesso',
        dados: response.data.aula
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/aula', error.response?.data);
      logger.error(`Erro ao criar aula: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 🔍 BUSCAR AULA POR ID - Buscar aula específica
  async buscarAulaPorId(aulaId: string): Promise<ApiResponse<Aula>> {
    try {
      logger.info(`🔍 Buscando aula: ${aulaId}`, 'service');
      logger.apiRequest('GET', `/aula/${aulaId}`);
      
      const response = await api.get(`/aula/${aulaId}`);
      
      logger.apiResponse(response.status, `/aula/${aulaId}`);
      logger.success('Aula encontrada com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Aula encontrada com sucesso',
        dados: response.data.aula
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/aula/${aulaId}`, error.response?.data);
      logger.error(`Erro ao buscar aula: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // ✏️ ATUALIZAR AULA - Atualizar dados de uma aula
  async atualizarAula(aulaId: string, dadosAtualizacao: Partial<Omit<Aula, 'aula_id' | 'turma_disciplina_professor_id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Aula>> {
    try {
      logger.info(`✏️ Atualizando aula: ${aulaId}`, 'service');
      logger.apiRequest('PUT', `/aula/${aulaId}`);
      
      const response = await api.put(`/aula/${aulaId}`, dadosAtualizacao);
      
      logger.apiResponse(response.status, `/aula/${aulaId}`);
      logger.success('Aula atualizada com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Aula atualizada com sucesso',
        dados: response.data.aula
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/aula/${aulaId}`, error.response?.data);
      logger.error(`Erro ao atualizar aula: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 🗑️ DELETAR AULA - Deletar uma aula
  async deletarAula(aulaId: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info(`🗑️ Deletando aula: ${aulaId}`, 'service');
      logger.apiRequest('DELETE', `/aula/${aulaId}`);
      
      const response = await api.delete(`/aula/${aulaId}`);
      
      logger.apiResponse(response.status, `/aula/${aulaId}`);
      logger.success('Aula deletada com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Aula deletada com sucesso',
        dados: true
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/aula/${aulaId}`, error.response?.data);
      logger.error(`Erro ao deletar aula: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  }
};

export default aulaService;
