import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { turmaService, type Turma } from '../../../services/turmaService';
import { serieService, type Serie } from '../../../services/serieService';
import { anoLetivoService, type AnoLetivo } from '../../../services/anoLetivoService';
import { logger } from '../../../lib/logger';

interface TurmaModalProps {
  turma: Turma | null;
  onClose: () => void;
  onSalvar: () => void;
}

export default function TurmaModal({ turma, onClose, onSalvar }: TurmaModalProps) {
  const [nomeTurma, setNomeTurma] = useState('');
  const [serieId, setSerieId] = useState('');
  const [anoLetivoId, setAnoLetivoId] = useState('');
  const [turno, setTurno] = useState<'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL'>('MANHA');
  const [sala, setSala] = useState('');
  const [capacidadeMaxima, setCapacidadeMaxima] = useState('');
  
  const [series, setSeries] = useState<Serie[]>([]);
  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const isEdicao = !!turma;

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (turma) {
      setNomeTurma(turma.nome_turma);
      setSerieId(turma.serie_id);
      setAnoLetivoId(turma.ano_letivo_id);
      setTurno(turma.turno);
      setSala(turma.sala || '');
      setCapacidadeMaxima(turma.capacidade_maxima?.toString() || '');
    }
  }, [turma]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [dadosSeries, dadosAnos] = await Promise.all([
        serieService.listarSeries(),
        anoLetivoService.listarAnosLetivos()
      ]);
      
      setSeries(dadosSeries);
      setAnosLetivos(dadosAnos);
      
      // Se for criação, selecionar o ano letivo ativo automaticamente
      if (!turma) {
        const anoAtivo = dadosAnos.find(ano => ano.ativo);
        if (anoAtivo) {
          setAnoLetivoId(anoAtivo.ano_letivo_id);
        }
      }
    } catch (error: any) {
      logger.error('Erro ao carregar dados', 'page');
      alert('Erro ao carregar dados: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeTurma.trim()) {
      alert('Nome da turma é obrigatório');
      return;
    }

    if (!serieId) {
      alert('Série é obrigatória');
      return;
    }

    if (!anoLetivoId) {
      alert('Ano letivo é obrigatório');
      return;
    }

    try {
      setSalvando(true);

      const dados: any = {
        nome_turma: nomeTurma,
        serie_id: serieId,
        ano_letivo_id: anoLetivoId,
        turno: turno
      };

      if (sala.trim()) {
        dados.sala = sala;
      }

      if (capacidadeMaxima) {
        dados.capacidade_maxima = parseInt(capacidadeMaxima);
      }

      if (isEdicao) {
        await turmaService.atualizarTurma(turma!.turma_id, dados);
        logger.success('Turma atualizada com sucesso', 'page');
      } else {
        await turmaService.criarTurma(dados);
        logger.success('Turma criada com sucesso', 'page');
      }

      onSalvar();
    } catch (error: any) {
      logger.error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} turma`, 'page');
      alert(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} turma: ` + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdicao ? 'Editar Turma' : 'Nova Turma'}
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
            {/* Nome da Turma */}
            <div>
              <label htmlFor="nomeTurma" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Turma *
              </label>
              <input
                type="text"
                id="nomeTurma"
                value={nomeTurma}
                onChange={(e) => setNomeTurma(e.target.value)}
                placeholder="Ex: 6º ano A, 1º ano B..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={salvando}
                required
              />
            </div>

            {/* Série e Ano Letivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="serieId" className="block text-sm font-medium text-gray-700 mb-2">
                  Série *
                </label>
                <select
                  id="serieId"
                  value={serieId}
                  onChange={(e) => setSerieId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={salvando}
                  required
                >
                  <option value="">Selecione uma série</option>
                  {series.map((serie) => (
                    <option key={serie.serie_id} value={serie.serie_id}>
                      {serie.nome_serie}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="anoLetivoId" className="block text-sm font-medium text-gray-700 mb-2">
                  Ano Letivo *
                </label>
                <select
                  id="anoLetivoId"
                  value={anoLetivoId}
                  onChange={(e) => setAnoLetivoId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={salvando}
                  required
                >
                  <option value="">Selecione um ano</option>
                  {anosLetivos.map((ano) => (
                    <option key={ano.ano_letivo_id} value={ano.ano_letivo_id}>
                      {ano.ano} {ano.ativo && '(Ativo)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Turno */}
            <div>
              <label htmlFor="turno" className="block text-sm font-medium text-gray-700 mb-2">
                Turno *
              </label>
              <select
                id="turno"
                value={turno}
                onChange={(e) => setTurno(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={salvando}
                required
              >
                <option value="MANHA">Manhã</option>
                <option value="TARDE">Tarde</option>
                <option value="NOITE">Noite</option>
                <option value="INTEGRAL">Integral</option>
              </select>
            </div>

            {/* Sala e Capacidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sala" className="block text-sm font-medium text-gray-700 mb-2">
                  Sala
                </label>
                <input
                  type="text"
                  id="sala"
                  value={sala}
                  onChange={(e) => setSala(e.target.value)}
                  placeholder="Ex: Sala 101"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={salvando}
                />
              </div>

              <div>
                <label htmlFor="capacidadeMaxima" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidade Máxima
                </label>
                <input
                  type="number"
                  id="capacidadeMaxima"
                  value={capacidadeMaxima}
                  onChange={(e) => setCapacidadeMaxima(e.target.value)}
                  placeholder="Ex: 30"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={salvando}
                />
              </div>
            </div>
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
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

