import React from 'react'
import { Heart } from 'lucide-react'
import { StepHeader } from './StepHeader'
import type { FormularioFichaCadastro } from '../types'

interface Step4Props {
  formData: FormularioFichaCadastro
  setFormData: React.Dispatch<React.SetStateAction<FormularioFichaCadastro>>
  showErrors?: boolean
}

export const Step4DadosSaude: React.FC<Step4Props> = ({ 
  formData, 
  setFormData, 
  showErrors = false 
}) => {
  
  // Função para atualizar campos dos dados de saúde
  const atualizarDadosSaude = (campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      dados_saude: {
        ...prev.dados_saude,
        [campo]: valor
      }
    }))
  }

  return (
    <div className="space-y-8">
      <StepHeader 
        icon={Heart}
        title="Dados de Saúde"
        description="Informações médicas e de saúde do aluno"
      />

      {/* Seção 1: Necessidades Especiais */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
          Necessidades Especiais e Alergias
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Necessidades Especiais
            </label>
            <textarea
              value={formData.dados_saude.necessidades_especiais}
              onChange={(e) => atualizarDadosSaude('necessidades_especiais', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva necessidades especiais (cadeirante, deficiência visual, etc.)"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alergias
            </label>
            <textarea
              value={formData.dados_saude.alergias}
              onChange={(e) => atualizarDadosSaude('alergias', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva alergias conhecidas (alimentos, medicamentos, etc.)"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restrições Alimentares
            </label>
            <textarea
              value={formData.dados_saude.restricao_alimentar}
              onChange={(e) => atualizarDadosSaude('restricao_alimentar', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva restrições alimentares (vegetariano, intolerância à lactose, etc.)"
              rows={2}
              maxLength={300}
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Condições de Saúde */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
          Condições de Saúde
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problemas de Saúde
            </label>
            <textarea
              value={formData.dados_saude.problema_saude}
              onChange={(e) => atualizarDadosSaude('problema_saude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva problemas de saúde conhecidos (asma, diabetes, epilepsia, etc.)"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Checkboxes para condições específicas */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="vacinas_em_dia"
                checked={formData.dados_saude.vacinas_em_dia}
                onChange={(e) => atualizarDadosSaude('vacinas_em_dia', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="vacinas_em_dia" className="ml-2 text-sm text-gray-700">
                Vacinas em dia
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="historico_convulsao"
                checked={formData.dados_saude.historico_convulsao}
                onChange={(e) => atualizarDadosSaude('historico_convulsao', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="historico_convulsao" className="ml-2 text-sm text-gray-700">
                Histórico de convulsão
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="perda_esfincter_emocional"
                checked={formData.dados_saude.perda_esfincter_emocional}
                onChange={(e) => atualizarDadosSaude('perda_esfincter_emocional', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="perda_esfincter_emocional" className="ml-2 text-sm text-gray-700">
                Perda de esfíncter emocional
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dorme_bem"
                checked={formData.dados_saude.dorme_bem}
                onChange={(e) => atualizarDadosSaude('dorme_bem', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="dorme_bem" className="ml-2 text-sm text-gray-700">
                Dorme bem
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="alimenta_se_bem"
                checked={formData.dados_saude.alimenta_se_bem}
                onChange={(e) => atualizarDadosSaude('alimenta_se_bem', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="alimenta_se_bem" className="ml-2 text-sm text-gray-700">
                Alimenta-se bem
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="uso_sanitario_sozinho"
                checked={formData.dados_saude.uso_sanitario_sozinho}
                onChange={(e) => atualizarDadosSaude('uso_sanitario_sozinho', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="uso_sanitario_sozinho" className="ml-2 text-sm text-gray-700">
                Usa sanitário sozinho
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 3: Medicações */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
          Medicações
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicação para Febre
            </label>
            <input
              type="text"
              value={formData.dados_saude.medicacao_febre}
              onChange={(e) => atualizarDadosSaude('medicacao_febre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Dipirona, Paracetamol"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicação para Dor de Cabeça
            </label>
            <input
              type="text"
              value={formData.dados_saude.medicacao_dor_cabeca}
              onChange={(e) => atualizarDadosSaude('medicacao_dor_cabeca', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Paracetamol"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicação para Dor de Barriga
            </label>
            <input
              type="text"
              value={formData.dados_saude.medicacao_dor_barriga}
              onChange={(e) => atualizarDadosSaude('medicacao_dor_barriga', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Buscopan"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alergia a Medicamentos
            </label>
            <input
              type="text"
              value={formData.dados_saude.alergia_medicamento}
              onChange={(e) => atualizarDadosSaude('alergia_medicamento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Penicilina, Aspirina"
              maxLength={200}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Uso Contínuo de Medicamentos
            </label>
            <textarea
              value={formData.dados_saude.uso_continuo_medicamento}
              onChange={(e) => atualizarDadosSaude('uso_continuo_medicamento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva medicamentos de uso contínuo (horário, dosagem, etc.)"
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Seção 4: Informações Familiares */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
          Informações Familiares e Gestação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Parto
            </label>
            <select
              value={formData.dados_saude.tipo_parto}
              onChange={(e) => atualizarDadosSaude('tipo_parto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="Normal">Parto Normal</option>
              <option value="Cesárea">Cesárea</option>
              <option value="Fórceps">Fórceps</option>
              <option value="Não informado">Não informado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicação na Gravidez
            </label>
            <input
              type="text"
              value={formData.dados_saude.medicacao_gravidez}
              onChange={(e) => atualizarDadosSaude('medicacao_gravidez', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Medicamentos usados durante a gravidez"
              maxLength={200}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="gravidez_tranquila"
                checked={formData.dados_saude.gravidez_tranquila}
                onChange={(e) => atualizarDadosSaude('gravidez_tranquila', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="gravidez_tranquila" className="ml-2 text-sm text-gray-700">
                Gravidez tranquila
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="tem_irmaos"
                checked={formData.dados_saude.tem_irmaos}
                onChange={(e) => atualizarDadosSaude('tem_irmaos', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="tem_irmaos" className="ml-2 text-sm text-gray-700">
                Tem irmãos
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="frequentou_outra_escola"
                checked={formData.dados_saude.frequentou_outra_escola}
                onChange={(e) => atualizarDadosSaude('frequentou_outra_escola', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="frequentou_outra_escola" className="ml-2 text-sm text-gray-700">
                Frequentou outra escola
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 5: Acompanhamentos */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
          Acompanhamentos Especializados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="fonoaudiologico"
                checked={formData.dados_saude.fonoaudiologico}
                onChange={(e) => atualizarDadosSaude('fonoaudiologico', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="fonoaudiologico" className="ml-2 text-sm text-gray-700">
                Acompanhamento fonoaudiológico
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="psicopedagogico"
                checked={formData.dados_saude.psicopedagogico}
                onChange={(e) => atualizarDadosSaude('psicopedagogico', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="psicopedagogico" className="ml-2 text-sm text-gray-700">
                Acompanhamento psicopedagógico
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="neurologico"
                checked={formData.dados_saude.neurologico}
                onChange={(e) => atualizarDadosSaude('neurologico', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="neurologico" className="ml-2 text-sm text-gray-700">
                Acompanhamento neurológico
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outro Tratamento
              </label>
              <input
                type="text"
                value={formData.dados_saude.outro_tratamento}
                onChange={(e) => atualizarDadosSaude('outro_tratamento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Fisioterapia, Terapia Ocupacional"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo do Tratamento
              </label>
              <textarea
                value={formData.dados_saude.motivo_tratamento}
                onChange={(e) => atualizarDadosSaude('motivo_tratamento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o motivo dos tratamentos"
                rows={2}
                maxLength={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 6: Observações Gerais */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
          Observações Gerais
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações Adicionais
          </label>
          <textarea
            value={formData.dados_saude.observacoes}
            onChange={(e) => atualizarDadosSaude('observacoes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Informações adicionais importantes sobre a saúde da criança"
            rows={4}
            maxLength={1000}
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.dados_saude.observacoes.length}/1000 caracteres
          </p>
        </div>
      </div>

      {/* Dica informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-700 mb-2">💡 Informações importantes:</h3>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• Todas as informações de saúde são confidenciais e serão usadas apenas para cuidados da criança</li>
          <li>• Em caso de emergência, a escola entrará em contato com os responsáveis imediatamente</li>
          <li>• Mantenha sempre atualizada a carteira de vacinação da criança</li>
          <li>• Informe qualquer mudança nas condições de saúde da criança</li>
        </ul>
      </div>
    </div>
  )
}
