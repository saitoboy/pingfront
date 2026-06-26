import { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Calendar, Loader2, CheckCircle, Circle,
  ChevronDown, ChevronUp, Save, X, CalendarRange, AlertCircle, Zap
} from 'lucide-react';
import { anoLetivoService, type AnoLetivo } from '../../../services/anoLetivoService';
import PeriodoLetivoService, { type PeriodoLetivo } from '../../../services/periodoLetivoService';
import { useAuth } from '../../../contexts/AuthContext';
import AnoLetivoModal from '../modals/AnoLetivoModal';

const TRIMESTRE_LABELS = ['1º Trimestre', '2º Trimestre', '3º Trimestre'];

function extrairDataStr(data: any): string | null {
  if (data == null) return null;
  if (data instanceof Date) {
    if (isNaN(data.getTime())) return null;
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(data).trim();
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function formatarData(data: any): string {
  const str = extrairDataStr(data);
  if (!str) return '—';
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}

function temDataValida(data: any): boolean {
  return extrairDataStr(data) !== null;
}

export default function AnosLetivosTab() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.tipo_usuario_id === 'admin';

  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [anoLetivoEditando, setAnoLetivoEditando] = useState<AnoLetivo | null>(null);

  // Trimestres: quais anos estão expandidos e seus dados
  const [expandido, setExpandido] = useState<string | null>(null);
  const [trimestresMap, setTrimestresMap] = useState<Record<string, PeriodoLetivo[]>>({});
  const [carregandoTrimestres, setCarregandoTrimestres] = useState<string | null>(null);
  const [salvandoTrimestre, setSalvandoTrimestre] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ data_inicio: '', data_fim: '' });
  const [adicionandoTrimestre, setAdicionandoTrimestre] = useState<string | null>(null);
  const [novoTrimestre, setNovoTrimestre] = useState({ bimestre: 1, data_inicio: '', data_fim: '' });
  const [ativandoTrimestre, setAtivandoTrimestre] = useState<string | null>(null);
  const [periodoAtual, setPeriodoAtual] = useState<PeriodoLetivo | null>(null);

  useEffect(() => {
    carregarAnosLetivos();
    carregarPeriodoAtual();
  }, []);

  const carregarPeriodoAtual = async () => {
    try {
      const dados = await PeriodoLetivoService.buscarAtual();
      setPeriodoAtual(dados);
    } catch {
      // silencioso
    }
  };

  const carregarAnosLetivos = async () => {
    try {
      setLoading(true);
      const dados = await anoLetivoService.listarAnosLetivos();
      setAnosLetivos(dados.sort((a, b) => b.ano - a.ano));
    } catch (error: any) {
      alert('Erro ao carregar anos letivos: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setLoading(false);
    }
  };

  const carregarTrimestres = async (ano_letivo_id: string) => {
    if (trimestresMap[ano_letivo_id] !== undefined) return;
    try {
      setCarregandoTrimestres(ano_letivo_id);
      const dados = await PeriodoLetivoService.listarPorAno(ano_letivo_id);
      setTrimestresMap(prev => ({ ...prev, [ano_letivo_id]: dados }));
    } catch (error: any) {
      alert('Erro ao carregar trimestres: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setCarregandoTrimestres(null);
    }
  };

  const toggleExpansao = async (ano_letivo_id: string) => {
    if (expandido === ano_letivo_id) {
      setExpandido(null);
      return;
    }
    setExpandido(ano_letivo_id);
    await carregarTrimestres(ano_letivo_id);
  };

  const handleCriarTodos = async (ano_letivo_id: string) => {
    try {
      setSalvandoTrimestre(ano_letivo_id);
      await PeriodoLetivoService.criarTodos(ano_letivo_id);
      // Recarrega
      const dados = await PeriodoLetivoService.listarPorAno(ano_letivo_id);
      setTrimestresMap(prev => ({ ...prev, [ano_letivo_id]: dados }));
    } catch (error: any) {
      alert('Erro ao criar trimestres: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvandoTrimestre(null);
    }
  };

  const handleIniciarEdicao = (periodo: PeriodoLetivo) => {
    setEditandoId(periodo.periodo_letivo_id);
    setEditData({
      data_inicio: extrairDataStr(periodo.data_inicio) ?? '',
      data_fim: extrairDataStr(periodo.data_fim) ?? '',
    });
  };

  const handleSalvarEdicao = async (periodo: PeriodoLetivo) => {
    try {
      setSalvandoTrimestre(periodo.periodo_letivo_id);
      await PeriodoLetivoService.atualizar(periodo.periodo_letivo_id, {
        data_inicio: editData.data_inicio || null,
        data_fim: editData.data_fim || null,
      });
      const dados = await PeriodoLetivoService.listarPorAno(periodo.ano_letivo_id);
      setTrimestresMap(prev => ({ ...prev, [periodo.ano_letivo_id]: dados }));
      setEditandoId(null);
    } catch (error: any) {
      alert('Erro ao salvar: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvandoTrimestre(null);
    }
  };

  const handleDeletarTrimestre = async (periodo: PeriodoLetivo) => {
    if (!confirm(`Deseja excluir o ${TRIMESTRE_LABELS[periodo.bimestre - 1]}?`)) return;
    try {
      setSalvandoTrimestre(periodo.periodo_letivo_id);
      await PeriodoLetivoService.deletar(periodo.periodo_letivo_id);
      setTrimestresMap(prev => ({
        ...prev,
        [periodo.ano_letivo_id]: (prev[periodo.ano_letivo_id] || []).filter(
          p => p.periodo_letivo_id !== periodo.periodo_letivo_id
        ),
      }));
    } catch (error: any) {
      alert('Erro ao excluir trimestre: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvandoTrimestre(null);
    }
  };

  const handleAdicionarTrimestre = async (ano_letivo_id: string) => {
    const existentes = (trimestresMap[ano_letivo_id] || []).map(p => p.bimestre);
    const proximo = [1, 2, 3].find(n => !existentes.includes(n));
    if (!proximo) return;
    setNovoTrimestre({ bimestre: proximo, data_inicio: '', data_fim: '' });
    setAdicionandoTrimestre(ano_letivo_id);
  };

  const handleSalvarNovo = async (ano_letivo_id: string) => {
    try {
      setSalvandoTrimestre('novo');
      await PeriodoLetivoService.criar({
        bimestre: novoTrimestre.bimestre,
        ano_letivo_id,
        data_inicio: novoTrimestre.data_inicio || null,
        data_fim: novoTrimestre.data_fim || null,
      });
      const dados = await PeriodoLetivoService.listarPorAno(ano_letivo_id);
      setTrimestresMap(prev => ({ ...prev, [ano_letivo_id]: dados }));
      setAdicionandoTrimestre(null);
    } catch (error: any) {
      alert('Erro ao criar trimestre: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvandoTrimestre(null);
    }
  };

  const handleAtivarPeriodo = async (periodo: PeriodoLetivo, anoLabel: number) => {
    if (!confirm(`Ativar o ${TRIMESTRE_LABELS[periodo.bimestre - 1]} de ${anoLabel} para todas as matrículas ativas deste ano?`)) return;
    try {
      setAtivandoTrimestre(periodo.periodo_letivo_id);
      const resultado = await PeriodoLetivoService.ativar(periodo.periodo_letivo_id);
      alert(`${TRIMESTRE_LABELS[periodo.bimestre - 1]} ativado em ${resultado.total} matrícula(s).`);
      await carregarPeriodoAtual();
    } catch (error: any) {
      alert('Erro ao ativar período: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setAtivandoTrimestre(null);
    }
  };

  const handleNovoAnoLetivo = () => { setAnoLetivoEditando(null); setModalAberto(true); };
  const handleEditarAnoLetivo = (al: AnoLetivo) => { setAnoLetivoEditando(al); setModalAberto(true); };

  const handleDeletarAnoLetivo = async (al: AnoLetivo) => {
    if (al.ativo) { alert('Não é possível deletar o ano letivo ativo.'); return; }
    if (!confirm(`Deletar o ano letivo "${al.ano}"?`)) return;
    try {
      await anoLetivoService.deletarAnoLetivo(al.ano_letivo_id);
      await carregarAnosLetivos();
    } catch (error: any) {
      alert('Erro ao deletar: ' + (error.response?.data?.mensagem || error.message));
    }
  };

  const handleAtivarAnoLetivo = async (al: AnoLetivo) => {
    if (al.ativo) return;
    if (!confirm(`Ativar o ano letivo "${al.ano}"?`)) return;
    try {
      await anoLetivoService.ativarAnoLetivo(al.ano_letivo_id);
      await carregarAnosLetivos();
    } catch (error: any) {
      alert('Erro ao ativar: ' + (error.response?.data?.mensagem || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando anos letivos...</span>
      </div>
    );
  }

  const anoAtual = periodoAtual
    ? anosLetivos.find(a => a.ano_letivo_id === periodoAtual.ano_letivo_id)
    : null;

  return (
    <div>
      {periodoAtual && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
            <Zap className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Trimestre Ativo</p>
            <p className="text-sm font-semibold text-green-900">
              {TRIMESTRE_LABELS[periodoAtual.bimestre - 1]}
              {anoAtual ? ` — ${anoAtual.ano}` : ''}
            </p>
          </div>
          {(temDataValida(periodoAtual.data_inicio) || temDataValida(periodoAtual.data_fim)) && (
            <span className="text-xs text-green-700 flex-shrink-0">
              {formatarData(periodoAtual.data_inicio)} → {formatarData(periodoAtual.data_fim)}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
            Anos Letivos
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerencie os anos letivos e seus trimestres
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleNovoAnoLetivo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Ano Letivo
          </button>
        )}
      </div>

      {anosLetivos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Nenhum ano letivo cadastrado</p>
          {isAdmin && <p className="text-gray-500 mt-2">Clique em "Novo Ano Letivo" para começar</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {anosLetivos.map((al) => {
            const isExpandido = expandido === al.ano_letivo_id;
            const trimestres = trimestresMap[al.ano_letivo_id] || [];
            const carregando = carregandoTrimestres === al.ano_letivo_id;
            const existentes = trimestres.map(p => p.bimestre);
            const faltam = [1, 2, 3].filter(n => !existentes.includes(n));

            return (
              <div key={al.ano_letivo_id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Linha principal do ano */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => toggleExpansao(al.ano_letivo_id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">{al.ano}</span>
                    {al.ativo ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </span>
                    ) : null}
                    <span className="text-xs text-gray-400 ml-1">
                      {isExpandido
                        ? `${trimestres.length}/3 trimestres`
                        : 'clique para ver trimestres'}
                    </span>
                    {isExpandido
                      ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />}
                  </button>

                  {/* Ações do ano letivo */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!al.ativo && (
                      <button
                        onClick={() => handleAtivarAnoLetivo(al)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        title="Ativar"
                      >
                        <Circle className="w-3 h-3 mr-1" />
                        Inativo
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button onClick={() => handleEditarAnoLetivo(al)} className="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletarAnoLetivo(al)}
                          className={al.ativo ? 'text-gray-300 cursor-not-allowed p-1' : 'text-red-600 hover:text-red-900 p-1'}
                          disabled={al.ativo}
                          title={al.ativo ? 'Não é possível deletar o ano ativo' : 'Deletar'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Painel de trimestres */}
                {isExpandido && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                    {carregando ? (
                      <div className="flex items-center gap-2 text-gray-500 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Carregando trimestres...</span>
                      </div>
                    ) : (
                      <>
                        {/* Aviso se faltam trimestres */}
                        {isAdmin && faltam.length > 0 && trimestres.length === 0 && (
                          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-amber-800">Nenhum trimestre configurado para este ano.</p>
                            </div>
                            <button
                              onClick={() => handleCriarTodos(al.ano_letivo_id)}
                              disabled={salvandoTrimestre === al.ano_letivo_id}
                              className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                            >
                              {salvandoTrimestre === al.ano_letivo_id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Plus className="w-3 h-3" />}
                              Criar os 3 trimestres
                            </button>
                          </div>
                        )}

                        {/* Lista de trimestres */}
                        <div className="space-y-2">
                          {[1, 2, 3].map((num) => {
                            const periodo = trimestres.find(p => p.bimestre === num);
                            const label = TRIMESTRE_LABELS[num - 1];
                            const editando = editandoId === periodo?.periodo_letivo_id;
                            const salvando = salvandoTrimestre === periodo?.periodo_letivo_id;
                            const isAtivo = periodoAtual?.periodo_letivo_id === periodo?.periodo_letivo_id;

                            if (!periodo) {
                              return (
                                <div key={num} className="flex items-center gap-3 px-3 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                                  <CalendarRange className="w-4 h-4" />
                                  <span>{label}</span>
                                  <span className="text-xs">não configurado</span>
                                  {isAdmin && (
                                    <button
                                      onClick={() => {
                                        setNovoTrimestre({ bimestre: num, data_inicio: '', data_fim: '' });
                                        setAdicionandoTrimestre(al.ano_letivo_id);
                                      }}
                                      className="ml-auto text-blue-500 hover:text-blue-700 text-xs underline"
                                    >
                                      Adicionar
                                    </button>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div key={num} className={`border rounded-lg ${isAtivo ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
                                {editando ? (
                                  <div className="px-3 py-2 space-y-2">
                                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                      <CalendarRange className="w-4 h-4 text-blue-500" />
                                      {label}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                      <div className="flex-1 min-w-32">
                                        <label className="text-xs text-gray-500">Início</label>
                                        <input
                                          type="date"
                                          value={editData.data_inicio}
                                          onChange={e => setEditData(d => ({ ...d, data_inicio: e.target.value }))}
                                          className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-32">
                                        <label className="text-xs text-gray-500">Fim</label>
                                        <input
                                          type="date"
                                          value={editData.data_fim}
                                          onChange={e => setEditData(d => ({ ...d, data_fim: e.target.value }))}
                                          className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                      </div>
                                      <div className="flex items-end gap-1">
                                        <button
                                          onClick={() => handleSalvarEdicao(periodo)}
                                          disabled={salvando}
                                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                          {salvando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                          Salvar
                                        </button>
                                        <button
                                          onClick={() => setEditandoId(null)}
                                          className="flex items-center gap-1 px-2 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 px-3 py-2">
                                    <CalendarRange className={`w-4 h-4 flex-shrink-0 ${isAtivo ? 'text-green-600' : 'text-blue-500'}`} />
                                    <span className={`text-sm font-medium w-28 flex-shrink-0 ${isAtivo ? 'text-green-800' : 'text-gray-700'}`}>{label}</span>
                                    {isAtivo && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                                        <CheckCircle className="w-3 h-3" />
                                        Ativo
                                      </span>
                                    )}
                                    <span className="text-sm text-gray-500 flex-1">
                                      {temDataValida(periodo.data_inicio) || temDataValida(periodo.data_fim)
                                        ? `${formatarData(periodo.data_inicio)} → ${formatarData(periodo.data_fim)}`
                                        : <span className="text-gray-400 italic">sem datas definidas</span>}
                                    </span>
                                    {isAdmin && (
                                      <div className="flex gap-1 flex-shrink-0 items-center">
                                        {!isAtivo && (
                                          <button
                                            onClick={() => handleAtivarPeriodo(periodo, al.ano)}
                                            disabled={ativandoTrimestre === periodo.periodo_letivo_id}
                                            className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                            title="Ativar este trimestre nas matrículas"
                                          >
                                            {ativandoTrimestre === periodo.periodo_letivo_id
                                              ? <Loader2 className="w-3 h-3 animate-spin" />
                                              : <Zap className="w-3 h-3" />}
                                            Ativar
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleIniciarEdicao(periodo)}
                                          className="text-blue-600 hover:text-blue-900 p-1"
                                          title="Editar datas"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeletarTrimestre(periodo)}
                                          disabled={salvandoTrimestre === periodo.periodo_letivo_id}
                                          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                                          title="Excluir trimestre"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Formulário de novo trimestre */}
                        {adicionandoTrimestre === al.ano_letivo_id && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-800 mb-2">
                              Adicionar {TRIMESTRE_LABELS[novoTrimestre.bimestre - 1]}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              <div className="flex-1 min-w-32">
                                <label className="text-xs text-gray-500">Início</label>
                                <input
                                  type="date"
                                  value={novoTrimestre.data_inicio}
                                  onChange={e => setNovoTrimestre(d => ({ ...d, data_inicio: e.target.value }))}
                                  className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex-1 min-w-32">
                                <label className="text-xs text-gray-500">Fim</label>
                                <input
                                  type="date"
                                  value={novoTrimestre.data_fim}
                                  onChange={e => setNovoTrimestre(d => ({ ...d, data_fim: e.target.value }))}
                                  className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex items-end gap-1">
                                <button
                                  onClick={() => handleSalvarNovo(al.ano_letivo_id)}
                                  disabled={salvandoTrimestre === 'novo'}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {salvandoTrimestre === 'novo' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setAdicionandoTrimestre(null)}
                                  className="flex items-center gap-1 px-2 py-1 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Botão adicionar trimestre avulso (quando já há alguns mas não todos) */}
                        {isAdmin && faltam.length > 0 && trimestres.length > 0 && adicionandoTrimestre !== al.ano_letivo_id && (
                          <button
                            onClick={() => handleAdicionarTrimestre(al.ano_letivo_id)}
                            className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="w-3 h-3" />
                            Adicionar trimestre
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && (
        <AnoLetivoModal
          anoLetivo={anoLetivoEditando}
          onClose={() => setModalAberto(false)}
          onSalvar={async () => { setModalAberto(false); await carregarAnosLetivos(); }}
        />
      )}
    </div>
  );
}
