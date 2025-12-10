import api from '../lib/api';
import { logger } from '../lib/logger';
import type { ApiResponse } from '../types/api';

export interface ContatoFormData {
  nome: string;
  telefone: string;
  email: string;
  mensagem: string;
}

export const contatoService = {
  async enviarMensagem(dados: ContatoFormData): Promise<ApiResponse<any>> {
    try {
      logger.info('Enviando mensagem de contato', 'general');
      logger.apiRequest('POST', '/contato', { nome: dados.nome, email: dados.email });
      
      const response = await api.post('/contato', dados);
      
      logger.apiResponse(response.status, '/contato');
      logger.success('Mensagem de contato enviada com sucesso', 'general');
      
      return response.data;
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/contato', error.response?.data);
      logger.error(`Erro ao enviar mensagem: ${error.response?.data?.mensagem || error.message}`, 'general');
      
      throw error;
    }
  }
};

