import { useState, useEffect, useMemo } from 'react';
import {
  CalendarClock, Loader2, School, Coffee, X, Trash2, AlertTriangle, BookOpen,
} from 'lucide-react';
import { cadastroService } from '../../../services/cadastroService';
import {
  alocacaoProfessorService,
  type AlocacaoProfessor,
  type TurmaDisponivel,
} from '../../../services/alocacaoProfessorService';
import GradeHorarioService, { type GradeHorario } from '../../../services/gradeHorarioService';
import { useAuth } from '../../../contexts/AuthContext';
import type { AnoLetivo } from '../../../types/api';

// Aulas de 50min, 12:30 → 17:00, com recreio de 20min após a 3ª aula.
const SLOTS = [
  { ordem: 1, inicio: '12:30:00', fim: '13:20:00' },
  { ordem: 2, inicio: '13:20:00', fim: '14:10:00' },
  { ordem: 3, inicio: '14:10:00', fim: '15:00:00' },
  { ordem: 4, inicio: '15:20:00', fim: '16:10:00' },
  { ordem: 5, inicio: '16:10:00', fim: '17:00:00' },
];
const RECREIO = { inicio: '15:00:00', fim: '15:20:00' };
// Recreio entra logo após a 3ª aula
const RECREIO_APOS_ORDEM = 3;

const DIAS = [
  { num: 1, label: 'Segunda', abrev: 'Seg' },
  { num: 2, label: 'Terça', abrev: 'Ter' },
  { num: 3, label: 'Quarta', abrev: 'Qua' },
  { num: 4, label: 'Quinta', abrev: 'Qui' },
  { num: 5, label: 'Sexta', abrev: 'Sex' },
];

// "12:30:00" → "12:30"
const hhmm = (t?: string | null) => (t ? t.slice(0, 5) : '');

// Paleta determinística por disciplina (classes estáticas p/ Tailwind)
const PALETA = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-emerald-50 border-emerald-200 text-emerald-800',
  'bg-orange-50 border-orange-200 text-orange-800',
  'bg-pink-50 border-pink-200 text-pink-800',
  'bg-cyan-50 border-cyan-200 text-cyan-800',
  'bg-amber-50 border-amber-200 text-amber-800',
  'bg-indigo-50 border-indigo-200 text-indigo-800',
];
const corDisciplina = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETA[h % PALETA.length];
};

const asArray = (resp: any): GradeHorario[] => {
  const d = resp?.dados ?? resp?.data ?? [];
  return Array.isArray(d) ? d : [];
};

// "2º Ano" + "2 ano B" → "2º Ano · Turma B"
const formatarTurma = (nomeSerie: string, nomeTurma: string) => {
  const letra = nomeTurma.trim().split(/\s+/).pop() || '';
  return letra.length <= 2 ? `${nomeSerie} · Turma ${letra.toUpperCase()}` : nomeTurma;
};

export default function GradeHorarioTab() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.tipo_usuario_id === 'admin';

  const [loading, setLoading] = useState(true);
  const [anoAtivo, setAnoAtivo] = useState<AnoLetivo | null>(null);
  const [turmas, setTurmas] = useState<TurmaDisponivel[]>([]);
  const [todasAlocacoes, setTodasAlocacoes] = useState<AlocacaoProfessor[]>([]);
  const [todasGrades, setTodasGrades] = useState<GradeHorario[]>([]);
  const [turmaSel, setTurmaSel] = useState<string | null>(null);

  const [pickerCell, setPickerCell] = useState<{ dia: number; inicio: string; fim: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    try {
      setLoading(true);
      const anosResp = await cadastroService.getAnosLetivos();
      const ativo: AnoLetivo | undefined = anosResp?.dados?.find((a: AnoLetivo) => a.ativo);
      if (!ativo) {
        setAnoAtivo(null);
        return;
      }
      setAnoAtivo(ativo);

      const [alocResp, turmasResp, gradesResp] = await Promise.all([
        alocacaoProfessorService.listarPorAnoLetivo(ativo.ano_letivo_id),
        alocacaoProfessorService.buscarTurmas(ativo.ano_letivo_id),
        GradeHorarioService.listarGrades(),
      ]);

      const turmasList = turmasResp.dados || [];
      setTodasAlocacoes(alocResp.dados || []);
      setTurmas(turmasList);
      setTodasGrades(asArray(gradesResp));
      setTurmaSel(prev => prev ?? turmasList[0]?.turma_id ?? null);
    } catch (error: any) {
      alert('Erro ao carregar grade horária: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setLoading(false);
    }
  };

  const recarregarGrades = async () => {
    const gradesResp = await GradeHorarioService.listarGrades();
    setTodasGrades(asArray(gradesResp));
  };

  // Vinculação (turma_disciplina_professor_id) → dados, p/ lookup rápido
  const vincMap = useMemo(() => {
    const m = new Map<string, AlocacaoProfessor>();
    todasAlocacoes.forEach(a => m.set(a.turma_disciplina_professor_id, a));
    return m;
  }, [todasAlocacoes]);

  // Disciplinas (vinculações) da turma selecionada
  const alocacoesTurma = useMemo(
    () => todasAlocacoes.filter(a => a.turma_id === turmaSel),
    [todasAlocacoes, turmaSel],
  );

  // Grades só das vinculações da turma selecionada
  const gradesTurma = useMemo(() => {
    const ids = new Set(alocacoesTurma.map(a => a.turma_disciplina_professor_id));
    return todasGrades.filter(g => ids.has(g.turma_disciplina_professor_id));
  }, [todasGrades, alocacoesTurma]);

  const getGrade = (dia: number, inicio: string) =>
    gradesTurma.find(g => g.dia_semana === dia && hhmm(g.hora_inicio) === hhmm(inicio));

  const turmaAtual = turmas.find(t => t.turma_id === turmaSel);

  const handleAtribuir = async (aloc: AlocacaoProfessor) => {
    if (!pickerCell) return;
    const { dia, inicio, fim } = pickerCell;

    // Aviso: professor já tem aula nesse mesmo dia/horário em OUTRA turma
    const conflitoProf = todasGrades.find(g => {
      if (g.dia_semana !== dia || hhmm(g.hora_inicio) !== hhmm(inicio)) return false;
      if (g.turma_disciplina_professor_id === aloc.turma_disciplina_professor_id) return false;
      const outra = vincMap.get(g.turma_disciplina_professor_id);
      return outra?.professor_id === aloc.professor_id;
    });
    if (conflitoProf) {
      const outra = vincMap.get(conflitoProf.turma_disciplina_professor_id);
      const turmaConf = outra ? formatarTurma(outra.nome_serie, outra.nome_turma) : 'outra turma';
      const ok = confirm(
        `${aloc.nome_professor || 'O professor'} já tem aula nesse horário em ${turmaConf}.\nDeseja atribuir mesmo assim?`,
      );
      if (!ok) return;
    }

    try {
      setSalvando(true);
      await GradeHorarioService.criarGrade({
        turma_disciplina_professor_id: aloc.turma_disciplina_professor_id,
        dia_semana: dia,
        hora_inicio: inicio,
        hora_fim: fim,
      });
      await recarregarGrades();
      setPickerCell(null);
    } catch (error: any) {
      alert('Erro ao atribuir aula: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (grade: GradeHorario) => {
    if (!grade.grade_horario_id) return;
    try {
      setRemovendo(grade.grade_horario_id);
      await GradeHorarioService.deletarGrade(grade.grade_horario_id);
      await recarregarGrades();
    } catch (error: any) {
      alert('Erro ao remover aula: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setRemovendo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando grade horária...</span>
      </div>
    );
  }

  if (!anoAtivo) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <CalendarClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">Nenhum ano letivo ativo</p>
        <p className="text-gray-500 mt-2">Ative um ano letivo para montar a grade horária.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarClock className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
          Grade Horária
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Monte os horários de aula de cada turma — {anoAtivo.ano}
        </p>
      </div>

      {/* Seletor de turma */}
      {turmas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Nenhuma turma cadastrada</p>
          <p className="text-gray-500 mt-2">Cadastre turmas para montar a grade.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <School className="w-4 h-4 text-gray-500" />
              Turma
            </label>
            <select
              value={turmaSel ?? ''}
              onChange={e => setTurmaSel(e.target.value)}
              className="flex-1 sm:flex-none sm:min-w-72 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {turmas.map(t => (
                <option key={t.turma_id} value={t.turma_id}>
                  {formatarTurma(t.nome_serie, t.nome_turma)} — {t.turno}
                </option>
              ))}
            </select>
          </div>

          {alocacoesTurma.length === 0 ? (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Nenhuma disciplina alocada nesta turma.</p>
                <p className="text-sm text-amber-700 mt-1">
                  Vá em <span className="font-medium">Alocação de Professores</span> e vincule
                  professores/disciplinas a esta turma antes de montar a grade.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2 pb-2">
              <table className="w-full border-separate border-spacing-1 min-w-[640px]">
                <thead>
                  <tr>
                    <th className="w-24 text-xs font-semibold text-gray-400 text-left px-2 pb-1">Horário</th>
                    {DIAS.map(d => (
                      <th key={d.num} className="text-xs font-semibold text-gray-600 px-2 pb-1">
                        <span className="hidden sm:inline">{d.label}</span>
                        <span className="sm:hidden">{d.abrev}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map(slot => (
                    <SlotRow
                      key={slot.ordem}
                      slot={slot}
                      isAdmin={isAdmin}
                      getGrade={getGrade}
                      vincMap={vincMap}
                      removendo={removendo}
                      onCellClick={(dia) => isAdmin && setPickerCell({ dia, inicio: slot.inicio, fim: slot.fim })}
                      onRemover={handleRemover}
                      showRecreioAfter={slot.ordem === RECREIO_APOS_ORDEM}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal de atribuição de disciplina à célula */}
      {pickerCell && turmaAtual && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => !salvando && setPickerCell(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Atribuir aula</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {DIAS.find(d => d.num === pickerCell.dia)?.label} · {hhmm(pickerCell.inicio)}–{hhmm(pickerCell.fim)}
                </p>
              </div>
              <button
                onClick={() => !salvando && setPickerCell(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2">
              {alocacoesTurma.map(aloc => (
                <button
                  key={aloc.turma_disciplina_professor_id}
                  onClick={() => handleAtribuir(aloc)}
                  disabled={salvando}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors disabled:opacity-50 ${corDisciplina(aloc.disciplina_id)} hover:brightness-95`}
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{aloc.nome_disciplina}</p>
                    <p className="text-xs opacity-75 truncate">{aloc.nome_professor || 'Sem professor'}</p>
                  </div>
                  {salvando && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Linha de um horário (+ divisória de recreio) ----
function SlotRow({
  slot, isAdmin, getGrade, vincMap, removendo, onCellClick, onRemover, showRecreioAfter,
}: {
  slot: { ordem: number; inicio: string; fim: string };
  isAdmin: boolean;
  getGrade: (dia: number, inicio: string) => GradeHorario | undefined;
  vincMap: Map<string, AlocacaoProfessor>;
  removendo: string | null;
  onCellClick: (dia: number) => void;
  onRemover: (grade: GradeHorario) => void;
  showRecreioAfter: boolean;
}) {
  return (
    <>
      <tr>
        <td className="align-top px-2 py-1">
          <div className="text-xs font-semibold text-gray-700">{slot.ordem}ª</div>
          <div className="text-[11px] text-gray-400 whitespace-nowrap">
            {hhmm(slot.inicio)}–{hhmm(slot.fim)}
          </div>
        </td>
        {DIAS.map(d => {
          const grade = getGrade(d.num, slot.inicio);
          const aloc = grade ? vincMap.get(grade.turma_disciplina_professor_id) : undefined;
          const removendoEsta = grade?.grade_horario_id === removendo;

          if (grade && aloc) {
            return (
              <td key={d.num} className="align-top p-0">
                <div className={`group relative h-full min-h-[3.5rem] rounded-lg border px-2 py-1.5 ${corDisciplina(aloc.disciplina_id)}`}>
                  <p className="text-xs font-semibold leading-tight pr-4 break-words">{aloc.nome_disciplina}</p>
                  <p className="text-[10px] opacity-75 leading-tight truncate">{aloc.nome_professor}</p>
                  {isAdmin && (
                    <button
                      onClick={() => onRemover(grade)}
                      disabled={removendoEsta}
                      className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-white/60 transition-opacity"
                      title="Remover aula"
                    >
                      {removendoEsta ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </td>
            );
          }

          return (
            <td key={d.num} className="align-top p-0">
              <button
                onClick={() => onCellClick(d.num)}
                disabled={!isAdmin}
                className="w-full h-full min-h-[3.5rem] rounded-lg border border-dashed border-gray-200 text-gray-300 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-50/40 transition-colors flex items-center justify-center disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:cursor-default text-lg"
              >
                {isAdmin ? '+' : ''}
              </button>
            </td>
          );
        })}
      </tr>
      {showRecreioAfter && (
        <tr>
          <td />
          <td colSpan={DIAS.length} className="py-0.5">
            <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg py-1">
              <Coffee className="w-3.5 h-3.5" />
              Recreio · {hhmm(RECREIO.inicio)}–{hhmm(RECREIO.fim)}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
