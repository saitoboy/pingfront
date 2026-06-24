import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, Plus, Trash2, RefreshCw, TrendingUp, Award, School } from 'lucide-react';
import { logger } from '../../lib/logger';
import { alocacaoProfessorService } from '../../services/alocacaoProfessorService';
import { cadastroService } from '../../services/cadastroService';
import AlocarProfessorModal from './AlocarProfessorModal';
import type { 
  AlocacaoProfessor, 
  ProfessorDisponivel, 
  DisciplinaDisponivel, 
  TurmaDisponivel,
  EstatisticasAlocacao 
} from '../../services/alocacaoProfessorService';
import type { AnoLetivo } from '../../types/api';

export default function AlocacaoProfessorPage() {
  // Estados principais
  const [anoLetivoAtivo, setAnoLetivoAtivo] = useState<AnoLetivo | null>(null);
  const [alocacoes, setAlocacoes] = useState<AlocacaoProfessor[]>([]);
  const [professores, setProfessores] = useState<ProfessorDisponivel[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaDisponivel[]>([]);
  const [turmas, setTurmas] = useState<TurmaDisponivel[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasAlocacao | null>(null);

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Carregar dados iniciais ao montar
  useEffect(() => {
    carregarAnoLetivoAtivo();
  }, []);

  // Carregar dados quando ano ativo for definido
  useEffect(() => {
    if (anoLetivoAtivo) {
      carregarDadosCompletos();
    }
  }, [anoLetivoAtivo]);

  const carregarAnoLetivoAtivo = async () => {
    try {
      setLoadingInicial(true);
      logger.info('📅 Carregando ano letivo ativo');
      const response = await cadastroService.getAnosLetivos();
      
      if (response.status === 'sucesso' && response.dados) {
        // Buscar o ano ativo automaticamente
        const anoAtivo = response.dados.find((ano: AnoLetivo) => ano.ativo);
        
        if (anoAtivo) {
          setAnoLetivoAtivo(anoAtivo);
          logger.success(`✅ Ano letivo ativo: ${anoAtivo.ano}`, 'service');
        } else {
          logger.info('⚠️ Nenhum ano letivo ativo encontrado');
          alert('Nenhum ano letivo ativo encontrado. Configure um ano letivo ativo para usar esta funcionalidade.');
        }
      }
    } catch (error) {
      logger.error('Erro ao carregar ano letivo ativo', 'service', error);
      alert('Erro ao carregar ano letivo. Por favor, recarregue a página.');
    } finally {
      setLoadingInicial(false);
    }
  };

  const carregarDadosCompletos = async () => {
    await Promise.all([
      carregarDadosAuxiliares(),
      carregarAlocacoes(),
      carregarTurmas(),
      carregarEstatisticas()
    ]);
  };

  const carregarDadosAuxiliares = async () => {
    try {
      logger.info('📚 Carregando dados auxiliares');
      
      const [profResponse, discResponse] = await Promise.all([
        alocacaoProfessorService.buscarProfessores(),
        alocacaoProfessorService.buscarDisciplinas()
      ]);

      if (profResponse.dados) setProfessores(profResponse.dados);
      if (discResponse.dados) setDisciplinas(discResponse.dados);
    } catch (error) {
      logger.error('Erro ao carregar dados auxiliares', 'service', error);
    }
  };

  const carregarAlocacoes = async () => {
    if (!anoLetivoAtivo) return;

    setLoading(true);
    try {
      logger.info(`🔍 Carregando alocações do ano: ${anoLetivoAtivo.ano}`);
      const response = await alocacaoProfessorService.listarPorAnoLetivo(anoLetivoAtivo.ano_letivo_id);
      
      if (response.dados) {
        setAlocacoes(response.dados);
        logger.success(`✅ ${response.dados.length} alocações carregadas`);
      }
    } catch (error) {
      logger.error('Erro ao carregar alocações', 'service', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarTurmas = async () => {
    if (!anoLetivoAtivo) return;

    try {
      const response = await alocacaoProfessorService.buscarTurmas(anoLetivoAtivo.ano_letivo_id);
      if (response.dados) setTurmas(response.dados);
    } catch (error) {
      logger.error('Erro ao carregar turmas', 'service', error);
    }
  };

  const carregarEstatisticas = async () => {
    if (!anoLetivoAtivo) return;

    try {
      const response = await alocacaoProfessorService.obterEstatisticas(anoLetivoAtivo.ano_letivo_id);
      if (response.dados) setEstatisticas(response.dados);
    } catch (error) {
      logger.error('Erro ao carregar estatísticas', 'service', error);
    }
  };

  const handleCriarAlocacoes = async (novasAlocacoes: Array<{ turma_id: string; disciplina_id: string; professor_id: string }>) => {
    setLoading(true);
    try {
      logger.info(`📝 Criando ${novasAlocacoes.length} alocações`);
      const response = await alocacaoProfessorService.criarAlocacoes(novasAlocacoes);
      
      if (response.status === 'sucesso') {
        logger.success('✅ Alocações criadas com sucesso');
        setModalAberto(false);
        await carregarAlocacoes();
        await carregarEstatisticas();
      }
    } catch (error: any) {
      logger.error('Erro ao criar alocações', 'service', error);
      throw error; // Propaga para o modal exibir o erro inline
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverAlocacao = async (alocacaoId: string) => {
    if (!confirm('Tem certeza que deseja remover esta alocação?')) return;

    setLoading(true);
    try {
      await alocacaoProfessorService.removerAlocacao(alocacaoId);
      logger.success('✅ Alocação removida');
      await carregarAlocacoes();
      await carregarEstatisticas();
    } catch (error: any) {
      logger.error('Erro ao remover alocação', 'service', error);
      alert(error.response?.data?.mensagem || 'Erro ao remover alocação');
    } finally {
      setLoading(false);
    }
  };

  // Nome de turma legível: dado vem redundante (serie "2º Ano" + turma "2 ano B").
  // Extrai só o identificador (ex.: "B") e monta "2º Ano · Turma B".
  const formatarTurma = (nomeSerie: string, nomeTurma: string) => {
    const letra = nomeTurma.trim().split(/\s+/).pop() || '';
    return letra.length <= 2 ? `${nomeSerie} · Turma ${letra.toUpperCase()}` : nomeTurma;
  };

  // Agrupar por professor
  const alocacoesPorProfessor = alocacoes.reduce((acc, alocacao) => {
    const key = alocacao.professor_id;
    if (!acc[key]) {
      acc[key] = {
        professor_id: alocacao.professor_id,
        nome_professor: alocacao.nome_professor || 'Professor Desconhecido',
        email_professor: alocacao.email_professor || '',
        alocacoes: []
      };
    }
    acc[key].alocacoes.push(alocacao);
    return acc;
  }, {} as Record<string, { professor_id: string; nome_professor: string; email_professor: string; alocacoes: AlocacaoProfessor[] }>);

  const professoresComAlocacoes = Object.values(alocacoesPorProfessor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner do Ano Letivo Ativo */}
        {anoLetivoAtivo && (
          <div className="bg-blue-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-medium">Gerenciando Ano Letivo</p>
                  <h2 className="text-3xl font-bold">{anoLetivoAtivo.ano}</h2>
                  <p className="text-sm text-blue-100 mt-1">
                    {new Date(anoLetivoAtivo.data_inicio).toLocaleDateString('pt-BR')} até {new Date(anoLetivoAtivo.data_fim).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

{/* Estatísticas */}
        {estatisticas && anoLetivoAtivo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Alocações</p>
                  <p className="text-3xl font-bold mt-1">{estatisticas.total_alocacoes}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Professores Alocados</p>
                  <p className="text-3xl font-bold mt-1">{estatisticas.total_professores}</p>
                </div>
                <Users className="w-12 h-12 text-purple-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Disciplinas</p>
                  <p className="text-3xl font-bold mt-1">{estatisticas.total_disciplinas}</p>
                </div>
                <BookOpen className="w-12 h-12 text-orange-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Turmas</p>
                  <p className="text-3xl font-bold mt-1">{estatisticas.total_turmas}</p>
                </div>
                <School className="w-12 h-12 text-green-200 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Barra de ações */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 mb-6">
          
          <button
            onClick={() => setModalAberto(true)}
            disabled={!anoLetivoAtivo || loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Alocação
          </button>
        </div>

        {/* Lista de Alocações por Professor */}
        {loadingInicial ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando ano letivo ativo...</p>
          </div>
        ) : !anoLetivoAtivo ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum Ano Letivo Ativo</h3>
            <p className="text-gray-600">Configure um ano letivo ativo para usar esta funcionalidade</p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando alocações...</p>
          </div>
        ) : professoresComAlocacoes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma Alocação Encontrada</h3>
            <p className="text-gray-600 mb-6">Clique em "Nova Alocação" para começar a vincular professores</p>
            <button
              onClick={() => setModalAberto(true)}
              className="px-6 py-3 bg-blue-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeira Alocação
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {professoresComAlocacoes.map((prof) => {
              // Agrupar alocações do professor por turma (evita repetir turma/sala em cada card)
              const turmasMap = prof.alocacoes.reduce((acc, a) => {
                if (!acc[a.turma_id]) {
                  acc[a.turma_id] = {
                    turma_id: a.turma_id,
                    nome_serie: a.nome_serie,
                    nome_turma: a.nome_turma,
                    turno: a.turno,
                    sala: a.sala,
                    disciplinas: [] as AlocacaoProfessor[]
                  };
                }
                acc[a.turma_id].disciplinas.push(a);
                return acc;
              }, {} as Record<string, { turma_id: string; nome_serie: string; nome_turma: string; turno: string; sala: string; disciplinas: AlocacaoProfessor[] }>);
              const turmasDoProfessor = Object.values(turmasMap);
              const iniciais = prof.nome_professor.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();

              return (
                <div key={prof.professor_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header do Professor */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{iniciais}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">{prof.nome_professor}</h3>
                      <p className="text-gray-500 text-xs truncate">{prof.email_professor}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex-shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="font-semibold text-sm">{prof.alocacoes.length}</span>
                    </div>
                  </div>

                  {/* Turmas do professor */}
                  <div className="p-4 space-y-3">
                    {turmasDoProfessor.map((turma) => (
                      <div key={turma.turma_id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Cabeçalho da turma (uma vez só) */}
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                          <School className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="font-semibold text-gray-800 text-sm">
                            {formatarTurma(turma.nome_serie, turma.nome_turma)}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto capitalize">
                            {turma.turno} • Sala {turma.sala}
                          </span>
                        </div>
                        {/* Disciplinas como chips */}
                        <div className="flex flex-wrap gap-2 p-3">
                          {turma.disciplinas.map((alocacao) => (
                            <div
                              key={alocacao.turma_disciplina_professor_id}
                              className="group flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-900 pl-3 pr-1.5 py-1.5 rounded-lg text-sm"
                            >
                              <span className="font-medium">{alocacao.nome_disciplina}</span>
                              <button
                                onClick={() => handleRemoverAlocacao(alocacao.turma_disciplina_professor_id)}
                                className="w-6 h-6 flex items-center justify-center rounded-md text-orange-400 hover:bg-red-100 hover:text-red-600 transition-all"
                                disabled={loading}
                                title="Remover alocação"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Alocação */}
      <AlocarProfessorModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onConfirm={handleCriarAlocacoes}
        professores={professores}
        disciplinas={disciplinas}
        turmas={turmas}
        loading={loading}
      />
    </div>
  );
}

