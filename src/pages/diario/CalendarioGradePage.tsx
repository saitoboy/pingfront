import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  ClipboardList,
  UserCheck,
  X,
  Save,
  Users,
  Edit,
  Trash2
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { professorService } from '../../services/professorService'
import gradeHorarioService from '../../services/gradeHorarioService'
import conteudoAulaService from '../../services/conteudoAulaService'
import atividadeService from '../../services/atividadeService'
import frequenciaService, { type AlunoFrequencia } from '../../services/frequenciaService'
import periodoLetivoService from '../../services/periodoLetivoService'
import type { ProfessorComTurmas } from '../../types/diario'

interface TurmaDisciplina {
  turma_id: string;
  nome_turma: string;
  turno: string;
  sala: string;
  nome_serie: string;
  disciplina_id: string;
  nome_disciplina: string;
  ano: number;
  ano_letivo_ativo: boolean;
  turma_disciplina_professor_id: string;
}

interface GradeHorario {
  grade_horario_id: string;
  turma_disciplina_professor_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  nome_disciplina: string;
  nome_turma: string;
  nome_serie: string;
}

interface DiaCalendario {
  data: Date;
  dia: number;
  mes: number;
  ano: number;
  diaSemana: number;
  isCurrentMonth: boolean;
  conteudos: any[];
  atividades: any[];
  frequencias: any[];
  grades: GradeHorario[];
}

export default function CalendarioGradePage() {
  const { professorId } = useParams<{ professorId: string; diaSemana?: string }>()
  const navigate = useNavigate()
  const [_professor, setProfessor] = useState<ProfessorComTurmas | null>(null)
  const [turmasDisciplinas, setTurmasDisciplinas] = useState<TurmaDisciplina[]>([])
  const [mesAtual, setMesAtual] = useState(new Date())
  const [calendario, setCalendario] = useState<DiaCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [diaSelecionado, setDiaSelecionado] = useState<DiaCalendario | null>(null)
  const [periodoLetivoAtual, setPeriodoLetivoAtual] = useState<string>('')
  const [alunosTurma, setAlunosTurma] = useState<Record<string, AlunoFrequencia[]>>({})
  
  // Estados para formulários
  const [showFormConteudo, setShowFormConteudo] = useState(false)
  const [showFormAtividade, setShowFormAtividade] = useState(false)
  const [showFormFrequencia, setShowFormFrequencia] = useState(false)
  const [showViewConteudo, setShowViewConteudo] = useState(false)
  const [showEditConteudo, setShowEditConteudo] = useState(false)
  const [conteudoSelecionado, setConteudoSelecionado] = useState<any>(null)
  const [gradeSelecionada, setGradeSelecionada] = useState<GradeHorario | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [loadingFrequencia, setLoadingFrequencia] = useState(false)
  const [editConteudo, setEditConteudo] = useState({ descricao: '', conteudo: '' })
  
  // Formulários
  const [formConteudo, setFormConteudo] = useState({ descricao: '', conteudo: '' })
  const [formAtividade, setFormAtividade] = useState({ 
    titulo: '', 
    descricao: '', 
    peso: 1, 
    vale_nota: false 
  })
  const [frequencias, setFrequencias] = useState<Record<string, boolean>>({})

  // Removido: não precisamos mais filtrar por dia da semana específico
  // const diaSemanaNum = diaSemana ? parseInt(diaSemana) : 1

  // Função auxiliar para formatar data no formato YYYY-MM-DD
  // Usa métodos locais para evitar problemas de timezone
  const formatarDataParaAPI = (data: Date): string => {
    // Criar uma nova data no timezone local para evitar problemas de conversão
    const dataLocal = new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      0, 0, 0, 0
    )
    const ano = dataLocal.getFullYear()
    const mes = String(dataLocal.getMonth() + 1).padStart(2, '0')
    const dia = String(dataLocal.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  useEffect(() => {
    if (professorId) {
      carregarDados()
      carregarPeriodoLetivoAtual()
    }
  }, [professorId, mesAtual])

  const carregarPeriodoLetivoAtual = async () => {
    try {
      const response = await periodoLetivoService.buscarPeriodoLetivoAtual()
      if (response.sucesso && response.dados) {
        const periodo = Array.isArray(response.dados) ? response.dados[0] : response.dados
        setPeriodoLetivoAtual(periodo.periodo_letivo_id)
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar período letivo atual', 'component', error)
    }
  }

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      // Carregar professor
      const professorResponse = await professorService.listarProfessoresComTurmas()
      if (professorResponse.status === 'sucesso' && professorResponse.dados) {
        const prof = professorResponse.dados.find(p => p.usuario_id === professorId)
        if (prof) {
          setProfessor(prof)
        }
      }

      // Carregar turmas/disciplinas
      const turmasResponse = await professorService.listarTurmasProfessor(professorId || '')
      if (turmasResponse.status === 'sucesso' && turmasResponse.dados) {
        const turmas = turmasResponse.dados as TurmaDisciplina[]
        setTurmasDisciplinas(turmas)

        // Carregar grades de todos os dias da semana
        const gradesPromises = turmas.map(async (td) => {
          try {
            const gradesResponse = await gradeHorarioService.buscarGradesPorVinculacao(td.turma_disciplina_professor_id)
            const grades = gradesResponse.dados || gradesResponse.data || []
            const gradesArray = Array.isArray(grades) ? grades : [grades]
            
            return gradesArray.map((g: any) => ({
              ...g,
              nome_disciplina: td.nome_disciplina,
              nome_turma: td.nome_turma,
              nome_serie: td.nome_serie,
              turma_disciplina_professor_id: td.turma_disciplina_professor_id
            }))
          } catch (error) {
            return []
          }
        })

        const gradesArrays = await Promise.all(gradesPromises)
        const todasGrades = gradesArrays.flat()

        // Gerar calendário
        await gerarCalendario(todasGrades)
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar dados', 'component', error)
    } finally {
      setLoading(false)
    }
  }

  const gerarCalendario = async (todasGrades: GradeHorario[]) => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    
    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes, 1)
    
    // Dia da semana do primeiro dia (0 = Domingo, 1 = Segunda, etc.)
    const diaSemanaPrimeiro = primeiroDia.getDay()
    
    // Ajustar para começar na segunda-feira (1)
    const diasAntes = diaSemanaPrimeiro === 0 ? 6 : diaSemanaPrimeiro - 1
    
    // Primeiro dia visível no calendário
    const primeiroDiaVisivel = new Date(ano, mes, 1 - diasAntes)
    
    const dias: DiaCalendario[] = []
    
    // Gerar 42 dias (6 semanas) - todos os dias do calendário
    for (let i = 0; i < 42; i++) {
      // Criar data no timezone local para evitar problemas de timezone
      // Usar os valores diretamente do primeiroDiaVisivel e adicionar i dias
      const data = new Date(
        primeiroDiaVisivel.getFullYear(),
        primeiroDiaVisivel.getMonth(),
        primeiroDiaVisivel.getDate() + i,
        0, 0, 0, 0
      )
      
      const diaSemanaData = data.getDay()
      const isCurrentMonth = data.getMonth() === mes
      
      // Filtrar grades que correspondem ao dia da semana deste dia
      // Converter domingo (0) para 7 para compatibilidade com o sistema
      const diaSemanaParaFiltro = diaSemanaData === 0 ? 7 : diaSemanaData
      const gradesDoDia = todasGrades.filter(grade => grade.dia_semana === diaSemanaParaFiltro)
      
      // Se houver grades para este dia e for do mês atual, buscar dados
      if (gradesDoDia.length > 0 && isCurrentMonth) {
        // Criar data no formato YYYY-MM-DD
        const dataStr = formatarDataParaAPI(data)
        
        // Buscar dados para este dia
        const conteudosPromises = gradesDoDia.map(async (grade) => {
          try {
            const response = await conteudoAulaService.buscarConteudosPorDataEVinculacao(
              grade.turma_disciplina_professor_id,
              dataStr
            )
            const conteudos = response.dados || []
            return Array.isArray(conteudos) ? conteudos.map((c: any) => ({ ...c, grade })) : []
          } catch {
            return []
          }
        })

        const atividadesPromises = gradesDoDia.map(async (grade) => {
          try {
            const response = await atividadeService.buscarAtividadesPorDataEVinculacao(
              grade.turma_disciplina_professor_id,
              dataStr
            )
            const atividades = response.dados || []
            return Array.isArray(atividades) ? atividades.map((a: any) => ({ ...a, grade })) : []
          } catch {
            return []
          }
        })

        // Buscar frequências agrupadas por turma (não por disciplina)
        // Agrupar grades por turma_id para buscar frequência uma vez por turma
        const turmasUnicas = new Map<string, { turma_id: string, professor_id: string }>()
        gradesDoDia.forEach(grade => {
          const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === grade.turma_disciplina_professor_id)
          if (turma && !turmasUnicas.has(turma.turma_id)) {
            // Buscar professor_id a partir do usuario_id (professorId)
            // No sistema, professor_id na vinculação é o usuario_id
            turmasUnicas.set(turma.turma_id, {
              turma_id: turma.turma_id,
              professor_id: professorId || '' // professorId é o usuario_id que também é usado como professor_id
            })
          }
        })

        const frequenciasPromises = Array.from(turmasUnicas.values()).map(async ({ turma_id, professor_id }) => {
          try {
            const response = await frequenciaService.buscarFrequenciasPorProfessorTurmaEData(
              professor_id,
              turma_id,
              dataStr
            )
            const frequencias = response.dados || []
            // Associar frequências a todas as grades dessa turma
            const gradesDaTurma = gradesDoDia.filter(g => {
              const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === g.turma_disciplina_professor_id)
              return turma?.turma_id === turma_id
            })
            return Array.isArray(frequencias) 
              ? frequencias.map((f: any) => ({ 
                  ...f, 
                  grade: gradesDaTurma[0] // Usar primeira grade como referência
                })) 
              : []
          } catch {
            return []
          }
        })

        const [conteudosArrays, atividadesArrays, frequenciasArrays] = await Promise.all([
          Promise.all(conteudosPromises),
          Promise.all(atividadesPromises),
          Promise.all(frequenciasPromises)
        ])

        dias.push({
          data,
          dia: data.getDate(),
          mes: data.getMonth(),
          ano: data.getFullYear(),
          diaSemana: diaSemanaData,
          isCurrentMonth,
          conteudos: conteudosArrays.flat(),
          atividades: atividadesArrays.flat(),
          frequencias: frequenciasArrays.flat(),
          grades: gradesDoDia
        })
      } else {
        // Incluir todos os dias do calendário (mesmo os que não têm aulas)
        dias.push({
          data,
          dia: data.getDate(),
          mes: data.getMonth(),
          ano: data.getFullYear(),
          diaSemana: diaSemanaData,
          isCurrentMonth,
          conteudos: [],
          atividades: [],
          frequencias: [],
          grades: []
        })
      }
    }

    setCalendario(dias)
  }

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))
  }

  const mesProximo = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))
  }

  const carregarAlunosTurmas = async (grades: GradeHorario[]) => {
    if (!diaSelecionado || !professorId) return
    
    for (const grade of grades) {
      // Usar turma_id como chave ao invés de turma_disciplina_professor_id
      const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === grade.turma_disciplina_professor_id)
      if (!turma) continue
      
      const turmaKey = turma.turma_id
      
      if (!alunosTurma[turmaKey]) {
        try {
          // Criar data no formato YYYY-MM-DD
          const dataStr = formatarDataParaAPI(diaSelecionado.data)
          
          // Primeiro tentar buscar frequências existentes
          try {
            const frequenciasExistentes = await frequenciaService.buscarFrequenciasPorProfessorTurmaEData(
              professorId, // professorId é o usuario_id que também é usado como professor_id
              turma.turma_id,
              dataStr
            )
            
            if (frequenciasExistentes.sucesso && frequenciasExistentes.dados && Array.isArray(frequenciasExistentes.dados) && frequenciasExistentes.dados.length > 0) {
              // Usar frequências existentes
              const alunosComPresenca = frequenciasExistentes.dados.map((freq: any) => ({
                matricula_aluno_id: freq.matricula_aluno_id,
                ra: freq.ra || '',
                nome_aluno: freq.nome_aluno || '',
                sobrenome_aluno: freq.sobrenome_aluno || '',
                presenca: freq.presenca,
                frequencia_id: freq.frequencia_id
              }))
              
              setAlunosTurma(prev => ({
                ...prev,
                [turmaKey]: alunosComPresenca
              }))
              continue
            }
          } catch (error) {
            logger.warning('⚠️ Erro ao buscar frequências existentes, buscando alunos da turma', 'component', error)
          }
          
          // Se não encontrou frequências, buscar alunos da turma
          const response = await frequenciaService.buscarAlunosTurma(turma.turma_id)
          const alunos = response.dados || []
          const alunosArray = Array.isArray(alunos) ? (alunos as any[]).map(aluno => ({
            ...aluno,
            presenca: true // Todos começam como presentes
          })) as AlunoFrequencia[] : []
          
          setAlunosTurma(prev => ({
            ...prev,
            [turmaKey]: alunosArray
          }))
        } catch (error) {
          logger.error(`❌ Erro ao carregar alunos da turma ${turma.turma_id}`, 'component', error)
        }
      }
    }
  }

  const handleSalvarConteudo = async () => {
    if (!gradeSelecionada || !formConteudo.descricao || !formConteudo.conteudo || !diaSelecionado) return

    try {
      setSalvando(true)
      // Criar data no formato YYYY-MM-DD
      const dataStr = formatarDataParaAPI(diaSelecionado.data)
      
      const response = await conteudoAulaService.criarConteudoComData({
        turma_disciplina_professor_id: gradeSelecionada.turma_disciplina_professor_id,
        data_aula: dataStr,
        descricao: formConteudo.descricao,
        conteudo: formConteudo.conteudo
      })

      if (response.sucesso || (response as any).success) {
        logger.success('✅ Conteúdo criado com sucesso', 'component')
        setShowFormConteudo(false)
        setFormConteudo({ descricao: '', conteudo: '' })
        setGradeSelecionada(null)
        await carregarDados()
      }
    } catch (error: any) {
      logger.error('❌ Erro ao criar conteúdo', 'component', error)
      alert(error.response?.data?.mensagem || error.message || 'Erro ao criar conteúdo')
    } finally {
      setSalvando(false)
    }
  }

  const handleEditarConteudo = () => {
    if (!conteudoSelecionado) return
    setEditConteudo({
      descricao: conteudoSelecionado.descricao || '',
      conteudo: conteudoSelecionado.conteudo || ''
    })
    setShowViewConteudo(false)
    setShowEditConteudo(true)
  }

  const handleSalvarEdicaoConteudo = async () => {
    if (!conteudoSelecionado || !editConteudo.descricao.trim() || !editConteudo.conteudo.trim()) return

    try {
      setSalvando(true)
      
      const response = await conteudoAulaService.atualizarConteudo(
        conteudoSelecionado.conteudo_aula_id,
        {
          descricao: editConteudo.descricao,
          conteudo: editConteudo.conteudo
        }
      )

      if (response.sucesso || (response as any).success) {
        logger.success('✅ Conteúdo atualizado com sucesso', 'component')
        setShowEditConteudo(false)
        setConteudoSelecionado(null)
        setEditConteudo({ descricao: '', conteudo: '' })
        await carregarDados()
      }
    } catch (error: any) {
      logger.error('❌ Erro ao atualizar conteúdo', 'component', error)
      alert(error.response?.data?.mensagem || error.message || 'Erro ao atualizar conteúdo')
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluirConteudo = async () => {
    if (!conteudoSelecionado) return
    
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir o conteúdo "${conteudoSelecionado.descricao}"?\n\nEsta ação não pode ser desfeita.`
    )
    
    if (!confirmacao) return

    try {
      setSalvando(true)
      
      const response = await conteudoAulaService.deletarConteudo(conteudoSelecionado.conteudo_aula_id)

      if (response.sucesso || (response as any).success) {
        logger.success('✅ Conteúdo excluído com sucesso', 'component')
        setShowViewConteudo(false)
        setConteudoSelecionado(null)
        await carregarDados()
      }
    } catch (error: any) {
      logger.error('❌ Erro ao excluir conteúdo', 'component', error)
      alert(error.response?.data?.mensagem || error.message || 'Erro ao excluir conteúdo')
    } finally {
      setSalvando(false)
    }
  }

  const handleSalvarAtividade = async () => {
    if (!gradeSelecionada || !formAtividade.titulo || !periodoLetivoAtual || !diaSelecionado) return

    try {
      setSalvando(true)
      // Criar data no formato YYYY-MM-DD
      const dataStr = formatarDataParaAPI(diaSelecionado.data)
      
      const response = await atividadeService.criarAtividadeComData({
        turma_disciplina_professor_id: gradeSelecionada.turma_disciplina_professor_id,
        data_aula: dataStr,
        titulo: formAtividade.titulo,
        descricao: formAtividade.descricao,
        peso: formAtividade.peso,
        vale_nota: formAtividade.vale_nota,
        periodo_letivo_id: periodoLetivoAtual
      })

      if (response.sucesso || (response as any).success) {
        logger.success('✅ Atividade criada com sucesso', 'component')
        setShowFormAtividade(false)
        setFormAtividade({ titulo: '', descricao: '', peso: 1, vale_nota: false })
        setGradeSelecionada(null)
        await carregarDados()
      }
    } catch (error: any) {
      logger.error('❌ Erro ao criar atividade', 'component', error)
      alert(error.response?.data?.mensagem || error.message || 'Erro ao criar atividade')
    } finally {
      setSalvando(false)
    }
  }

  const handleAbrirFrequencia = async (grade: GradeHorario) => {
    try {
      setLoadingFrequencia(true)
      setGradeSelecionada(grade)
      
      if (!diaSelecionado || !professorId) return
      
      // Buscar turma_id a partir da grade selecionada
      const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === grade.turma_disciplina_professor_id)
      if (!turma) {
        throw new Error('Turma não encontrada')
      }
      
      // Criar data no formato YYYY-MM-DD
      const dataStr = formatarDataParaAPI(diaSelecionado.data)
      
      // Buscar frequências existentes
      const frequenciasExistentes = await frequenciaService.buscarFrequenciasPorProfessorTurmaEData(
        professorId, // usuario_id usado como professor_id
        turma.turma_id,
        dataStr
      )
      
      if (frequenciasExistentes.sucesso && frequenciasExistentes.dados && Array.isArray(frequenciasExistentes.dados) && frequenciasExistentes.dados.length > 0) {
        // Carregar frequências existentes
        const frequenciasMap: Record<string, boolean> = {}
        frequenciasExistentes.dados.forEach((freq: any) => {
          frequenciasMap[freq.matricula_aluno_id] = freq.presenca === true
        })
        setFrequencias(frequenciasMap)
        
        // Carregar alunos com frequências existentes
        const alunosComPresenca = frequenciasExistentes.dados.map((freq: any) => ({
          matricula_aluno_id: freq.matricula_aluno_id,
          ra: freq.ra || '',
          nome_aluno: freq.nome_aluno || '',
          sobrenome_aluno: freq.sobrenome_aluno || '',
          presenca: freq.presenca === true,
          frequencia_id: freq.frequencia_id
        }))
        
        setAlunosTurma({
          ...alunosTurma,
          [turma.turma_id]: alunosComPresenca
        })
      } else {
        // Buscar alunos da turma se não houver frequências
        const response = await frequenciaService.buscarAlunosTurma(turma.turma_id)
        
        if (response.sucesso && response.dados) {
          const alunosComPresenca = (response.dados as any[]).map(aluno => ({
            ...aluno,
            presenca: true // Todos começam como presentes
          })) as AlunoFrequencia[]
          
          setAlunosTurma({
            ...alunosTurma,
            [turma.turma_id]: alunosComPresenca
          })
          
          // Inicializar todas como presentes
          const frequenciasMap: Record<string, boolean> = {}
          alunosComPresenca.forEach(aluno => {
            frequenciasMap[aluno.matricula_aluno_id] = true
          })
          setFrequencias(frequenciasMap)
        }
      }
      
      setShowFormFrequencia(true)
    } catch (error: any) {
      logger.error('❌ Erro ao carregar frequência', 'component', error)
      alert(error.response?.data?.mensagem || error.message || 'Erro ao carregar frequência')
    } finally {
      setLoadingFrequencia(false)
    }
  }

  const handleSalvarFrequencia = async () => {
    if (!gradeSelecionada || !diaSelecionado || Object.keys(frequencias).length === 0) return

    try {
      setSalvando(true)
      
      // Buscar turma_id a partir da grade selecionada
      const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === gradeSelecionada.turma_disciplina_professor_id)
      if (!turma) {
        throw new Error('Turma não encontrada')
      }
      
      // Criar data no formato YYYY-MM-DD
      const ano = diaSelecionado.data.getFullYear()
      const mes = String(diaSelecionado.data.getMonth() + 1).padStart(2, '0')
      const dia = String(diaSelecionado.data.getDate()).padStart(2, '0')
      const dataStr = `${ano}-${mes}-${dia}`
      
      const frequenciasArray = Object.entries(frequencias).map(([matriculaId, presenca]) => ({
        matricula_aluno_id: matriculaId,
        presenca: presenca === true
      }))

      // Usar professor_id (que é o usuario_id/professorId) e turma_id
      const response = await frequenciaService.registrarFrequenciaLotePorProfessorTurmaEData(
        professorId || '', // professorId é o usuario_id que também é usado como professor_id
        turma.turma_id,
        dataStr,
        frequenciasArray
      )

      if (response.sucesso || (response as any).success) {
        logger.success('✅ Frequência registrada com sucesso', 'component')
        setShowFormFrequencia(false)
        setFrequencias({})
        setGradeSelecionada(null)
        await carregarDados()
      }
    } catch (error: any) {
      logger.error('❌ Erro ao registrar frequência', 'component', error)
      alert(error.response?.data?.mensagem || error.message || 'Erro ao registrar frequência')
    } finally {
      setSalvando(false)
    }
  }

  const handleMarcarTodosPresentes = () => {
    const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === gradeSelecionada?.turma_disciplina_professor_id)
    const turmaKey = turma?.turma_id || ''
    const alunos = alunosTurma[turmaKey] || []
    
    const novasFrequencias: Record<string, boolean> = {}
    alunos.forEach(aluno => {
      novasFrequencias[aluno.matricula_aluno_id] = true
    })
    setFrequencias(novasFrequencias)
  }

  const handleMarcarTodosFaltas = () => {
    const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === gradeSelecionada?.turma_disciplina_professor_id)
    const turmaKey = turma?.turma_id || ''
    const alunos = alunosTurma[turmaKey] || []
    
    const novasFrequencias: Record<string, boolean> = {}
    alunos.forEach(aluno => {
      novasFrequencias[aluno.matricula_aluno_id] = false
    })
    setFrequencias(novasFrequencias)
  }

  const handleTogglePresenca = (matriculaId: string) => {
    setFrequencias(prev => ({
      ...prev,
      [matriculaId]: !prev[matriculaId]
    }))
  }

  const nomeMes = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navegação do Mês */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={mesAnterior}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{nomeMes}</h2>
            <button
              onClick={mesProximo}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendário */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando calendário...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {diasSemana.map((dia) => (
                <div key={dia} className="p-4 text-center font-semibold text-gray-700 bg-gray-50">
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do calendário */}
            <div className="grid grid-cols-7">
              {calendario.map((dia, index) => {
                const hoje = new Date()
                const isHoje = dia.data.toDateString() === hoje.toDateString()
                const temAulas = dia.grades.length > 0 && dia.isCurrentMonth

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (temAulas) {
                        setDiaSelecionado(dia)
                        // Carregar alunos das turmas se necessário
                        carregarAlunosTurmas(dia.grades)
                      }
                    }}
                    className={`
                      min-h-[120px] p-2 border border-gray-200
                      ${dia.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${temAulas ? 'cursor-pointer hover:bg-blue-50' : ''}
                      ${isHoje && temAulas ? 'ring-2 ring-blue-500' : ''}
                      ${!dia.isCurrentMonth ? 'opacity-50' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium mb-1 ${isHoje ? 'text-blue-600' : 'text-gray-700'}`}>
                      {dia.dia}
                    </div>
                    {temAulas && (
                      <div className="space-y-1">
                        {dia.conteudos.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <FileText className="w-3 h-3" />
                            <span>{dia.conteudos.length}</span>
                          </div>
                        )}
                        {dia.atividades.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-purple-600">
                            <ClipboardList className="w-3 h-3" />
                            <span>{dia.atividades.length}</span>
                          </div>
                        )}
                        {dia.frequencias.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-blue-600">
                            <UserCheck className="w-3 h-3" />
                            <span>{dia.frequencias.length}</span>
                          </div>
                        )}
                        {dia.grades.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {dia.grades.length} {dia.grades.length === 1 ? 'aula' : 'aulas'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Dia */}
        {diaSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {diaSelecionado.data.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <button
                  onClick={() => setDiaSelecionado(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Botões de Adicionar */}
                {diaSelecionado.grades.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                    {/* Botões de Conteúdo - um por disciplina/turma */}
                    {diaSelecionado.grades.map((grade) => (
                      <button
                        key={`conteudo-${grade.grade_horario_id}`}
                        onClick={() => {
                          setGradeSelecionada(grade)
                          setShowFormConteudo(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Conteúdo - {grade.nome_disciplina}</span>
                      </button>
                    ))}
                    {/* Botões de Atividade - um por disciplina/turma */}
                    {diaSelecionado.grades.map((grade) => (
                      <button
                        key={`atividade-${grade.grade_horario_id}`}
                        onClick={() => {
                          setGradeSelecionada(grade)
                          setShowFormAtividade(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Avaliação - {grade.nome_disciplina}</span>
                      </button>
                    ))}
                    {/* Agrupar grades por turma e criar apenas um botão por turma */}
                    {(() => {
                      // Agrupar grades por turma_id
                      const turmasUnicas = new Map<string, GradeHorario>()
                      diaSelecionado.grades.forEach(grade => {
                        const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === grade.turma_disciplina_professor_id)
                        if (turma && !turmasUnicas.has(turma.turma_id)) {
                          turmasUnicas.set(turma.turma_id, grade)
                        }
                      })
                      
                      return Array.from(turmasUnicas.values()).map((grade) => {
                        const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === grade.turma_disciplina_professor_id)
                        return (
                          <button
                            key={`freq-${turma?.turma_id || grade.grade_horario_id}`}
                            onClick={() => handleAbrirFrequencia(grade)}
                            disabled={loadingFrequencia}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Frequência - {turma?.nome_turma || grade.nome_turma}</span>
                          </button>
                        )
                      })
                    })()}
                  </div>
                )}

                {/* Conteúdos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                    Conteúdos ({diaSelecionado.conteudos.length})
                  </h3>
                  {diaSelecionado.conteudos.length > 0 ? (
                    <div className="space-y-3">
                      {diaSelecionado.conteudos.map((conteudo: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="bg-green-50 rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setConteudoSelecionado(conteudo)
                            setShowViewConteudo(true)
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{conteudo.grade?.nome_disciplina}</h4>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                  {conteudo.grade?.hora_inicio} - {conteudo.grade?.hora_fim}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{conteudo.grade?.nome_serie} - {conteudo.grade?.nome_turma}</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-green-100">
                            <p className="text-sm font-semibold text-gray-800 mb-2">{conteudo.descricao}</p>
                            <p className="text-sm text-gray-700 line-clamp-3">{conteudo.conteudo}</p>
                          </div>
                          {conteudo.created_at && (
                            <p className="text-xs text-gray-500 mt-2">
                              Criado em: {new Date(conteudo.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            Clique para ver mais detalhes →
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhum conteúdo registrado para este dia</p>
                    </div>
                  )}
                </div>

                {/* Atividades */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <ClipboardList className="w-5 h-5 text-purple-600 mr-2" />
                    Avaliações ({diaSelecionado.atividades.length})
                  </h3>
                  {diaSelecionado.atividades.length > 0 ? (
                    <div className="space-y-3">
                      {diaSelecionado.atividades.map((atividade: any, idx: number) => (
                        <div key={idx} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{atividade.grade?.nome_disciplina}</h4>
                              <p className="text-sm text-gray-600">{atividade.grade?.nome_serie} - {atividade.grade?.nome_turma}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {atividade.grade?.hora_inicio} - {atividade.grade?.hora_fim}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">{atividade.titulo}</p>
                          <p className="text-sm text-gray-600">{atividade.descricao}</p>
                          {atividade.vale_nota && (
                            <div className="mt-2 text-xs text-purple-600">
                              Peso: {atividade.peso} • Vale nota
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhuma avaliação registrada para este dia</p>
                    </div>
                  )}
                </div>




              </div>
            </div>
          </div>
        )}

        {/* Modal Separado de Conteúdo */}
        {showFormConteudo && gradeSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 text-green-600 mr-3" />
                  Adicionar Conteúdo - {gradeSelecionada.nome_disciplina}
                </h3>
                <button
                  onClick={() => {
                    setShowFormConteudo(false)
                    setGradeSelecionada(null)
                    setFormConteudo({ descricao: '', conteudo: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formConteudo.descricao}
                      onChange={(e) => setFormConteudo({ ...formConteudo, descricao: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: Capítulo 5 - Equações Quadráticas"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conteúdo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formConteudo.conteudo}
                      onChange={(e) => setFormConteudo({ ...formConteudo, conteudo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={8}
                      placeholder="Descreva detalhadamente o conteúdo ministrado nesta aula..."
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Turma:</strong> {gradeSelecionada.nome_turma} - {gradeSelecionada.nome_serie}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Horário:</strong> {gradeSelecionada.hora_inicio} - {gradeSelecionada.hora_fim}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Data:</strong> {diaSelecionado?.data.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowFormConteudo(false)
                        setGradeSelecionada(null)
                        setFormConteudo({ descricao: '', conteudo: '' })
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSalvarConteudo}
                      disabled={salvando || !formConteudo.descricao.trim() || !formConteudo.conteudo.trim()}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{salvando ? 'Salvando...' : 'Salvar Conteúdo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização de Conteúdo */}
        {showViewConteudo && conteudoSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 text-green-600 mr-3" />
                  Conteúdo - {conteudoSelecionado.grade?.nome_disciplina}
                </h3>
                <button
                  onClick={() => {
                    setShowViewConteudo(false)
                    setConteudoSelecionado(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {/* Informações da Aula */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Turma</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {conteudoSelecionado.grade?.nome_turma} - {conteudoSelecionado.grade?.nome_serie}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Horário</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {conteudoSelecionado.grade?.hora_inicio} - {conteudoSelecionado.grade?.hora_fim}
                        </p>
                      </div>
                      {conteudoSelecionado.created_at && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Data de Criação</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(conteudoSelecionado.created_at).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-base font-semibold text-gray-900">{conteudoSelecionado.descricao}</p>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {conteudoSelecionado.conteudo}
                      </p>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={handleExcluirConteudo}
                      disabled={salvando}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir</span>
                    </button>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setShowViewConteudo(false)
                          setConteudoSelecionado(null)
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Fechar
                      </button>
                      <button
                        onClick={handleEditarConteudo}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Conteúdo */}
        {showEditConteudo && conteudoSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Edit className="w-6 h-6 text-green-600 mr-3" />
                  Editar Conteúdo - {conteudoSelecionado.grade?.nome_disciplina}
                </h3>
                <button
                  onClick={() => {
                    setShowEditConteudo(false)
                    setConteudoSelecionado(null)
                    setEditConteudo({ descricao: '', conteudo: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {/* Informações da Aula */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Turma</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {conteudoSelecionado.grade?.nome_turma} - {conteudoSelecionado.grade?.nome_serie}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Horário</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {conteudoSelecionado.grade?.hora_inicio} - {conteudoSelecionado.grade?.hora_fim}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editConteudo.descricao}
                      onChange={(e) => setEditConteudo({ ...editConteudo, descricao: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Ex: Capítulo 5 - Equações Quadráticas"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conteúdo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editConteudo.conteudo}
                      onChange={(e) => setEditConteudo({ ...editConteudo, conteudo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={10}
                      placeholder="Descreva detalhadamente o conteúdo ministrado nesta aula..."
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowEditConteudo(false)
                        setConteudoSelecionado(null)
                        setEditConteudo({ descricao: '', conteudo: '' })
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSalvarEdicaoConteudo}
                      disabled={salvando || !editConteudo.descricao.trim() || !editConteudo.conteudo.trim()}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{salvando ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Separado de Atividade */}
        {showFormAtividade && gradeSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <ClipboardList className="w-6 h-6 text-purple-600 mr-3" />
                  Adicionar Avaliação - {gradeSelecionada.nome_disciplina}
                </h3>
                <button
                  onClick={() => {
                    setShowFormAtividade(false)
                    setGradeSelecionada(null)
                    setFormAtividade({ titulo: '', descricao: '', peso: 1, vale_nota: false })
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {/* Informações da Aula */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Turma</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {gradeSelecionada.nome_turma} - {gradeSelecionada.nome_serie}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Horário</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {gradeSelecionada.hora_inicio} - {gradeSelecionada.hora_fim}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Data</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {diaSelecionado?.data.toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formAtividade.titulo}
                      onChange={(e) => setFormAtividade({ ...formAtividade, titulo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Ex: Prova Bimestral - Matemática"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formAtividade.descricao}
                      onChange={(e) => setFormAtividade({ ...formAtividade, descricao: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={5}
                      placeholder="Descreva detalhadamente a avaliação..."
                    />
                  </div>

                  {/* Peso e Vale Nota */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formAtividade.peso}
                        onChange={(e) => setFormAtividade({ ...formAtividade, peso: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center space-x-3 cursor-pointer p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors w-full">
                        <input
                          type="checkbox"
                          checked={formAtividade.vale_nota}
                          onChange={(e) => setFormAtividade({ ...formAtividade, vale_nota: e.target.checked })}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Vale nota</span>
                      </label>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowFormAtividade(false)
                        setGradeSelecionada(null)
                        setFormAtividade({ titulo: '', descricao: '', peso: 1, vale_nota: false })
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSalvarAtividade}
                      disabled={salvando || !formAtividade.titulo.trim() || !formAtividade.descricao.trim() || !periodoLetivoAtual}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{salvando ? 'Salvando...' : 'Salvar Avaliação'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Separado de Frequência */}
        {showFormFrequencia && gradeSelecionada && (() => {
          const turma = turmasDisciplinas.find(td => td.turma_disciplina_professor_id === gradeSelecionada.turma_disciplina_professor_id)
          const turmaKey = turma?.turma_id || ''
          const alunos = alunosTurma[turmaKey] || []
          
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <UserCheck className="w-6 h-6 text-blue-600 mr-3" />
                    Registrar Frequência - {turma?.nome_turma || gradeSelecionada.nome_turma}
                  </h3>
                  <button
                    onClick={() => {
                      setShowFormFrequencia(false)
                      setGradeSelecionada(null)
                      setFrequencias({})
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6">
                      
                      {loadingFrequencia ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                          <p className="text-sm text-gray-600">Carregando alunos...</p>
                        </div>
                      ) : alunos.length > 0 ? (
                        <div className="space-y-4">
                          {/* Botões de Ação Rápida */}
                          <div className="flex items-center justify-center space-x-4">
                            <button
                              onClick={handleMarcarTodosPresentes}
                              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              Marcar Todos Presentes
                            </button>
                            <button
                              onClick={handleMarcarTodosFaltas}
                              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Marcar Todos Faltas
                            </button>
                          </div>

                          {/* Lista de Alunos */}
                          <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2 bg-white">
                            {alunos.map((aluno) => {
                              const isPresente = frequencias[aluno.matricula_aluno_id] === true
                              const labelPresenca = isPresente ? 'Presente' : 'Falta'
                              
                              return (
                                <div
                                  key={aluno.matricula_aluno_id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                      {aluno.nome_aluno?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                      <h5 className="font-semibold text-gray-900">
                                        {aluno.nome_aluno || 'Nome não informado'} {aluno.sobrenome_aluno || ''}
                                      </h5>
                                      <p className="text-xs text-gray-600">RA: {aluno.ra || 'N/A'}</p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleTogglePresenca(aluno.matricula_aluno_id)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                      isPresente
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                  >
                                    {labelPresenca}
                                  </button>
                                </div>
                              )
                            })}
                          </div>

                          {/* Estatísticas */}
                          <div className="flex items-center justify-between text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                            <span>Total: {alunos.length} alunos</span>
                            <span className="text-green-600 font-medium">
                              Presentes: {Object.values(frequencias).filter(p => p === true).length}
                            </span>
                            <span className="text-red-600 font-medium">
                              Faltas: {Object.values(frequencias).filter(p => p !== true).length}
                            </span>
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setShowFormFrequencia(false)
                                setGradeSelecionada(null)
                                setFrequencias({})
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSalvarFrequencia}
                              disabled={salvando || Object.keys(frequencias).length === 0}
                              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save className="w-4 h-4" />
                              <span>{salvando ? 'Salvando...' : 'Salvar Frequência'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-sm text-gray-600">Nenhum aluno encontrado nesta turma</p>
                        </div>
                      )}
                </div>
              </div>
            </div>
          )
        })()}
        </div>
      </div>
    </>
  )
}

