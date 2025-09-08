import React from 'react'
import { FileText } from 'lucide-react'
import { StepHeader } from './StepHeader'
import { validators } from '../../../lib/utils'
import type { FormularioFichaCadastro } from '../types'

interface Step2Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  showErrors?: boolean
}

export const Step2CertidaoNascimento: React.FC<Step2Props> = ({ 
  formData, 
  setFormData, 
  showErrors = false 
}) => {
  // Consumir showErrors para evitar warning - será usado quando implementarmos validação visual neste step
  void showErrors;
  
  // Função auxiliar para formatação de nomes
  const formatarNomeProprio = (texto: string) => {
    return texto
      .toLowerCase()
      .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
  }

  return (
    <div className="space-y-6">
      <StepHeader 
        icon={FileText}
        title="Certidão de Nascimento"
        description="Dados da certidão de nascimento"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Livro *
          </label>
          <input
            type="text"
            required
            value={formData.certidao.livro_certidao}
            onChange={(e) => {
              const formattedValue = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '')
              setFormData(prev => ({
                ...prev,
                certidao: {
                  ...prev.certidao,
                  livro_certidao: formattedValue
                }
              }))
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !validators.obrigatorio(formData.certidao.livro_certidao) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Ex: A123"
            maxLength={10}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Folha *
          </label>
          <input
            type="text"
            required
            value={formData.certidao.folha_certidao}
            onChange={(e) => {
              const formattedValue = e.target.value.replace(/\D/g, '')
              setFormData(prev => ({
                ...prev,
                certidao: {
                  ...prev.certidao,
                  folha_certidao: formattedValue
                }
              }))
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !validators.obrigatorio(formData.certidao.folha_certidao) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Ex: 123"
            maxLength={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Termo *
          </label>
          <input
            type="text"
            required
            value={formData.certidao.termo_certidao}
            onChange={(e) => {
              const formattedValue = e.target.value.replace(/\D/g, '')
              setFormData(prev => ({
                ...prev,
                certidao: {
                  ...prev.certidao,
                  termo_certidao: formattedValue
                }
              }))
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !validators.obrigatorio(formData.certidao.termo_certidao) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Ex: 456"
            maxLength={10}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Matrícula *
          </label>
          <input
            type="text"
            required
            value={formData.certidao.matricula_certidao}
            onChange={(e) => {
              const formattedValue = e.target.value.replace(/\D/g, '')
              setFormData(prev => ({
                ...prev,
                certidao: {
                  ...prev.certidao,
                  matricula_certidao: formattedValue
                }
              }))
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !validators.obrigatorio(formData.certidao.matricula_certidao) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Ex: 789012"
            maxLength={15}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Expedição *
          </label>
          <input
            type="date"
            required
            value={formData.certidao.data_expedicao_certidao}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                certidao: {
                  ...prev.certidao,
                  data_expedicao_certidao: e.target.value
                }
              }))
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !validators.obrigatorio(formData.certidao.data_expedicao_certidao) || 
              (formData.certidao.data_expedicao_certidao && !validators.dataNascimento(formData.certidao.data_expedicao_certidao))
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
          />
          {(!validators.obrigatorio(formData.certidao.data_expedicao_certidao) || 
           (formData.certidao.data_expedicao_certidao && !validators.dataNascimento(formData.certidao.data_expedicao_certidao))) && (
            <p className="mt-1 text-sm text-red-600">
              {!validators.obrigatorio(formData.certidao.data_expedicao_certidao) 
                ? 'Data de expedição é obrigatória' 
                : 'Data não pode ser futura'}
            </p>
          )}
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Cartório *
          </label>
          <input
            type="text"
            required
            value={formData.certidao.nome_cartorio_certidao}
            onChange={(e) => {
              const formattedValue = formatarNomeProprio(e.target.value)
              setFormData(prev => ({
                ...prev,
                certidao: {
                  ...prev.certidao,
                  nome_cartorio_certidao: formattedValue
                }
              }))
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !validators.obrigatorio(formData.certidao.nome_cartorio_certidao) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Ex: 1º Ofício de Registro Civil das Pessoas Naturais da Comarca de São Paulo"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">💡 Dica:</h3>
        <p className="text-sm text-gray-600">
          Os dados da certidão de nascimento são opcionais, mas ajudam na validação e organização dos registros escolares.
          Se não tiver os dados em mãos, você pode pular esta etapa e completar posteriormente.
        </p>
      </div>
    </div>
  )
}
