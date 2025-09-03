import { 
  User, 
  FileText, 
  Users, 
  Heart, 
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
    title: "Certidão de Nascimento",
    icon: FileText,
    description: "Dados da certidão de nascimento",
    section: "certidao"
  },
  {
    id: 3,
    title: "Responsáveis",
    icon: Users, 
    description: "Dados dos responsáveis pelo aluno",
    section: "responsaveis"
  },
  {
    id: 4,
    title: "Dados de Saúde", 
    icon: Heart,
    description: "Informações médicas e de saúde",
    section: "dados_saude"
  },
  {
    id: 5,
    title: "Diagnósticos",
    icon: Stethoscope,
    description: "Diagnósticos e necessidades especiais", 
    section: "diagnostico"
  },
  {
    id: 6,
    title: "Matrícula",
    icon: GraduationCap,
    description: "Turma e dados acadêmicos",
    section: "matricula"
  },
  {
    id: 7,
    title: "Revisão",
    icon: CheckCircle, 
    description: "Conferir dados antes de salvar",
    section: "review"
  }
]
