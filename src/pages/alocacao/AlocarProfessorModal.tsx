import { useState, useEffect } from 'react';
import { X, UserPlus, BookOpen, Users, School, Check, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { logger } from '../../lib/logger';
import { professorDisciplinaService } from '../../services/professorDisciplinaService';
import type { Disciplina } from '../../services/disciplinaService';
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
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<Set<string>>(new Set());

  // Disciplinas que o professor selecionado pode lecionar (habilitação)
  const [disciplinasHabilitadas, setDisciplinasHabilitadas] = useState<Disciplina[]>([]);
  const [loadingHabilitadas, setLoadingHabilitadas] = useState(false);

  // Resetar ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setProfessorSelecionado('');
      setAlocacoesTemp([]);
      setTurmaSelecionada('');
      setDisciplinasSelecionadas(new Set());
      setDisciplinasHabilitadas([]);
    }
  }, [isOpen]);

  // Ao trocar de professor, carregar as disciplinas habilitadas e limpar a lista
  useEffect(() => {
    if (!professorSelecionado) {
      setDisciplinasHabilitadas([]);
      setDisciplinasSelecionadas(new Set());
      setAlocacoesTemp([]);
      return;
    }

    let cancelado = false;
    const carregar = async () => {
      try {
        setLoadingHabilitadas(true);
        const habilitadas = await professorDisciplinaService.listarDisciplinasDoProfessor(professorSelecionado);
        if (!cancelado) {
          setDisciplinasHabilitadas(habilitadas);
          setDisciplinasSelecionadas(new Set());
          setAlocacoesTemp([]);
        }
      } catch (error) {
        if (!cancelado) {
          logger.error('Erro ao carregar disciplinas do professor', 'service');
          setDisciplinasHabilitadas([]);
        }
      } finally {
        if (!cancelado) setLoadingHabilitadas(false);
      }
    };

    carregar();
    return () => {
      cancelado = true;
    };
  }, [professorSelecionado]);

  const disciplinasBase = disciplinasHabilitadas.filter((d) => d.categoria === 'base');
  const disciplinasEspeciais = disciplinasHabilitadas.filter((d) => d.categoria !== 'base');
  const idsBase = disciplinasBase.map((d) => d.disciplina_id);
  const todasBaseMarcadas = idsBase.length > 0 && idsBase.every((id) => disciplinasSelecionadas.has(id));

  const toggleDisciplina = (disciplina_id: string) => {
    setDisciplinasSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(disciplina_id)) novo.delete(disciplina_id);
      else novo.add(disciplina_id);
      return novo;
    });
  };

  const togglePacoteBase = () => {
    setDisciplinasSelecionadas((prev) => {
      const novo = new Set(prev);
      if (todasBaseMarcadas) idsBase.forEach((id) => novo.delete(id));
      else idsBase.forEach((id) => novo.add(id));
      return novo;
    });
  };

  const adicionarAlocacoes = () => {
    if (!turmaSelecionada || disciplinasSelecionadas.size === 0) {
      logger.warning('⚠️ Selecione a turma e ao menos uma disciplina');
      return;
    }

    setAlocacoesTemp((prev) => {
      const novas = [...prev];
      disciplinasSelecionadas.forEach((disciplina_id) => {
        const jaExiste = novas.some(
          (a) => a.turma_id === turmaSelecionada && a.disciplina_id === disciplina_id
        );
        if (!jaExiste) {
          novas.push({ turma_id: turmaSelecionada, disciplina_id });
        }
      });
      return novas;
    });

    // Limpar seleção de disciplinas (mantém a turma pra facilitar adicionar outras)
    setDisciplinasSelecionadas(new Set());
    logger.info('✅ Alocações adicionadas à lista');
  };

  const removerAlocacao = (index: number) => {
    setAlocacoesTemp(alocacoesTemp.filter((_, i) => i !== index));
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

    const alocacoes = alocacoesTemp.map((a) => ({
      ...a,
      professor_id: professorSelecionado
    }));

    onConfirm(alocacoes);
  };

  const getNomeTurma = (turma_id: string) => {
    const turma = turmas.find((t) => t.turma_id === turma_id);
    return turma ? `${turma.nome_serie} - ${turma.nome_turma} (${turma.turno})` : 'Turma não encontrada';
  };

  const getNomeDisciplina = (disciplina_id: string) => {
    const disciplina = disciplinas.find((d) => d.disciplina_id === disciplina_id);
    return disciplina ? disciplina.nome_disciplina : 'Disciplina não encontrada';
  };

  const renderChipDisciplina = (disciplina: Disciplina) => {
    const marcada = disciplinasSelecionadas.has(disciplina.disciplina_id);
    return (
      <button
        key={disciplina.disciplina_id}
        type="button"
        onClick={() => toggleDisciplina(disciplina.disciplina_id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-left text-sm font-medium transition-all ${
          marcada ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        <span
          className={`flex items-center justify-center w-4 h-4 rounded border-2 flex-shrink-0 ${
            marcada ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
          }`}
        >
          {marcada && <Check className="w-3 h-3" />}
        </span>
        {disciplina.nome_disciplina}
      </button>
    );
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
              <p className="text-blue-100 text-sm">Vincule o professor às disciplinas e turmas</p>
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
          {professorSelecionado && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                Selecione a turma e as disciplinas
              </h3>

              {/* Turma */}
              <div className="mb-4">
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

              {/* Disciplinas (habilitadas do professor) */}
              {loadingHabilitadas ? (
                <div className="flex items-center gap-2 py-4 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando disciplinas do professor...
                </div>
              ) : disciplinasHabilitadas.length === 0 ? (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Este professor ainda não tem disciplinas definidas</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Defina as disciplinas dele em <strong>Gestão Escolar → Disciplinas do Professor</strong> para poder alocá-lo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Base */}
                  {disciplinasBase.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Disciplinas base</span>
                        <button
                          type="button"
                          onClick={togglePacoteBase}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {todasBaseMarcadas ? 'Desmarcar base' : 'Marcar pacote base'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {disciplinasBase.map(renderChipDisciplina)}
                      </div>
                    </div>
                  )}

                  {/* Especiais */}
                  {disciplinasEspeciais.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-2">Disciplinas especiais</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {disciplinasEspeciais.map(renderChipDisciplina)}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={adicionarAlocacoes}
                    disabled={!turmaSelecionada || disciplinasSelecionadas.size === 0 || loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Adicionar à Lista ({disciplinasSelecionadas.size})
                  </button>
                </div>
              )}
            </div>
          )}

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
                      <p className="font-semibold text-gray-800">{getNomeTurma(alocacao.turma_id)}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                        {getNomeDisciplina(alocacao.disciplina_id)}
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

          {/* Aviso quando não há professor selecionado */}
          {!professorSelecionado && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Comece selecionando o professor</p>
                <p className="text-sm text-blue-700 mt-1">
                  As disciplinas disponíveis serão as que o professor pode lecionar.
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
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
