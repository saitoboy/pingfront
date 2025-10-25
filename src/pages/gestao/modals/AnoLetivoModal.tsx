import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { anoLetivoService, type AnoLetivo } from '../../../services/anoLetivoService';
import { logger } from '../../../lib/logger';

interface AnoLetivoModalProps {
  anoLetivo: AnoLetivo | null;
  onClose: () => void;
  onSalvar: () => void;
}

export default function AnoLetivoModal({ anoLetivo, onClose, onSalvar }: AnoLetivoModalProps) {
  const [ano, setAno] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [ativo, setAtivo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const isEdicao = !!anoLetivo;

  useEffect(() => {
    if (anoLetivo) {
      setAno(anoLetivo.ano.toString());
      // Converter data_inicio e data_fim para formato YYYY-MM-DD se existirem
      if ((anoLetivo as any).data_inicio) {
        const dataInicioStr = (anoLetivo as any).data_inicio.split('T')[0];
        setDataInicio(dataInicioStr);
      }
      if ((anoLetivo as any).data_fim) {
        const dataFimStr = (anoLetivo as any).data_fim.split('T')[0];
        setDataFim(dataFimStr);
      }
      setAtivo(anoLetivo.ativo);
    } else {
      // Ao criar, sugere o próximo ano e datas padrão
      const anoAtual = new Date().getFullYear();
      setAno(anoAtual.toString());
      setDataInicio(`${anoAtual}-02-01`); // 1º de fevereiro
      setDataFim(`${anoAtual}-12-20`); // 20 de dezembro
      setAtivo(false);
    }
  }, [anoLetivo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const anoNumero = parseInt(ano);

    if (!ano.trim() || isNaN(anoNumero)) {
      alert('Ano é obrigatório e deve ser um número válido');
      return;
    }

    if (anoNumero < 1900 || anoNumero > 2100) {
      alert('Ano deve estar entre 1900 e 2100');
      return;
    }

    if (!dataInicio) {
      alert('Data de início é obrigatória');
      return;
    }

    if (!dataFim) {
      alert('Data de fim é obrigatória');
      return;
    }

    // Validar que data fim é posterior à data início
    if (new Date(dataFim) <= new Date(dataInicio)) {
      alert('Data de fim deve ser posterior à data de início');
      return;
    }

    try {
      setSalvando(true);

      const dados = {
        ano: anoNumero,
        data_inicio: dataInicio,
        data_fim: dataFim,
        ativo: ativo
      };

      if (isEdicao) {
        await anoLetivoService.atualizarAnoLetivo(anoLetivo!.ano_letivo_id, dados);
        logger.success('Ano letivo atualizado com sucesso', 'service');
      } else {
        await anoLetivoService.criarAnoLetivo(dados);
        logger.success('Ano letivo criado com sucesso', 'service');
      }

      onSalvar();
    } catch (error: any) {
      logger.error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} ano letivo`, 'service');
      alert(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} ano letivo: ` + (error.response?.data?.mensagem || error.message));
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
            {isEdicao ? 'Editar Ano Letivo' : 'Novo Ano Letivo'}
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
          <div className="space-y-4">
            {/* Ano */}
            <div>
              <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-2">
                Ano *
              </label>
              <input
                type="number"
                id="ano"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ex: 2024"
                min="1900"
                max="2100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={salvando}
                required
              />
            </div>

            {/* Data Início */}
            <div>
              <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                id="dataInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={salvando}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Data de início do ano letivo
              </p>
            </div>

            {/* Data Fim */}
            <div>
              <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-2">
                Data de Fim *
              </label>
              <input
                type="date"
                id="dataFim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={salvando}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Data de término do ano letivo
              </p>
            </div>

            {/* Ativo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                disabled={salvando}
              />
              <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                Marcar como ano letivo ativo
              </label>
            </div>

            {ativo && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  ⚠️ Ao marcar como ativo, todos os outros anos letivos serão automaticamente desativados.
                </p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-6">
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
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
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

