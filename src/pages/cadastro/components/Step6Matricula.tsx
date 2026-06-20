import React from 'react'
import { GraduationCap, Calendar, Users, AlertCircle } from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'
import type { AnoLetivo, Serie, Turma } from '../../../types/api'

interface Step6Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  anosLetivos: AnoLetivo[]
  series: Serie[]
  turmas: Turma[]
  isLoadingDropdowns: boolean
  showErrors?: boolean
}

export const Step6Matricula: React.FC<Step6Props> = ({
  formData,
  setFormData,
  anosLetivos, 
  series,
  turmas, 
  isLoadingDropdowns,
  showErrors = false
}) => {
  const updateMatricula = (field: keyof FormularioFichaCadastro['matricula'], value: string) => {
    setFormData(prev => ({
      ...prev,
      matricula: {
        ...prev.matricula,
        [field]: value
      }
    }))
  }

  const formatarNomeTurma = (turma: Turma): string => {
    const serie = series.find(s => s.serie_id === turma.serie_id)
    // O nome_turma no banco às vezes repete a série (ex: "2 ano A"), então usamos
    // apenas o identificador final (A, B...) para combinar com o nome da série.
    const identificador = turma.nome_turma.trim().split(/\s+/).pop() || turma.nome_turma

    const partes: string[] = []
    if (serie?.nome_serie) partes.push(serie.nome_serie)
    partes.push(`Turma ${identificador}`)

    let texto = partes.join(' - ')
    texto += ` (${turma.turno})`
    if (turma.sala) texto += ` - Sala ${turma.sala}`
    return texto
  }

  // Ordenar as turmas pela série (1º Ano, 2º Ano... 5º Ano) e depois pelo nome da turma
  const turmasOrdenadas = [...turmas].sort((a, b) => {
    const serieA = series.find(s => s.serie_id === a.serie_id)?.nome_serie ?? ''
    const serieB = series.find(s => s.serie_id === b.serie_id)?.nome_serie ?? ''
    if (serieA !== serieB) {
      return serieA.localeCompare(serieB, 'pt-BR', { numeric: true })
    }
    return a.nome_turma.localeCompare(b.nome_turma, 'pt-BR', { numeric: true })
  })

  const isFieldInvalid = (value: string) => {
    return !value || value.trim() === ''
  }

  const getFieldBorderClass = (value: string) => {
    return isFieldInvalid(value) 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  }

  return (
    <div className="space-y-6">
      <StepHeader 
        icon={GraduationCap}
        title="Matrícula"
        description="Turma e dados acadêmicos"
      />
      
      <div className="grid gap-6">
        {/* Ano Letivo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ano Letivo</h3>
          </div>
          
          <div>
            <label htmlFor="ano_letivo_id" className="block text-sm font-medium text-gray-700 mb-2">
              Ano Letivo <span className="text-red-500">*</span>
            </label>
            
            {isLoadingDropdowns ? (
              <div className="flex items-center gap-2 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Carregando anos letivos...</span>
              </div>
            ) : (
              <>
                <select
                  id="ano_letivo_id"
                  value={formData.matricula.ano_letivo_id}
                  onChange={(e) => updateMatricula('ano_letivo_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getFieldBorderClass(formData.matricula.ano_letivo_id)}`}
                >
                  <option value="">Selecione o ano letivo</option>
                  {anosLetivos.map(ano => (
                    <option key={ano.ano_letivo_id} value={ano.ano_letivo_id}>
                      {ano.ano}
                    </option>
                  ))}
                </select>
                
                {isFieldInvalid(formData.matricula.ano_letivo_id) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Ano letivo é obrigatório
                  </p>
                )}
                
                {anosLetivos.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Nenhum ano letivo disponível
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Turma */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Turma</h3>
          </div>
          
          <div>
            <label htmlFor="turma_id" className="block text-sm font-medium text-gray-700 mb-2">
              Turma <span className="text-red-500">*</span>
            </label>
            
            {isLoadingDropdowns ? (
              <div className="flex items-center gap-2 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm text-gray-600">Carregando turmas...</span>
              </div>
            ) : (
              <>
                <select
                  id="turma_id"
                  value={formData.matricula.turma_id}
                  onChange={(e) => updateMatricula('turma_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getFieldBorderClass(formData.matricula.turma_id)}`}
                >
                  <option value="">Selecione a turma</option>
                  {turmasOrdenadas.map(turma => (
                    <option key={turma.turma_id} value={turma.turma_id}>
                      {formatarNomeTurma(turma)}
                    </option>
                  ))}
                </select>
                
                {isFieldInvalid(formData.matricula.turma_id) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Turma é obrigatória
                  </p>
                )}
                
                {turmas.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Nenhuma turma disponível
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Data da Matrícula */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Data da Matrícula</h3>
          </div>
          
          <div>
            <label htmlFor="data_matricula" className="block text-sm font-medium text-gray-700 mb-2">
              Data da Matrícula <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="data_matricula"
              value={formData.matricula.data_matricula}
              onChange={(e) => updateMatricula('data_matricula', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getFieldBorderClass(formData.matricula.data_matricula)}`}
              max={new Date().toISOString().split('T')[0]} // Não permitir datas futuras
            />
            
            {isFieldInvalid(formData.matricula.data_matricula) && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Data da matrícula é obrigatória
              </p>
            )}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Informações Importantes</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• A data da matrícula não pode ser superior à data atual</li>
                <li>• Certifique-se de que o ano letivo e a turma selecionados estão corretos</li>
                <li>• Estes dados poderão ser alterados posteriormente pela secretaria</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
