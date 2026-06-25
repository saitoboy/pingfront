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
export const parseISO = (data: string): Date => new Date(data + 'T00:00:00')

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
 */
export const diasLetivosNoIntervalo = (
  inicio: string,
  fim: string,
  diasSemana: Set<number>
): string[] => {
  if (!inicio || !fim || diasSemana.size === 0) return []
  const dias: string[] = []
  const atual = parseISO(inicio)
  const limite = parseISO(fim)
  while (atual <= limite) {
    if (diasSemana.has(atual.getDay())) dias.push(toISO(atual))
    atual.setDate(atual.getDate() + 1)
  }
  return dias
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
