import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  CircleDashed,
  Circle,
  User,
  GraduationCap,
  Lock,
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
  agruparPorMes,
  diaSemanaDe,
  nomeDiaSemana,
  formatarDataLonga,
  hojeISO,
  ehFuturo,
  rotuloTrimestre,
  type StatusDia,
} from '../../lib/diarioCalendario'

const STATUS_META: Record<StatusDia, { rotulo: string; cor: string; Icon: typeof CheckCircle2 }> = {
  completo: { rotulo: 'Completo', cor: 'text-green-600 bg-green-50 border-green-200', Icon: CheckCircle2 },
  parcial: { rotulo: 'Parcial', cor: 'text-amber-600 bg-amber-50 border-amber-200', Icon: CircleDashed },
  vazio: { rotulo: 'Não preenchido', cor: 'text-gray-400 bg-white border-gray-200', Icon: Circle },
}

export default function MeuDiarioPage() {
  const navigate = useNavigate()
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
  }, [])

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

  const meses = useMemo(() => {
    if (!ctx || !trimestre?.data_inicio || !trimestre?.data_fim) return []
    const dias = diasLetivosNoIntervalo(trimestre.data_inicio, trimestre.data_fim, diasSemanaComAula(ctx))
    return agruparPorMes(dias)
  }, [ctx, trimestre])

  const totais = useMemo(() => {
    const dias = meses.flatMap((m) => m.dias)
    const conta = (s: StatusDia) => dias.filter((d) => (statusPorData[d] || 'vazio') === s).length
    return { total: dias.length, completo: conta('completo'), parcial: conta('parcial'), vazio: conta('vazio') }
  }, [meses, statusPorData])

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

            {ctx!.trimestreAtivoId && (
              <p className="-mt-3 mb-5 text-sm text-gray-600">
                Trimestre ativo no momento:{' '}
                <span className="font-semibold text-gray-900">
                  {rotuloTrimestre(
                    ctx!.trimestres.find((t) => t.periodo_letivo_id === ctx!.trimestreAtivoId)?.bimestre || 0
                  )}
                </span>
              </p>
            )}

            {/* Resumo de pendências */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <ResumoCard valor={totais.total} rotulo="Dias letivos" cor="text-blue-600" />
              <ResumoCard valor={totais.completo} rotulo="Completos" cor="text-green-600" />
              <ResumoCard valor={totais.parcial} rotulo="Parciais" cor="text-amber-600" />
              <ResumoCard valor={totais.vazio} rotulo="Pendentes" cor="text-gray-500" />
            </div>

            {/* Painel de dias por mês */}
            <AnimatePresence mode="wait">
              <motion.div
                key={trimestreId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {meses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum dia letivo neste trimestre.</p>
                  </div>
                ) : (
                  meses.map((mes) => (
                    <div key={mes.chave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900 capitalize">{mes.rotulo}</h3>
                      </div>
                      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {mes.dias.map((data) => (
                          <DiaCard
                            key={data}
                            data={data}
                            status={statusPorData[data] || 'vazio'}
                            futuro={ehFuturo(data)}
                            onClick={() => navigate(`/diario/dia/${data}`)}
                          />
                        ))}
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

function DiaCard({
  data,
  status,
  futuro,
  onClick,
}: {
  data: string
  status: StatusDia
  futuro: boolean
  onClick: () => void
}) {
  const meta = STATUS_META[status]
  const dia = diaSemanaDe(data)

  if (futuro) {
    return (
      <div
        className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 text-left opacity-60 cursor-not-allowed"
        title="Lançamentos em datas futuras não são permitidos"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg font-bold text-gray-400">{formatarDataLonga(data).split(' de ')[0]}</span>
          <Lock className="w-4 h-4 text-gray-300" />
        </div>
        <span className="text-xs text-gray-400">{nomeDiaSemana(dia)}</span>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${meta.cor}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-bold text-gray-900">{formatarDataLonga(data).split(' de ')[0]}</span>
        <meta.Icon className="w-4 h-4" />
      </div>
      <span className="text-xs text-gray-600 block">{nomeDiaSemana(dia)}</span>
      <span className="text-[11px] font-medium mt-2 inline-flex items-center gap-1">
        {meta.rotulo}
        <ChevronRight className="w-3 h-3" />
      </span>
    </button>
  )
}
