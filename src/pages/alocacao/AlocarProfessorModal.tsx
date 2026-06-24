import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, BookOpen, Users, School, Check, AlertCircle, Sparkles, Loader2, Save, ChevronDown, Pencil } from 'lucide-react';
import { logger } from '../../lib/logger';
import { professorDisciplinaService } from '../../services/professorDisciplinaService';
import { disciplinaService } from '../../services/disciplinaService';
import type { Disciplina } from '../../services/disciplinaService';
import type { ProfessorDisponivel, DisciplinaDisponivel, TurmaDisponivel } from '../../services/alocacaoProfessorService';

interface AlocarProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (alocacoes: Array<{ turma_id: string; disciplina_id: string; professor_id: string }>) => Promise<void> | void;
  professores: ProfessorDisponivel[];
  disciplinas: DisciplinaDisponivel[];
  turmas: TurmaDisponivel[];
  loading?: boolean;
}

interface AlocacaoTemp {
  turma_id: string;
  disciplina_id: string;
}

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  accent?: 'blue' | 'green';
}

const DROPDOWN_MAX_H = 240; // px (corresponde ao max-h-60)

// Nome de turma legível: dado vem redundante (serie "2º Ano" + turma "2 ano B").
// Extrai só o identificador (ex.: "B") e monta "2º Ano · Turma B".
function formatarTurma(nomeSerie: string, nomeTurma: string, turno: string) {
  const letra = nomeTurma.trim().split(/\s+/).pop() || '';
  const base = letra.length <= 2 ? `${nomeSerie} · Turma ${letra.toUpperCase()}` : nomeTurma;
  return `${base} (${turno})`;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '-- Selecione --',
  disabled = false,
  accent = 'blue'
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; width: number; top?: number; bottom?: number }>({ left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const ring = accent === 'green' ? 'ring-green-500 border-green-500' : 'ring-blue-500 border-blue-500';
  const selectedBg = accent === 'green' ? 'bg-green-50 text-green-900' : 'bg-blue-50 text-blue-900';

  // Recalcula posição do menu (fixo na viewport) — evita clipping do overflow do modal
  const atualizarPosicao = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const espacoAbaixo = window.innerHeight - r.bottom;
    const abrirParaCima = espacoAbaixo < DROPDOWN_MAX_H && r.top > espacoAbaixo;
    setCoords(
      abrirParaCima
        ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 4 }
        : { left: r.left, width: r.width, top: r.bottom + 4 }
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    atualizarPosicao();
    const onScroll = () => atualizarPosicao();
    window.addEventListener('scroll', onScroll, true); // captura scroll de qualquer ancestral
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, atualizarPosicao]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selecionada = options.find((o) => o.value === value);

  return (
    <div ref={triggerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 rounded-xl text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          open ? `ring-2 ${ring}` : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={`truncate ${selecionada ? 'text-gray-800' : 'text-gray-400'}`}>
          {selecionada ? selecionada.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={listRef}
          style={{ position: 'fixed', left: coords.left, width: coords.width, top: coords.top, bottom: coords.bottom, maxHeight: DROPDOWN_MAX_H }}
          className="z-[60] bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto overscroll-contain py-1"
        >
          {options.map((opt) => {
            const ativa = opt.value === value;
            return (
              <button
                key={opt.value || 'placeholder'}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                  ativa ? selectedBg + ' font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {ativa && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
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
  const [erroSubmit, setErroSubmit] = useState<string>('');
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>('');
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<Set<string>>(new Set());

  // Disciplinas que o professor selecionado pode lecionar (habilitação)
  const [disciplinasHabilitadas, setDisciplinasHabilitadas] = useState<Disciplina[]>([]);
  const [loadingHabilitadas, setLoadingHabilitadas] = useState(false);

  // Configuração inline de disciplinas
  const [mostrarConfigInline, setMostrarConfigInline] = useState(false);
  const [todasDisciplinasConfig, setTodasDisciplinasConfig] = useState<Disciplina[]>([]);
  const [selecionadasConfig, setSelecionadasConfig] = useState<Set<string>>(new Set());
  const [carregandoDisciplinasConfig, setCarregandoDisciplinasConfig] = useState(false);
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Resetar ao abrir/fechar
  useEffect(() => {
    if (!isOpen) {
      setProfessorSelecionado('');
      setAlocacoesTemp([]);
      setTurmaSelecionada('');
      setDisciplinasSelecionadas(new Set());
      setDisciplinasHabilitadas([]);
      setMostrarConfigInline(false);
      setSelecionadasConfig(new Set());
      setErroSubmit('');
    }
  }, [isOpen]);

  // Ao trocar de professor, carregar as disciplinas habilitadas e limpar a lista
  useEffect(() => {
    if (!professorSelecionado) {
      setDisciplinasHabilitadas([]);
      setDisciplinasSelecionadas(new Set());
      setAlocacoesTemp([]);
      setMostrarConfigInline(false);
      setSelecionadasConfig(new Set());
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

  // Carregar todas as disciplinas quando o painel inline abre (apenas uma vez)
  useEffect(() => {
    if (!mostrarConfigInline || todasDisciplinasConfig.length > 0) return;
    const carregar = async () => {
      setCarregandoDisciplinasConfig(true);
      try {
        const data = await disciplinaService.listarDisciplinas();
        setTodasDisciplinasConfig(data);
      } catch {
        logger.error('Erro ao carregar disciplinas', 'service');
      } finally {
        setCarregandoDisciplinasConfig(false);
      }
    };
    carregar();
  }, [mostrarConfigInline]);

  const nomeProfessor = professores.find((p) => p.professor_id === professorSelecionado)?.nome_usuario || '';

  const disciplinasBase = disciplinasHabilitadas.filter((d) => d.categoria === 'base');
  const disciplinasEspeciais = disciplinasHabilitadas.filter((d) => d.categoria !== 'base');
  const idsBase = disciplinasBase.map((d) => d.disciplina_id);
  const todasBaseMarcadas = idsBase.length > 0 && idsBase.every((id) => disciplinasSelecionadas.has(id));

  // Config inline
  const disciplinasBaseConfig = todasDisciplinasConfig.filter(d => d.categoria === 'base');
  const disciplinasEspeciaisConfig = todasDisciplinasConfig.filter(d => d.categoria !== 'base');
  const idsBaseConfig = disciplinasBaseConfig.map(d => d.disciplina_id);
  const todasBaseMarcadasConfig = idsBaseConfig.length > 0 && idsBaseConfig.every(id => selecionadasConfig.has(id));

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

  const toggleDisciplinaConfig = (disciplina_id: string) => {
    setSelecionadasConfig(prev => {
      const novo = new Set(prev);
      if (novo.has(disciplina_id)) novo.delete(disciplina_id);
      else novo.add(disciplina_id);
      return novo;
    });
  };

  const togglePacoteBaseConfig = () => {
    setSelecionadasConfig(prev => {
      const novo = new Set(prev);
      if (todasBaseMarcadasConfig) idsBaseConfig.forEach(id => novo.delete(id));
      else idsBaseConfig.forEach(id => novo.add(id));
      return novo;
    });
  };

  const recarregarHabilitadas = async () => {
    if (!professorSelecionado) return;
    try {
      setLoadingHabilitadas(true);
      const habilitadas = await professorDisciplinaService.listarDisciplinasDoProfessor(professorSelecionado);
      setDisciplinasHabilitadas(habilitadas);
    } catch {
      setDisciplinasHabilitadas([]);
    } finally {
      setLoadingHabilitadas(false);
    }
  };

  const handleSalvarConfig = async () => {
    if (!professorSelecionado) return;
    try {
      setSalvandoConfig(true);
      await professorDisciplinaService.definirDisciplinasDoProfessor(
        professorSelecionado,
        Array.from(selecionadasConfig)
      );
      setMostrarConfigInline(false);
      await recarregarHabilitadas();
    } catch (error: any) {
      logger.error('Erro ao salvar disciplinas', 'service');
      alert('Erro ao salvar: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvandoConfig(false);
    }
  };

  // Abre o editor de capacitação já marcando as disciplinas atuais do professor
  const abrirEditorCapacitacao = () => {
    setSelecionadasConfig(new Set(disciplinasHabilitadas.map((d) => d.disciplina_id)));
    setMostrarConfigInline(true);
  };

  const cancelarEditorCapacitacao = () => {
    setMostrarConfigInline(false);
    setSelecionadasConfig(new Set());
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

    setDisciplinasSelecionadas(new Set());
    logger.info('✅ Alocações adicionadas à lista');
  };

  const removerAlocacao = (index: number) => {
    setAlocacoesTemp(alocacoesTemp.filter((_, i) => i !== index));
  };

  const handleConfirmar = async () => {
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

    setErroSubmit('');
    try {
      await onConfirm(alocacoes);
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.mensagem || error?.message || 'Erro ao criar alocações';
      setErroSubmit(mensagem);
    }
  };

  const getNomeTurma = (turma_id: string) => {
    const turma = turmas.find((t) => t.turma_id === turma_id);
    return turma ? formatarTurma(turma.nome_serie, turma.nome_turma, turma.turno) : 'Turma não encontrada';
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

  const renderChipDisciplinaConfig = (disciplina: Disciplina) => {
    const marcada = selecionadasConfig.has(disciplina.disciplina_id);
    return (
      <button
        key={disciplina.disciplina_id}
        type="button"
        onClick={() => toggleDisciplinaConfig(disciplina.disciplina_id)}
        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border-2 text-left text-xs font-medium transition-all ${
          marcada ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        <span className={`flex items-center justify-center w-4 h-4 rounded border-2 flex-shrink-0 ${
          marcada ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
        }`}>
          {marcada && <Check className="w-2.5 h-2.5" />}
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
          {/* Passo 1: Seleção de Professor */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              Selecione o professor
            </label>
            <CustomSelect
              value={professorSelecionado}
              onChange={setProfessorSelecionado}
              disabled={loading}
              accent="blue"
              placeholder="-- Selecione um professor --"
              options={professores.map((prof) => ({
                value: prof.professor_id,
                label: `${prof.nome_usuario} (${prof.email_usuario})`
              }))}
            />
          </div>

          {/* Passo 2: Capacitação — disciplinas que o professor leciona */}
          {professorSelecionado && (
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  Disciplinas que {nomeProfessor || 'o professor'} leciona
                </h3>
                {!mostrarConfigInline && !loadingHabilitadas && disciplinasHabilitadas.length > 0 && (
                  <button
                    onClick={abrirEditorCapacitacao}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>
                )}
              </div>

              {loadingHabilitadas ? (
                <div className="flex items-center gap-2 py-4 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando disciplinas do professor...
                </div>
              ) : mostrarConfigInline ? (
                /* Editor de capacitação */
                <div className="bg-white border-2 border-blue-100 rounded-xl p-4">
                  {carregandoDisciplinasConfig ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Carregando disciplinas...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {disciplinasBaseConfig.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Disciplinas base</span>
                            <button
                              type="button"
                              onClick={togglePacoteBaseConfig}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              <Sparkles className="w-3 h-3" />
                              {todasBaseMarcadasConfig ? 'Desmarcar base' : 'Marcar tudo'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {disciplinasBaseConfig.map(renderChipDisciplinaConfig)}
                          </div>
                        </div>
                      )}

                      {disciplinasEspeciaisConfig.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Disciplinas especiais</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {disciplinasEspeciaisConfig.map(renderChipDisciplinaConfig)}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">{selecionadasConfig.size} selecionada(s)</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={cancelarEditorCapacitacao}
                            disabled={salvandoConfig}
                            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSalvarConfig}
                            disabled={selecionadasConfig.size === 0 || salvandoConfig}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {salvandoConfig ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                            ) : (
                              <><Save className="w-4 h-4" /> Salvar disciplinas</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : disciplinasHabilitadas.length === 0 ? (
                /* Sem capacitação ainda */
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">Este professor ainda não tem disciplinas definidas</p>
                    <p className="text-sm text-amber-700 mt-1">Defina o que ele pode lecionar para poder alocá-lo.</p>
                  </div>
                  <button
                    onClick={abrirEditorCapacitacao}
                    className="ml-3 flex-shrink-0 text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Definir disciplinas
                  </button>
                </div>
              ) : (
                /* Resumo das disciplinas habilitadas (somente leitura) */
                <div className="flex flex-wrap gap-2">
                  {disciplinasHabilitadas.map((d) => (
                    <span
                      key={d.disciplina_id}
                      className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      {d.nome_disciplina}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Passo 3: Turma + disciplinas para alocar */}
          {professorSelecionado && !mostrarConfigInline && !loadingHabilitadas && disciplinasHabilitadas.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                Escolha a turma e marque as disciplinas
              </h3>

              {/* Turma */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <School className="w-4 h-4 mr-1 text-green-600" />
                  Turma
                </label>
                <CustomSelect
                  value={turmaSelecionada}
                  onChange={setTurmaSelecionada}
                  disabled={loading}
                  accent="green"
                  placeholder="-- Selecione --"
                  options={turmas.map((turma) => ({
                    value: turma.turma_id,
                    label: formatarTurma(turma.nome_serie, turma.nome_turma, turma.turno)
                  }))}
                />
              </div>

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

        {/* Erro de submissão (ex.: disciplina já tem professor na turma) */}
        {erroSubmit && (
          <div className="mx-6 mb-2 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Não foi possível alocar</p>
              <p className="text-sm text-red-700 mt-0.5">{erroSubmit}</p>
            </div>
            <button
              onClick={() => setErroSubmit('')}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
