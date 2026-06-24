import { useRef, useState } from 'react'
import { Camera, X, ImagePlus, Loader2 } from 'lucide-react'

interface UploadFotosProps {
  fotos: string[]
  onChange: (fotos: string[]) => void
  disabled?: boolean
  maxFotos?: number
}

// Redimensiona e comprime a imagem antes de virar base64, para não estourar o banco
const comprimirImagem = (file: File, maxLado = 1280, qualidade = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxLado) {
          height = Math.round((height * maxLado) / width)
          width = maxLado
        } else if (height > maxLado) {
          width = Math.round((width * maxLado) / height)
          height = maxLado
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', qualidade))
      }
      img.onerror = () => reject(new Error('Imagem inválida'))
      img.src = ev.target?.result as string
    }
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

export default function UploadFotos({ fotos, onChange, disabled = false, maxFotos = 5 }: UploadFotosProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [processando, setProcessando] = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null)

  const handleSelecionar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files ?? [])
    if (arquivos.length === 0) return

    const espacoRestante = maxFotos - fotos.length
    const aProcessar = arquivos.slice(0, espacoRestante)

    setProcessando(true)
    try {
      const novas = await Promise.all(aProcessar.map((f) => comprimirImagem(f)))
      onChange([...fotos, ...novas])
    } catch {
      // erro silencioso — imagens inválidas são ignoradas
    } finally {
      setProcessando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removerFoto = (index: number) => {
    onChange(fotos.filter((_, i) => i !== index))
  }

  const podeAdicionar = !disabled && fotos.length < maxFotos

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {fotos.map((foto, index) => (
          <div
            key={index}
            className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
          >
            <img
              src={foto}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setFotoAmpliada(foto)}
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => removerFoto(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                title="Remover foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {podeAdicionar && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={processando}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            {processando ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      {fotos.length === 0 && !podeAdicionar && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
          <Camera className="w-4 h-4" />
          <span>Nenhuma foto adicionada</span>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        {fotos.length}/{maxFotos} fotos • Opcional • As imagens são comprimidas automaticamente
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelecionar}
        className="hidden"
      />

      {/* Visualização ampliada */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setFotoAmpliada(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fotoAmpliada}
            alt="Foto ampliada"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
