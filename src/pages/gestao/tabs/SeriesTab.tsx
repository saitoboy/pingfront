import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, Loader2 } from 'lucide-react';
import { serieService, type Serie } from '../../../services/serieService';
import { logger } from '../../../lib/logger';
import SerieModal from '../modals/SerieModal';

export default function SeriesTab() {
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [serieEditando, setSerieEditando] = useState<Serie | null>(null);

  useEffect(() => {
    carregarSeries();
  }, []);

  const carregarSeries = async () => {
    try {
      setLoading(true);
      const dados = await serieService.listarSeries();
      setSeries(dados);
    } catch (error: any) {
      logger.error('Erro ao carregar séries', 'page');
      alert('Erro ao carregar séries: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNovaSerie = () => {
    setSerieEditando(null);
    setModalAberto(true);
  };

  const handleEditarSerie = (serie: Serie) => {
    setSerieEditando(serie);
    setModalAberto(true);
  };

  const handleDeletarSerie = async (serie: Serie) => {
    if (!confirm(`Tem certeza que deseja deletar a série "${serie.nome_serie}"?`)) {
      return;
    }

    try {
      await serieService.deletarSerie(serie.serie_id);
      logger.success('Série deletada com sucesso', 'page');
      await carregarSeries();
    } catch (error: any) {
      logger.error('Erro ao deletar série', 'page');
      alert('Erro ao deletar série: ' + (error.response?.data?.mensagem || error.message));
    }
  };

  const handleSalvarSerie = async () => {
    setModalAberto(false);
    await carregarSeries();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando séries...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header com botão adicionar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            Séries Escolares
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie as séries/anos escolares disponíveis
          </p>
        </div>
        <button
          onClick={handleNovaSerie}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Série
        </button>
      </div>

      {/* Lista de séries */}
      {series.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Nenhuma série cadastrada</p>
          <p className="text-gray-500 mt-2">Clique em "Nova Série" para começar</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Série
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {series.map((serie) => (
                <tr key={serie.serie_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GraduationCap className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{serie.nome_serie}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{serie.serie_id.substring(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditarSerie(serie)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Editar série"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDeletarSerie(serie)}
                      className="text-red-600 hover:text-red-900"
                      title="Deletar série"
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
        <SerieModal
          serie={serieEditando}
          onClose={() => setModalAberto(false)}
          onSalvar={handleSalvarSerie}
        />
      )}
    </div>
  );
}

