import api from '../lib/api';
import { logger } from '../lib/logger';
import type { 
  ApiResponse, 
  Parentesco, 
  Religiao, 
  AnoLetivo, 
  Turma 
} from '../types/api';

export const cadastroService = {
  // 📋 RELIGIÕES - Buscar lista de religiões
  async getReligioes(): Promise<ApiResponse<Religiao[]>> {
    try {
      logger.apiRequest('GET', '/religiao');
      
      const response = await api.get('/religiao');
      
      logger.apiResponse(response.status, '/religiao');
      
      // Processar resposta - formato: {"religioes": [...], "total": n}
      const religioesData = response.data?.religioes || [];
      
      if (Array.isArray(religioesData)) {
        logger.info(`✅ ${religioesData.length} religiões carregadas da API`);
        return {
          status: 'sucesso',
          dados: religioesData,
          mensagem: 'Religiões carregadas com sucesso'
        };
      } else {
        logger.info('📋 API de religiões retornou estrutura inesperada');
        return {
          status: 'erro',
          dados: [],
          mensagem: 'Estrutura de resposta inesperada'
        };
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/religiao', error.response?.data);
      logger.error(`Erro ao carregar religiões: ${error.response?.data?.mensagem || error.message}`);
      
      throw error;
    }
  },

  // 👥 PARENTESCOS - Buscar lista de parentescos
  async getParentescos(): Promise<ApiResponse<Parentesco[]>> {
    try {
      logger.apiRequest('GET', '/parentesco');
      
      const response = await api.get('/parentesco');
      
      logger.apiResponse(response.status, '/parentesco');
      
      // Processar resposta - formato: {"parentescos": [...], "total": n}
      const parentescosData = response.data?.parentescos || [];
      
      if (Array.isArray(parentescosData)) {
        logger.info(`✅ ${parentescosData.length} parentescos carregados da API`);
        return {
          status: 'sucesso',
          dados: parentescosData,
          mensagem: 'Parentescos carregados com sucesso'
        };
      } else {
        logger.info('📋 API de parentescos retornou estrutura inesperada');
        return {
          status: 'erro',
          dados: [],
          mensagem: 'Estrutura de resposta inesperada'
        };
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/parentesco', error.response?.data);
      logger.error(`Erro ao carregar parentescos: ${error.response?.data?.mensagem || error.message}`);
      
      throw error;
    }
  },

  // 📚 ANOS LETIVOS - Buscar lista de anos letivos
  async getAnosLetivos(): Promise<ApiResponse<AnoLetivo[]>> {
    try {
      logger.apiRequest('GET', '/ano-letivo');
      
      const response = await api.get('/ano-letivo');
      
      logger.apiResponse(response.status, '/ano-letivo');
      
      // Processar resposta - formato: {"sucesso": true, "dados": [...], "total": n}
      const anosLetivosData = response.data?.dados || [];
      
      if (Array.isArray(anosLetivosData)) {
        logger.info(`✅ ${anosLetivosData.length} anos letivos carregados da API`);
        return {
          status: 'sucesso',
          dados: anosLetivosData,
          mensagem: 'Anos letivos carregados com sucesso'
        };
      } else {
        logger.info('📋 API de anos letivos retornou estrutura inesperada');
        return {
          status: 'erro',
          dados: [],
          mensagem: 'Estrutura de resposta inesperada'
        };
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/ano-letivo', error.response?.data);
      logger.error(`Erro ao carregar anos letivos: ${error.response?.data?.mensagem || error.message}`);
      
      throw error;
    }
  },

  // 🎓 TURMAS - Buscar lista de turmas
  async getTurmas(): Promise<ApiResponse<Turma[]>> {
    try {
      logger.apiRequest('GET', '/turma');
      
      const response = await api.get('/turma');
      
      logger.apiResponse(response.status, '/turma');
      
      // Processar resposta - formato: {"sucesso": true, "dados": [...]}
      const turmasData = response.data?.dados || [];
      
      if (Array.isArray(turmasData)) {
        logger.info(`✅ ${turmasData.length} turmas carregadas da API`);
        return {
          status: 'sucesso',
          dados: turmasData,
          mensagem: 'Turmas carregadas com sucesso'
        };
      } else {
        logger.info('📋 API de turmas retornou estrutura inesperada');
        return {
          status: 'erro',
          dados: [],
          mensagem: 'Estrutura de resposta inesperada'
        };
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/turma', error.response?.data);
      logger.error(`Erro ao carregar turmas: ${error.response?.data?.mensagem || error.message}`);
      
      throw error;
    }
  },

  // 🔄 CARREGAR TODOS OS DROPDOWNS - Método utilitário para carregar todos os dados
  async carregarTodosDropdowns() {
    try {
      logger.info('🔄 Carregando dados de todos os dropdowns...');

      // Carregar todos os dados em paralelo para melhor performance
      const [religioes, parentescos, anosLetivos, turmas] = await Promise.all([
        this.getReligioes(),
        this.getParentescos(), 
        this.getAnosLetivos(),
        this.getTurmas()
      ]);

      logger.info('✅ Todos os dados dos dropdowns carregados com sucesso');

      return {
        religioes: religioes.status === 'sucesso' ? religioes.dados || [] : [],
        parentescos: parentescos.status === 'sucesso' ? parentescos.dados || [] : [],
        anosLetivos: anosLetivos.status === 'sucesso' ? anosLetivos.dados || [] : [],
        turmas: turmas.status === 'sucesso' ? turmas.dados || [] : []
      };
    } catch (error) {
      logger.error('❌ Erro ao carregar dados dos dropdowns');
      throw error;
    }
  }
};
