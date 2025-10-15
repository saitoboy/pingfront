import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { disciplinaService, type Disciplina } from '../../../services/disciplinaService';
import { logger } from '../../../lib/logger';

interface DisciplinaModalProps {
  disciplina: Disciplina | null;
  onClose: () => void;
  onSalvar: () => void;
}

export default function DisciplinaModal({ disciplina, onClose, onSalvar }: DisciplinaModalProps) {
  const [nomeDisciplina, setNomeDisciplina] = useState('');
  const [salvando, setSalvando] = useState(false);
  const isEdicao = !!disciplina;

  useEffect(() => {
    if (disciplina) {
      setNomeDisciplina(disciplina.nome_disciplina);
    }
  }, [disciplina]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeDisciplina.trim()) {
      alert('Nome da disciplina é obrigatório');
      return;
    }

    try {
      setSalvando(true);

      if (isEdicao) {
        await disciplinaService.atualizarDisciplina(disciplina!.disciplina_id, { nome_disciplina: nomeDisciplina });
        logger.success('Disciplina atualizada com sucesso', 'page');
      } else {
        await disciplinaService.criarDisciplina({ nome_disciplina: nomeDisciplina });
        logger.success('Disciplina criada com sucesso', 'page');
      }

      onSalvar();
    } catch (error: any) {
      logger.error(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} disciplina`, 'page');
      alert(`Erro ao ${isEdicao ? 'atualizar' : 'criar'} disciplina: ` + (error.response?.data?.mensagem || error.message));
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
            {isEdicao ? 'Editar Disciplina' : 'Nova Disciplina'}
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
            <label htmlFor="nomeDisciplina" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Disciplina *
            </label>
            <input
              type="text"
              id="nomeDisciplina"
              value={nomeDisciplina}
              onChange={(e) => setNomeDisciplina(e.target.value)}
              placeholder="Ex: Matemática, Português, Música..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
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

