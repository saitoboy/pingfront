import React from 'react'
import { CheckCircle } from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'

interface Step7Props {
  formData: FormularioFichaCadastro
  onSubmit: () => void
  isLoading: boolean
}

export const Step7Revisao: React.FC<Step7Props> = () => (
  <div className="space-y-6">
    <StepHeader 
      icon={CheckCircle}
      title="Revisão"
      description="Conferir dados antes de salvar"
    />
    <div className="text-center py-12">
      <p className="text-gray-600">Step 7 - Em construção</p>
    </div>
  </div>
)
