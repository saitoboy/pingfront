import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Loader2, CheckCircle, Circle } from 'lucide-react';
import { anoLetivoService, type AnoLetivo } from '../../../services/anoLetivoService';
import { logger } from '../../../lib/logger';
import AnoLetivoModal from '../modals/AnoLetivoModal';

export default function AnosLetivosTab() {
  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [anoLetivoEditando, setAnoLetivoEditando] = useState<AnoLetivo | null>(null);

  useEffect(() => {
    carregarAnosLetivos();
  }, []);

  const carregarAnosLetivos = async () => {
    try {
      setLoading(true);
      const dados = await anoLetivoService.listarAnosLetivos();
      // Ordenar por ano decrescente
      const dadosOrdenados = dados.sort((a, b) => b.ano - a.ano);
      setAnosLetivos(dadosOrdenados);
    } catch (error: any) {
      logger.error('Erro ao carregar anos letivos', 'service');
      alert('Erro ao carregar anos letivos: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNovoAnoLetivo = () => {
    setAnoLetivoEditando(null);
    setModalAberto(true);
  };

  const handleEditarAnoLetivo = (anoLetivo: AnoLetivo) => {
    setAnoLetivoEditando(anoLetivo);
    setModalAberto(true);
  };

  const handleDeletarAnoLetivo = async (anoLetivo: AnoLetivo) => {
    if (anoLetivo.ativo) {
      alert('Não é possível deletar o ano letivo ativo. Ative outro ano letivo primeiro.');
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar o ano letivo "${anoLetivo.ano}"?`)) {
      return;
    }

    try {
      await anoLetivoService.deletarAnoLetivo(anoLetivo.ano_letivo_id);
      logger.success('Ano letivo deletado com sucesso', 'service');
      await carregarAnosLetivos();
    } catch (error: any) {
      logger.error('Erro ao deletar ano letivo', 'service');
      alert('Erro ao deletar ano letivo: ' + (error.response?.data?.mensagem || error.message));
    }
  };

  const handleAtivarAnoLetivo = async (anoLetivo: AnoLetivo) => {
    if (anoLetivo.ativo) {
      return; // Já está ativo
    }

    if (!confirm(`Deseja ativar o ano letivo "${anoLetivo.ano}"? O ano letivo atual será desativado.`)) {
      return;
    }

    try {
      await anoLetivoService.ativarAnoLetivo(anoLetivo.ano_letivo_id);
      logger.success('Ano letivo ativado com sucesso', 'service');
      await carregarAnosLetivos();
    } catch (error: any) {
      logger.error('Erro ao ativar ano letivo', 'service');
      alert('Erro ao ativar ano letivo: ' + (error.response?.data?.mensagem || error.message));
    }
  };

  const handleSalvarAnoLetivo = async () => {
    setModalAberto(false);
    await carregarAnosLetivos();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando anos letivos...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header com botão adicionar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Anos Letivos
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie os anos letivos do sistema
          </p>
        </div>
        <button
          onClick={handleNovoAnoLetivo}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Ano Letivo
        </button>
      </div>

      {/* Lista de anos letivos */}
      {anosLetivos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Nenhum ano letivo cadastrado</p>
          <p className="text-gray-500 mt-2">Clique em "Novo Ano Letivo" para começar</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {anosLetivos.map((anoLetivo) => (
                <tr key={anoLetivo.ano_letivo_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{anoLetivo.ano}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {anoLetivo.ativo ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Ativo
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAtivarAnoLetivo(anoLetivo)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                        title="Clique para ativar"
                      >
                        <Circle className="w-4 h-4 mr-1" />
                        Inativo
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditarAnoLetivo(anoLetivo)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Editar ano letivo"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDeletarAnoLetivo(anoLetivo)}
                      className={`${
                        anoLetivo.ativo 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-900'
                      }`}
                      title={anoLetivo.ativo ? 'Não é possível deletar o ano ativo' : 'Deletar ano letivo'}
                      disabled={anoLetivo.ativo}
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
        <AnoLetivoModal
          anoLetivo={anoLetivoEditando}
          onClose={() => setModalAberto(false)}
          onSalvar={handleSalvarAnoLetivo}
        />
      )}
    </div>
  );
}

