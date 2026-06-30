import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  FileText,
  User,
  Calendar,
  Phone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Pencil,
  Save,
  CheckCircle,
  AlertCircle,
  X,
  Camera,
  Stethoscope,
  Eye as EyeIcon,
  Ear,
  Brain,
  Star,
  Activity,
  GraduationCap,
  Users,
  Plus,
  Trash2
} from 'lucide-react';
import { cadastroService } from '../../services/cadastroService';
import { logger } from '../../lib/logger';
import type { FichaCadastroResposta, Parentesco, AnoLetivo, Serie, Turma } from '../../types/api';
import { imprimirFicha } from './utils/fichaImpressao';

export default function ListarFichasPage() {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState<FichaCadastroResposta[]>([]);
  const [fichasFiltradas, setFichasFiltradas] = useState<FichaCadastroResposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fichaSelecionada, setFichaSelecionada] = useState<FichaCadastroResposta | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);

  // ──────────────────── EDIÇÃO ────────────────────
  const [mostrarEdicao, setMostrarEdicao] = useState(false);
  const [fichaEmEdicao, setFichaEmEdicao] = useState<FichaCadastroResposta | null>(null);
  const [editTab, setEditTab] = useState<'aluno' | 'responsaveis' | 'diagnostico' | 'matricula'>('aluno');
  const [editAluno, setEditAluno] = useState<Record<string, any>>({});
  const [editResponsaveis, setEditResponsaveis] = useState<Record<string, any>[]>([]);
  const [editDiagnostico, setEditDiagnostico] = useState<Record<string, any>>({});
  const [editMatricula, setEditMatricula] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  // Dropdowns para o modal de edição
  const [parentescos, setParentescos] = useState<Parentesco[]>([]);
  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoadingEditDropdowns, setIsLoadingEditDropdowns] = useState(false);
  const fichasPorPagina = 6;

  // Carregar fichas ao montar o componente
  useEffect(() => {
    carregarFichas();
    carregarDropdowns();
  }, []);

  const carregarDropdowns = async () => {
    try {
      setIsLoadingEditDropdowns(true);
      const dados = await cadastroService.carregarTodosDropdowns();
      setParentescos(dados.parentescos);
      setAnosLetivos(dados.anosLetivos);
      setSeries(dados.series);
      setTurmas(dados.turmas);
    } catch {
      // silencioso — dropdowns não bloqueiam a listagem
    } finally {
      setIsLoadingEditDropdowns(false);
    }
  };

  // Filtrar fichas quando o termo de busca mudar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFichasFiltradas(fichas);
      setPaginaAtual(1); // Resetar para primeira página ao limpar busca
      return;
    }

    const termo = searchTerm.toLowerCase();
    const filtradas = fichas.filter(ficha => {
      const nomeCompleto = `${ficha.aluno.nome_aluno} ${ficha.aluno.sobrenome_aluno}`.toLowerCase();
      const ra = ficha.matricula.ra?.toLowerCase() || '';
      const cpf = ficha.aluno.cpf_aluno?.toLowerCase() || '';
      
      return nomeCompleto.includes(termo) || 
             ra.includes(termo) || 
             cpf.includes(termo);
    });

    setFichasFiltradas(filtradas);
    setPaginaAtual(1); // Resetar para primeira página ao buscar
  }, [searchTerm, fichas]);

  const carregarFichas = async () => {
    try {
      setIsLoading(true);
      logger.info('📋 Carregando fichas de cadastro...');
      
      const resultado = await cadastroService.listarTodasFichas();
      
      if (resultado.status === 'sucesso' && resultado.dados) {
        setFichas(resultado.dados);
        setFichasFiltradas(resultado.dados);
        logger.success(`✅ ${resultado.dados.length} fichas carregadas`);
      } else {
        logger.error(`❌ Erro ao carregar fichas: ${resultado.mensagem}`);
        setFichas([]);
        setFichasFiltradas([]);
      }
    } catch (error) {
      logger.error('❌ Erro inesperado ao carregar fichas');
      console.error(error);
      setFichas([]);
      setFichasFiltradas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarData = (data: string | Date | null | undefined): string => {
    if (!data) return 'N/A';
    try {
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatarCPF = (cpf: string | null | undefined): string => {
    if (!cpf) return 'N/A';
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return cpf;
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (telefone: string | null | undefined): string => {
    if (!telefone) return 'N/A';
    const telLimpo = telefone.replace(/\D/g, '');
    if (telLimpo.length === 11) {
      return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telLimpo.length === 10) {
      return telLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  };

  const abrirDetalhes = (ficha: FichaCadastroResposta) => {
    setFichaSelecionada(ficha);
    setMostrarDetalhes(true);
  };

  const handleImprimir = (ficha?: FichaCadastroResposta) => {
    const fichaParaImprimir = ficha || fichaSelecionada;
    if (!fichaParaImprimir) return;
    imprimirFicha(fichaParaImprimir);
  };

  const dateToInput = (d: Date | string | null | undefined): string => {
    if (!d) return '';
    const dt = typeof d === 'string' ? new Date(d) : d;
    return isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0];
  };

  const TABS_EDICAO = [
    { id: 'aluno' as const, label: 'Dados Pessoais' },
    { id: 'responsaveis' as const, label: 'Responsáveis' },
    { id: 'diagnostico' as const, label: 'Diagnósticos' },
    { id: 'matricula' as const, label: 'Matrícula' },
  ];

  const formatarNomeTurmaEdit = (turma: Turma): string => {
    const serie = series.find(s => s.serie_id === turma.serie_id);
    const identificador = turma.nome_turma.trim().split(/\s+/).pop() || turma.nome_turma;
    const partes: string[] = [];
    if (serie?.nome_serie) partes.push(serie.nome_serie);
    partes.push(`Turma ${identificador}`);
    let texto = partes.join(' - ');
    texto += ` (${turma.turno})`;
    if (turma.sala) texto += ` - Sala ${turma.sala}`;
    return texto;
  };

  const turmasOrdenadas = [...turmas].sort((a, b) => {
    const serieA = series.find(s => s.serie_id === a.serie_id)?.nome_serie ?? '';
    const serieB = series.find(s => s.serie_id === b.serie_id)?.nome_serie ?? '';
    if (serieA !== serieB) return serieA.localeCompare(serieB, 'pt-BR', { numeric: true });
    return a.nome_turma.localeCompare(b.nome_turma, 'pt-BR', { numeric: true });
  });

  const iCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm';
  const lCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1';

  const abrirEdicao = (ficha: FichaCadastroResposta) => {
    setFichaEmEdicao(ficha);
    setEditAluno({ ...ficha.aluno });
    setEditResponsaveis(ficha.responsaveis?.map(r => ({ ...r })) || []);
    setEditDiagnostico(ficha.diagnostico ? { ...ficha.diagnostico } : {});
    setEditMatricula({ ...ficha.matricula });
    setEditTab('aluno');
    setSaveStatus(null);
    setMostrarEdicao(true);
  };

  const salvarEdicao = async () => {
    if (!fichaEmEdicao) return;
    setIsSaving(true);
    setSaveStatus(null);
    const falhas: string[] = [];

    const calls: Promise<void>[] = [
      cadastroService.atualizarAluno(fichaEmEdicao.aluno.aluno_id, editAluno)
        .then(r => { if (r.status === 'erro') falhas.push(`Aluno: ${r.mensagem}`); })
        .catch(e => falhas.push(`Aluno: ${e.message}`)),

      cadastroService.atualizarMatricula(fichaEmEdicao.matricula.matricula_aluno_id, editMatricula)
        .then(r => { if (r.status === 'erro') falhas.push(`Matrícula: ${r.mensagem}`); })
        .catch(e => falhas.push(`Matrícula: ${e.message}`)),
    ];

    editResponsaveis.forEach(resp => {
      if (resp.responsavel_id) {
        calls.push(
          cadastroService.atualizarResponsavel(resp.responsavel_id, resp)
            .then(r => { if (r.status === 'erro') falhas.push(`Responsável: ${r.mensagem}`); })
            .catch(e => falhas.push(`Responsável: ${e.message}`))
        );
      }
    });

    if (fichaEmEdicao.diagnostico?.diagnostico_id) {
      calls.push(
        cadastroService.atualizarDiagnostico(fichaEmEdicao.diagnostico.diagnostico_id, editDiagnostico)
          .then(r => { if (r.status === 'erro') falhas.push(`Diagnóstico: ${r.mensagem}`); })
          .catch(e => falhas.push(`Diagnóstico: ${e.message}`))
      );
    }

    await Promise.all(calls);

    if (falhas.length === 0) {
      setSaveStatus({ ok: true, msg: 'Salvo com sucesso!' });
      await carregarFichas();
      setTimeout(() => setMostrarEdicao(false), 800);
    } else {
      setSaveStatus({ ok: false, msg: falhas.join(' | ') });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando fichas de cadastro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          
          {/* Contador */}
          <div className="mt-4 text-sm text-gray-600">
            {fichasFiltradas.length === fichas.length ? (
              <span>Total: <strong>{fichas.length}</strong> fichas cadastradas</span>
            ) : (
              <span>
                Mostrando <strong>{fichasFiltradas.length}</strong> de <strong>{fichas.length}</strong> fichas
              </span>
            )}
          </div>

          <button
            onClick={() => navigate('/ficha-cadastro')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Nova Ficha
          </button>
        </div>

        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, RA ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

      </div>

      {/* Cálculo de paginação */}
      {(() => {
        const totalPaginas = Math.ceil(fichasFiltradas.length / fichasPorPagina);
        const indiceInicio = (paginaAtual - 1) * fichasPorPagina;
        const indiceFim = indiceInicio + fichasPorPagina;
        const fichasPaginaAtual = fichasFiltradas.slice(indiceInicio, indiceFim);

        return (
          <>
            {/* Lista de fichas */}
            {fichasFiltradas.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? 'Nenhuma ficha encontrada' : 'Nenhuma ficha cadastrada'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Tente buscar com outros termos' 
                    : 'Comece criando uma nova ficha de cadastro'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/ficha-cadastro')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Criar Primeira Ficha
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fichasPaginaAtual.map((ficha) => (
                    <div
                      key={ficha.matricula.matricula_aluno_id}
                      className="group bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 overflow-hidden transform"
                    >
                      {/* Header com gradiente */}
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Foto do aluno */}
                            {ficha.aluno.foto_aluno ? (
                              <img
                                src={ficha.aluno.foto_aluno}
                                alt={ficha.aluno.nome_aluno}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white/50 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                                {ficha.aluno.nome_aluno} {ficha.aluno.sobrenome_aluno}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold text-sm">
                                  RA: {ficha.matricula.ra || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImprimir(ficha);
                              }}
                              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-110"
                              title="Imprimir ficha"
                            >
                              <Printer className="w-5 h-5 text-white" />
                            </button>
                            <button
                              onClick={() => abrirDetalhes(ficha)}
                              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-110"
                              title="Ver detalhes"
                            >
                              <Eye className="w-5 h-5 text-white" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); abrirEdicao(ficha); }}
                              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-110"
                              title="Editar ficha"
                            >
                              <Pencil className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Corpo do card */}
                      <div className="p-6 space-y-4">
                        {/* Informações principais */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Data de Nascimento</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {formatarData(ficha.aluno.data_nascimento_aluno)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">CPF</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {formatarCPF(ficha.aluno.cpf_aluno)}
                              </p>
                            </div>
                          </div>

                          {ficha.responsaveis && ficha.responsaveis.length > 0 && (
                            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Phone className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 font-medium">Responsável</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {ficha.responsaveis[0].nome_responsavel} {ficha.responsaveis[0].sobrenome_responsavel}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status da matrícula */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                              ficha.matricula.status === 'ativo' 
                                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                                : ficha.matricula.status === 'transferido'
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                            }`}>
                              {ficha.matricula.status || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controles de Paginação */}
                {totalPaginas > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {/* Botão Anterior */}
                    <button
                      onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                      disabled={paginaAtual === 1}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => {
                        // Mostrar sempre primeira e última página
                        // Mostrar página atual e páginas adjacentes
                        // Mostrar "..." quando necessário
                        if (
                          pagina === 1 ||
                          pagina === totalPaginas ||
                          (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1)
                        ) {
                          return (
                            <button
                              key={pagina}
                              onClick={() => setPaginaAtual(pagina)}
                              className={`w-10 h-10 rounded-lg border transition-colors ${
                                pagina === paginaAtual
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pagina}
                            </button>
                          );
                        } else if (
                          pagina === paginaAtual - 2 ||
                          pagina === paginaAtual + 2
                        ) {
                          return (
                            <span key={pagina} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Botão Próximo */}
                    <button
                      onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                      disabled={paginaAtual === totalPaginas}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Informação da paginação */}
                <div className="mt-4 text-center text-sm text-gray-600">
                  Mostrando <strong>{indiceInicio + 1}</strong> a <strong>{Math.min(indiceFim, fichasFiltradas.length)}</strong> de <strong>{fichasFiltradas.length}</strong> fichas
                </div>
              </>
            )}
          </>
        );
      })()}


      {/* Modal de edição */}
      {mostrarEdicao && fichaEmEdicao && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !isSaving && setMostrarEdicao(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Editar Ficha</h2>
                <p className="text-indigo-100 text-sm">
                  {fichaEmEdicao.aluno.nome_aluno} {fichaEmEdicao.aluno.sobrenome_aluno} · RA: {fichaEmEdicao.matricula.ra}
                </p>
              </div>
              <button
                onClick={() => !isSaving && setMostrarEdicao(false)}
                disabled={isSaving}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-8 bg-white flex gap-1 overflow-x-auto flex-shrink-0">
              {TABS_EDICAO.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setEditTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    editTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conteúdo */}
            <div className="p-8 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a5b4fc #f3f4f6' }}>

              {/* ── Dados Pessoais ── */}
              {editTab === 'aluno' && (
                <div className="space-y-6">
                  {/* Foto */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="relative w-28 h-28 rounded-full border-4 border-indigo-200 overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors"
                      onClick={() => document.getElementById('edit-foto-input')?.click()}
                      title="Clique para trocar foto"
                    >
                      {editAluno.foto_aluno ? (
                        <img src={editAluno.foto_aluno} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400">
                          <Camera className="w-8 h-8" />
                          <span className="text-xs">Adicionar foto</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => document.getElementById('edit-foto-input')?.click()} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        {editAluno.foto_aluno ? 'Trocar foto' : 'Escolher foto'}
                      </button>
                      {editAluno.foto_aluno && (
                        <button type="button" onClick={() => setEditAluno(p => ({ ...p, foto_aluno: undefined }))} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                          <X className="w-3 h-3" /> Remover
                        </button>
                      )}
                    </div>
                    <input
                      id="edit-foto-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => setEditAluno(p => ({ ...p, foto_aluno: ev.target?.result as string }));
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p className="text-xs text-gray-400">Opcional — JPG, PNG ou GIF</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                      <input type="text" className={iCls} value={editAluno.nome_aluno || ''} maxLength={50}
                        onChange={e => {
                          const v = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
                          setEditAluno(p => ({ ...p, nome_aluno: v }));
                        }}
                        placeholder="Nome do aluno"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sobrenome *</label>
                      <input type="text" className={iCls} value={editAluno.sobrenome_aluno || ''} maxLength={80}
                        onChange={e => {
                          const v = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
                          setEditAluno(p => ({ ...p, sobrenome_aluno: v }));
                        }}
                        placeholder="Sobrenome do aluno"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
                      <input type="date" className={iCls} value={dateToInput(editAluno.data_nascimento_aluno)} max={new Date().toISOString().split('T')[0]}
                        onChange={e => setEditAluno(p => ({ ...p, data_nascimento_aluno: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
                      <input type="text" className={iCls} maxLength={14}
                        value={(() => { const c = (editAluno.cpf_aluno || '').replace(/\D/g, ''); return c.length === 11 ? c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : editAluno.cpf_aluno || ''; })()}
                        onChange={e => setEditAluno(p => ({ ...p, cpf_aluno: e.target.value.replace(/\D/g, '') }))}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Responsáveis ── */}
              {editTab === 'responsaveis' && (
                <div className="space-y-4">
                  {/* Tabs dos responsáveis */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editResponsaveis.map((_, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700">
                        Responsável {idx + 1}
                        {editResponsaveis.length > 1 && (
                          <button onClick={() => setEditResponsaveis(prev => prev.filter((_, i) => i !== idx))} className="ml-1 p-0.5 hover:bg-red-500 hover:text-white rounded transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setEditResponsaveis(prev => [...prev, { nome_responsavel: '', sobrenome_responsavel: '', telefone_responsavel: '', rg_responsavel: '', cpf_responsavel: '', grau_instrucao_responsavel: '', email_responsavel: '', parentesco_id: '' }])}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>

                  {editResponsaveis.map((resp, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-5">
                      <p className="text-sm font-semibold text-gray-700 mb-4">Responsável {idx + 1}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                          <input type="text" className={iCls} value={resp.nome_responsavel || ''} maxLength={50}
                            onChange={e => {
                              const v = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
                              setEditResponsaveis(prev => prev.map((r, i) => i === idx ? { ...r, nome_responsavel: v } : r));
                            }}
                            placeholder="Nome do responsável"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sobrenome *</label>
                          <input type="text" className={iCls} value={resp.sobrenome_responsavel || ''} maxLength={80}
                            onChange={e => {
                              const v = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
                              setEditResponsaveis(prev => prev.map((r, i) => i === idx ? { ...r, sobrenome_responsavel: v } : r));
                            }}
                            placeholder="Sobrenome do responsável"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
                          <input type="text" className={iCls} maxLength={14}
                            value={(() => { const c = (resp.cpf_responsavel || '').replace(/\D/g, ''); return c.length === 11 ? c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : resp.cpf_responsavel || ''; })()}
                            onChange={e => setEditResponsaveis(prev => prev.map((r, i) => i === idx ? { ...r, cpf_responsavel: e.target.value.replace(/\D/g, '') } : r))}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                          <input type="text" className={iCls} maxLength={15}
                            value={(() => { const t = (resp.telefone_responsavel || '').replace(/\D/g, ''); return t.length === 11 ? t.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : t.length === 10 ? t.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3') : resp.telefone_responsavel || ''; })()}
                            onChange={e => setEditResponsaveis(prev => prev.map((r, i) => i === idx ? { ...r, telefone_responsavel: e.target.value.replace(/\D/g, '') } : r))}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Parentesco *</label>
                          <select className={iCls} value={resp.parentesco_id || ''} disabled={isLoadingEditDropdowns}
                            onChange={e => setEditResponsaveis(prev => prev.map((r, i) => i === idx ? { ...r, parentesco_id: e.target.value } : r))}
                          >
                            <option value="">{isLoadingEditDropdowns ? 'Carregando...' : 'Selecione o parentesco...'}</option>
                            {parentescos.map(p => <option key={p.parentesco_id} value={p.parentesco_id}>{p.nome_parentesco}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {editResponsaveis.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum responsável cadastrado.</p>
                  )}
                </div>
              )}

              {/* ── Diagnósticos ── */}
              {editTab === 'diagnostico' && (
                <div className="grid gap-6">
                  {/* Deficiências Visuais */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <EyeIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Deficiências Visuais</h3>
                    </div>
                    <div className="grid gap-3">
                      {(['cegueira', 'Cegueira'], ['baixa_visao', 'Baixa Visão']).length > 0 && (
                        [['cegueira', 'Cegueira'], ['baixa_visao', 'Baixa Visão']] as [string, string][]
                      ).map(([field, label]) => (
                        <label key={field} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" checked={!!editDiagnostico[field]} onChange={e => setEditDiagnostico(p => ({ ...p, [field]: e.target.checked }))} />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Deficiências Auditivas */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Ear className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Deficiências Auditivas</h3>
                    </div>
                    <div className="grid gap-3">
                      {([['surdez', 'Surdez'], ['deficiencia_auditiva', 'Deficiência Auditiva'], ['surdocegueira', 'Surdocegueira'], ['alteracoes_processamento_auditivo', 'Alterações no Processamento Auditivo']] as [string, string][]).map(([field, label]) => (
                        <label key={field} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" checked={!!editDiagnostico[field]} onChange={e => setEditDiagnostico(p => ({ ...p, [field]: e.target.checked }))} />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Deficiências Físicas e Múltiplas */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Deficiências Físicas e Múltiplas</h3>
                    </div>
                    <div className="grid gap-3">
                      {([['deficiencia_fisica', 'Deficiência Física'], ['deficiencia_multipla', 'Deficiência Múltipla']] as [string, string][]).map(([field, label]) => (
                        <label key={field} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" checked={!!editDiagnostico[field]} onChange={e => setEditDiagnostico(p => ({ ...p, [field]: e.target.checked }))} />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Deficiências Intelectuais e Síndromes */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Deficiências Intelectuais e Síndromes</h3>
                    </div>
                    <div className="grid gap-3">
                      {([['deficiencia_intelectual', 'Deficiência Intelectual'], ['sindrome_down', 'Síndrome de Down']] as [string, string][]).map(([field, label]) => (
                        <label key={field} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" checked={!!editDiagnostico[field]} onChange={e => setEditDiagnostico(p => ({ ...p, [field]: e.target.checked }))} />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Transtornos e Condições Especiais */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Transtornos e Condições Especiais</h3>
                    </div>
                    <div className="grid gap-3">
                      {([['altas_habilidades', 'Altas Habilidades/Superdotação'], ['tea', 'TEA (Transtorno do Espectro Autista)'], ['tdah', 'TDAH (Transtorno do Déficit de Atenção com Hiperatividade)']] as [string, string][]).map(([field, label]) => (
                        <label key={field} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" checked={!!editDiagnostico[field]} onChange={e => setEditDiagnostico(p => ({ ...p, [field]: e.target.checked }))} />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Outros */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Stethoscope className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Outros Diagnósticos</h3>
                    </div>
                    <label htmlFor="edit-outros-diag" className="block text-sm font-medium text-gray-700 mb-2">Descreva outros diagnósticos não listados acima</label>
                    <textarea
                      id="edit-outros-diag"
                      rows={4}
                      maxLength={500}
                      className={`${iCls} resize-none`}
                      value={editDiagnostico.outros_diagnosticos || ''}
                      onChange={e => setEditDiagnostico(p => ({ ...p, outros_diagnosticos: e.target.value }))}
                      placeholder="Descreva outros diagnósticos, laudos médicos ou observações importantes..."
                    />
                    <div className="mt-1 text-xs text-gray-500">{(editDiagnostico.outros_diagnosticos || '').length}/500 caracteres</div>
                  </div>
                </div>
              )}

              {/* ── Matrícula ── */}
              {editTab === 'matricula' && (
                <div className="grid gap-6">
                  {/* Ano Letivo */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Ano Letivo</h3>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ano Letivo <span className="text-red-500">*</span></label>
                    {isLoadingEditDropdowns ? (
                      <div className="flex items-center gap-2 py-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" /><span className="text-sm text-gray-600">Carregando...</span></div>
                    ) : (
                      <select className={iCls} value={editMatricula.ano_letivo_id || ''} onChange={e => setEditMatricula(p => ({ ...p, ano_letivo_id: e.target.value }))}>
                        <option value="">Selecione o ano letivo</option>
                        {anosLetivos.map(a => <option key={a.ano_letivo_id} value={a.ano_letivo_id}>{a.ano}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Turma */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Turma</h3>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Turma <span className="text-red-500">*</span></label>
                    {isLoadingEditDropdowns ? (
                      <div className="flex items-center gap-2 py-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" /><span className="text-sm text-gray-600">Carregando...</span></div>
                    ) : (
                      <select className={iCls} value={editMatricula.turma_id || ''} onChange={e => setEditMatricula(p => ({ ...p, turma_id: e.target.value }))}>
                        <option value="">Selecione a turma</option>
                        {turmasOrdenadas.map(t => <option key={t.turma_id} value={t.turma_id}>{formatarNomeTurmaEdit(t)}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Data da Matrícula */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Data da Matrícula</h3>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data da Matrícula <span className="text-red-500">*</span></label>
                    <input type="date" className={iCls} value={dateToInput(editMatricula.data_matricula)} max={new Date().toISOString().split('T')[0]}
                      onChange={e => setEditMatricula(p => ({ ...p, data_matricula: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex-1">
                {saveStatus && (
                  <div className={`flex items-center gap-2 text-sm font-medium ${saveStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {saveStatus.ok ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <span>{saveStatus.msg}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarEdicao(false)}
                  disabled={isSaving}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarEdicao}
                  disabled={isSaving}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Salvando...' : 'Salvar Tudo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {mostrarDetalhes && fichaSelecionada && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setMostrarDetalhes(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do modal com gradiente */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between z-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {fichaSelecionada.aluno.nome_aluno} {fichaSelecionada.aluno.sobrenome_aluno}
                </h2>
                <p className="text-blue-100 text-sm">Detalhes completos da ficha de cadastro</p>
              </div>
              <button
                onClick={() => setMostrarDetalhes(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white hover:scale-110"
                title="Fechar"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div 
              className="p-8 space-y-6 overflow-y-auto flex-1 scrollbar-orange"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#fb923c #f3f4f6'
              }}
            >
              {/* Dados do Aluno */}
              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-4 mb-6">
                  {fichaSelecionada.aluno.foto_aluno ? (
                    <img
                      src={fichaSelecionada.aluno.foto_aluno}
                      alt={fichaSelecionada.aluno.nome_aluno}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="p-3 bg-blue-500 rounded-lg flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">Dados do Aluno</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nome Completo</label>
                    <p className="text-base font-semibold text-gray-900">{fichaSelecionada.aluno.nome_aluno} {fichaSelecionada.aluno.sobrenome_aluno}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">RA</label>
                    <p className="text-base font-semibold text-blue-600">{fichaSelecionada.matricula.ra || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Data de Nascimento</label>
                    <p className="text-base font-semibold text-gray-900">{formatarData(fichaSelecionada.aluno.data_nascimento_aluno)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">CPF</label>
                    <p className="text-base font-semibold text-gray-900">{formatarCPF(fichaSelecionada.aluno.cpf_aluno)}</p>
                  </div>
                </div>
              </section>

              {/* Certidão — exibe apenas se existir */}
              {fichaSelecionada.certidao && (
                <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Certidão de Nascimento</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Livro</label>
                      <p className="text-base font-semibold text-gray-900">{fichaSelecionada.certidao.livro_certidao || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Matrícula</label>
                      <p className="text-base font-semibold text-gray-900">{fichaSelecionada.certidao.matricula_certidao || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Termo</label>
                      <p className="text-base font-semibold text-gray-900">{fichaSelecionada.certidao.termo_certidao || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Folha</label>
                      <p className="text-base font-semibold text-gray-900">{fichaSelecionada.certidao.folha_certidao || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Data de Expedição</label>
                      <p className="text-base font-semibold text-gray-900">{formatarData(fichaSelecionada.certidao.data_expedicao_certidao)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Cartório</label>
                      <p className="text-base font-semibold text-gray-900">{fichaSelecionada.certidao.nome_cartorio_certidao || 'N/A'}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Responsáveis */}
              {fichaSelecionada.responsaveis && fichaSelecionada.responsaveis.length > 0 && (
                <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-500 rounded-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Responsáveis ({fichaSelecionada.responsaveis.length})</h3>
                  </div>
                  <div className="space-y-4">
                    {fichaSelecionada.responsaveis.map((responsavel, index) => (
                      <div key={index} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nome</label>
                            <p className="text-base font-semibold text-gray-900">{responsavel.nome_responsavel} {responsavel.sobrenome_responsavel}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">CPF</label>
                            <p className="text-base font-semibold text-gray-900">{formatarCPF(responsavel.cpf_responsavel)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Telefone</label>
                            <p className="text-base font-semibold text-gray-900">{formatarTelefone(responsavel.telefone_responsavel)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Matrícula */}
              <section className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-yellow-500 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Matrícula</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Data de Matrícula</label>
                    <p className="text-base font-semibold text-gray-900">{formatarData(fichaSelecionada.matricula.data_matricula)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Status</label>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                      fichaSelecionada.matricula.status === 'ativo' 
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                        : fichaSelecionada.matricula.status === 'transferido'
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    }`}>
                      {fichaSelecionada.matricula.status || 'N/A'}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer do modal */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-4 flex justify-between items-center">
              <button
                onClick={() => handleImprimir()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimir Ficha
              </button>
              <button
                onClick={() => setMostrarDetalhes(false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

