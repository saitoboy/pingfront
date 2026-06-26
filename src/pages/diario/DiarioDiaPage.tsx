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
  Pencil,
  FileDown,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { logger } from '../../lib/logger'
import { useAuth } from '../../contexts/AuthContext'
import frequenciaService, { type AlunoFrequencia } from '../../services/frequenciaService'
import registroDiarioService from '../../services/registroDiarioService'
import RichTextEditor from '../../components/diario/RichTextEditor'
import AnexosUploader from '../../components/diario/AnexosUploader'
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
import type { RegistroDiario, StatusRegistroDiario, AnexoRegistro } from '../../types/diario'

const stripHtml = (html: string): string => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const registroVazio = (vinculacaoId: string, data: string): RegistroDiario => ({
  turma_disciplina_professor_id: vinculacaoId,
  data_aula: data,
  resumo: '',
  anexos: [],
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
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [editandoOverride, setEditandoOverride] = useState<Record<string, boolean>>({})

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
                    anexos: resp.dados.anexos || [],
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

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 3000)
    return () => clearTimeout(t)
  }, [toastMsg])

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

  const atualizarAnexos = (vinculacaoId: string, anexos: AnexoRegistro[]) => {
    setRegistros((prev) => ({
      ...prev,
      [vinculacaoId]: { ...prev[vinculacaoId], anexos },
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
        if (status === 'concluido') {
          setToastMsg('Registro concluído com sucesso!')
          setEditandoOverride((prev) => { const n = { ...prev }; delete n[vinculacaoId]; return n })
        }
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

  const [gerandoPdf, setGerandoPdf] = useState(false)

  const gerarPDF = async () => {
    if (!ctx || !data) return
    setGerandoPdf(true)
    try {
      const doc = new jsPDF()
      const pw = doc.internal.pageSize.getWidth()
      const ph = doc.internal.pageSize.getHeight()
      const margin = 14
      const contentW = pw - margin * 2
      const footerY = ph - 12

      // Paleta
      const azul: [number, number, number] = [37, 99, 235]
      const azulClaro: [number, number, number] = [219, 234, 254]
      const cinza: [number, number, number] = [107, 114, 128]
      const cinzaClaro: [number, number, number] = [243, 244, 246]
      const verde: [number, number, number] = [22, 163, 74]
      const vermelho: [number, number, number] = [220, 38, 38]
      const texto: [number, number, number] = [31, 41, 55]

      let y = 0

      const ensureSpace = (needed: number) => {
        if (y + needed > footerY - 4) {
          doc.addPage()
          y = margin + 4
        }
      }

      // Cabeçalho com faixa colorida
      doc.setFillColor(...azul)
      doc.rect(0, 0, pw, 34, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('Relatório Diário de Aula', margin, 15)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(`${formatarDataLonga(data)} • ${nomeDiaSemana(diaSemana)}`, margin, 24)
      if (trimestre) {
        doc.setFontSize(9)
        doc.text(rotuloTrimestre(trimestre.bimestre), pw - margin, 24, { align: 'right' })
      }
      y = 34

      // Caixa de informações turma/professor
      doc.setFillColor(...cinzaClaro)
      doc.rect(0, y, pw, 16, 'F')
      doc.setTextColor(...texto)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('Turma:', margin, y + 7)
      doc.setFont('helvetica', 'normal')
      doc.text(ctx.nomeTurma, margin + 16, y + 7)
      doc.setFont('helvetica', 'bold')
      doc.text('Professor(a):', margin, y + 12.5)
      doc.setFont('helvetica', 'normal')
      doc.text(usuario?.nome_usuario || '-', margin + 26, y + 12.5)
      y += 24

      // Seção de título com barra lateral colorida
      const sectionTitle = (titulo: string, cor: [number, number, number]) => {
        ensureSpace(14)
        doc.setFillColor(...cor)
        doc.rect(margin, y - 4, 3, 9, 'F')
        doc.setTextColor(...texto)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.text(titulo, margin + 6, y + 2.5)
        y += 11
      }

      // ─── Frequência ───
      sectionTitle('Frequência', verde)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...cinza)
      doc.text(
        `${presentes} presentes  •  ${alunos.length - presentes} faltas  •  ${alunos.length} alunos`,
        margin,
        y
      )
      y += 4

      if (alunos.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [['Nome do Aluno', 'RA', 'Presença']],
          body: alunos.map((a) => [
            `${a.nome_aluno} ${a.sobrenome_aluno || ''}`.trim(),
            a.ra || '-',
            a.presenca === true ? 'Presente' : 'Falta',
          ]),
          styles: { fontSize: 9, cellPadding: 3, textColor: texto },
          headStyles: { fillColor: verde, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [249, 250, 251] as [number, number, number] },
          columnStyles: {
            1: { cellWidth: 30 },
            2: { cellWidth: 32, halign: 'center' },
          },
          didParseCell: (d) => {
            if (d.section === 'body' && d.column.index === 2) {
              d.cell.styles.textColor = d.cell.raw === 'Presente' ? verde : vermelho
              d.cell.styles.fontStyle = 'bold'
            }
          },
          margin: { left: margin, right: margin },
        })
        y = (doc as any).lastAutoTable.finalY + 12
      } else {
        doc.setTextColor(...cinza)
        doc.text('Nenhum aluno registrado.', margin, y)
        y += 12
      }

      // ─── Disciplinas ───
      for (const disc of disciplinas) {
        const registro = registros[disc.turma_disciplina_professor_id]
        if (!registro) continue

        sectionTitle(disc.nome_disciplina, azul)

        // Linha de meta: horários + badge de status
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(...cinza)
        if (disc.horarios.length > 0) {
          doc.text(disc.horarios.join('  •  '), margin, y)
        }
        const concluido = registro.status === 'concluido'
        const badge = concluido ? 'Concluído' : 'Rascunho'
        const badgeCor: [number, number, number] = concluido ? verde : [217, 119, 6]
        const badgeW = doc.getTextWidth(badge) + 8
        doc.setFillColor(...badgeCor)
        doc.roundedRect(pw - margin - badgeW, y - 4, badgeW, 6, 1.5, 1.5, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.text(badge, pw - margin - badgeW + 4, y)
        y += 7

        // Conteúdo ministrado
        ensureSpace(10)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9.5)
        doc.setTextColor(...texto)
        doc.text('Conteúdo ministrado', margin, y)
        y += 5

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        const conteudo = stripHtml(registro.resumo || '').trim()
        if (conteudo) {
          const lines = doc.splitTextToSize(conteudo, contentW - 4)
          for (const line of lines) {
            ensureSpace(5.5)
            doc.setTextColor(...texto)
            doc.text(line, margin + 2, y)
            y += 5
          }
          y += 3
        } else {
          doc.setTextColor(...cinza)
          doc.text('(sem conteúdo registrado)', margin + 2, y)
          y += 7
        }

        // Anexos
        if (registro.anexos && registro.anexos.length > 0) {
          ensureSpace(8)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9.5)
          doc.setTextColor(...texto)
          doc.text('Anexos', margin, y)
          y += 5

          for (const anexo of registro.anexos) {
            const ehImagem = anexo.tipo?.startsWith('image/') && anexo.dados
            if (ehImagem) {
              try {
                const props = doc.getImageProperties(anexo.dados)
                const maxW = contentW - 4
                const maxH = 90
                let w = props.width
                let h = props.height
                // converte px -> mm aprox (96 dpi) e limita
                const ratio = w / h
                w = maxW
                h = w / ratio
                if (h > maxH) {
                  h = maxH
                  w = h * ratio
                }
                ensureSpace(h + 8)
                // legenda (nome)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.setTextColor(...cinza)
                doc.text(`• ${anexo.nome}`, margin + 2, y)
                y += 4
                doc.addImage(anexo.dados, props.fileType, margin + 2, y, w, h)
                // moldura
                doc.setDrawColor(...azulClaro)
                doc.rect(margin + 2, y, w, h)
                y += h + 5
              } catch {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8.5)
                doc.setTextColor(...cinza)
                doc.text(`• ${anexo.nome} (imagem não pôde ser carregada)`, margin + 2, y)
                y += 5
              }
            } else {
              ensureSpace(5)
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(8.5)
              doc.setTextColor(...cinza)
              doc.text(`• ${anexo.nome}`, margin + 2, y)
              y += 5
            }
          }
          y += 2
        }
        y += 4
      }

      // Rodapé em todas as páginas
      const pageCount = (doc.internal as any).getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setDrawColor(...cinzaClaro)
        doc.line(margin, footerY - 3, pw - margin, footerY - 3)
        doc.setFontSize(8)
        doc.setTextColor(...cinza)
        doc.setFont('helvetica', 'normal')
        doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, margin, footerY)
        doc.text(`Página ${i} de ${pageCount}`, pw - margin, footerY, { align: 'right' })
      }

      doc.save(`diario-${data}.pdf`)
    } catch (error) {
      logger.error('❌ Erro ao gerar PDF', 'component', error)
      alert('Erro ao gerar o PDF.')
    } finally {
      setGerandoPdf(false)
    }
  }

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
              {!futuro && disciplinas.length > 0 && (
                <button
                  onClick={gerarPDF}
                  disabled={gerandoPdf}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {gerandoPdf ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  {gerandoPdf ? 'Gerando...' : 'Exportar PDF'}
                </button>
              )}
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
                    const editandoEste = Boolean(editandoOverride[disc.turma_disciplina_professor_id])
                    const bloqueado = concluido && !editandoEste
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

                        <div className={`p-5 space-y-4 transition-colors ${bloqueado ? 'bg-gray-50/70' : ''}`}>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Conteúdo ministrado
                            </label>
                            <RichTextEditor
                              value={registro.resumo}
                              onChange={(html) => atualizarConteudo(disc.turma_disciplina_professor_id, html)}
                              placeholder="Descreva o conteúdo trabalhado nesta disciplina..."
                              disabled={bloqueado || ocupado}
                              minHeight={120}
                            />
                          </div>
                          <AnexosUploader
                            value={registro.anexos || []}
                            onChange={(anexos) => atualizarAnexos(disc.turma_disciplina_professor_id, anexos)}
                            disabled={bloqueado || ocupado}
                          />
                          <div className="flex justify-end gap-3">
                            {bloqueado ? (
                              <button
                                onClick={() =>
                                  setEditandoOverride((prev) => ({
                                    ...prev,
                                    [disc.turma_disciplina_professor_id]: true,
                                  }))
                                }
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-blue-700 border-2 border-blue-200 bg-white rounded-xl hover:bg-blue-50 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Editar
                              </button>
                            ) : (
                              <>
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
                              </>
                            )}
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

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-green-600 text-white rounded-2xl shadow-2xl pointer-events-none">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold whitespace-nowrap">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
