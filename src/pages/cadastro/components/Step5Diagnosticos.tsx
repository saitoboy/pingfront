import React from 'react'
import { Stethoscope, Eye, Ear, Brain, Star, Activity } from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'

interface Step5Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  showErrors?: boolean
}

export const Step5Diagnosticos: React.FC<Step5Props> = ({ 
  formData, 
  setFormData, 
  showErrors = false 
}) => {
  // Consumir showErrors para evitar warning - não usado pois todos os campos são opcionais
  void showErrors;
  
  const updateDiagnostico = (field: keyof FormularioFichaCadastro['diagnostico'], value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      diagnostico: {
        ...prev.diagnostico,
        [field]: value
      }
    }))
  }

  const CheckboxField: React.FC<{
    label: string;
    field: keyof FormularioFichaCadastro['diagnostico'];
    checked: boolean;
  }> = ({ label, field, checked }) => (
    <div className="flex items-center space-x-3">
      <input
        type="checkbox"
        id={field}
        checked={checked}
        onChange={(e) => updateDiagnostico(field, e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor={field} className="text-sm font-medium text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  )

  return (
    <div className="space-y-6">
      <StepHeader 
        icon={Stethoscope}
        title="Diagnósticos"
        description="Diagnósticos e necessidades especiais"
      />
      
      <div className="grid gap-6">
        {/* Deficiências Visuais */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Deficiências Visuais</h3>
          </div>
          <div className="grid gap-3">
            <CheckboxField
              label="Cegueira"
              field="cegueira"
              checked={formData.diagnostico.cegueira}
            />
            <CheckboxField
              label="Baixa Visão"
              field="baixa_visao"
              checked={formData.diagnostico.baixa_visao}
            />
          </div>
        </div>

        {/* Deficiências Auditivas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Ear className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Deficiências Auditivas</h3>
          </div>
          <div className="grid gap-3">
            <CheckboxField
              label="Surdez"
              field="surdez"
              checked={formData.diagnostico.surdez}
            />
            <CheckboxField
              label="Deficiência Auditiva"
              field="deficiencia_auditiva"
              checked={formData.diagnostico.deficiencia_auditiva}
            />
            <CheckboxField
              label="Surdocegueira"
              field="surdocegueira"
              checked={formData.diagnostico.surdocegueira}
            />
            <CheckboxField
              label="Alterações no Processamento Auditivo"
              field="alteracoes_processamento_auditivo"
              checked={formData.diagnostico.alteracoes_processamento_auditivo}
            />
          </div>
        </div>

        {/* Deficiências Físicas e Múltiplas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Deficiências Físicas e Múltiplas</h3>
          </div>
          <div className="grid gap-3">
            <CheckboxField
              label="Deficiência Física"
              field="deficiencia_fisica"
              checked={formData.diagnostico.deficiencia_fisica}
            />
            <CheckboxField
              label="Deficiência Múltipla"
              field="deficiencia_multipla"
              checked={formData.diagnostico.deficiencia_multipla}
            />
          </div>
        </div>

        {/* Deficiências Intelectuais e Síndromes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Deficiências Intelectuais e Síndromes</h3>
          </div>
          <div className="grid gap-3">
            <CheckboxField
              label="Deficiência Intelectual"
              field="deficiencia_intelectual"
              checked={formData.diagnostico.deficiencia_intelectual}
            />
            <CheckboxField
              label="Síndrome de Down"
              field="sindrome_down"
              checked={formData.diagnostico.sindrome_down}
            />
          </div>
        </div>

        {/* Transtornos e Condições Especiais */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Transtornos e Condições Especiais</h3>
          </div>
          <div className="grid gap-3">
            <CheckboxField
              label="Altas Habilidades/Superdotação"
              field="altas_habilidades"
              checked={formData.diagnostico.altas_habilidades}
            />
            <CheckboxField
              label="TEA (Transtorno do Espectro Autista)"
              field="tea"
              checked={formData.diagnostico.tea}
            />
            <CheckboxField
              label="TDAH (Transtorno do Déficit de Atenção com Hiperatividade)"
              field="tdah"
              checked={formData.diagnostico.tdah}
            />
          </div>
        </div>

        {/* Outros Diagnósticos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Stethoscope className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Outros Diagnósticos</h3>
          </div>
          <div>
            <label htmlFor="outros_diagnosticos" className="block text-sm font-medium text-gray-700 mb-2">
              Descreva outros diagnósticos não listados acima
            </label>
            <textarea
              id="outros_diagnosticos"
              rows={4}
              maxLength={500}
              value={formData.diagnostico.outros_diagnosticos}
              onChange={(e) => updateDiagnostico('outros_diagnosticos', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descreva outros diagnósticos, laudos médicos ou observações importantes..."
            />
            <div className="mt-1 text-xs text-gray-500">
              {formData.diagnostico.outros_diagnosticos.length}/500 caracteres
            </div>
          </div>
        </div>

        {/* Observação Importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Informação Importante</h4>
              <p className="text-sm text-blue-700">
                Estes campos são opcionais e devem ser preenchidos apenas se houver diagnósticos confirmados por profissionais de saúde. 
                As informações fornecidas ajudarão a escola a oferecer o melhor suporte pedagógico ao aluno.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
