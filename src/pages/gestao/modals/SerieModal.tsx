import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { serieService, type Serie } from '../../../services/serieService';
import { logger } from '../../../lib/logger';

interface SerieModalProps {
  serie: Serie | null;
  onClose: () => void;
  onSalvar: () => void;
}

export default function SerieModal({ serie, onClose, onSalvar }: SerieModalProps) {
  const [nomeSerie, setNomeSerie] = useState('');
  const [salvando, setSalvando] = useState(false);
  const isEdicao = !!serie;

  useEffect(() => {
    if (serie) {
      setNomeSerie(serie.nome_serie);
    }
  }, [serie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeSerie.trim()) {
      alert('Nome da série é obrigatório');
      return;
    }

    try {
      setSalvando(true);

      if (isEdicao) {
        await serieService.atualizarSerie(serie!.serie_id, { nome_serie: nomeSerie });
        logger.success('Série atualizada com sucesso', 'page');
      } else {
        await serieService.criarSerie({ nome_serie: nomeSerie });
        logger.success('Série criada com sucesso', 'page');
      }

      onSalvar();
    } catch (error: any) {
      logger.error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} série`, 'page');
      alert(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} série: ` + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdicao ? 'Editar Série' : 'Nova Série'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={salvando}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="nomeSerie" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Série *
            </label>
            <input
              type="text"
              id="nomeSerie"
              value={nomeSerie}
              onChange={(e) => setNomeSerie(e.target.value)}
              placeholder="Ex: 1º ano, 6º ano, Ensino Médio..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={salvando}
              required
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              disabled={salvando}
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

