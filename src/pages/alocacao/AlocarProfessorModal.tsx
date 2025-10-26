import { useState, useEffect } from 'react';
import { X, UserPlus, BookOpen, Users, School, Check, AlertCircle } from 'lucide-react';
import { logger } from '../../lib/logger';
import type { ProfessorDisponivel, DisciplinaDisponivel, TurmaDisponivel } from '../../services/alocacaoProfessorService';

interface AlocarProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (alocacoes: Array<{ turma_id: string; disciplina_id: string; professor_id: string }>) => void;
  professores: ProfessorDisponivel[];
  disciplinas: DisciplinaDisponivel[];
  turmas: TurmaDisponivel[];
  loading?: boolean;
}

interface AlocacaoTemp {
  turma_id: string;
  disciplina_id: string;
}

export default function AlocarProfessorModal({
  isOpen,
  onClose,
  onConfirm,
  professores,
  disciplinas,
  turmas,
  loading = false
}: AlocarProfessorModalProps) {
  const [professorSelecionado, setProfessorSelecionado] = useState<string>('');
  const [alocacoesTemp, setAlocacoesTemp] = useState<AlocacaoTemp[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>('');
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string>('');

  // Resetar ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setProfessorSelecionado('');
      setAlocacoesTemp([]);
      setTurmaSelecionada('');
      setDisciplinaSelecionada('');
    }
  }, [isOpen]);

  const adicionarAlocacao = () => {
    if (!turmaSelecionada || !disciplinaSelecionada) {
      logger.warning('⚠️ Turma e disciplina devem ser selecionadas');
      return;
    }

    // Verificar se já existe
    const jaExiste = alocacoesTemp.some(
      a => a.turma_id === turmaSelecionada && a.disciplina_id === disciplinaSelecionada
    );

    if (jaExiste) {
      logger.warning('⚠️ Esta combinação já foi adicionada');
      return;
    }

    setAlocacoesTemp([...alocacoesTemp, {
      turma_id: turmaSelecionada,
      disciplina_id: disciplinaSelecionada
    }]);

    // Limpar seleção
    setTurmaSelecionada('');
    setDisciplinaSelecionada('');
    
    logger.info('➕ Alocação adicionada temporariamente');
  };

  const removerAlocacao = (index: number) => {
    setAlocacoesTemp(alocacoesTemp.filter((_, i) => i !== index));
    logger.info('➖ Alocação removida');
  };

  const handleConfirmar = () => {
    if (!professorSelecionado) {
      logger.warning('⚠️ Selecione um professor');
      return;
    }

    if (alocacoesTemp.length === 0) {
      logger.warning('⚠️ Adicione pelo menos uma alocação');
      return;
    }

    // Criar array de alocações com professor
    const alocacoes = alocacoesTemp.map(a => ({
      ...a,
      professor_id: professorSelecionado
    }));

    onConfirm(alocacoes);
  };

  const getNomeTurma = (turma_id: string) => {
    const turma = turmas.find(t => t.turma_id === turma_id);
    return turma ? `${turma.nome_serie} - ${turma.nome_turma} (${turma.turno})` : 'Turma não encontrada';
  };

  const getNomeDisciplina = (disciplina_id: string) => {
    const disciplina = disciplinas.find(d => d.disciplina_id === disciplina_id);
    return disciplina ? disciplina.nome_disciplina : 'Disciplina não encontrada';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Alocar Professor</h2>
              <p className="text-blue-100 text-sm">Vincule professores às disciplinas e turmas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            disabled={loading}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Seleção de Professor */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Selecione o Professor
            </label>
            <select
              value={professorSelecionado}
              onChange={(e) => setProfessorSelecionado(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={loading}
            >
              <option value="">-- Selecione um professor --</option>
              {professores.map((prof) => (
                <option key={prof.professor_id} value={prof.professor_id}>
                  {prof.nome_usuario} ({prof.email_usuario})
                </option>
              ))}
            </select>
          </div>

          {/* Adicionar Alocações */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
              Adicionar Turma e Disciplina
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <School className="w-4 h-4 mr-1 text-green-600" />
                  Turma
                </label>
                <select
                  value={turmaSelecionada}
                  onChange={(e) => setTurmaSelecionada(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  disabled={loading}
                >
                  <option value="">-- Selecione --</option>
                  {turmas.map((turma) => (
                    <option key={turma.turma_id} value={turma.turma_id}>
                      {turma.nome_serie} - {turma.nome_turma} ({turma.turno})
                    </option>
                  ))}
                </select>
              </div>

              {/* Disciplina */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-1 text-orange-600" />
                  Disciplina
                </label>
                <select
                  value={disciplinaSelecionada}
                  onChange={(e) => setDisciplinaSelecionada(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  disabled={loading}
                >
                  <option value="">-- Selecione --</option>
                  {disciplinas.map((disc) => (
                    <option key={disc.disciplina_id} value={disc.disciplina_id}>
                      {disc.nome_disciplina}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={adicionarAlocacao}
              disabled={!turmaSelecionada || !disciplinaSelecionada || loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Adicionar à Lista
            </button>
          </div>

          {/* Lista de Alocações Temporárias */}
          {alocacoesTemp.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-600" />
                Alocações a Serem Criadas ({alocacoesTemp.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {alocacoesTemp.map((alocacao, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-green-200 rounded-lg p-4 flex items-center justify-between hover:border-green-300 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {getNomeTurma(alocacao.turma_id)}
                      </p>
                      <p className="text-sm text-gray-600">
                        📚 {getNomeDisciplina(alocacao.disciplina_id)}
                      </p>
                    </div>
                    <button
                      onClick={() => removerAlocacao(index)}
                      className="ml-4 w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aviso quando não há alocações */}
          {alocacoesTemp.length === 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Nenhuma alocação adicionada ainda</p>
                <p className="text-sm text-blue-700 mt-1">
                  Selecione uma turma e disciplina acima e clique em "Adicionar à Lista"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!professorSelecionado || alocacoesTemp.length === 0 || loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Alocando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Confirmar Alocações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

