import { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, Loader2, Save, Sparkles, Check, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { disciplinaService, type Disciplina } from '../../../services/disciplinaService';
import { professorDisciplinaService } from '../../../services/professorDisciplinaService';
import { alocacaoProfessorService, type ProfessorDisponivel } from '../../../services/alocacaoProfessorService';
import { logger } from '../../../lib/logger';

export default function DisciplinasProfessorTab() {
  const [professores, setProfessores] = useState<ProfessorDisponivel[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professorSelecionado, setProfessorSelecionado] = useState('');
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [loadingHabilitacao, setLoadingHabilitacao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Pacote base em massa
  const [mostrarMassa, setMostrarMassa] = useState(false);
  const [massaSelecionados, setMassaSelecionados] = useState<Set<string>>(new Set());
  const [aplicandoMassa, setAplicandoMassa] = useState(false);
  // Professores que já têm o pacote base completo (não aparecem na lista em massa)
  const [professoresComBase, setProfessoresComBase] = useState<Set<string>>(new Set());

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (professorSelecionado) {
      carregarHabilitacao(professorSelecionado);
    } else {
      setSelecionadas(new Set());
    }
  }, [professorSelecionado]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [profResponse, disciplinasData, comBase] = await Promise.all([
        alocacaoProfessorService.buscarProfessores(),
        disciplinaService.listarDisciplinas(),
        professorDisciplinaService.listarProfessoresComPacoteBase()
      ]);
      setProfessores(profResponse.dados || []);
      setDisciplinas(disciplinasData);
      setProfessoresComBase(new Set(comBase));
    } catch (error: any) {
      logger.error('Erro ao carregar dados', 'service');
      alert('Erro ao carregar dados: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setLoading(false);
    }
  };

  const carregarHabilitacao = async (professor_id: string) => {
    try {
      setLoadingHabilitacao(true);
      const habilitadas = await professorDisciplinaService.listarDisciplinasDoProfessor(professor_id);
      setSelecionadas(new Set(habilitadas.map((d) => d.disciplina_id)));
    } catch (error: any) {
      logger.error('Erro ao carregar habilitação', 'service');
      alert('Erro ao carregar disciplinas do professor: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setLoadingHabilitacao(false);
    }
  };

  const disciplinasBase = disciplinas.filter((d) => d.categoria === 'base');
  const disciplinasEspeciais = disciplinas.filter((d) => d.categoria !== 'base');
  const idsBase = disciplinasBase.map((d) => d.disciplina_id);
  const todasBaseMarcadas = idsBase.length > 0 && idsBase.every((id) => selecionadas.has(id));

  const toggleDisciplina = (disciplina_id: string) => {
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(disciplina_id)) {
        novo.delete(disciplina_id);
      } else {
        novo.add(disciplina_id);
      }
      return novo;
    });
  };

  const togglePacoteBase = () => {
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (todasBaseMarcadas) {
        idsBase.forEach((id) => novo.delete(id));
      } else {
        idsBase.forEach((id) => novo.add(id));
      }
      return novo;
    });
  };

  const handleSalvar = async () => {
    if (!professorSelecionado) return;
    try {
      setSalvando(true);
      await professorDisciplinaService.definirDisciplinasDoProfessor(
        professorSelecionado,
        Array.from(selecionadas)
      );
      logger.success('Disciplinas do professor salvas', 'service');
      alert('✅ Disciplinas do professor atualizadas com sucesso!');
      // Salvar individualmente pode completar/desfazer o pacote base desse professor
      await recarregarStatusBase();
    } catch (error: any) {
      logger.error('Erro ao salvar habilitação', 'service');
      alert('Erro ao salvar: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setSalvando(false);
    }
  };

  // Professores que ainda NÃO têm o pacote base completo (só esses aparecem na lista em massa)
  const professoresSemBase = professores.filter((p) => !professoresComBase.has(p.professor_id));
  const todosMassaMarcados =
    professoresSemBase.length > 0 && professoresSemBase.every((p) => massaSelecionados.has(p.professor_id));

  const recarregarStatusBase = async () => {
    try {
      const comBase = await professorDisciplinaService.listarProfessoresComPacoteBase();
      setProfessoresComBase(new Set(comBase));
    } catch {
      // status é só visual; ignora erro silenciosamente
    }
  };

  const toggleMassaProfessor = (professor_id: string) => {
    setMassaSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(professor_id)) novo.delete(professor_id);
      else novo.add(professor_id);
      return novo;
    });
  };

  const toggleMassaTodos = () => {
    setMassaSelecionados(todosMassaMarcados ? new Set() : new Set(professoresSemBase.map((p) => p.professor_id)));
  };

  const handleAplicarMassa = async () => {
    if (massaSelecionados.size === 0) return;
    try {
      setAplicandoMassa(true);
      const ids = Array.from(massaSelecionados);
      const resultado = await professorDisciplinaService.aplicarPacoteBase(ids);
      logger.success('Pacote base aplicado em massa', 'service');
      alert(
        `✅ Pacote base aplicado a ${resultado.professores} professor(es)!\n` +
        `${resultado.vinculos_adicionados} novo(s) vínculo(s) criado(s) ` +
        `(os que já existiam foram mantidos).`
      );
      // Se o professor aberto recebeu o pacote, recarrega para refletir
      if (professorSelecionado && massaSelecionados.has(professorSelecionado)) {
        await carregarHabilitacao(professorSelecionado);
      }
      setMassaSelecionados(new Set());
      setMostrarMassa(false);
      // Atualiza quem já tem o pacote base (somem da lista em massa)
      await recarregarStatusBase();
    } catch (error: any) {
      logger.error('Erro ao aplicar pacote base em massa', 'service');
      alert('Erro ao aplicar pacote base: ' + (error.response?.data?.mensagem || error.message));
    } finally {
      setAplicandoMassa(false);
    }
  };

  const renderDisciplina = (disciplina: Disciplina) => {
    const marcada = selecionadas.has(disciplina.disciplina_id);
    return (
      <button
        key={disciplina.disciplina_id}
        type="button"
        onClick={() => toggleDisciplina(disciplina.disciplina_id)}
        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
          marcada
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div
          className={`flex items-center justify-center w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors ${
            marcada ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
          }`}
        >
          {marcada && <Check className="w-3.5 h-3.5" />}
        </div>
        <span className={`text-sm font-medium ${marcada ? 'text-blue-900' : 'text-gray-700'}`}>
          {disciplina.nome_disciplina}
        </span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
          Disciplinas do Professor
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Defina quais disciplinas cada professor pode lecionar. Essas disciplinas serão as
          opções disponíveis na hora de alocar o professor.
        </p>
      </div>

      {/* Pacote base em massa */}
      <div className="bg-green-50 border border-green-200 rounded-lg mb-6 overflow-hidden">
        <button
          onClick={() => setMostrarMassa((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-green-100/60 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-green-800">
            <Layers className="w-5 h-5" />
            Aplicar pacote base em massa
          </span>
          {mostrarMassa ? (
            <ChevronUp className="w-5 h-5 text-green-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-green-700" />
          )}
        </button>

        {mostrarMassa && (
          <div className="px-4 pb-4 border-t border-green-200">
            <p className="text-sm text-green-700 my-3">
              Marque os professores que dão as disciplinas base e adicione o pacote a todos de uma vez.
              As disciplinas que cada um já tem são mantidas. Professores que já têm o pacote base
              completo não aparecem aqui.
            </p>

            {professoresSemBase.length === 0 ? (
              <div className="flex items-center gap-2 py-6 justify-center text-sm text-green-700">
                <Check className="w-5 h-5" />
                Todos os professores já têm o pacote base aplicado.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={toggleMassaTodos}
                    className="text-xs font-medium text-green-700 hover:text-green-900 underline"
                  >
                    {todosMassaMarcados ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                  <span className="text-xs text-green-700">{massaSelecionados.size} selecionado(s)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {professoresSemBase.map((prof) => {
                    const marcado = massaSelecionados.has(prof.professor_id);
                    return (
                      <button
                        key={prof.professor_id}
                        type="button"
                        onClick={() => toggleMassaProfessor(prof.professor_id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all ${
                          marcado ? 'border-green-500 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-5 h-5 rounded-md border-2 flex-shrink-0 ${
                            marcado ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
                          }`}
                        >
                          {marcado && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate">{prof.nome_usuario}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAplicarMassa}
                    disabled={massaSelecionados.size === 0 || aplicandoMassa}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aplicandoMassa ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Aplicar pacote base
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Seleção do professor */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          Professor
        </label>
        <select
          value={professorSelecionado}
          onChange={(e) => setProfessorSelecionado(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione um professor...</option>
          {professores.map((prof) => (
            <option key={prof.professor_id} value={prof.professor_id}>
              {prof.nome_usuario} ({prof.email_usuario})
            </option>
          ))}
        </select>
      </div>

      {/* Conteúdo */}
      {!professorSelecionado ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Selecione um professor</p>
          <p className="text-gray-500 mt-2">Escolha um professor acima para definir as disciplinas que ele leciona</p>
        </div>
      ) : loadingHabilitacao ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando disciplinas do professor...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pacote base */}
          <section className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Disciplinas base</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  currículo padrão
                </span>
              </div>
              {disciplinasBase.length > 0 && (
                <button
                  onClick={togglePacoteBase}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {todasBaseMarcadas ? 'Desmarcar pacote base' : 'Marcar pacote base'}
                </button>
              )}
            </div>
            {disciplinasBase.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma disciplina base cadastrada.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {disciplinasBase.map(renderDisciplina)}
              </div>
            )}
          </section>

          {/* Especiais */}
          <section className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-800">Disciplinas especiais</h3>
            </div>
            {disciplinasEspeciais.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma disciplina especial cadastrada.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {disciplinasEspeciais.map(renderDisciplina)}
              </div>
            )}
          </section>

          {/* Rodapé com salvar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{selecionadas.size}</span> disciplina(s) selecionada(s)
            </p>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar disciplinas
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
