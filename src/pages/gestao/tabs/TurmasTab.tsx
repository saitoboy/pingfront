import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, Loader2, Filter, GraduationCap, Clock, MapPin } from 'lucide-react';
import { turmaService, type Turma } from '../../../services/turmaService';
import { serieService, type Serie } from '../../../services/serieService';
import { logger } from '../../../lib/logger';
import TurmaModal from '../modals/TurmaModal';

export default function TurmasTab() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmasFiltradas, setTurmasFiltradas] = useState<Turma[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [turmaEditando, setTurmaEditando] = useState<Turma | null>(null);

  // Filtros
  const [filtroSerie, setFiltroSerie] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [turmas, filtroSerie, filtroTurno]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [dadosTurmas, dadosSeries] = await Promise.all([
        turmaService.listarTurmas(),
        serieService.listarSeries()
      ]);
      setTurmas(dadosTurmas);
      setSeries(dadosSeries);
    } catch (error: any) {
      logger.error('Erro ao carregar dados', 'service');
      alert('Erro ao carregar dados: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...turmas];

    if (filtroSerie) {
      resultado = resultado.filter(t => t.serie_id === filtroSerie);
    }

    if (filtroTurno) {
      resultado = resultado.filter(t => t.turno === filtroTurno);
    }

    setTurmasFiltradas(resultado);
  };

  const handleNovaTurma = () => {
    setTurmaEditando(null);
    setModalAberto(true);
  };

  const handleEditarTurma = (turma: Turma) => {
    setTurmaEditando(turma);
    setModalAberto(true);
  };

  const handleDeletarTurma = async (turma: Turma) => {
    if (!confirm(`Tem certeza que deseja deletar a turma "${turma.nome_turma}"?`)) {
      return;
    }

    try {
      await turmaService.deletarTurma(turma.turma_id);
      logger.success('Turma deletada com sucesso', 'service');
      await carregarDados();
    } catch (error: any) {
      logger.error('Erro ao deletar turma', 'service');
      alert('Erro ao deletar turma: ' + (error.response?.data?.mensagem || error.message));
    }
  };

  const handleSalvarTurma = async () => {
    setModalAberto(false);
    await carregarDados();
  };

  const getTurnoLabel = (turno: string) => {
    const turnos: Record<string, string> = {
      'manhã': 'Manhã',
      'tarde': 'Tarde',
      'noite': 'Noite',
      'integral': 'Integral'
    };
    return turnos[turno] || turno;
  };

  const getTurnoColor = (turno: string) => {
    const cores: Record<string, string> = {
      'manhã': 'bg-yellow-100 text-yellow-800',
      'tarde': 'bg-orange-100 text-orange-800',
      'noite': 'bg-indigo-100 text-indigo-800',
      'integral': 'bg-blue-100 text-blue-800'
    };
    return cores[turno] || 'bg-gray-100 text-gray-800';
  };

  // Nome da série a partir do serie_id (o endpoint de turmas não traz nome_serie)
  const getNomeSerie = (turma: Turma) =>
    series.find(s => s.serie_id === turma.serie_id)?.nome_serie ?? turma.nome_serie ?? 'Sem série';

  // O nome_turma às vezes repete a série (ex: "2 ano A"); usamos só o identificador final (A, B...)
  const getIdentificadorTurma = (turma: Turma) =>
    turma.nome_turma.trim().split(/\s+/).pop() || turma.nome_turma;

  // Agrupar turmas por série, ordenadas de 1º ao 5º ano
  const seriesOrdenadas = [...series].sort((a, b) =>
    a.nome_serie.localeCompare(b.nome_serie, 'pt-BR', { numeric: true })
  );

  const gruposPorSerie = seriesOrdenadas
    .map(serie => ({
      serie,
      turmasDaSerie: turmasFiltradas
        .filter(t => t.serie_id === serie.serie_id)
        .sort((a, b) => a.nome_turma.localeCompare(b.nome_turma, 'pt-BR', { numeric: true }))
    }))
    .filter(grupo => grupo.turmasDaSerie.length > 0);

  // Turmas cuja série não foi encontrada na lista (caso de dados órfãos)
  const turmasSemSerie = turmasFiltradas
    .filter(t => !series.some(s => s.serie_id === t.serie_id))
    .sort((a, b) => a.nome_turma.localeCompare(b.nome_turma, 'pt-BR', { numeric: true }));

  const renderCardTurma = (turma: Turma) => (
    <div
      key={turma.turma_id}
      className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              Turma {getIdentificadorTurma(turma)}
            </p>
            {/* Série + turno unificados */}
            <p className="text-xs text-gray-500 truncate">
              {getNomeSerie(turma)} · {getTurnoLabel(turma.turno)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => handleEditarTurma(turma)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar turma"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeletarTurma(turma)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Deletar turma"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detalhes: turno sempre; sala e capacidade quando existirem */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTurnoColor(turma.turno)}`}>
          <Clock className="w-3 h-3" />
          {getTurnoLabel(turma.turno)}
        </span>
        {turma.sala && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <MapPin className="w-3 h-3" />
            Sala {turma.sala}
          </span>
        )}
        {turma.capacidade_maxima != null && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <Users className="w-3 h-3" />
            {turma.capacidade_maxima} alunos
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando turmas...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header com total e botão adicionar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
            Turmas
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {turmas.length}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerencie as turmas da escola
          </p>
        </div>
        <button
          onClick={handleNovaTurma}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          Nova Turma
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Série
            </label>
            <select
              value={filtroSerie}
              onChange={(e) => setFiltroSerie(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as séries</option>
              {seriesOrdenadas.map((serie) => (
                <option key={serie.serie_id} value={serie.serie_id}>
                  {serie.nome_serie}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Turno
            </label>
            <select
              value={filtroTurno}
              onChange={(e) => setFiltroTurno(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os turnos</option>
              <option value="manhã">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
              <option value="integral">Integral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de turmas agrupada por série */}
      {turmasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            {turmas.length === 0 ? 'Nenhuma turma cadastrada' : 'Nenhuma turma encontrada com os filtros aplicados'}
          </p>
          <p className="text-gray-500 mt-2">
            {turmas.length === 0 ? 'Clique em "Nova Turma" para começar' : 'Tente ajustar os filtros'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {gruposPorSerie.map(({ serie, turmasDaSerie }) => (
            <section key={serie.serie_id}>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">{serie.nome_serie}</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {turmasDaSerie.length} {turmasDaSerie.length === 1 ? 'turma' : 'turmas'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {turmasDaSerie.map(renderCardTurma)}
              </div>
            </section>
          ))}

          {turmasSemSerie.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-800">Sem série definida</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {turmasSemSerie.length} {turmasSemSerie.length === 1 ? 'turma' : 'turmas'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {turmasSemSerie.map(renderCardTurma)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <TurmaModal
          turma={turmaEditando}
          onClose={() => setModalAberto(false)}
          onSalvar={handleSalvarTurma}
        />
      )}
    </div>
  );
}
