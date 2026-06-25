import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Users,
  UserCheck,
  CheckCircle2,
  CircleDashed,
  Save,
  Lock,
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { useAuth } from '../../contexts/AuthContext'
import frequenciaService, { type AlunoFrequencia } from '../../services/frequenciaService'
import registroDiarioService from '../../services/registroDiarioService'
import RichTextEditor from '../../components/diario/RichTextEditor'
import {
  carregarContextoDiario,
  diasSemanaComAula,
  disciplinasDoDiaSemana,
  type ContextoDiario,
  type DisciplinaDoDia,
} from '../../lib/diarioDados'
import {
  diasLetivosNoIntervalo,
  diaSemanaDe,
  nomeDiaSemana,
  formatarDataLonga,
  ehFuturo,
  rotuloTrimestre,
} from '../../lib/diarioCalendario'
import type { RegistroDiario, StatusRegistroDiario } from '../../types/diario'

const registroVazio = (vinculacaoId: string, data: string): RegistroDiario => ({
  turma_disciplina_professor_id: vinculacaoId,
  data_aula: data,
  resumo: '',
  status: 'rascunho',
})

const semConteudo = (html?: string) => !html || html.replace(/<[^>]*>/g, '').trim() === ''

// Animação de folhear: slide horizontal conforme a direção da navegação
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -60 : 60 }),
}

export default function DiarioDiaPage() {
  const { data } = useParams<{ data: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [ctx, setCtx] = useState<ContextoDiario | null>(null)
  const [loading, setLoading] = useState(true)
  const [direcao, setDirecao] = useState(0) // -1 anterior, +1 próximo (para animação)

  // Frequência (única por dia/turma — aplicada a todas as disciplinas)
  const [alunos, setAlunos] = useState<AlunoFrequencia[]>([])
  const [salvandoFreq, setSalvandoFreq] = useState(false)
  const [freqSalva, setFreqSalva] = useState(false)

  // Conteúdo por disciplina (registro diário por vinculação)
  const [registros, setRegistros] = useState<Record<string, RegistroDiario>>({})
  const [salvando, setSalvando] = useState<Record<string, boolean>>({})

  // Carrega o contexto uma vez
  useEffect(() => {
    if (!usuario) {
      navigate('/dashboard')
      return
    }
    carregarContextoDiario()
      .then(setCtx)
      .catch((e) => logger.error('❌ Erro ao carregar contexto do diário', 'component', e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recarrega frequência + registros sempre que a data ou o contexto mudar
  useEffect(() => {
    if (ctx && data) carregarDoDia()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, data])

  const diaSemana = data ? diaSemanaDe(data) : -1
  const disciplinas: DisciplinaDoDia[] = useMemo(
    () => (ctx && data ? disciplinasDoDiaSemana(ctx, diaSemana) : []),
    [ctx, data, diaSemana]
  )

  // Trimestre que contém a data + dias letivos do trimestre (para folhear)
  const { trimestre, diasLetivos } = useMemo(() => {
    if (!ctx || !data) return { trimestre: null, diasLetivos: [] as string[] }
    const tri = ctx.trimestres.find(
      (t) => t.data_inicio && t.data_fim && data >= t.data_inicio && data <= t.data_fim
    )
    const dias =
      tri?.data_inicio && tri?.data_fim
        ? diasLetivosNoIntervalo(tri.data_inicio, tri.data_fim, diasSemanaComAula(ctx))
        : []
    return { trimestre: tri || null, diasLetivos: dias }
  }, [ctx, data])

  const idx = data ? diasLetivos.indexOf(data) : -1
  const diaAnterior = idx > 0 ? diasLetivos[idx - 1] : null
  const proximoDia = idx >= 0 && idx < diasLetivos.length - 1 ? diasLetivos[idx + 1] : null
  const proximoPermitido = proximoDia && !ehFuturo(proximoDia) ? proximoDia : null
  const futuro = data ? ehFuturo(data) : false

  const carregarDoDia = async () => {
    if (!ctx || !data) return
    setLoading(true)
    setFreqSalva(false)
    try {
      const discs = disciplinasDoDiaSemana(ctx, diaSemanaDe(data))

      // Conteúdo de cada disciplina
      const novosRegistros: Record<string, RegistroDiario> = {}
      await Promise.all(
        discs.map(async (d) => {
          try {
            const resp = await registroDiarioService.buscarPorData(d.turma_disciplina_professor_id, data)
            novosRegistros[d.turma_disciplina_professor_id] =
              resp.sucesso && resp.dados
                ? {
                    turma_disciplina_professor_id: d.turma_disciplina_professor_id,
                    data_aula: data,
                    resumo: resp.dados.resumo || '',
                    status: resp.dados.status || 'rascunho',
                  }
                : registroVazio(d.turma_disciplina_professor_id, data)
          } catch {
            novosRegistros[d.turma_disciplina_professor_id] = registroVazio(d.turma_disciplina_professor_id, data)
          }
        })
      )
      setRegistros(novosRegistros)

      // Frequência (uma vez, por turma)
      await carregarFrequencia()
    } catch (error) {
      logger.error('❌ Erro ao carregar o dia', 'component', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarFrequencia = useCallback(async () => {
    if (!ctx?.turmaId || !data || !usuario?.usuario_id) return
    try {
      const existentes = await frequenciaService.buscarFrequenciasPorProfessorTurmaEData(
        usuario.usuario_id,
        ctx.turmaId,
        data
      )
      if (existentes.sucesso && Array.isArray(existentes.dados) && existentes.dados.length > 0) {
        setAlunos(
          (existentes.dados as any[]).map((f) => ({
            matricula_aluno_id: f.matricula_aluno_id,
            ra: f.ra || '',
            nome_aluno: f.nome_aluno || '',
            sobrenome_aluno: f.sobrenome_aluno || '',
            presenca: f.presenca,
            frequencia_id: f.frequencia_id,
          }))
        )
        setFreqSalva(true)
      } else {
        const resp = await frequenciaService.buscarAlunosTurma(ctx.turmaId)
        if (resp.sucesso && Array.isArray(resp.dados)) {
          setAlunos((resp.dados as any[]).map((a) => ({ ...a, presenca: true })))
        } else {
          setAlunos([])
        }
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar frequência', 'component', error)
      setAlunos([])
    }
  }, [ctx, data, usuario])

  const irPara = (destino: string | null, dir: number) => {
    if (!destino) return
    setDirecao(dir)
    navigate(`/diario/dia/${destino}`)
  }

  const togglePresenca = (matriculaId: string) => {
    setAlunos((prev) =>
      prev.map((a) => (a.matricula_aluno_id === matriculaId ? { ...a, presenca: !a.presenca } : a))
    )
    setFreqSalva(false)
  }

  const marcarTodos = (presente: boolean) => {
    setAlunos((prev) => prev.map((a) => ({ ...a, presenca: presente })))
    setFreqSalva(false)
  }

  const salvarFrequencia = async () => {
    if (!ctx?.turmaId || !data || !usuario?.usuario_id) return
    try {
      setSalvandoFreq(true)
      const frequencias = alunos.map((a) => ({
        matricula_aluno_id: a.matricula_aluno_id,
        presenca: a.presenca === true,
      }))
      const resp = await frequenciaService.registrarFrequenciaLotePorProfessorTurmaEData(
        usuario.usuario_id,
        ctx.turmaId,
        data,
        frequencias
      )
      if (resp.success || resp.sucesso) {
        setFreqSalva(true)
        logger.success('✅ Frequência registrada', 'component')
      }
    } catch (error) {
      logger.error('❌ Erro ao salvar frequência', 'component', error)
      alert('Erro ao salvar a frequência.')
    } finally {
      setSalvandoFreq(false)
    }
  }

  const atualizarConteudo = (vinculacaoId: string, html: string) => {
    setRegistros((prev) => ({
      ...prev,
      [vinculacaoId]: { ...prev[vinculacaoId], resumo: html },
    }))
  }

  const salvarConteudo = async (vinculacaoId: string, status: StatusRegistroDiario) => {
    const registro = registros[vinculacaoId]
    if (!registro) return
    if (status === 'concluido' && semConteudo(registro.resumo)) {
      alert('Escreva o conteúdo ministrado antes de concluir.')
      return
    }
    try {
      setSalvando((prev) => ({ ...prev, [vinculacaoId]: true }))
      const resp = await registroDiarioService.salvar({ ...registro, status })
      if (resp.sucesso) {
        setRegistros((prev) => ({ ...prev, [vinculacaoId]: { ...prev[vinculacaoId], status } }))
        logger.success('✅ Conteúdo salvo', 'component')
      } else {
        alert(resp.mensagem || 'Erro ao salvar o conteúdo.')
      }
    } catch (error: any) {
      logger.error('❌ Erro ao salvar conteúdo', 'component', error)
      alert(error.response?.data?.mensagem || 'Erro ao salvar o conteúdo.')
    } finally {
      setSalvando((prev) => ({ ...prev, [vinculacaoId]: false }))
    }
  }

  const presentes = alunos.filter((a) => a.presenca === true).length

  if (loading || !ctx || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Abrindo o dia...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voltar */}
        <button
          onClick={() => navigate('/meu-diario')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao diário</span>
        </button>

        {/* Cabeçalho + navegação entre dias */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => irPara(diaAnterior, -1)}
              disabled={!diaAnterior}
              className="p-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Dia anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center flex-1 min-w-0">
              {trimestre && (
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-1">
                  {rotuloTrimestre(trimestre.bimestre)}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{formatarDataLonga(data)}</h1>
              <p className="text-sm text-gray-600 capitalize">{nomeDiaSemana(diaSemana)}</p>
            </div>

            <button
              onClick={() => irPara(proximoPermitido, 1)}
              disabled={!proximoPermitido}
              className="p-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={proximoDia && !proximoPermitido ? 'Datas futuras bloqueadas' : 'Próximo dia'}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {futuro ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Lock className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data futura</h3>
            <p className="text-gray-600">Não é permitido lançar diário em datas futuras.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direcao}>
            <motion.div
              key={data}
              custom={direcao}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {disciplinas.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma aula prevista na grade para este dia.</p>
                </div>
              ) : (
                <>
                  {/* Frequência */}
                  <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow">
                          <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">Frequência</h2>
                          <p className="text-xs text-gray-600">
                            {ctx.nomeSerie} - {ctx.nomeTurma} • vale para todas as disciplinas do dia
                          </p>
                        </div>
                      </div>
                      {freqSalva && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-4 h-4" /> Salva
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      {alunos.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Nenhum aluno encontrado nesta turma.</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <span className="text-sm text-gray-600">
                              {presentes} presentes • {alunos.length - presentes} faltas • {alunos.length} alunos
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => marcarTodos(true)}
                                className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                Todos presentes
                              </button>
                              <button
                                onClick={() => marcarTodos(false)}
                                className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Todos faltas
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                            {alunos.map((aluno) => {
                              const presente = aluno.presenca === true
                              return (
                                <button
                                  key={aluno.matricula_aluno_id}
                                  onClick={() => togglePresenca(aluno.matricula_aluno_id)}
                                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors text-left ${
                                    presente
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-red-50 border-red-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                                        presente ? 'bg-green-500' : 'bg-red-400'
                                      }`}
                                    >
                                      {aluno.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                      {aluno.nome_aluno} {aluno.sobrenome_aluno || ''}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${
                                      presente ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                                    }`}
                                  >
                                    {presente ? 'Presente' : 'Falta'}
                                  </span>
                                </button>
                              )
                            })}
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={salvarFrequencia}
                              disabled={salvandoFreq}
                              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 shadow"
                            >
                              <Save className="w-4 h-4" />
                              {salvandoFreq ? 'Salvando...' : 'Salvar frequência'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </section>

                  {/* Conteúdo por disciplina */}
                  {disciplinas.map((disc) => {
                    const registro = registros[disc.turma_disciplina_professor_id] || registroVazio(
                      disc.turma_disciplina_professor_id,
                      data
                    )
                    const concluido = registro.status === 'concluido'
                    const ocupado = salvando[disc.turma_disciplina_professor_id]
                    return (
                      <section
                        key={disc.turma_disciplina_professor_id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                      >
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate">{disc.nome_disciplina}</h3>
                              {disc.horarios.length > 0 && (
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> {disc.horarios.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 ${
                              concluido ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {concluido ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
                            {concluido ? 'Concluído' : 'Rascunho'}
                          </span>
                        </div>

                        <div className="p-5 space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Conteúdo ministrado
                            </label>
                            <RichTextEditor
                              value={registro.resumo}
                              onChange={(html) => atualizarConteudo(disc.turma_disciplina_professor_id, html)}
                              placeholder="Descreva o conteúdo trabalhado nesta disciplina..."
                              disabled={ocupado}
                              minHeight={120}
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => salvarConteudo(disc.turma_disciplina_professor_id, 'rascunho')}
                              disabled={ocupado}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" /> Salvar rascunho
                            </button>
                            <button
                              onClick={() => salvarConteudo(disc.turma_disciplina_professor_id, 'concluido')}
                              disabled={ocupado}
                              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow"
                            >
                              {ocupado ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              Concluir
                            </button>
                          </div>
                        </div>
                      </section>
                    )
                  })}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
