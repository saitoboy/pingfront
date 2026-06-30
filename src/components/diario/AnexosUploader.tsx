import { useRef, useState } from 'react'
import { Paperclip, FileText, ImageIcon, File, X, Download, Loader2 } from 'lucide-react'
import type { AnexoRegistro } from '../../types/diario'

const MAX_ARQUIVO = 5 * 1024 * 1024 // 5 MB por arquivo
const MAX_TOTAL = 9 * 1024 * 1024 // 9 MB no total (limite do payload é 10 MB)

const formatarTamanho = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const lerComoBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const ehImagem = (tipo: string) => tipo.startsWith('image/')
const ehPdf = (tipo: string) => tipo === 'application/pdf'

interface Props {
  value: AnexoRegistro[]
  onChange: (anexos: AnexoRegistro[]) => void
  disabled?: boolean
}

export default function AnexosUploader({ value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const totalAtual = value.reduce((acc, a) => acc + a.tamanho, 0)

  const handleArquivos = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setErro(null)
    setCarregando(true)
    try {
      const novos: AnexoRegistro[] = []
      let total = totalAtual

      for (const file of Array.from(files)) {
        if (file.size > MAX_ARQUIVO) {
          setErro(`"${file.name}" excede o limite de 5 MB.`)
          continue
        }
        if (total + file.size > MAX_TOTAL) {
          setErro('Limite total de anexos (9 MB) atingido.')
          break
        }
        const dados = await lerComoBase64(file)
        novos.push({ nome: file.name, tipo: file.type || 'application/octet-stream', tamanho: file.size, dados })
        total += file.size
      }

      if (novos.length > 0) onChange([...value, ...novos])
    } catch {
      setErro('Não foi possível ler o(s) arquivo(s).')
    } finally {
      setCarregando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remover = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">Anexos</label>
        <span className="text-xs text-gray-400">Imagens, PDFs ou outros · até 5 MB cada</span>
      </div>

      {/* Lista de anexos */}
      {value.length > 0 && (
        <ul className="space-y-2 mb-3">
          {value.map((anexo, idx) => (
            <li
              key={`${anexo.nome}-${idx}`}
              className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
            >
              {ehImagem(anexo.tipo) ? (
                <img src={anexo.dados} alt={anexo.nome} className="w-10 h-10 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  {ehPdf(anexo.tipo) ? (
                    <FileText className="w-5 h-5 text-red-500" />
                  ) : (
                    <File className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{anexo.nome}</p>
                <p className="text-xs text-gray-500">{formatarTamanho(anexo.tamanho)}</p>
              </div>

              <a
                href={anexo.dados}
                download={anexo.nome}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Baixar"
              >
                <Download className="w-4 h-4" />
              </a>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => remover(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Botão de adicionar */}
      {!disabled && (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            className="hidden"
            onChange={(e) => handleArquivos(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={carregando}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 border-dashed rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
            {carregando ? 'Carregando...' : 'Adicionar anexo'}
          </button>
        </>
      )}

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

      {value.length === 0 && disabled && (
        <p className="flex items-center gap-1.5 text-sm text-gray-400">
          <ImageIcon className="w-4 h-4" /> Nenhum anexo.
        </p>
      )}
    </div>
  )
}
