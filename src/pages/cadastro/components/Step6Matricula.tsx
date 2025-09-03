import React from 'react'
import { GraduationCap } from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'
import type { AnoLetivo, Turma } from '../../../types/api'

interface Step6Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  anosLetivos: AnoLetivo[]
  turmas: Turma[]
  isLoadingDropdowns: boolean
}

export const Step6Matricula: React.FC<Step6Props> = ({
  anosLetivos, 
  turmas, 
  isLoadingDropdowns 
}) => (
  <div className="space-y-6">
    <StepHeader 
      icon={GraduationCap}
      title="Matrícula"
      description="Turma e dados acadêmicos"
    />
    <div className="text-center py-12">
      <p className="text-gray-600">Step 6 - Em construção</p>
      <p className="text-sm text-gray-500 mt-2">
        Anos Letivos: {anosLetivos.length} | 
        Turmas: {turmas.length} | 
        Loading: {isLoadingDropdowns ? 'Sim' : 'Não'}
      </p>
    </div>
  </div>
)
