import { useRef, useEffect, useCallback } from 'react'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: number
}

interface ToolbarButton {
  command: string
  icon: typeof Bold
  label: string
}

const TOOLBAR: ToolbarButton[] = [
  { command: 'bold', icon: Bold, label: 'Negrito' },
  { command: 'italic', icon: Italic, label: 'Itálico' },
  { command: 'underline', icon: Underline, label: 'Sublinhado' },
  { command: 'insertUnorderedList', icon: List, label: 'Lista' },
  { command: 'insertOrderedList', icon: ListOrdered, label: 'Lista numerada' },
]

/**
 * Editor de texto rico leve baseado em contentEditable.
 * Emite HTML simples (negrito, itálico, sublinhado e listas).
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escreva aqui...',
  disabled = false,
  minHeight = 140,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastEmitted = useRef<string>('')

  // Sincroniza o conteúdo externo sem mexer no cursor quando o valor não mudou
  useEffect(() => {
    const el = editorRef.current
    if (el && value !== lastEmitted.current && value !== el.innerHTML) {
      el.innerHTML = value || ''
    }
  }, [value])

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? ''
    lastEmitted.current = html
    onChange(html)
  }, [onChange])

  const exec = useCallback(
    (command: string) => {
      if (disabled) return
      editorRef.current?.focus()
      // execCommand é depreciado, mas continua suportado e é suficiente para formatação básica
      document.execCommand(command, false)
      handleInput()
    },
    [disabled, handleInput]
  )

  const isEmpty = !value || value === '<br>' || value.replace(/<[^>]*>/g, '').trim() === ''

  return (
    <div
      className={`border rounded-xl overflow-hidden bg-white transition-colors ${
        disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {TOOLBAR.map(({ command, icon: Icon, label }) => (
          <button
            key={command}
            type="button"
            title={label}
            disabled={disabled}
            onMouseDown={(e) => {
              e.preventDefault() // mantém a seleção no editor
              exec(command)
            }}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Área editável */}
      <div className="relative">
        {isEmpty && !disabled && (
          <span className="pointer-events-none absolute left-4 top-3 text-gray-400 text-sm">{placeholder}</span>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          suppressContentEditableWarning
          className="px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}

/** Renderiza HTML de forma segura para leitura (visão admin / preview). */
export function RichTextView({ html, className = '' }: { html: string; className?: string }) {
  if (!html || html.replace(/<[^>]*>/g, '').trim() === '') {
    return <p className="text-sm text-gray-400 italic">Não preenchido</p>
  }
  return (
    <div
      className={`text-sm text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
