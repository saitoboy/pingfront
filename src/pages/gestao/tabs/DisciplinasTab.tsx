import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { disciplinaService, type Disciplina } from '../../../services/disciplinaService';
import { logger } from '../../../lib/logger';
import DisciplinaModal from '../modals/DisciplinaModal';

export default function DisciplinasTab() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [disciplinaEditando, setDisciplinaEditando] = useState<Disciplina | null>(null);

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  const carregarDisciplinas = async () => {
    try {
      setLoading(true);
      const dados = await disciplinaService.listarDisciplinas();
      setDisciplinas(dados);
    } catch (error: any) {
      logger.error('Erro ao carregar disciplinas', 'service');
      alert('Erro ao carregar disciplinas: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNovaDisciplina = () => {
    setDisciplinaEditando(null);
    setModalAberto(true);
  };

  const handleEditarDisciplina = (disciplina: Disciplina) => {
    setDisciplinaEditando(disciplina);
    setModalAberto(true);
  };

  const handleDeletarDisciplina = async (disciplina: Disciplina) => {
    if (!confirm(`Tem certeza que deseja deletar a disciplina "${disciplina.nome_disciplina}"?`)) {
      return;
    }

    try {
      await disciplinaService.deletarDisciplina(disciplina.disciplina_id);
      logger.success('Disciplina deletada com sucesso', 'service');
      await carregarDisciplinas();
    } catch (error: any) {
      logger.error('Erro ao deletar disciplina', 'service');
      alert('Erro ao deletar disciplina: ' + (error.response?.data?.mensagem || error.message));
    }
  };

  const handleSalvarDisciplina = async () => {
    setModalAberto(false);
    await carregarDisciplinas();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando disciplinas...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header com botão adicionar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Disciplinas
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie as disciplinas oferecidas pela escola
          </p>
        </div>
        <button
          onClick={handleNovaDisciplina}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Disciplina
        </button>
      </div>

      {/* Lista de disciplinas */}
      {disciplinas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Nenhuma disciplina cadastrada</p>
          <p className="text-gray-500 mt-2">Clique em "Nova Disciplina" para começar</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disciplina
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
              {disciplinas.map((disciplina) => (
                <tr key={disciplina.disciplina_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{disciplina.nome_disciplina}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{disciplina.disciplina_id.substring(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditarDisciplina(disciplina)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Editar disciplina"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDeletarDisciplina(disciplina)}
                      className="text-red-600 hover:text-red-900"
                      title="Deletar disciplina"
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
        <DisciplinaModal
          disciplina={disciplinaEditando}
          onClose={() => setModalAberto(false)}
          onSalvar={handleSalvarDisciplina}
        />
      )}
    </div>
  );
}

