import {
  User,
  Users,
  Stethoscope,
  GraduationCap,
  CheckCircle
} from 'lucide-react'

export interface WizardStep {
  id: number;
  title: string;
  icon: any;
  description: string;
  section: string;
  optional?: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Dados Pessoais",
    icon: User,
    description: "Informações básicas do aluno",
    section: "aluno"
  },
  {
    id: 2,
    title: "Responsáveis",
    icon: Users,
    description: "Dados dos responsáveis pelo aluno",
    section: "responsaveis"
  },
  {
    id: 3,
    title: "Diagnósticos",
    icon: Stethoscope,
    description: "Diagnósticos e necessidades especiais",
    section: "diagnostico",
    optional: true
  },
  {
    id: 4,
    title: "Matrícula",
    icon: GraduationCap,
    description: "Turma e dados acadêmicos",
    section: "matricula"
  },
  {
    id: 5,
    title: "Revisão",
    icon: CheckCircle,
    description: "Conferir dados antes de salvar",
    section: "review"
  }
]
