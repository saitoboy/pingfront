import api from '../lib/api';
import { logger } from '../lib/logger';
import type { 
  ApiResponse, 
  Parentesco, 
  Religiao, 
  AnoLetivo, 
  Turma,
  Serie,
  FichaCadastroCompleta,
  FichaCadastroResposta
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
      
      // Processar resposta - formato da API: {"success": "...", "data": [...], "total": n}
      const parentescosData = response.data?.data || response.data?.parentescos || [];
      
      if (Array.isArray(parentescosData)) {
        logger.info(`✅ ${parentescosData.length} parentescos carregados da API`);
        return {
          status: 'sucesso',
          dados: parentescosData,
          mensagem: 'Parentescos carregados com sucesso'
        };
      } else {
        logger.info('📋 API de parentescos retornou estrutura inesperada', 'api', response.data);
        return {
          status: 'erro',
          dados: [],
          mensagem: 'Estrutura de resposta inesperada'
        };
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/parentesco', error.response?.data);
      logger.error(`Erro ao carregar parentescos: ${error.response?.data?.mensagem || error.message}`, 'api');
      
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

  // 📝 SÉRIES - Buscar lista de séries
  async getSeries(): Promise<ApiResponse<Serie[]>> {
    try {
      logger.apiRequest('GET', '/serie');
      
      const response = await api.get('/serie');
      
      logger.apiResponse(response.status, '/serie');
      console.log('🔍 Debug response /serie:', response.data);
      
      // Processar resposta - formato: {"sucesso": true, "dados": [...]}
      const seriesData = response.data?.dados || response.data?.data || [];
      
      console.log('🔍 Debug seriesData:', seriesData);
      
      if (Array.isArray(seriesData)) {
        logger.info(`✅ ${seriesData.length} séries carregadas da API`);
        return {
          status: 'sucesso',
          dados: seriesData,
          mensagem: 'Séries carregadas com sucesso'
        };
      } else {
        logger.info('📋 API de séries retornou estrutura inesperada');
        console.log('❌ Estrutura inesperada:', response.data);
        return {
          status: 'erro',
          dados: [],
          mensagem: 'Estrutura de resposta inesperada'
        };
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/serie', error.response?.data);
      logger.error(`Erro ao carregar séries: ${error.response?.data?.mensagem || error.message}`);
      console.log('❌ Erro ao carregar séries:', error);
      
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

  // 📝 PROCESSAR FICHA DE CADASTRO COMPLETA - Enviar todos os dados para o backend
  async processarFichaCadastro(dadosCompletos: FichaCadastroCompleta): Promise<ApiResponse<FichaCadastroResposta>> {
    try {
      logger.apiRequest('POST', '/ficha-cadastro');
      logger.info('📝 Enviando ficha de cadastro completa para a API...');
      
      const response = await api.post('/ficha-cadastro', dadosCompletos);
      
      logger.apiResponse(response.status, '/ficha-cadastro');
      console.log('🔍 Debug response ficha-cadastro:', response.data);
      
      // Processar resposta - formato esperado: {"sucesso": true, "dados": {...}, "mensagem": "..."
      const dadosResposta = response.data?.dados || response.data;
      
      if (response.data?.sucesso || response.status === 201) {
        const raGerado = dadosResposta?.ra_gerado || dadosResposta?.matricula?.ra || 'N/A';
        logger.success(`✅ Ficha de cadastro processada com sucesso! RA: ${raGerado}`);
        
        return {
          status: 'sucesso',
          dados: dadosResposta,
          mensagem: response.data?.mensagem || 'Ficha de cadastro processada com sucesso'
        };
      } else {
        logger.info('📋 API de ficha-cadastro retornou estrutura inesperada');
        console.log('❌ Estrutura inesperada:', response.data);
        return {
          status: 'erro',
          dados: undefined,
          mensagem: response.data?.mensagem || 'Erro ao processar ficha de cadastro'
        };
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/ficha-cadastro', error.response?.data);
      logger.error(`Erro ao processar ficha de cadastro: ${error.response?.data?.mensagem || error.message}`);
      console.log('❌ Erro ao processar ficha:', error);
      
      // Tratamento de erros de validação ou outros erros específicos
      const mensagemErro = error.response?.data?.mensagem || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erro desconhecido ao processar ficha';
      
      return {
        status: 'erro',
        dados: undefined,
        mensagem: mensagemErro,
        detalhes: error.response?.data?.detalhes || error.response?.data?.errors
      };
    }
  },

  // 📋 LISTAR TODAS AS FICHAS DE CADASTRO - Buscar todas as fichas cadastradas
  async listarTodasFichas(): Promise<ApiResponse<FichaCadastroResposta[]>> {
    try {
      logger.apiRequest('GET', '/ficha-cadastro');
      logger.info('📋 Buscando todas as fichas de cadastro...');
      
      const response = await api.get('/ficha-cadastro');
      
      logger.apiResponse(response.status, '/ficha-cadastro');
      
      // Processar resposta - formato esperado: {"sucesso": true, "dados": [...], "total": n}
      const fichasData = response.data?.dados || [];
      
      if (response.data?.sucesso || response.status === 200) {
        logger.success(`✅ ${fichasData.length} fichas de cadastro carregadas`);
        
        return {
          status: 'sucesso',
          dados: fichasData,
          mensagem: response.data?.mensagem || `${fichasData.length} fichas de cadastro encontradas`
        };
      } else {
        logger.info('📋 API de fichas retornou estrutura inesperada');
        return {
          status: 'erro',
          dados: [],
          mensagem: response.data?.mensagem || 'Erro ao buscar fichas de cadastro'
        };
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/ficha-cadastro', error.response?.data);
      logger.error(`Erro ao listar fichas de cadastro: ${error.response?.data?.mensagem || error.message}`);
      
      return {
        status: 'erro',
        dados: [],
        mensagem: error.response?.data?.mensagem || error.message || 'Erro desconhecido ao buscar fichas'
      };
    }
  },

  // 🔄 CARREGAR TODOS OS DROPDOWNS - Método utilitário para carregar todos os dados
  async carregarTodosDropdowns() {
    try {
      logger.info('🔄 Carregando dados de todos os dropdowns...');

      // Carregar todos os dados em paralelo para melhor performance
      const [religioes, parentescos, anosLetivos, series, turmas] = await Promise.all([
        this.getReligioes(),
        this.getParentescos(), 
        this.getAnosLetivos(),
        this.getSeries(),
        this.getTurmas()
      ]);

      logger.info('✅ Todos os dados dos dropdowns carregados com sucesso');

      return {
        religioes: religioes.status === 'sucesso' ? religioes.dados || [] : [],
        parentescos: parentescos.status === 'sucesso' ? parentescos.dados || [] : [],
        anosLetivos: anosLetivos.status === 'sucesso' ? anosLetivos.dados || [] : [],
        series: series.status === 'sucesso' ? series.dados || [] : [],
        turmas: turmas.status === 'sucesso' ? turmas.dados || [] : []
      };
    } catch (error) {
      logger.error('❌ Erro ao carregar dados dos dropdowns');
      throw error;
    }
  }
};
