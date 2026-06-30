import api from '../lib/api';
import { logger } from '../lib/logger';

export interface TurmaSlot {
  slot_id?: string;
  turma_id: string;
  numero: number;
  hora_inicio: string;
  hora_fim: string;
}

const turmaSlotService = {
  async listarPorTurma(turmaId: string): Promise<TurmaSlot[]> {
    try {
      const resp = await api.get(`/turma-slot/turma/${turmaId}`);
      const d = resp.data?.dados;
      return Array.isArray(d) ? d : [];
    } catch (error) {
      logger.error('Erro ao listar slots', 'service', error);
      return [];
    }
  },

  async salvar(turmaId: string, slots: Array<{ numero: number; hora_inicio: string; hora_fim: string }>): Promise<void> {
    try {
      await api.post('/turma-slot', { turma_id: turmaId, slots });
    } catch (error) {
      logger.error('Erro ao salvar slots', 'service', error);
      throw error;
    }
  },

  async restaurarPadrao(turmaId: string): Promise<void> {
    try {
      await api.delete(`/turma-slot/turma/${turmaId}`);
    } catch (error) {
      logger.error('Erro ao restaurar slots padrão', 'service', error);
      throw error;
    }
  },
};

export default turmaSlotService;
