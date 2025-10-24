import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Star,
  Users,
  Plus,
  Save,
  X,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { logger } from '../../lib/logger'
import NotaService, { type AlunoNota } from '../../services/notaService'
import atividadeService, { type Atividade } from '../../services/atividadeService'

interface LancarNotasPageProps {
  atividade: Atividade
  turma: {
    turma_id: string
    nome_turma: string
    turno: string
    sala: string
    nome_serie: string
    ano: number
  }
  disciplina: {
    disciplina_id: string
    nome_disciplina: string
  }
  onVoltar?: () => void
}

interface NotaExistente {
  nota_id: string
  matricula_aluno_id: string
  valor: number
  nome_aluno: string
  sobrenome_aluno: string
  ra: string
  created_at: string
}

// Componente principal que busca os dados
export default function LancarNotasPageWrapper() {
  const { atividadeId } = useParams<{ atividadeId: string }>()
  const navigate = useNavigate()
  
  const [atividade, setAtividade] = useState<Atividade | null>(null)
  const [turma, setTurma] = useState<any>(null)
  const [disciplina, setDisciplina] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (atividadeId) {
      carregarDados()
    }
  }, [atividadeId])

  const carregarDados = async () => {
    try {
      setLoading(true)
      logger.info(`📊 Carregando dados para atividade: ${atividadeId}`, 'component')
      
      // Buscar dados da atividade
      const atividadeResponse = await atividadeService.buscarAtividadePorId(atividadeId || '')
      
      // Log detalhado da resposta
      logger.info('📊 Resposta da API:', 'component', atividadeResponse)
      console.log('📊 Resposta completa:', atividadeResponse)
      
      if (atividadeResponse.sucesso && atividadeResponse.dados) {
        const atividade = Array.isArray(atividadeResponse.dados) 
          ? atividadeResponse.dados[0] 
          : atividadeResponse.dados
        
        logger.info('📊 Dados da atividade:', 'component', atividade)
        console.log('📊 Atividade encontrada:', atividade)
        
        setAtividade(atividade)
        
        // Configurar dados simulados da turma e disciplina
        setTurma({
          turma_id: 'temp-turma-id',
          nome_turma: 'Turma A',
          turno: 'Manhã',
          sala: 'Sala 101',
          nome_serie: '1º Ano',
          ano: 2025
        })
        
        setDisciplina({
          disciplina_id: 'temp-disciplina-id',
          nome_disciplina: 'Matemática'
        })
        
        logger.success('✅ Dados carregados com sucesso', 'component')
      } else {
        logger.warning('⚠️ Atividade não encontrada, criando dados simulados', 'component')
        console.warn('⚠️ Criando atividade simulada para ID:', atividadeId)
        
        // Fallback: criar dados simulados da atividade
        const atividadeSimulada: Atividade = {
          atividade_id: atividadeId || 'temp-atividade-id',
          titulo: 'Atividade de Teste',
          descricao: 'Descrição da atividade de teste',
          peso: 10,
          vale_nota: true,
          periodo_letivo_id: 'temp-periodo-id',
          aula_id: 'temp-aula-id',
          turma_disciplina_professor_id: 'temp-vinculacao-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        setAtividade(atividadeSimulada)
        
        // Configurar dados simulados da turma e disciplina
        setTurma({
          turma_id: 'temp-turma-id',
          nome_turma: 'Turma A',
          turno: 'Manhã',
          sala: 'Sala 101',
          nome_serie: '1º Ano',
          ano: 2025
        })
        
        setDisciplina({
          disciplina_id: 'temp-disciplina-id',
          nome_disciplina: 'Matemática'
        })
        
        logger.success('✅ Dados simulados criados com sucesso', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar dados', 'component', error)
      console.error('❌ Erro completo:', error)
      navigate('/diario')
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    navigate('/diario')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando dados da atividade...</p>
        </div>
      </div>
    )
  }

  if (!atividade || !turma || !disciplina) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Erro</h1>
          <p className="text-gray-600">Não foi possível carregar os dados da atividade</p>
          <button
            onClick={handleVoltar}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <LancarNotasPage 
      atividade={atividade}
      turma={turma}
      disciplina={disciplina}
      onVoltar={handleVoltar}
    />
  )
}

// Componente original com as props
function LancarNotasPage({ 
  atividade,
  turma, 
  disciplina,
  onVoltar 
}: LancarNotasPageProps) {
  const [alunosTurma, setAlunosTurma] = useState<AlunoNota[]>([])
  const [notasExistentes, setNotasExistentes] = useState<NotaExistente[]>([])
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([])
  const [notasParaLancar, setNotasParaLancar] = useState<{[key: string]: number}>({})
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [showFormNota, setShowFormNota] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [notaParaExcluir, setNotaParaExcluir] = useState<NotaExistente | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [notaParaEditar, setNotaParaEditar] = useState<NotaExistente | null>(null)
  const [novaNota, setNovaNota] = useState<number>(0)

  useEffect(() => {
    carregarDados()
  }, [atividade.atividade_id])

  const carregarDados = async () => {
    try {
      setLoading(true)
      logger.info(`📊 Carregando dados para atividade: ${atividade.titulo}`, 'component')
      
      // Carregar alunos da aula usando o aula_id da atividade
      const alunosResponse = await NotaService.buscarAlunosAula(atividade.aula_id)
      
      if (alunosResponse.sucesso && alunosResponse.dados) {
        setAlunosTurma(alunosResponse.dados as unknown as AlunoNota[])
        logger.success(`✅ ${(alunosResponse.dados as unknown as AlunoNota[]).length} alunos carregados`, 'component')
      } else {
        logger.warning('⚠️ Nenhum aluno encontrado para a aula', 'component')
        setAlunosTurma([])
      }

      // Carregar notas existentes
      const notasResponse = await NotaService.buscarNotasPorAtividade(atividade.atividade_id || '')
      
      console.log('📊 Resposta das notas:', notasResponse)
      
      if (notasResponse.sucesso && notasResponse.dados && Array.isArray(notasResponse.dados)) {
        console.log('📊 Dados das notas:', notasResponse.dados)
        setNotasExistentes(notasResponse.dados as unknown as NotaExistente[])
        logger.success(`✅ ${(notasResponse.dados as unknown as NotaExistente[]).length} notas existentes carregadas`, 'component')
      } else {
        console.log('❌ Erro ao carregar notas:', notasResponse)
        logger.error('❌ Erro ao carregar notas existentes', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar dados', 'component', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelecionarAluno = (matriculaId: string) => {
    setAlunosSelecionados(prev => {
      if (prev.includes(matriculaId)) {
        // Remover da seleção
        const novasNotas = { ...notasParaLancar }
        delete novasNotas[matriculaId]
        setNotasParaLancar(novasNotas)
        return prev.filter(id => id !== matriculaId)
      } else {
        // Adicionar à seleção
        return [...prev, matriculaId]
      }
    })
  }

  const handleAlterarNota = (matriculaId: string, valor: number) => {
    setNotasParaLancar(prev => ({
      ...prev,
      [matriculaId]: valor
    }))
  }

  const handleSalvarNotas = async () => {
    try {
      setSalvando(true)
      logger.info(`💾 Salvando notas para atividade: ${atividade.titulo}`, 'component')
      
      const notas = Object.entries(notasParaLancar)
        .filter(([_, valor]) => valor !== undefined && valor !== null && valor >= 0)
        .map(([matricula_aluno_id, valor]) => ({
          matricula_aluno_id,
          valor
        }))
      
      if (notas.length === 0) {
        logger.error('❌ Nenhuma nota para salvar', 'component')
        return
      }

      const response = await NotaService.lancarNotasLote(atividade.atividade_id || '', notas)
      
      if (response.sucesso) {
        // Recarregar dados
        await carregarDados()
        // Limpar seleções
        setAlunosSelecionados([])
        setNotasParaLancar({})
        setShowFormNota(false)
        logger.success('✅ Notas salvas com sucesso', 'component')
      } else {
        logger.error('❌ Erro ao salvar notas', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar notas', 'component', error)
    } finally {
      setSalvando(false)
    }
  }

  const handleEditarNota = (nota: NotaExistente) => {
    setNotaParaEditar(nota)
    setNovaNota(nota.valor)
    setShowEditModal(true)
    logger.info(`📝 Editando nota: ${nota.valor}`, 'component')
  }

  const handleSalvarEdicao = async () => {
    if (!notaParaEditar) return

    try {
      setSalvando(true)
      logger.info(`💾 Salvando edição da nota: ${notaParaEditar.nota_id}`, 'component')
      
      const response = await NotaService.atualizarNota(notaParaEditar.nota_id, {
        valor: novaNota
      })
      
      if (response.sucesso) {
        await carregarDados()
        setShowEditModal(false)
        setNotaParaEditar(null)
        setNovaNota(0)
        logger.success('✅ Nota editada com sucesso', 'component')
      } else {
        logger.error('❌ Erro ao editar nota', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao editar nota', 'component', error)
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluirNota = (nota: NotaExistente) => {
    setNotaParaExcluir(nota)
    setShowConfirmDelete(true)
    logger.info(`🗑️ Solicitando exclusão da nota: ${nota.nota_id}`, 'component')
  }

  const handleConfirmarExclusao = async () => {
    if (!notaParaExcluir) return

    try {
      setSalvando(true)
      logger.info(`🗑️ Excluindo nota: ${notaParaExcluir.nota_id}`, 'component')
      
      const response = await NotaService.deletarNota(notaParaExcluir.nota_id)
      
      if (response.sucesso) {
        await carregarDados()
        setShowConfirmDelete(false)
        setNotaParaExcluir(null)
        logger.success('✅ Nota excluída com sucesso', 'component')
      } else {
        logger.error('❌ Erro ao excluir nota', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao excluir nota', 'component', error)
    } finally {
      setSalvando(false)
    }
  }

  const handleCancelarExclusao = () => {
    setShowConfirmDelete(false)
    setNotaParaExcluir(null)
  }

  const alunosComNota = notasExistentes.map(n => n.matricula_aluno_id)
  const alunosDisponiveis = alunosTurma.filter(aluno => !alunosComNota.includes(aluno.matricula_aluno_id))

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onVoltar}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{atividade.titulo} - {disciplina.nome_disciplina} - {turma.nome_serie} {turma.nome_turma}</h1>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Seção: Notas Existentes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
                  Notas Lançadas ({notasExistentes.length})
                </h3>
              </div>

              {notasExistentes.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhuma nota lançada ainda</p>
                  <p className="text-sm text-gray-400">Selecione alunos para lançar notas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notasExistentes.map((nota) => (
                    <div key={nota.nota_id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                          {nota.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {nota.nome_aluno} {nota.sobrenome_aluno}
                          </h4>
                          <p className="text-sm text-gray-600">RA: {nota.ra}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{nota.valor}</div>
                          <div className="text-xs text-gray-500">/ 10</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditarNota(nota)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Editar nota"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleExcluirNota(nota)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Excluir nota"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seção: Lançar Novas Notas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-blue-500" />
                  Alunos Disponíveis ({alunosDisponiveis.length})
                </h3>
                {alunosSelecionados.length > 0 && (
                  <button
                    onClick={() => setShowFormNota(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Lançar Notas ({alunosSelecionados.length})
                  </button>
                )}
              </div>

              {alunosDisponiveis.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Todos os alunos já têm nota</p>
                  <p className="text-sm text-gray-400">Não há mais alunos para lançar notas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alunosDisponiveis.map((aluno) => (
                    <div key={aluno.matricula_aluno_id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={alunosSelecionados.includes(aluno.matricula_aluno_id)}
                          onChange={() => handleSelecionarAluno(aluno.matricula_aluno_id)}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {aluno.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {aluno.nome_aluno} {aluno.sobrenome_aluno}
                          </h4>
                          <p className="text-sm text-gray-600">RA: {aluno.ra}</p>
                        </div>
                      </div>
                      {alunosSelecionados.includes(aluno.matricula_aluno_id) && (
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">Nota:</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={notasParaLancar[aluno.matricula_aluno_id] || ''}
                            onChange={(e) => handleAlterarNota(aluno.matricula_aluno_id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center"
                            placeholder="0.0"
                          />
                          <span className="text-sm text-gray-500">/ 10</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Lançamento */}
        {showFormNota && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Confirmar Lançamento de Notas</h3>
                      <p className="text-sm text-gray-600">Revise as notas antes de salvar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFormNota(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  {alunosSelecionados.map(matriculaId => {
                    const aluno = alunosTurma.find(a => a.matricula_aluno_id === matriculaId)
                    const nota = notasParaLancar[matriculaId]
                    return (
                      <div key={matriculaId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {aluno?.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {aluno?.nome_aluno} {aluno?.sobrenome_aluno}
                            </h4>
                            <p className="text-sm text-gray-600">RA: {aluno?.ra}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-yellow-600">{nota || 0}</div>
                          <div className="text-xs text-gray-500">/ 10</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowFormNota(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarNotas}
                    disabled={salvando}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    {salvando ? 'Salvando...' : 'Salvar Notas'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showConfirmDelete && notaParaExcluir && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h3>
                      <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelarExclusao}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {notaParaExcluir.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {notaParaExcluir.nome_aluno} {notaParaExcluir.sobrenome_aluno}
                        </h4>
                        <p className="text-sm text-gray-600">RA: {notaParaExcluir.ra}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">{notaParaExcluir.valor}</div>
                      <div className="text-xs text-gray-500">/ 10</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Tem certeza que deseja excluir esta nota?
                  </p>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={handleCancelarExclusao}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarExclusao}
                    disabled={salvando}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    {salvando ? 'Excluindo...' : 'Excluir Nota'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Nota */}
        {showEditModal && notaParaEditar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Edit className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Editar Nota</h3>
                      <p className="text-sm text-gray-600">Altere o valor da nota</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {notaParaEditar.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {notaParaEditar.nome_aluno} {notaParaEditar.sobrenome_aluno}
                        </h4>
                        <p className="text-sm text-gray-600">RA: {notaParaEditar.ra}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nova Nota
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={novaNota}
                      onChange={(e) => setNovaNota(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold"
                      placeholder="0.0"
                    />
                    <p className="text-xs text-gray-500 text-center">Nota de 0 a 10</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarEdicao}
                    disabled={salvando || novaNota < 0 || novaNota > 10}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    {salvando ? 'Salvando...' : 'Salvar Alteração'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
