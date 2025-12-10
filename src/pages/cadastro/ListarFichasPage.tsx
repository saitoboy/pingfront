import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  FileText, 
  User, 
  Calendar,
  Phone,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Printer
} from 'lucide-react';
import { cadastroService } from '../../services/cadastroService';
import { logger } from '../../lib/logger';
import type { FichaCadastroResposta } from '../../types/api';
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
  const fichasPorPagina = 6;

  // Carregar fichas ao montar o componente
  useEffect(() => {
    carregarFichas();
  }, []);

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
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                              {ficha.aluno.nome_aluno} {ficha.aluno.sobrenome_aluno}
                            </h3>
                            <div className="flex items-center gap-2 backdrop-blur-sm rounded-lg px-3 py-1.5">
                              <User className="w-4 h-4 text-white" />
                              <span className="text-white font-semibold text-sm">
                                RA: {ficha.matricula.ra || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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

                          <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <MapPin className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Endereço</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {ficha.aluno.endereco_aluno || 'N/A'}
                              </p>
                            </div>
                          </div>
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
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
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">RG</label>
                    <p className="text-base font-semibold text-gray-900">{fichaSelecionada.aluno.rg_aluno || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Naturalidade</label>
                    <p className="text-base font-semibold text-gray-900">{fichaSelecionada.aluno.naturalidade_aluno || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Endereço</label>
                    <p className="text-base font-semibold text-gray-900">{fichaSelecionada.aluno.endereco_aluno || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Bairro</label>
                    <p className="text-base font-semibold text-gray-900">{fichaSelecionada.aluno.bairro_aluno || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">CEP</label>
                    <p className="text-base font-semibold text-gray-900">{fichaSelecionada.aluno.cep_aluno || 'N/A'}</p>
                  </div>
                </div>
              </section>

              {/* Certidão */}
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
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">RG</label>
                            <p className="text-base font-semibold text-gray-900">{responsavel.rg_responsavel || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Telefone</label>
                            <p className="text-base font-semibold text-gray-900">{formatarTelefone(responsavel.telefone_responsavel)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Email</label>
                            <p className="text-base font-semibold text-gray-900 break-all">{responsavel.email_responsavel || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Grau de Instrução</label>
                            <p className="text-base font-semibold text-gray-900">{responsavel.grau_instrucao_responsavel || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Dados de Saúde */}
              {fichaSelecionada.dados_saude && (
                <section className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-500 rounded-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Dados de Saúde</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Vacinas em Dia</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        fichaSelecionada.dados_saude.vacinas_em_dia 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {fichaSelecionada.dados_saude.vacinas_em_dia ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    {fichaSelecionada.dados_saude.alergias && (
                      <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Alergias</label>
                        <p className="text-base font-semibold text-gray-900">{fichaSelecionada.dados_saude.alergias}</p>
                      </div>
                    )}
                    {fichaSelecionada.dados_saude.observacoes && (
                      <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Observações</label>
                        <p className="text-base font-semibold text-gray-900 whitespace-pre-wrap">{fichaSelecionada.dados_saude.observacoes}</p>
                      </div>
                    )}
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

