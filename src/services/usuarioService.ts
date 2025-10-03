import api from '../lib/api';
import { logger } from '../lib/logger';
import type { 
  ApiResponse, 
  UsuarioTipo,
  Usuario 
} from '../types/api';

export interface CriarUsuarioRequest {
  nome_usuario: string;
  email_usuario: string;
  senha_usuario: string;
  tipo_usuario_id: string;
}

export interface CriarUsuarioResponse {
  usuario: Usuario;
}

export const usuarioService = {
  // 🔍 BUSCAR TIPOS DE USUÁRIO - Lista todos os tipos disponíveis
  async buscarTiposUsuario(): Promise<UsuarioTipo[]> {
    try {
      logger.info('🔍 Buscando tipos de usuário...', 'service');
      logger.apiRequest('GET', '/usuario-tipo');
      
      const response = await api.get('/usuario-tipo');
      
      logger.apiResponse(response.status, '/usuario-tipo');
      logger.success('Tipos de usuário carregados com sucesso', 'service');
      
      // O backend retorna { status, mensagem, dados }
      return response.data.dados || [];
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/usuario-tipo', error.response?.data);
      logger.error(`Erro ao buscar tipos de usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 👤 CRIAR USUÁRIO - Criar novo usuário no sistema
  async criarUsuario(dados: CriarUsuarioRequest): Promise<ApiResponse<CriarUsuarioResponse>> {
    try {
      logger.info('👤 Criando novo usuário...', 'service');
      logger.apiRequest('POST', '/auth/registrar', { 
        nome_usuario: dados.nome_usuario,
        email_usuario: dados.email_usuario,
        tipo_usuario_id: dados.tipo_usuario_id
      });
      
      const response = await api.post('/auth/registrar', dados);
      
      logger.apiResponse(response.status, '/auth/registrar');
      logger.success('Usuário criado com sucesso', 'service');
      
      // O backend retorna { mensagem: string, usuario: Usuario }
      // Precisamos transformar para o formato ApiResponse esperado
      return {
        status: 'sucesso',
        mensagem: response.data.mensagem,
        dados: {
          usuario: response.data.usuario
        }
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/auth/registrar', error.response?.data);
      logger.error(`Erro ao criar usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 📋 LISTAR USUÁRIOS - Lista todos os usuários
  async listarUsuarios(): Promise<ApiResponse<Usuario[]>> {
    try {
      logger.info('📋 Listando usuários...', 'service');
      logger.apiRequest('GET', '/usuarios');
      
      const response = await api.get('/usuarios');
      
      logger.apiResponse(response.status, '/usuarios');
      logger.success('Usuários carregados com sucesso', 'service');
      
      // O backend retorna { usuarios: Usuario[] }
      // Precisamos transformar para o formato ApiResponse esperado
      return {
        status: 'sucesso',
        mensagem: 'Usuários carregados com sucesso',
        dados: response.data.usuarios || response.data
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/usuarios', error.response?.data);
      logger.error(`Erro ao listar usuários: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 🔍 BUSCAR USUÁRIO POR ID - Buscar usuário específico
  async buscarUsuarioPorId(usuarioId: string): Promise<ApiResponse<Usuario>> {
    try {
      logger.info(`🔍 Buscando usuário: ${usuarioId}`, 'service');
      logger.apiRequest('GET', `/usuarios/${usuarioId}`);
      
      const response = await api.get(`/usuarios/${usuarioId}`);
      
      logger.apiResponse(response.status, `/usuarios/${usuarioId}`);
      logger.success('Usuário encontrado com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Usuário encontrado com sucesso',
        dados: response.data.usuario || response.data
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/usuarios/${usuarioId}`, error.response?.data);
      logger.error(`Erro ao buscar usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // ✏️ ATUALIZAR USUÁRIO - Atualizar dados do usuário
  async atualizarUsuario(usuarioId: string, dados: Partial<CriarUsuarioRequest>): Promise<ApiResponse<Usuario>> {
    try {
      logger.info(`✏️ Atualizando usuário: ${usuarioId}`, 'service');
      logger.apiRequest('PUT', `/usuarios/${usuarioId}`, dados);
      
      const response = await api.put(`/usuarios/${usuarioId}`, dados);
      
      logger.apiResponse(response.status, `/usuarios/${usuarioId}`);
      logger.success('Usuário atualizado com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Usuário atualizado com sucesso',
        dados: response.data.usuario || response.data
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/usuarios/${usuarioId}`, error.response?.data);
      logger.error(`Erro ao atualizar usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 🗑️ EXCLUIR USUÁRIO - Excluir usuário
  async excluirUsuario(usuarioId: string): Promise<ApiResponse<void>> {
    try {
      logger.info(`🗑️ Excluindo usuário: ${usuarioId}`, 'service');
      logger.apiRequest('DELETE', `/usuarios/${usuarioId}`);
      
      const response = await api.delete(`/usuarios/${usuarioId}`);
      
      logger.apiResponse(response.status, `/usuarios/${usuarioId}`);
      logger.success('Usuário excluído com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Usuário excluído com sucesso'
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/usuarios/${usuarioId}`, error.response?.data);
      logger.error(`Erro ao excluir usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 🏷️ TIPOS DE USUÁRIO - Gerenciamento de tipos

  // 📋 LISTAR TIPOS DE USUÁRIO - Lista todos os tipos
  async listarTiposUsuario(): Promise<ApiResponse<UsuarioTipo[]>> {
    try {
      logger.info('📋 Listando tipos de usuário...', 'service');
      logger.apiRequest('GET', '/usuario-tipo');
      
      const response = await api.get('/usuario-tipo');
      
      logger.apiResponse(response.status, '/usuario-tipo');
      logger.success('Tipos de usuário carregados com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Tipos de usuário carregados com sucesso',
        dados: response.data
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/usuario-tipo', error.response?.data);
      logger.error(`Erro ao listar tipos de usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // ➕ CRIAR TIPO DE USUÁRIO - Criar novo tipo
  async criarTipoUsuario(dados: { nome_tipo: string }): Promise<ApiResponse<UsuarioTipo>> {
    try {
      logger.info('➕ Criando novo tipo de usuário...', 'service');
      logger.apiRequest('POST', '/usuario-tipo', dados);
      
      const response = await api.post('/usuario-tipo', dados);
      
      logger.apiResponse(response.status, '/usuario-tipo');
      logger.success('Tipo de usuário criado com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Tipo de usuário criado com sucesso',
        dados: response.data
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/usuario-tipo', error.response?.data);
      logger.error(`Erro ao criar tipo de usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // ✏️ ATUALIZAR TIPO DE USUÁRIO - Atualizar tipo existente
  async atualizarTipoUsuario(tipoId: string, dados: { nome_tipo: string }): Promise<ApiResponse<UsuarioTipo>> {
    try {
      logger.info(`✏️ Atualizando tipo de usuário: ${tipoId}`, 'service');
      logger.apiRequest('PUT', `/usuario-tipo/${tipoId}`, dados);
      
      const response = await api.put(`/usuario-tipo/${tipoId}`, dados);
      
      logger.apiResponse(response.status, `/usuario-tipo/${tipoId}`);
      logger.success('Tipo de usuário atualizado com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Tipo de usuário atualizado com sucesso',
        dados: response.data
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/usuario-tipo/${tipoId}`, error.response?.data);
      logger.error(`Erro ao atualizar tipo de usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  },

  // 🗑️ EXCLUIR TIPO DE USUÁRIO - Excluir tipo
  async excluirTipoUsuario(tipoId: string): Promise<ApiResponse<void>> {
    try {
      logger.info(`🗑️ Excluindo tipo de usuário: ${tipoId}`, 'service');
      logger.apiRequest('DELETE', `/usuario-tipo/${tipoId}`);
      
      const response = await api.delete(`/usuario-tipo/${tipoId}`);
      
      logger.apiResponse(response.status, `/usuario-tipo/${tipoId}`);
      logger.success('Tipo de usuário excluído com sucesso', 'service');
      
      return {
        status: 'sucesso',
        mensagem: 'Tipo de usuário excluído com sucesso'
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, `/usuario-tipo/${tipoId}`, error.response?.data);
      logger.error(`Erro ao excluir tipo de usuário: ${error.response?.data?.mensagem || error.message}`, 'service');
      
      throw error;
    }
  }
};
