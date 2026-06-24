import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  CircleDashed,
  Eye,
  X,
  Filter,
  Camera,
  Target,
  Lightbulb,
  StickyNote,
  FileText,
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { professorService } from '../../services/professorService'
import registroDiarioService from '../../services/registroDiarioService'
import { RichTextView } from '../../components/diario/RichTextEditor'
import type { ProfessorComTurmas, RegistroDiario, RegistroDiarioComDetalhes } from '../../types/diario'

// Extrai YYYY-MM-DD de um timestamp/Date string
const apenasData = (iso: string): string => (iso ? iso.split('T')[0] : '')

const formatarDataLonga = (iso: string) =>
  new Date(apenasData(iso) + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

export default function AdminDiariosPage() {
  const { professorId } = useParams<{ professorId: string }>()
  const navigate = useNavigate()

  const [professor, setProfessor] = useState<ProfessorComTurmas | null>(null)
  const [registros, setRegistros] = useState<RegistroDiarioComDetalhes[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroDisciplina, setFiltroDisciplina] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  // Detalhe (read-only)
  const [detalhe, setDetalhe] = useState<RegistroDiario | null>(null)
  const [loadingDetalhe, setLoadingDetalhe] = useState(false)

  useEffect(() => {
    if (professorId) {
      carregarProfessor()
      carregarRegistros()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professorId])

  const carregarProfessor = async () => {
    try {
      const response = await professorService.listarProfessoresComTurmas()
      if (response.status === 'sucesso' && response.dados) {
        const encontrado = response.dados.find((p) => p.usuario_id === professorId)
        setProfessor(encontrado || null)
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar professor', 'component', error)
    }
  }

  const carregarRegistros = async () => {
    try {
      setLoading(true)
      const response = await registroDiarioService.listarPorProfessor(professorId || '')
      if (response.sucesso && response.dados) {
        setRegistros(response.dados)
        logger.success(`✅ ${response.dados.length} registros carregados`, 'component')
      } else {
        setRegistros([])
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar registros do professor', 'component', error)
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }

  const disciplinasUnicas = useMemo(
    () => Array.from(new Set(registros.map((r) => r.nome_disciplina))).sort(),
    [registros]
  )

  const registrosFiltrados = useMemo(
    () =>
      registros.filter((r) => {
        if (filtroDisciplina && r.nome_disciplina !== filtroDisciplina) return false
        if (filtroStatus && r.status !== filtroStatus) return false
        return true
      }),
    [registros, filtroDisciplina, filtroStatus]
  )

  const abrirDetalhe = async (registro: RegistroDiarioComDetalhes) => {
    try {
      setLoadingDetalhe(true)
      setDetalhe({
        turma_disciplina_professor_id: registro.turma_disciplina_professor_id,
        data_aula: apenasData(registro.data_aula),
        resumo: registro.resumo,
        status: registro.status,
      })
      const response = await registroDiarioService.buscarPorData(
        registro.turma_disciplina_professor_id,
        apenasData(registro.data_aula)
      )
      if (response.sucesso && response.dados) {
        setDetalhe({
          ...response.dados,
          data_aula: apenasData(response.dados.data_aula as string),
        })
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar detalhe do registro', 'component', error)
    } finally {
      setLoadingDetalhe(false)
    }
  }

  const totalConcluidos = registros.filter((r) => r.status === 'concluido').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Diário de {professor?.nome_usuario || 'Professor'}
              </h1>
              <p className="text-gray-600 text-sm">{professor?.email_usuario}</p>
            </div>
            <div className="hidden sm:flex gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">{registros.length}</div>
                <div className="text-xs text-gray-500">Registros</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">{totalConcluidos}</div>
                <div className="text-xs text-gray-500">Concluídos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {registros.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <Filter className="w-4 h-4" /> Filtrar:
              </span>
              <select
                value={filtroDisciplina}
                onChange={(e) => setFiltroDisciplina(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as disciplinas</option>
                {disciplinasUnicas.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="concluido">Concluídos</option>
                <option value="rascunho">Rascunhos</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600">Carregando registros...</p>
            </div>
          </div>
        )}

        {/* Lista de registros */}
        {!loading && (
          <div className="space-y-3">
            {registrosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FileText className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum registro encontrado</h3>
                <p className="text-gray-600 text-sm">
                  {registros.length === 0
                    ? 'Este professor ainda não preencheu nenhum registro diário.'
                    : 'Nenhum registro corresponde aos filtros selecionados.'}
                </p>
              </div>
            ) : (
              registrosFiltrados.map((registro) => (
                <button
                  key={registro.registro_diario_id}
                  onClick={() => abrirDetalhe(registro)}
                  className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          {registro.nome_disciplina}
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            registro.status === 'concluido'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {registro.status === 'concluido' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <CircleDashed className="w-3 h-3" />
                          )}
                          {registro.status === 'concluido' ? 'Concluído' : 'Rascunho'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="capitalize">{formatarDataLonga(registro.data_aula)}</span>
                        <span className="text-gray-400">•</span>
                        {registro.nome_serie} - {registro.nome_turma}
                      </p>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        <RichTextView html={registro.resumo} />
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de detalhe (read-only) */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 capitalize">{formatarDataLonga(detalhe.data_aula)}</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    detalhe.status === 'concluido' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {detalhe.status === 'concluido' ? 'Concluído' : 'Rascunho'}
                </span>
              </div>
              <button
                onClick={() => setDetalhe(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {loadingDetalhe && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Carregando detalhes...
                </div>
              )}

              <section>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-500" /> Resumo da aula
                </h4>
                <RichTextView html={detalhe.resumo} />
              </section>

              <section>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-500" /> Conteúdo programático
                </h4>
                <RichTextView html={detalhe.conteudo_programatico || ''} />
              </section>

              <section>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Metodologia
                </h4>
                {detalhe.metodologia ? (
                  <p className="text-sm text-gray-700">{detalhe.metodologia}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Não preenchido</p>
                )}
              </section>

              {detalhe.recursos && detalhe.recursos.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-gray-900 mb-1.5">Recursos utilizados</h4>
                  <div className="flex flex-wrap gap-2">
                    {detalhe.recursos.map((r) => (
                      <span key={r} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {r}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {detalhe.fotos && detalhe.fotos.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-pink-500" /> Fotos
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {detalhe.fotos.map((foto, i) => (
                      <a key={i} href={foto} target="_blank" rel="noreferrer" className="block">
                        <img
                          src={foto}
                          alt={`Foto ${i + 1}`}
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                        />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-gray-500" /> Observações
                </h4>
                <RichTextView html={detalhe.observacoes || ''} />
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
