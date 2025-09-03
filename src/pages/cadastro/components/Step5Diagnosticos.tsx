import React from 'react'
import { Stethoscope } from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'

interface Step5Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
}

export const Step5Diagnosticos: React.FC<Step5Props> = () => (
  <div className="space-y-6">
    <StepHeader 
      icon={Stethoscope}
      title="Diagnósticos"
      description="Diagnósticos e necessidades especiais"
    />
    <div className="text-center py-12">
      <p className="text-gray-600">Step 5 - Em construção</p>
    </div>
  </div>
)
