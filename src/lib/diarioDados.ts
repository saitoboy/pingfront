// Carregamento e agregação dos dados do Diário Escolar do professor logado.
// Reúne vinculações (turma/disciplina), grade horária e trimestres num único contexto.

import { anoLetivoService, type AnoLetivo } from '../services/anoLetivoService'
import periodoLetivoService, { type PeriodoLetivo } from '../services/periodoLetivoService'
import gradeHorarioService, { type GradeHorario } from '../services/gradeHorarioService'
import { professorService } from '../services/professorService'
import registroDiarioService from '../services/registroDiarioService'
import { logger } from './logger'
import type { StatusDia } from './diarioCalendario'

export interface Vinculacao {
  turma_disciplina_professor_id: string
  turma_id: string
  nome_turma: string
  nome_serie: string
  turno: string
  sala: string
  disciplina_id: string
  nome_disciplina: string
  ano: number
}

export interface DisciplinaDoDia extends Vinculacao {
  horarios: string[] // ex.: ["07:00 - 07:50"]
}

export interface ContextoDiario {
  anoLetivo: AnoLetivo | null
  trimestres: PeriodoLetivo[] // ordenados por bimestre
  trimestreAtivoId: string // período letivo ativo no momento ('' se nenhum)
  vinculacoes: Vinculacao[]
  // grades por vinculação, para descobrir os dias da semana de cada disciplina
  gradesPorVinculacao: Record<string, GradeHorario[]>
  // turma "principal" do professor (frequência é por turma)
  turmaId: string
  nomeTurma: string
  nomeSerie: string
}

/** Carrega tudo que as telas do diário precisam de uma vez. */
export const carregarContextoDiario = async (): Promise<ContextoDiario> => {
  // Período letivo ativo: fonte primária do ano letivo (endpoint /ano-letivo/ativo pode falhar)
  const [periodoAtual, turmasResp] = await Promise.all([
    periodoLetivoService.buscarAtual().catch(() => null),
    professorService.listarMinhasTurmas(),
  ])

  const vinculacoes: Vinculacao[] =
    turmasResp.status === 'sucesso' && Array.isArray(turmasResp.dados)
      ? turmasResp.dados.map((t: any) => ({
          turma_disciplina_professor_id: t.turma_disciplina_professor_id,
          turma_id: t.turma_id,
          nome_turma: t.nome_turma,
          nome_serie: t.nome_serie,
          turno: t.turno,
          sala: t.sala,
          disciplina_id: t.disciplina_id,
          nome_disciplina: t.nome_disciplina,
          ano: t.ano,
        }))
      : []

  // ano letivo: do período ativo; fallback no endpoint dedicado (que pode dar 500)
  let anoLetivoId = periodoAtual?.ano_letivo_id || ''
  let anoLetivo: AnoLetivo | null = null
  if (!anoLetivoId) {
    anoLetivo = await anoLetivoService.buscarAnoLetivoAtivo().catch(() => null)
    anoLetivoId = anoLetivo?.ano_letivo_id || ''
  }

  let trimestres: PeriodoLetivo[] = []
  if (anoLetivoId) {
    try {
      trimestres = (await periodoLetivoService.listarPorAno(anoLetivoId)).sort(
        (a, b) => a.bimestre - b.bimestre
      )
    } catch (error) {
      logger.error('❌ Erro ao carregar trimestres', 'service', error)
    }
  }
  // se nada veio mas há um período ativo, ao menos mostra ele
  if (trimestres.length === 0 && periodoAtual) trimestres = [periodoAtual]

  // Carrega a grade de cada vinculação em paralelo
  const gradesPorVinculacao: Record<string, GradeHorario[]> = {}
  await Promise.all(
    vinculacoes.map(async (v) => {
      try {
        const resp = await gradeHorarioService.buscarGradesPorVinculacao(v.turma_disciplina_professor_id)
        const dados = (resp.data ?? resp.dados ?? []) as GradeHorario | GradeHorario[]
        gradesPorVinculacao[v.turma_disciplina_professor_id] = Array.isArray(dados) ? dados : [dados]
      } catch {
        gradesPorVinculacao[v.turma_disciplina_professor_id] = []
      }
    })
  )

  const primeira = vinculacoes[0]
  return {
    anoLetivo,
    trimestres,
    trimestreAtivoId: periodoAtual?.periodo_letivo_id || '',
    vinculacoes,
    gradesPorVinculacao,
    turmaId: primeira?.turma_id ?? '',
    nomeTurma: primeira?.nome_turma ?? '',
    nomeSerie: primeira?.nome_serie ?? '',
  }
}

/** Conjunto de dias da semana (0-6) em que o professor tem alguma aula. */
export const diasSemanaComAula = (ctx: ContextoDiario): Set<number> => {
  const dias = new Set<number>()
  for (const grades of Object.values(ctx.gradesPorVinculacao)) {
    for (const g of grades) dias.add(g.dia_semana)
  }
  return dias
}

/** Disciplinas (com horários) previstas para um dia da semana específico. */
export const disciplinasDoDiaSemana = (ctx: ContextoDiario, diaSemana: number): DisciplinaDoDia[] => {
  const resultado: DisciplinaDoDia[] = []
  for (const v of ctx.vinculacoes) {
    const grades = (ctx.gradesPorVinculacao[v.turma_disciplina_professor_id] || []).filter(
      (g) => g.dia_semana === diaSemana
    )
    if (grades.length === 0) continue
    const horarios = grades
      .map((g) => `${g.hora_inicio} - ${g.hora_fim}`)
      .sort((a, b) => a.localeCompare(b))
    resultado.push({ ...v, horarios })
  }
  return resultado
}

/**
 * Mapa data(YYYY-MM-DD) -> StatusDia, considerando os registros de conteúdo
 * de todas as vinculações. completo = todas as disciplinas previstas no dia
 * têm registro 'concluido'; parcial = há algum registro mas não todos concluídos.
 */
export const carregarStatusPorData = async (
  ctx: ContextoDiario,
  diasSemanaPorData: (data: string) => number
): Promise<Record<string, StatusDia>> => {
  // registros por data: conta concluídos e total de registros existentes
  const registrosPorData: Record<string, { concluidos: number; total: number }> = {}

  await Promise.all(
    ctx.vinculacoes.map(async (v) => {
      try {
        const resp = await registroDiarioService.listarPorVinculacao(v.turma_disciplina_professor_id)
        if (!resp.sucesso || !Array.isArray(resp.dados)) return
        for (const r of resp.dados) {
          const data = r.data_aula
          const slot = (registrosPorData[data] ??= { concluidos: 0, total: 0 })
          slot.total += 1
          if (r.status === 'concluido') slot.concluidos += 1
        }
      } catch {
        /* ignora vinculação sem registros */
      }
    })
  )

  const status: Record<string, StatusDia> = {}
  for (const [data, info] of Object.entries(registrosPorData)) {
    const diaSemana = diasSemanaPorData(data)
    const previstas = disciplinasDoDiaSemanaCount(ctx, diaSemana)
    if (info.total === 0) {
      status[data] = 'vazio'
    } else if (previstas > 0 && info.concluidos >= previstas) {
      status[data] = 'completo'
    } else {
      status[data] = 'parcial'
    }
  }
  return status
}

const disciplinasDoDiaSemanaCount = (ctx: ContextoDiario, diaSemana: number): number => {
  let n = 0
  for (const v of ctx.vinculacoes) {
    const grades = ctx.gradesPorVinculacao[v.turma_disciplina_professor_id] || []
    if (grades.some((g) => g.dia_semana === diaSemana)) n += 1
  }
  return n
}
