import { useState, useEffect } from 'react'
import { CalendarOff, Loader2, Plus, Trash2, AlertTriangle, CalendarDays } from 'lucide-react'
import anoLetivoService, { type AnoLetivo } from '../../../services/anoLetivoService'
import FeriadoService, { type Feriado } from '../../../services/feriadoService'
import { useAuth } from '../../../contexts/AuthContext'

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
]
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// "2026-04-21" → "21 de Abril de 2026 · Terça-feira"
const formatarData = (data: string): string => {
  const d = new Date(data.substring(0, 10) + 'T00:00:00')
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()} · ${DIAS_SEMANA[d.getDay()]}`
}

export default function FeriadosTab() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.tipo_usuario_id === 'admin'

  const [loading, setLoading] = useState(true)
  const [anoAtivo, setAnoAtivo] = useState<AnoLetivo | null>(null)
  const [feriados, setFeriados] = useState<Feriado[]>([])

  const [novaData, setNovaData] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  const carregar = async () => {
    try {
      setLoading(true)
      const ativo = await anoLetivoService.buscarAnoLetivoAtivo().catch(() => null)
      setAnoAtivo(ativo)
      if (ativo) {
        const lista = await FeriadoService.listarPorAno(ativo.ano_letivo_id)
        setFeriados(lista)
      }
    } catch {
      /* estados tratados na UI */
    } finally {
      setLoading(false)
    }
  }

  const handleAdicionar = async () => {
    if (!anoAtivo || !novaData || !novaDescricao.trim()) return
    setErro(null)
    try {
      setSalvando(true)
      const criado = await FeriadoService.criar({
        ano_letivo_id: anoAtivo.ano_letivo_id,
        data: novaData,
        descricao: novaDescricao.trim(),
      })
      setFeriados((prev) => [...prev, criado].sort((a, b) => a.data.localeCompare(b.data)))
      setNovaData('')
      setNovaDescricao('')
    } catch (e: any) {
      setErro(e.response?.data?.mensagem || 'Não foi possível adicionar o feriado.')
    } finally {
      setSalvando(false)
    }
  }

  const handleRemover = async (feriado_id: string) => {
    try {
      setRemovendo(feriado_id)
      await FeriadoService.deletar(feriado_id)
      setFeriados((prev) => prev.filter((f) => f.feriado_id !== feriado_id))
    } catch {
      setErro('Não foi possível remover o feriado.')
    } finally {
      setRemovendo(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!anoAtivo) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="w-14 h-14 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum ano letivo ativo</h3>
        <p className="text-gray-500">Ative um ano letivo para gerenciar os feriados.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-1">
        <CalendarOff className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Feriados e Recessos</h2>
      </div>
      <p className="text-gray-500 mb-6">
        Datas sem aula em {anoAtivo.ano} — não aparecem para o professor preencher no diário.
      </p>

      {/* Formulário de adição (apenas admin) */}
      {isAdmin && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="sm:w-48">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Data</label>
              <input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição</label>
              <input
                type="text"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
                placeholder="Ex.: Tiradentes, Recesso escolar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              onClick={handleAdicionar}
              disabled={salvando || !novaData || !novaDescricao.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Adicionar
            </button>
          </div>

          {erro && (
            <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {erro}
            </div>
          )}
        </div>
      )}

      {/* Lista de feriados */}
      {feriados.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
          <CalendarOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum feriado cadastrado para {anoAtivo.ano}.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {feriados.map((f) => (
            <li
              key={f.feriado_id}
              className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <CalendarOff className="w-5 h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{f.descricao}</p>
                  <p className="text-sm text-gray-500">{formatarData(f.data)}</p>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleRemover(f.feriado_id)}
                  disabled={removendo === f.feriado_id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Remover feriado"
                >
                  {removendo === f.feriado_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
