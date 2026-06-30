import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Circle,
  User,
  GraduationCap,
  Lock,
  AlertTriangle,
  CalendarOff,
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { useAuth } from '../../contexts/AuthContext'
import {
  carregarContextoDiario,
  diasSemanaComAula,
  carregarStatusPorData,
  type ContextoDiario,
} from '../../lib/diarioDados'
import {
  diasLetivosNoIntervalo,
  gerarCalendario,
  diaSemanaDe,
  formatarDataLonga,
  hojeISO,
  ehFuturo,
  rotuloTrimestre,
  type StatusDia,
} from '../../lib/diarioCalendario'

const NOMES_DIA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Estilo das células de dia letivo, por status de preenchimento
const CELL_LETIVO: Record<StatusDia, { cls: string; Icon: typeof CheckCircle2; rotulo: string }> = {
  completo: { cls: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100', Icon: CheckCircle2, rotulo: 'Completo' },
  parcial: { cls: 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100', Icon: CircleDashed, rotulo: 'Parcial' },
  vazio: { cls: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100', Icon: Circle, rotulo: 'Pendente' },
}

export default function MeuDiarioPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario } = useAuth()
  const [ctx, setCtx] = useState<ContextoDiario | null>(null)
  const [statusPorData, setStatusPorData] = useState<Record<string, StatusDia>>({})
  const [loading, setLoading] = useState(true)
  const [trimestreId, setTrimestreId] = useState<string>('')

  useEffect(() => {
    if (!usuario) {
      navigate('/dashboard')
      return
    }
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const carregar = async () => {
    try {
      setLoading(true)
      const contexto = await carregarContextoDiario()
      setCtx(contexto)

      // seleciona o trimestre ativo; senão o que contém hoje; senão o primeiro
      const hoje = hojeISO()
      const contemHoje = contexto.trimestres.find(
        (t) => t.data_inicio && t.data_fim && hoje >= t.data_inicio && hoje <= t.data_fim
      )
      setTrimestreId(
        contexto.trimestreAtivoId ||
          contemHoje?.periodo_letivo_id ||
          contexto.trimestres[0]?.periodo_letivo_id ||
          ''
      )

      const status = await carregarStatusPorData(contexto, diaSemanaDe)
      setStatusPorData(status)
      logger.success('✅ Diário carregado', 'component')
    } catch (error) {
      logger.error('❌ Erro ao carregar diário', 'component', error)
    } finally {
      setLoading(false)
    }
  }

  const trimestre = useMemo(
    () => ctx?.trimestres.find((t) => t.periodo_letivo_id === trimestreId) || null,
    [ctx, trimestreId]
  )

  // dias da semana em que o professor tem aula
  const diasComAula = useMemo(() => (ctx ? diasSemanaComAula(ctx) : new Set<number>()), [ctx])

  // dias letivos reais (exclui feriados) — base dos totais
  const diasLetivos = useMemo(() => {
    if (!ctx || !trimestre?.data_inicio || !trimestre?.data_fim) return []
    return diasLetivosNoIntervalo(trimestre.data_inicio, trimestre.data_fim, diasComAula, ctx.feriados)
  }, [ctx, trimestre, diasComAula])

  // estrutura de calendário (meses → semanas → células)
  const calendario = useMemo(() => {
    if (!trimestre?.data_inicio || !trimestre?.data_fim) return []
    return gerarCalendario(trimestre.data_inicio, trimestre.data_fim)
  }, [trimestre])

  const totais = useMemo(() => {
    const conta = (s: StatusDia) => diasLetivos.filter((d) => (statusPorData[d] || 'vazio') === s).length
    return {
      total: diasLetivos.length,
      completo: conta('completo'),
      parcial: conta('parcial'),
      vazio: conta('vazio'),
    }
  }, [diasLetivos, statusPorData])

  const totalGrades = useMemo(() => {
    if (!ctx) return 0
    return Object.values(ctx.gradesPorVinculacao).reduce((acc, grades) => acc + grades.length, 0)
  }, [ctx])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Carregando seu diário...</p>
        </div>
      </div>
    )
  }

  const semDados = !ctx || ctx.vinculacoes.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">Meu Diário</h1>
              <p className="text-gray-600 mt-0.5 truncate">{usuario?.nome_usuario}</p>
              {ctx?.nomeTurma && (
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> {ctx.nomeSerie} - {ctx.nomeTurma}
                </p>
              )}
            </div>
          </div>
        </div>

        {!semDados && totalGrades === 0 && (
          <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Grade horária não configurada</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Nenhum horário de aula foi encontrado para suas turmas. Peça ao administrador para configurar a grade em <span className="font-medium">Gestão Escolar → Grade Horária</span>.
              </p>
            </div>
          </div>
        )}

        {semDados ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma encontrada</h3>
            <p className="text-gray-600">Você não possui turmas alocadas no ano letivo ativo.</p>
          </div>
        ) : ctx!.trimestres.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trimestres não configurados</h3>
            <p className="text-gray-600">O ano letivo ativo ainda não possui trimestres com datas definidas.</p>
          </div>
        ) : (
          <>
            {/* Seletor de trimestre */}
            <div className="flex flex-wrap gap-3 mb-6">
              {ctx!.trimestres.map((t) => {
                const selecionado = t.periodo_letivo_id === trimestreId
                const ativoAgora = t.periodo_letivo_id === ctx!.trimestreAtivoId
                return (
                  <button
                    key={t.periodo_letivo_id}
                    onClick={() => setTrimestreId(t.periodo_letivo_id)}
                    className={`relative px-5 py-3 rounded-2xl font-semibold border transition-all shadow-sm ${
                      selecionado
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {rotuloTrimestre(t.bimestre)}
                    {ativoAgora && (
                      <span
                        className={`ml-2 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          selecionado ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        Ativo
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Resumo de pendências */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <ResumoCard valor={totais.total} rotulo="Dias letivos" cor="text-blue-600" />
              <ResumoCard valor={totais.completo} rotulo="Completos" cor="text-green-600" />
              <ResumoCard valor={totais.parcial} rotulo="Parciais" cor="text-amber-600" />
              <ResumoCard valor={totais.vazio} rotulo="Pendentes" cor="text-gray-500" />
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs text-gray-600">
              <Legenda cor="bg-blue-200" texto="A preencher" />
              <Legenda cor="bg-amber-300" texto="Parcial" />
              <Legenda cor="bg-green-300" texto="Completo" />
              <Legenda cor="bg-red-300" texto="Feriado" />
              <Legenda cor="bg-gray-200" texto="Sem aula" />
            </div>

            {/* Calendário */}
            <AnimatePresence mode="wait">
              <motion.div
                key={trimestreId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {calendario.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Trimestre sem datas definidas.</p>
                  </div>
                ) : (
                  calendario.map((mes) => (
                    <div
                      key={`${mes.ano}-${mes.mes}`}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900 capitalize">{mes.rotulo}</h3>
                      </div>

                      <div className="p-3 sm:p-4">
                        {/* Cabeçalho dos dias da semana */}
                        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                          {NOMES_DIA_CURTO.map((d) => (
                            <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">
                              {d}
                            </div>
                          ))}
                        </div>

                        {/* Semanas */}
                        <div className="space-y-1.5">
                          {mes.semanas.map((semana, i) => (
                            <div key={i} className="grid grid-cols-7 gap-1.5">
                              {semana.map((cel, j) => (
                                <CelulaDia
                                  key={cel.data ?? `vazia-${i}-${j}`}
                                  data={cel.data}
                                  noTrimestre={cel.noTrimestre}
                                  feriado={cel.data ? ctx!.feriados.has(cel.data) : false}
                                  feriadoDesc={cel.data ? ctx!.feriadosDesc[cel.data] : undefined}
                                  temAula={cel.data ? diasComAula.has(diaSemanaDe(cel.data)) : false}
                                  status={cel.data ? statusPorData[cel.data] || 'vazio' : 'vazio'}
                                  onClick={() => cel.data && navigate(`/diario/dia/${cel.data}`)}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}

function ResumoCard({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
      <div className={`text-2xl font-bold ${cor}`}>{valor}</div>
      <div className="text-xs sm:text-sm text-gray-600">{rotulo}</div>
    </div>
  )
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded ${cor}`} />
      {texto}
    </div>
  )
}

function CelulaDia({
  data,
  noTrimestre,
  feriado,
  feriadoDesc,
  temAula,
  status,
  onClick,
}: {
  data: string | null
  noTrimestre: boolean
  feriado: boolean
  feriadoDesc?: string
  temAula: boolean
  status: StatusDia
  onClick: () => void
}) {
  // Célula de preenchimento (fora do mês) ou fora do trimestre
  if (!data || !noTrimestre) {
    return <div className="min-h-[58px] sm:min-h-[68px] rounded-lg bg-gray-50/40" />
  }

  const numero = Number(data.substring(8, 10))

  // Feriado — vermelho, não clicável
  if (feriado) {
    return (
      <div
        title={feriadoDesc ? `Feriado: ${feriadoDesc}` : 'Feriado'}
        className="min-h-[58px] sm:min-h-[68px] rounded-lg border border-red-200 bg-red-50 p-1.5 flex flex-col overflow-hidden"
      >
        <span className="text-sm font-bold text-red-700">{numero}</span>
        <span className="mt-auto flex items-center gap-0.5 text-[10px] font-medium text-red-500 leading-tight truncate">
          <CalendarOff className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{feriadoDesc || 'Feriado'}</span>
        </span>
      </div>
    )
  }

  // Sem aula (fim de semana ou dia da semana sem disciplina) — neutro
  if (!temAula) {
    return (
      <div className="min-h-[58px] sm:min-h-[68px] rounded-lg border border-gray-100 bg-gray-50 p-1.5">
        <span className="text-sm font-medium text-gray-300">{numero}</span>
      </div>
    )
  }

  // Dia letivo futuro — travado
  if (ehFuturo(data)) {
    return (
      <div
        title="Lançamentos em datas futuras não são permitidos"
        className="min-h-[58px] sm:min-h-[68px] rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-1.5 flex flex-col opacity-70"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-400">{numero}</span>
          <Lock className="w-3 h-3 text-gray-300" />
        </div>
      </div>
    )
  }

  // Dia letivo preenchível
  const meta = CELL_LETIVO[status]
  return (
    <button
      onClick={onClick}
      title={`${formatarDataLonga(data)} — ${meta.rotulo}`}
      className={`min-h-[58px] sm:min-h-[68px] w-full rounded-lg border p-1.5 flex flex-col text-left transition-colors ${meta.cls}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{numero}</span>
        <meta.Icon className="w-3.5 h-3.5" />
      </div>
      <span className="mt-auto text-[10px] font-medium leading-tight truncate">{meta.rotulo}</span>
    </button>
  )
}
