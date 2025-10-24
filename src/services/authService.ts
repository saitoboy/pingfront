import api from '../lib/api';
import { logger } from '../lib/logger';
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse 
} from '../types/api';

export const authService = {
  // 🔑 LOGIN - Fazer login do usuário
  async login(dados: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      logger.loginAttempt(dados.email);
      logger.apiRequest('POST', '/auth/login', { email: dados.email });
      
      const response = await api.post('/auth/login', dados);
      
      logger.apiResponse(response.status, '/auth/login');
      
      // A API retorna os dados diretamente, não dentro de 'dados'
      const apiData = response.data;
      
      // Se a API retornou sucesso, estrutura a resposta no formato esperado
      if (apiData.token) {
        const structuredResponse = {
          status: 'sucesso' as const,
          mensagem: 'Login realizado com sucesso',
          dados: {
            token: apiData.token,
            usuario: {
              usuario_id: apiData.usuario_id,
              nome_usuario: apiData.nome_usuario || apiData.nome,
              email_usuario: dados.email,
              tipo_usuario_id: apiData.tipo_usuario_id || 'professor',
              created_at: new Date(),
              updated_at: new Date()
            }
          }
        };
        
        logger.loginSuccess(structuredResponse.dados.usuario);
        return structuredResponse;
      } else {
        throw new Error('Token não encontrado na resposta da API');
      }
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/auth/login', error.response?.data);
      logger.loginError(error.response?.data?.mensagem || error.message);
      
      // Se der erro, repassa para quem chamou tratar
      throw error;
    }
  },

  // 📝 REGISTER - Registrar novo usuário
  async register(dados: any): Promise<ApiResponse<any>> {
    try {
      logger.info('Iniciando registro de novo usuário', 'auth');
      logger.apiRequest('POST', '/auth/register');
      
      const response = await api.post('/auth/register', dados);
      
      logger.apiResponse(response.status, '/auth/register');
      logger.success('Usuário registrado com sucesso', 'auth');
      
      return response.data;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/auth/register', error.response?.data);
      logger.error(`Erro no registro: ${error.response?.data?.mensagem || error.message}`, 'auth');
      
      throw error;
    }
  },

  // 🔄 REFRESH - Renovar token JWT
  async refresh(): Promise<ApiResponse<LoginResponse>> {
    try {
      logger.info('Renovando token JWT', 'auth');
      logger.apiRequest('POST', '/auth/refresh');
      
      const response = await api.post('/auth/refresh');
      
      logger.apiResponse(response.status, '/auth/refresh');
      logger.success('Token renovado com sucesso', 'auth');
      
      return response.data;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/auth/refresh', error.response?.data);
      logger.error(`Erro na renovação do token: ${error.response?.data?.mensagem || error.message}`, 'auth');
      
      throw error;
    }
  },

  // 🔌 TEST CONNECTION - Testar conexão com API
  async testConnection(): Promise<ApiResponse<any>> {
    try {
      logger.info('Testando conexão com a API', 'api');
      logger.apiRequest('GET', '/test-connection');
      
      const response = await api.get('/test-connection');
      
      logger.apiResponse(response.status, '/test-connection', response.data);
      logger.success('Conexão com API estabelecida', 'api');
      
      return response.data;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/test-connection', error.response?.data);
      logger.error(`Erro na conexão com API: ${error.response?.data?.mensagem || error.message}`, 'api');
      
      throw error;
    }
  }
};
