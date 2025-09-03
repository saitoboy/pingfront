import { useState } from 'react'
import { logger } from '../../lib/logger'

interface AlunoForm {
  // Dados Pessoais
  nome: string
  cpf: string
  rg: string
  dataNascimento: string
  sexo: string
  naturalidade: string
  
  // Endereço
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  
  // Contato
  telefone: string
  celular: string
  email: string
  
  // Responsável
  nomeResponsavel: string
  cpfResponsavel: string
  telefoneResponsavel: string
  emailResponsavel: string
}

export default function FichaCadastroPage() {
  const [formData, setFormData] = useState<AlunoForm>({
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    sexo: '',
    naturalidade: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    telefone: '',
    celular: '',
    email: '',
    nomeResponsavel: '',
    cpfResponsavel: '',
    telefoneResponsavel: '',
    emailResponsavel: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      logger.info('📝 Salvando ficha de cadastro...')
      // Aqui implementaremos a chamada para a API
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simula chamada à API
      logger.success('✅ Ficha de cadastro salva com sucesso!')
    } catch (error) {
      logger.error('❌ Erro ao salvar ficha de cadastro')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Ficha de Cadastro</h1>
        <p className="text-gray-600">Cadastre ou edite as informações de alunos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados Pessoais */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                required
                value={formData.cpf}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-2">
                RG
              </label>
              <input
                type="text"
                id="rg"
                name="rg"
                value={formData.rg}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="00.000.000-0"
              />
            </div>

            <div>
              <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento *
              </label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                required
                value={formData.dataNascimento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-2">
                Sexo *
              </label>
              <select
                id="sexo"
                name="sexo"
                required
                value={formData.sexo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div>
              <label htmlFor="naturalidade" className="block text-sm font-medium text-gray-700 mb-2">
                Naturalidade
              </label>
              <input
                type="text"
                id="naturalidade"
                name="naturalidade"
                value={formData.naturalidade}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cidade - UF"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏠</span>
            Endereço
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                CEP *
              </label>
              <input
                type="text"
                id="cep"
                name="cep"
                required
                value={formData.cep}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="00000-000"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700 mb-2">
                Logradouro *
              </label>
              <input
                type="text"
                id="logradouro"
                name="logradouro"
                required
                value={formData.logradouro}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-2">
                Número *
              </label>
              <input
                type="text"
                id="numero"
                name="numero"
                required
                value={formData.numero}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123"
              />
            </div>

            <div>
              <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-2">
                Complemento
              </label>
              <input
                type="text"
                id="complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Apto, Bloco, etc."
              />
            </div>

            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-2">
                Bairro *
              </label>
              <input
                type="text"
                id="bairro"
                name="bairro"
                required
                value={formData.bairro}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome do bairro"
              />
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-2">
                Cidade *
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                required
                value={formData.cidade}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome da cidade"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <input
                type="text"
                id="estado"
                name="estado"
                required
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📞</span>
            Contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 1234-5678"
              />
            </div>

            <div>
              <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-2">
                Celular *
              </label>
              <input
                type="tel"
                id="celular"
                name="celular"
                required
                value={formData.celular}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 91234-5678"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Responsável */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👨‍👩‍👧‍👦</span>
            Dados do Responsável
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nomeResponsavel" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Responsável *
              </label>
              <input
                type="text"
                id="nomeResponsavel"
                name="nomeResponsavel"
                required
                value={formData.nomeResponsavel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome completo do responsável"
              />
            </div>

            <div>
              <label htmlFor="cpfResponsavel" className="block text-sm font-medium text-gray-700 mb-2">
                CPF do Responsável *
              </label>
              <input
                type="text"
                id="cpfResponsavel"
                name="cpfResponsavel"
                required
                value={formData.cpfResponsavel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label htmlFor="telefoneResponsavel" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone do Responsável *
              </label>
              <input
                type="tel"
                id="telefoneResponsavel"
                name="telefoneResponsavel"
                required
                value={formData.telefoneResponsavel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 91234-5678"
              />
            </div>

            <div>
              <label htmlFor="emailResponsavel" className="block text-sm font-medium text-gray-700 mb-2">
                Email do Responsável
              </label>
              <input
                type="email"
                id="emailResponsavel"
                name="emailResponsavel"
                value={formData.emailResponsavel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            ) : (
              '💾 Salvar Cadastro'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
