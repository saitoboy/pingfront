import React from 'react'
import { Heart } from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'

interface Step4Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
}

export const Step4DadosSaude: React.FC<Step4Props> = () => (
  <div className="space-y-6">
    <StepHeader 
      icon={Heart}
      title="Dados de Saúde"
      description="Informações médicas e de saúde"
    />
    <div className="text-center py-12">
      <p className="text-gray-600">Step 4 - Em construção</p>
    </div>
  </div>
)
