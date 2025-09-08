import React, { useState } from 'react'
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
  showErrors?: boolean
}

interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export const Step1DadosPessoais: React.FC<Step1Props> = ({ 
  formData, 
  setFormData, 
  religioes, 
  isLoadingDropdowns,
  showErrors = false
}) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false)

  // Função para buscar endereço pelo CEP usando a API dos Correios (ViaCEP)
  const buscarEnderecoPorCep = async (cep: string) => {
    if (cep.length !== 8) return

    setIsLoadingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data: ViaCepResponse = await response.json()

      if (!data.erro) {
        // Capitalizar os valores recebidos da API
        const endereco = data.logradouro
          .toLowerCase()
          .replace(/(^|\s)\S/g, letter => letter.toUpperCase())

        const bairro = data.bairro
          .toLowerCase()
          .replace(/(^|\s)\S/g, letter => letter.toUpperCase())

        const naturalidade = `${data.localidade} - ${data.uf}`

        // Atualizar o formulário com os dados do CEP
        setFormData(prev => ({
          ...prev,
          aluno: {
            ...prev.aluno,
            endereco_aluno: endereco,
            bairro_aluno: bairro,
            naturalidade_aluno: naturalidade
          }
        }))

        console.log('✅ CEP encontrado:', {
          endereco,
          bairro,
          naturalidade
        })
      } else {
        console.warn('❌ CEP não encontrado')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar CEP:', error)
    } finally {
      setIsLoadingCep(false)
    }
  }
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

        {/* CEP com integração ViaCEP - movido para cima */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEP * 
            <span className="text-xs text-gray-500 ml-1">(preenche endereço automaticamente)</span>
          </label>
          <div className="relative">
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

                // Buscar dados do CEP quando estiver completo (8 dígitos)
                if (cleanCep.replace(/\D/g, '').length === 8) {
                  buscarEnderecoPorCep(cleanCep.replace(/\D/g, ''));
                }
              }}
              onBlur={() => {
                const cleanCep = formData.aluno.cep_aluno.replace(/\D/g, '');
                if (cleanCep.length === 8) {
                  buscarEnderecoPorCep(cleanCep);
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showErrors && (!validators.obrigatorio(formData.aluno.cep_aluno) || 
                (formData.aluno.cep_aluno && formData.aluno.cep_aluno.replace(/\D/g, '').length !== 8))
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              } ${isLoadingCep ? 'pr-10' : ''}`}
              placeholder="00000-000"
              maxLength={9}
              disabled={isLoadingCep}
            />
            {isLoadingCep && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>
          {showErrors && (!validators.obrigatorio(formData.aluno.cep_aluno) || 
           (formData.aluno.cep_aluno && formData.aluno.cep_aluno.replace(/\D/g, '').length !== 8)) && (
            <p className="mt-1 text-sm text-red-600">
              {!validators.obrigatorio(formData.aluno.cep_aluno) 
                ? 'CEP é obrigatório' 
                : 'CEP deve ter 8 dígitos'}
            </p>
          )}
          {isLoadingCep && (
            <p className="mt-1 text-sm text-blue-600 flex items-center">
              <span className="mr-1">🔍</span>
              Buscando endereço...
            </p>
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showErrors && !validators.obrigatorio(formData.aluno.endereco_aluno) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Rua, número, complemento"
            maxLength={150}
          />
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showErrors && !validators.obrigatorio(formData.aluno.bairro_aluno) 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="Nome do bairro"
            maxLength={100}
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
            maxLength={100}
          />
        </div>

        {/* Religião movida para o final */}
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
      </div>
    </div>
  )
}
