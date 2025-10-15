import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, Loader2, Filter } from 'lucide-react';
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
    const turnos: any = {
      'MANHA': 'Manhã',
      'TARDE': 'Tarde',
      'NOITE': 'Noite',
      'INTEGRAL': 'Integral'
    };
    return turnos[turno] || turno;
  };

  const getTurnoColor = (turno: string) => {
    const cores: any = {
      'MANHA': 'bg-yellow-100 text-yellow-800',
      'TARDE': 'bg-orange-100 text-orange-800',
      'NOITE': 'bg-blue-100 text-blue-800',
      'INTEGRAL': 'bg-blue-100 text-blue-800'
    };
    return cores[turno] || 'bg-gray-100 text-gray-800';
  };

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
      {/* Header com botão adicionar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Turmas
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie as turmas da escola
          </p>
        </div>
        <button
          onClick={handleNovaTurma}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              {series.map((serie) => (
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
              <option value="MANHA">Manhã</option>
              <option value="TARDE">Tarde</option>
              <option value="NOITE">Noite</option>
              <option value="INTEGRAL">Integral</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de turmas */}
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Série
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sala
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacidade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {turmasFiltradas.map((turma) => (
                <tr key={turma.turma_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{turma.nome_turma}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{turma.nome_serie || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTurnoColor(turma.turno)}`}>
                      {getTurnoLabel(turma.turno)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{turma.sala || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{turma.capacidade_maxima ? `${turma.capacidade_maxima} alunos` : '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditarTurma(turma)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Editar turma"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDeletarTurma(turma)}
                      className="text-red-600 hover:text-red-900"
                      title="Deletar turma"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

