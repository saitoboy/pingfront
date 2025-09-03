import React from 'react'
import { Users } from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'
import type { Parentesco } from '../../../types/api'

interface Step3Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  parentescos: Parentesco[]
  isLoadingDropdowns: boolean
}

export const Step3Responsaveis: React.FC<Step3Props> = ({ 
  parentescos, 
  isLoadingDropdowns 
}) => (
  <div className="space-y-6">
    <StepHeader 
      icon={Users}
      title="Responsáveis"
      description="Dados dos responsáveis pelo aluno"
    />
    <div className="text-center py-12">
      <p className="text-gray-600">Step 3 - Em construção</p>
      <p className="text-sm text-gray-500 mt-2">
        Parentescos carregados: {parentescos.length} | 
        Loading: {isLoadingDropdowns ? 'Sim' : 'Não'}
      </p>
    </div>
  </div>
)
