import api from '../lib/api';
import { logger } from '../lib/logger';
import type { ApiResponse } from '../types/api';

export interface AlocacaoProfessor {
  turma_disciplina_professor_id: string;
  turma_id: string;
  disciplina_id: string;
  professor_id: string;
  nome_disciplina: string;
  nome_turma: string;
  turno: string;
  sala: string;
  nome_serie: string;
  nome_professor?: string;
  email_professor?: string;
  ano_letivo?: number;
  ano_letivo_id?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface ProfessorDisponivel {
  professor_id: string;
  nome_usuario: string;
  email_usuario: string;
}

export interface DisciplinaDisponivel {
  disciplina_id: string;
  nome_disciplina: string;
}

export interface TurmaDisponivel {
  turma_id: string;
  nome_turma: string;
  turno: string;
  sala: string;
  nome_serie: string;
  serie_id: string;
}

export interface EstatisticasAlocacao {
  total_alocacoes: number;
  total_professores: number;
  total_disciplinas: number;
  total_turmas: number;
}

export interface CriarAlocacaoRequest {
  turma_id: string;
  disciplina_id: string;
  professor_id: string;
}

export const alocacaoProfessorService = {
  // 📋 LISTAR ALOCAÇÕES POR ANO LETIVO
  async listarPorAnoLetivo(ano_letivo_id: string): Promise<ApiResponse<AlocacaoProfessor[]>> {
    try {
      logger.info(`🔍 Buscando alocações do ano letivo: ${ano_letivo_id}`, 'service');
      logger.apiRequest('GET', `/alocacao-professor/ano-letivo/${ano_letivo_id}`);

      const response = await api.get(`/alocacao-professor/ano-letivo/${ano_letivo_id}`);

      logger.apiResponse(response.status, `/alocacao-professor/ano-letivo/${ano_letivo_id}`);
      logger.success(`✅ ${response.data.dados?.length || 0} alocações carregadas`, 'service');

      return {
        status: 'sucesso',
        mensagem: response.data.mensagem || 'Alocações carregadas com sucesso',
        dados: response.data.dados || []
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor/ano-letivo', error.response?.data);
      logger.error(`Erro ao listar alocações: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  // 👨‍🏫 LISTAR ALOCAÇÕES POR PROFESSOR
  async listarPorProfessor(professor_id: string): Promise<ApiResponse<AlocacaoProfessor[]>> {
    try {
      logger.info(`🔍 Buscando alocações do professor: ${professor_id}`, 'service');
      logger.apiRequest('GET', `/alocacao-professor/professor/${professor_id}`);

      const response = await api.get(`/alocacao-professor/professor/${professor_id}`);

      logger.apiResponse(response.status, `/alocacao-professor/professor/${professor_id}`);
      logger.success(`✅ ${response.data.dados?.length || 0} alocações do professor carregadas`, 'service');

      return {
        status: 'sucesso',
        mensagem: response.data.mensagem || 'Alocações do professor carregadas com sucesso',
        dados: response.data.dados || []
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor/professor', error.response?.data);
      logger.error(`Erro ao listar alocações do professor: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  // ➕ CRIAR ALOCAÇÕES
  async criarAlocacoes(alocacoes: CriarAlocacaoRequest[]): Promise<ApiResponse<any>> {
    try {
      logger.info(`📝 Criando ${alocacoes.length} alocações`, 'service');
      logger.apiRequest('POST', '/alocacao-professor', { alocacoes });

      const response = await api.post('/alocacao-professor', { alocacoes });

      logger.apiResponse(response.status, '/alocacao-professor');
      logger.success('✅ Alocações criadas com sucesso', 'service');

      return {
        status: 'sucesso',
        mensagem: response.data.mensagem || 'Alocações criadas com sucesso',
        dados: response.data.dados
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor', error.response?.data);
      logger.error(`Erro ao criar alocações: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  // 🗑️ REMOVER ALOCAÇÃO
  async removerAlocacao(alocacao_id: string): Promise<ApiResponse<void>> {
    try {
      logger.info(`🗑️ Removendo alocação: ${alocacao_id}`, 'service');
      logger.apiRequest('DELETE', `/alocacao-professor/${alocacao_id}`);

      const response = await api.delete(`/alocacao-professor/${alocacao_id}`);

      logger.apiResponse(response.status, `/alocacao-professor/${alocacao_id}`);
      logger.success('✅ Alocação removida com sucesso', 'service');

      return {
        status: 'sucesso',
        mensagem: response.data.mensagem || 'Alocação removida com sucesso'
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor', error.response?.data);
      logger.error(`Erro ao remover alocação: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  // 🗑️ REMOVER TODAS AS ALOCAÇÕES DE UM PROFESSOR NO ANO
  async removerAlocacoesProfessorAno(professor_id: string, ano_letivo_id: string): Promise<ApiResponse<any>> {
    try {
      logger.info(`🗑️ Removendo todas as alocações do professor ${professor_id} no ano ${ano_letivo_id}`, 'service');
      logger.apiRequest('DELETE', `/alocacao-professor/professor/${professor_id}/ano-letivo/${ano_letivo_id}`);

      const response = await api.delete(`/alocacao-professor/professor/${professor_id}/ano-letivo/${ano_letivo_id}`);

      logger.apiResponse(response.status, `/alocacao-professor/professor/${professor_id}/ano-letivo/${ano_letivo_id}`);
      logger.success('✅ Alocações do professor removidas', 'service');

      return {
        status: 'sucesso',
        mensagem: response.data.mensagem || 'Alocações removidas com sucesso',
        dados: response.data.dados
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor', error.response?.data);
      logger.error(`Erro ao remover alocações: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  // 🏫 BUSCAR TURMAS DISPONÍVEIS
  async buscarTurmas(ano_letivo_id: string): Promise<ApiResponse<TurmaDisponivel[]>> {
    try {
      logger.info(`🔍 Buscando turmas do ano letivo: ${ano_letivo_id}`, 'service');
      logger.apiRequest('GET', `/alocacao-professor/turmas/${ano_letivo_id}`);

      const response = await api.get(`/alocacao-professor/turmas/${ano_letivo_id}`);

      logger.apiResponse(response.status, `/alocacao-professor/turmas/${ano_letivo_id}`);
      logger.success(`✅ ${response.data.dados?.length || 0} turmas carregadas`, 'service');

      return {
        status: 'sucesso',
        mensagem: 'Turmas carregadas com sucesso',
        dados: response.data.dados || []
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor/turmas', error.response?.data);
      logger.error(`Erro ao buscar turmas: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  // 👨‍🏫 BUSCAR PROFESSORES DISPONÍVEIS (usuários com tipo professor)
  async buscarProfessores(): Promise<ApiResponse<ProfessorDisponivel[]>> {
    try {
      logger.info('🔍 Buscando professores disponíveis', 'service');
      logger.apiRequest('GET', '/alocacao-professor/professores');

      const response = await api.get('/alocacao-professor/professores');

      logger.apiResponse(response.status, '/alocacao-professor/professores');
      
      // Mapear para formato esperado - usar usuario_id diretamente
      const professores = (response.data.dados || []).map((prof: any) => ({
        professor_id: prof.usuario_id, // usuario_id será usado como professor_id
        nome_usuario: prof.nome_usuario,
        email_usuario: prof.email_usuario
      }));

      logger.success(`✅ ${professores.length} professores carregados`, 'service');

      return {
        status: 'sucesso',
        mensagem: 'Professores carregados com sucesso',
        dados: professores
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor/professores', error.response?.data);
      logger.error(`Erro ao buscar professores: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  // 📚 BUSCAR DISCIPLINAS DISPONÍVEIS
  async buscarDisciplinas(): Promise<ApiResponse<DisciplinaDisponivel[]>> {
    try {
      logger.info('🔍 Buscando disciplinas disponíveis', 'service');
      logger.apiRequest('GET', '/alocacao-professor/disciplinas');

      const response = await api.get('/alocacao-professor/disciplinas');

      logger.apiResponse(response.status, '/alocacao-professor/disciplinas');
      logger.success(`✅ ${response.data.dados?.length || 0} disciplinas carregadas`, 'service');

      return {
        status: 'sucesso',
        mensagem: 'Disciplinas carregadas com sucesso',
        dados: response.data.dados || []
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor/disciplinas', error.response?.data);
      logger.error(`Erro ao buscar disciplinas: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  },

  // 📊 OBTER ESTATÍSTICAS
  async obterEstatisticas(ano_letivo_id: string): Promise<ApiResponse<EstatisticasAlocacao>> {
    try {
      logger.info(`📊 Buscando estatísticas do ano letivo: ${ano_letivo_id}`, 'service');
      logger.apiRequest('GET', `/alocacao-professor/estatisticas/${ano_letivo_id}`);

      const response = await api.get(`/alocacao-professor/estatisticas/${ano_letivo_id}`);

      logger.apiResponse(response.status, `/alocacao-professor/estatisticas/${ano_letivo_id}`);
      logger.success('✅ Estatísticas carregadas', 'service');

      return {
        status: 'sucesso',
        mensagem: 'Estatísticas carregadas com sucesso',
        dados: response.data.dados
      };
    } catch (error: any) {
      logger.apiResponse(error.response?.status || 500, '/alocacao-professor/estatisticas', error.response?.data);
      logger.error(`Erro ao buscar estatísticas: ${error.response?.data?.mensagem || error.message}`, 'service');
      throw error;
    }
  }
};

