import React, { useState } from 'react'
import { Users, Plus, Trash2 } from 'lucide-react'
import { StepHeader } from './StepHeader'
import { formatters, validators } from '../../../lib/utils'
import type { FormularioFichaCadastro } from '../types'
import type { Parentesco } from '../../../types/api'

interface Step3Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  parentescos: Parentesco[]
  isLoadingDropdowns: boolean
  showErrors?: boolean
}

export const Step3Responsaveis: React.FC<Step3Props> = ({ 
  formData,
  setFormData,
  parentescos, 
  isLoadingDropdowns,
  showErrors = false
}) => {
  // Consumir showErrors para evitar warning - será usado quando implementarmos validação visual neste step
  void showErrors;
  
  const [responsavelAtivo, setResponsavelAtivo] = useState(0)

  // Adicionar novo responsável
  const adicionarResponsavel = () => {
    setFormData(prev => ({
      ...prev,
      responsaveis: [
        ...prev.responsaveis,
        {
          nome_responsavel: '',
          sobrenome_responsavel: '',
          telefone_responsavel: '',
          rg_responsavel: '',
          cpf_responsavel: '',
          grau_instrucao_responsavel: '',
          email_responsavel: '',
          parentesco_id: ''
        }
      ]
    }))
    setResponsavelAtivo(formData.responsaveis.length)
  }

  // Remover responsável
  const removerResponsavel = (index: number) => {
    if (formData.responsaveis.length > 1) {
      setFormData(prev => ({
        ...prev,
        responsaveis: prev.responsaveis.filter((_, i) => i !== index)
      }))
      if (responsavelAtivo >= index && responsavelAtivo > 0) {
        setResponsavelAtivo(responsavelAtivo - 1)
      }
    }
  }

  // Atualizar dados do responsável
  const atualizarResponsavel = (index: number, campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      responsaveis: prev.responsaveis.map((resp, i) => 
        i === index ? { ...resp, [campo]: valor } : resp
      )
    }))
  }

  const responsavelAtual = formData.responsaveis[responsavelAtivo] || formData.responsaveis[0]

  return (
    <div className="space-y-6">
      <StepHeader 
        icon={Users}
        title="Responsáveis"
        description="Dados dos responsáveis pelo aluno"
      />

      {/* Tabs dos Responsáveis */}
      <div className="flex flex-wrap gap-2 mb-6">
        {formData.responsaveis.map((_, index) => (
          <button
            key={index}
            onClick={() => setResponsavelAtivo(index)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              responsavelAtivo === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Responsável {index + 1}
            {formData.responsaveis.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removerResponsavel(index)
                }}
                className="ml-2 p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </button>
        ))}
        
        <button
          onClick={adicionarResponsavel}
          className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </button>
      </div>

      {/* Formulário do Responsável Atual */}
      {responsavelAtual && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              required
              value={responsavelAtual.nome_responsavel}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                const capitalizedValue = cleanValue
                  .toLowerCase()
                  .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
                atualizarResponsavel(responsavelAtivo, 'nome_responsavel', capitalizedValue);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !validators.obrigatorio(responsavelAtual.nome_responsavel) 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Nome do responsável"
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
              value={responsavelAtual.sobrenome_responsavel}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                const capitalizedValue = cleanValue
                  .toLowerCase()
                  .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
                atualizarResponsavel(responsavelAtivo, 'sobrenome_responsavel', capitalizedValue);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !validators.obrigatorio(responsavelAtual.sobrenome_responsavel) 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Sobrenome do responsável"
              maxLength={80}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF *
            </label>
            <input
              type="text"
              required
              value={formatters.cpf(responsavelAtual.cpf_responsavel)}
              onChange={(e) => {
                const cleanCpf = e.target.value.replace(/\D/g, '');
                atualizarResponsavel(responsavelAtivo, 'cpf_responsavel', cleanCpf);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !validators.obrigatorio(responsavelAtual.cpf_responsavel) || 
                (responsavelAtual.cpf_responsavel && !validators.cpf(responsavelAtual.cpf_responsavel))
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {(!validators.obrigatorio(responsavelAtual.cpf_responsavel) || 
             (responsavelAtual.cpf_responsavel && !validators.cpf(responsavelAtual.cpf_responsavel))) && (
              <p className="mt-1 text-sm text-red-600">
                {!validators.obrigatorio(responsavelAtual.cpf_responsavel) 
                  ? 'CPF é obrigatório' 
                  : 'CPF inválido'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RG *
            </label>
            <input
              type="text"
              required
              value={responsavelAtual.rg_responsavel}
              onChange={(e) => {
                let cleanRg = e.target.value.replace(/[^0-9X-]/gi, '').toUpperCase();
                if (cleanRg.length > 2 && cleanRg.indexOf('-') === -1) {
                  cleanRg = cleanRg.replace(/(\d{2})(\d{3})(\d{3})(\w{1})/, '$1.$2.$3-$4');
                }
                atualizarResponsavel(responsavelAtivo, 'rg_responsavel', cleanRg);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !validators.obrigatorio(responsavelAtual.rg_responsavel) 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="00.000.000-0"
              maxLength={12}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="text"
              required
              value={formatters.telefone(responsavelAtual.telefone_responsavel)}
              onChange={(e) => {
                const cleanTelefone = e.target.value.replace(/\D/g, '');
                atualizarResponsavel(responsavelAtivo, 'telefone_responsavel', cleanTelefone);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !validators.obrigatorio(responsavelAtual.telefone_responsavel) || 
                (responsavelAtual.telefone_responsavel && !validators.telefone(responsavelAtual.telefone_responsavel))
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
            {(!validators.obrigatorio(responsavelAtual.telefone_responsavel) || 
             (responsavelAtual.telefone_responsavel && !validators.telefone(responsavelAtual.telefone_responsavel))) && (
              <p className="mt-1 text-sm text-red-600">
                {!validators.obrigatorio(responsavelAtual.telefone_responsavel) 
                  ? 'Telefone é obrigatório' 
                  : 'Telefone inválido'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={responsavelAtual.email_responsavel}
              onChange={(e) => {
                atualizarResponsavel(responsavelAtivo, 'email_responsavel', e.target.value.toLowerCase());
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !validators.obrigatorio(responsavelAtual.email_responsavel) || 
                (responsavelAtual.email_responsavel && !validators.email(responsavelAtual.email_responsavel))
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="email@exemplo.com"
              maxLength={100}
            />
            {(!validators.obrigatorio(responsavelAtual.email_responsavel) || 
             (responsavelAtual.email_responsavel && !validators.email(responsavelAtual.email_responsavel))) && (
              <p className="mt-1 text-sm text-red-600">
                {!validators.obrigatorio(responsavelAtual.email_responsavel) 
                  ? 'Email é obrigatório' 
                  : 'Email inválido'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parentesco *
            </label>
            <select
              required
              value={responsavelAtual.parentesco_id}
              onChange={(e) => atualizarResponsavel(responsavelAtivo, 'parentesco_id', e.target.value)}
              disabled={isLoadingDropdowns}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !validators.obrigatorio(responsavelAtual.parentesco_id) 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              } ${isLoadingDropdowns ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {isLoadingDropdowns ? 'Carregando...' : 'Selecione o parentesco...'}
              </option>
              {!isLoadingDropdowns && parentescos.map(parentesco => (
                <option key={parentesco.parentesco_id} value={parentesco.parentesco_id}>
                  {parentesco.nome_parentesco}
                </option>
              ))}
            </select>
            {isLoadingDropdowns && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
                Buscando parentescos da API...
              </div>
            )}
            {!isLoadingDropdowns && parentescos.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">
                ⚠️ Nenhum parentesco encontrado. Verifique a conexão com a API.
              </p>
            )}
            {!validators.obrigatorio(responsavelAtual.parentesco_id) && (
              <p className="mt-1 text-sm text-red-600">Parentesco é obrigatório</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grau de Instrução
            </label>
            <select
              value={responsavelAtual.grau_instrucao_responsavel}
              onChange={(e) => atualizarResponsavel(responsavelAtivo, 'grau_instrucao_responsavel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="Fundamental Incompleto">Ensino Fundamental Incompleto</option>
              <option value="Fundamental Completo">Ensino Fundamental Completo</option>
              <option value="Médio Incompleto">Ensino Médio Incompleto</option>
              <option value="Médio Completo">Ensino Médio Completo</option>
              <option value="Superior Incompleto">Ensino Superior Incompleto</option>
              <option value="Superior Completo">Ensino Superior Completo</option>
              <option value="Pós-graduação">Pós-graduação</option>
              <option value="Mestrado">Mestrado</option>
              <option value="Doutorado">Doutorado</option>
            </select>
          </div>
        </div>
      )}

      {/* Dica sobre responsáveis */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-700 mb-2">💡 Informações importantes:</h3>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• É obrigatório cadastrar pelo menos um responsável</li>
          <li>• Você pode adicionar múltiplos responsáveis (pai, mãe, avós, etc.)</li>
          <li>• Todos os campos marcados com * são obrigatórios</li>
          <li>• O email será usado para comunicações da escola</li>
        </ul>
      </div>

      
    </div>
  )
}
