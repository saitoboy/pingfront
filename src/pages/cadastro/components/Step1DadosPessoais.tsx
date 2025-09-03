import React from 'react'
import { User } from 'lucide-react'
import { StepHeader } from './StepHeader'
import { formatters, validators } from '../../../lib/utils'
import type { FormularioFichaCadastro } from '../types'
import type { Religiao } from '../../../types/api'

interface Step1Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  religioes: Religiao[]
  isLoadingDropdowns: boolean
}

export const Step1DadosPessoais: React.FC<Step1Props> = ({ 
  formData, 
  setFormData, 
  religioes, 
  isLoadingDropdowns 
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
              !validators.obrigatorio(formData.aluno.nome_aluno) 
                ? 'border-gray-300' 
                : 'border-gray-300'
            }`}
            placeholder="Nome do aluno"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Sobrenome do aluno"
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
              formData.aluno.data_nascimento_aluno && !validators.dataNascimento(formData.aluno.data_nascimento_aluno) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
          />
          {formData.aluno.data_nascimento_aluno && !validators.dataNascimento(formData.aluno.data_nascimento_aluno) && (
            <p className="mt-1 text-sm text-red-600">Data não pode ser futura</p>
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
              formData.aluno.cpf_aluno && !validators.cpf(formData.aluno.cpf_aluno) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          {formData.aluno.cpf_aluno && !validators.cpf(formData.aluno.cpf_aluno) && (
            <p className="mt-1 text-sm text-red-600">CPF inválido</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RG
          </label>
          <input
            type="text"
            value={formData.aluno.rg_aluno}
            onChange={(e) => {
              // Formatação básica do RG (apenas números e hífen)
              let cleanRg = e.target.value.replace(/[^0-9X-]/gi, '').toUpperCase();
              if (cleanRg.length > 2 && cleanRg.indexOf('-') === -1) {
                cleanRg = cleanRg.replace(/(\d{2})(\d{3})(\d{3})(\w{1})/, '$1.$2.$3-$4');
              }
              setFormData(prev => ({
                ...prev,
                aluno: { ...prev.aluno, rg_aluno: cleanRg }
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="00.000.000-0"
            maxLength={12}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Naturalidade
          </label>
          <input
            type="text"
            value={formData.aluno.naturalidade_aluno}
            onChange={(e) => {
              // Capitalizar primeira letra de cada palavra
              const capitalizedValue = e.target.value
                .toLowerCase()
                .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
              setFormData(prev => ({
                ...prev,
                aluno: { ...prev.aluno, naturalidade_aluno: capitalizedValue }
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cidade - UF"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP *
          </label>
          <input
            type="text"
            required
            value={formData.aluno.cep_aluno}
            onChange={(e) => {
              // Formatação automática do CEP
              let cleanCep = e.target.value.replace(/\D/g, '');
              if (cleanCep.length > 5) {
                cleanCep = cleanCep.replace(/(\d{5})(\d{1,3})/, '$1-$2');
              }
              setFormData(prev => ({
                ...prev,
                aluno: { ...prev.aluno, cep_aluno: cleanCep }
              }));
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData.aluno.cep_aluno && formData.aluno.cep_aluno.replace(/\D/g, '').length !== 8 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="00000-000"
            maxLength={9}
          />
          {formData.aluno.cep_aluno && formData.aluno.cep_aluno.replace(/\D/g, '').length !== 8 && (
            <p className="mt-1 text-sm text-red-600">CEP deve ter 8 dígitos</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bairro *
          </label>
          <input
            type="text"
            required
            value={formData.aluno.bairro_aluno}
            onChange={(e) => {
              // Capitalizar primeira letra de cada palavra
              const capitalizedValue = e.target.value
                .toLowerCase()
                .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
              setFormData(prev => ({
                ...prev,
                aluno: { ...prev.aluno, bairro_aluno: capitalizedValue }
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Religião
          </label>
          <select
            value={formData.aluno.religiao_id}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              aluno: { ...prev.aluno, religiao_id: e.target.value }
            }))}
            disabled={isLoadingDropdowns}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoadingDropdowns ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="">
              {isLoadingDropdowns ? 'Carregando...' : 'Selecione...'}
            </option>
            {!isLoadingDropdowns && religioes.map(religiao => (
              <option key={religiao.religiao_id} value={religiao.religiao_id}>
                {religiao.nome_religiao}
              </option>
            ))}
          </select>
          {isLoadingDropdowns && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
              Buscando religiões da API...
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço Completo *
          </label>
          <input
            type="text"
            required
            value={formData.aluno.endereco_aluno}
            onChange={(e) => {
              // Capitalizar primeira letra de cada palavra
              const capitalizedValue = e.target.value
                .toLowerCase()
                .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
              setFormData(prev => ({
                ...prev,
                aluno: { ...prev.aluno, endereco_aluno: capitalizedValue }
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rua, número, complemento"
          />
        </div>
      </div>
    </div>
  )
}
