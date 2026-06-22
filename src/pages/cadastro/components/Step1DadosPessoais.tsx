import React, { useRef } from 'react'
import { User, Camera, X } from 'lucide-react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setFormData(prev => ({
        ...prev,
        aluno: { ...prev.aluno, foto_aluno: base64 }
      }))
    }
    reader.readAsDataURL(file)
  }

  const removerFoto = () => {
    setFormData(prev => ({
      ...prev,
      aluno: { ...prev.aluno, foto_aluno: undefined }
    }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <StepHeader
        icon={User}
        title="Dados Pessoais"
        description="Informações básicas do aluno"
      />

      {/* Foto do aluno */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative w-28 h-28 rounded-full border-4 border-blue-200 overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          title="Clique para adicionar foto"
        >
          {formData.aluno.foto_aluno ? (
            <img
              src={formData.aluno.foto_aluno}
              alt="Foto do aluno"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Camera className="w-8 h-8" />
              <span className="text-xs">Adicionar foto</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {formData.aluno.foto_aluno ? 'Trocar foto' : 'Escolher foto'}
          </button>
          {formData.aluno.foto_aluno && (
            <button
              type="button"
              onClick={removerFoto}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
            >
              <X className="w-3 h-3" />
              Remover
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFotoChange}
          className="hidden"
        />
        <p className="text-xs text-gray-400">Opcional — JPG, PNG ou GIF</p>
      </div>

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
            max={new Date().toISOString().split('T')[0]}
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
