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
      
      // A API retorna apenas o token
      const apiData = response.data;
      
      // Se a API retornou sucesso com token, busca os dados completos do usuário
      if (apiData.token) {
        // Salva temporariamente o token para fazer a requisição ao /auth/me
        const tempToken = apiData.token;
        
        // Faz requisição ao /auth/me para obter os dados completos do usuário
        logger.apiRequest('GET', '/auth/me');
        
        const meResponse = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${tempToken}`
          }
        });
        
        logger.apiResponse(meResponse.status, '/auth/me');
        
        // Extrai os dados do usuário da resposta
        const usuarioData = meResponse.data.usuario;
        
        if (!usuarioData) {
          throw new Error('Dados do usuário não encontrados na resposta do /auth/me');
        }
        
        // O tipo_usuario_id vem como UUID, precisamos buscar o nome do tipo
        let tipoUsuarioNome: 'admin' | 'secretario' | 'professor' = 'professor'; // Fallback
        const tipoUsuarioUUID = usuarioData.tipo_usuario_id;
        
        try {
          // Busca os tipos de usuário para mapear UUID -> nome
          logger.apiRequest('GET', '/usuario-tipo');
          const tiposResponse = await api.get('/usuario-tipo', {
            headers: {
              Authorization: `Bearer ${tempToken}`
            }
          });
          
          const tiposUsuario = tiposResponse.data.dados || tiposResponse.data || [];
          
          // Encontra o tipo correspondente ao UUID
          const tipoEncontrado = tiposUsuario.find((tipo: any) => 
            tipo.tipo_usuario_id === tipoUsuarioUUID
          );
          
          if (tipoEncontrado && tipoEncontrado.nome_tipo) {
            tipoUsuarioNome = tipoEncontrado.nome_tipo as 'admin' | 'secretario' | 'professor';
            logger.info(`Tipo mapeado: ${tipoUsuarioUUID} -> ${tipoUsuarioNome}`, 'auth');
          } else {
            logger.error(`Tipo de usuário com UUID "${tipoUsuarioUUID}" não encontrado`, 'auth');
          }
        } catch (error) {
          logger.error('Erro ao buscar tipos de usuário para mapeamento', 'auth', error);
          // Mantém o fallback 'professor'
        }
        
        // Estrutura a resposta no formato esperado
        // tipo_usuario_id deve ser o nome do tipo ('admin', 'secretario', 'professor') para compatibilidade
        const structuredResponse = {
          status: 'sucesso' as const,
          mensagem: 'Login realizado com sucesso',
          dados: {
            token: tempToken,
            usuario: {
              usuario_id: usuarioData.usuario_id,
              nome_usuario: usuarioData.nome_usuario,
              email_usuario: usuarioData.email_usuario,
              tipo_usuario_id: tipoUsuarioNome, // Nome do tipo para compatibilidade com Sidebar
              created_at: new Date(usuarioData.created_at),
              updated_at: new Date(usuarioData.updated_at)
            }
          }
        };
        
        logger.loginSuccess(structuredResponse.dados.usuario);
        logger.info('Dados do usuário obtidos do /auth/me:', 'auth', structuredResponse.dados.usuario);
        
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
