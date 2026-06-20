import React from 'react'
import { User } from 'lucide-react'
import { StepHeader } from './StepHeader'
import { formatters, validators } from '../../../lib/utils'
import type { FormularioFichaCadastro } from '../types'

interface Step1Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  showErrors?: boolean
}

export const Step1DadosPessoais: React.FC<Step1Props> = ({
  formData,
  setFormData,
  showErrors = false
}) => {
  return (
    <div className="space-y-6">
      <StepHeader 
        icon={User}
        title="Dados Pessoais"
        description="Informações básicas do aluno"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
          </label>
          <input
            type="text"
            required
            value={formData.aluno.nome_aluno}
            onChange={(e) => {
              // Capitalizar primeira letra de cada palavra e permitir apenas letras e espaços
              const cleanValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
              const capitalizedValue = cleanValue
                .toLowerCase()
                .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
              setFormData(prev => ({
                ...prev,
                aluno: { ...prev.aluno, nome_aluno: capitalizedValue }
              }));
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showErrors && !validators.obrigatorio(formData.aluno.nome_aluno) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Nome do aluno"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sobrenome *
          </label>
          <input
            type="text"
            required
            value={formData.aluno.sobrenome_aluno}
            onChange={(e) => {
              // Capitalizar primeira letra de cada palavra e permitir apenas letras e espaços
              const cleanValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
              const capitalizedValue = cleanValue
                .toLowerCase()
                .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
              setFormData(prev => ({
                ...prev,
                aluno: { ...prev.aluno, sobrenome_aluno: capitalizedValue }
              }));
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showErrors && !validators.obrigatorio(formData.aluno.sobrenome_aluno) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Sobrenome do aluno"
            maxLength={80}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Nascimento *
          </label>
          <input
            type="date"
            required
            value={formData.aluno.data_nascimento_aluno}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              aluno: { ...prev.aluno, data_nascimento_aluno: e.target.value }
            }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showErrors && (!validators.obrigatorio(formData.aluno.data_nascimento_aluno) || 
              (formData.aluno.data_nascimento_aluno && !validators.dataNascimento(formData.aluno.data_nascimento_aluno)))
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
          />
          {showErrors && (!validators.obrigatorio(formData.aluno.data_nascimento_aluno) || 
           (formData.aluno.data_nascimento_aluno && !validators.dataNascimento(formData.aluno.data_nascimento_aluno))) && (
            <p className="mt-1 text-sm text-red-600">
              {!validators.obrigatorio(formData.aluno.data_nascimento_aluno) 
                ? 'Data de nascimento é obrigatória' 
                : 'Data não pode ser futura'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF *
          </label>
          <input
            type="text"
            required
            value={formatters.cpf(formData.aluno.cpf_aluno)}
            onChange={(e) => {
              // Remove formatação para salvar apenas números
              const cleanCpf = e.target.value.replace(/\D/g, '');
              setFormData(prev => ({
                ...prev,
                aluno: { ...prev.aluno, cpf_aluno: cleanCpf }
              }));
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showErrors && (!validators.obrigatorio(formData.aluno.cpf_aluno) || 
              (formData.aluno.cpf_aluno && !validators.cpf(formData.aluno.cpf_aluno)))
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          {showErrors && (!validators.obrigatorio(formData.aluno.cpf_aluno) || 
           (formData.aluno.cpf_aluno && !validators.cpf(formData.aluno.cpf_aluno))) && (
            <p className="mt-1 text-sm text-red-600">
              {!validators.obrigatorio(formData.aluno.cpf_aluno) 
                ? 'CPF é obrigatório' 
                : 'CPF inválido'}
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
