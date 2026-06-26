// Utilitários de datas e dias letivos para o Diário Escolar.
// Dias letivos são derivados da grade horária (dias da semana com aula)
// dentro do intervalo de datas do trimestre. Feriados/calendário real ficam para depois.

export type StatusDia = 'completo' | 'parcial' | 'vazio'

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

/** Data de hoje em YYYY-MM-DD (timezone local). */
export const hojeISO = (): string => toISO(new Date())

/** Converte Date -> YYYY-MM-DD local. */
export const toISO = (d: Date): string => {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** Converte YYYY-MM-DD -> Date local (meia-noite). */
export const parseISO = (data: string): Date => new Date(data.substring(0, 10) + 'T00:00:00')

/** 0=Domingo ... 6=Sábado para uma data ISO. */
export const diaSemanaDe = (data: string): number => parseISO(data).getDay()

export const nomeDiaSemana = (dia: number): string => DIAS_SEMANA[dia] ?? ''

export const nomeMes = (mes: number): string => MESES[mes] ?? ''

/** Ex.: "15 de Junho de 2026". */
export const formatarDataLonga = (data: string): string => {
  const d = parseISO(data)
  return `${d.getDate()} de ${nomeMes(d.getMonth())} de ${d.getFullYear()}`
}

/** Ex.: "15/06". */
export const formatarDiaMes = (data: string): string => {
  const d = parseISO(data)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** true se a data é posterior a hoje (lançamento proibido). */
export const ehFuturo = (data: string): boolean => data > hojeISO()

/**
 * Lista todas as datas letivas (YYYY-MM-DD) dentro de [inicio, fim]
 * cujo dia da semana esteja no conjunto informado, em ordem crescente.
 * Datas em `feriados` (YYYY-MM-DD) são excluídas — não há aula nelas.
 */
export const diasLetivosNoIntervalo = (
  inicio: string,
  fim: string,
  diasSemana: Set<number>,
  feriados: Set<string> = new Set()
): string[] => {
  if (!inicio || !fim || diasSemana.size === 0) return []
  const dias: string[] = []
  const atual = parseISO(inicio)
  const limite = parseISO(fim)
  while (atual <= limite) {
    const iso = toISO(atual)
    if (diasSemana.has(atual.getDay()) && !feriados.has(iso)) dias.push(iso)
    atual.setDate(atual.getDate() + 1)
  }
  return dias
}

export interface CelulaCalendario {
  data: string | null // null = célula de preenchimento (antes do dia 1 / depois do último)
  noTrimestre: boolean // true se a data cai dentro de [inicio, fim] do trimestre
}

export interface MesCalendario {
  ano: number
  mes: number // 0-11
  rotulo: string // ex.: "Abril de 2026"
  semanas: CelulaCalendario[][] // cada semana tem 7 células (Dom→Sáb)
}

/**
 * Gera a estrutura de calendário (meses → semanas → células) cobrindo
 * todos os meses tocados por [inicio, fim]. Células fora do mês ou fora do
 * trimestre vêm marcadas para a UI renderizar esmaecidas.
 */
export const gerarCalendario = (inicio: string, fim: string): MesCalendario[] => {
  if (!inicio || !fim) return []
  const dInicio = parseISO(inicio)
  const dFim = parseISO(fim)
  const meses: MesCalendario[] = []

  let ano = dInicio.getFullYear()
  let mes = dInicio.getMonth()
  const ultimoAno = dFim.getFullYear()
  const ultimoMes = dFim.getMonth()

  while (ano < ultimoAno || (ano === ultimoAno && mes <= ultimoMes)) {
    const diasNoMes = new Date(ano, mes + 1, 0).getDate()
    const offset = new Date(ano, mes, 1).getDay() // 0=Domingo

    const celulas: CelulaCalendario[] = []
    for (let i = 0; i < offset; i++) celulas.push({ data: null, noTrimestre: false })
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = toISO(new Date(ano, mes, dia))
      celulas.push({ data, noTrimestre: data >= inicio && data <= fim })
    }
    while (celulas.length % 7 !== 0) celulas.push({ data: null, noTrimestre: false })

    const semanas: CelulaCalendario[][] = []
    for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7))

    meses.push({ ano, mes, rotulo: `${nomeMes(mes)} de ${ano}`, semanas })

    mes++
    if (mes > 11) {
      mes = 0
      ano++
    }
  }

  return meses
}

/** Agrupa datas por "Ano-Mês" preservando a ordem. */
export const agruparPorMes = (datas: string[]): { chave: string; rotulo: string; dias: string[] }[] => {
  const grupos: { chave: string; rotulo: string; dias: string[] }[] = []
  for (const data of datas) {
    const d = parseISO(data)
    const chave = `${d.getFullYear()}-${d.getMonth()}`
    let grupo = grupos.find((g) => g.chave === chave)
    if (!grupo) {
      grupo = { chave, rotulo: `${nomeMes(d.getMonth())} de ${d.getFullYear()}`, dias: [] }
      grupos.push(grupo)
    }
    grupo.dias.push(data)
  }
  return grupos
}

/** Rótulo do trimestre a partir do número (bimestre/ordem). */
export const rotuloTrimestre = (n: number): string => `${n}º Trimestre`
