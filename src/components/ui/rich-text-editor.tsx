import React, { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  List,
  Heading1,
  Heading2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  variables?: { label: string; value: string }[]
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = '150px',
  variables,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value])

  const handleCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    editorRef.current?.focus()
    onChange(editorRef.current?.innerHTML || '')
  }

  const handleLink = () => {
    const url = prompt('Digite a URL do link:')
    if (url) {
      handleCommand('createLink', url)
    }
  }

  return (
    <div
      className={cn(
        'border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 transition-all',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b p-1 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('bold')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('italic')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('underline')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Sublinhado"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('formatBlock', 'H1')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('formatBlock', 'H2')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('insertUnorderedList')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Lista"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLink}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('justifyLeft')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Alinhar à Esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('justifyCenter')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand('justifyRight')}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Alinhar à Direita"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        {variables && variables.length > 0 && (
          <>
            <div className="w-px h-4 bg-border mx-1" />
            <Select
              onValueChange={(val) => {
                editorRef.current?.focus()
                document.execCommand('insertText', false, val)
                onChange(editorRef.current?.innerHTML || '')
              }}
            >
              <SelectTrigger className="h-8 w-[160px] text-xs bg-transparent border-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Inserir Variável" />
              </SelectTrigger>
              <SelectContent>
                {variables.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          'p-4 text-sm focus:outline-none prose prose-sm max-w-none dark:prose-invert',
          !value && placeholder
            ? 'before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none empty:before:block'
            : '',
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  )
}
