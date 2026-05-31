import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Toggle } from './toggle'

export interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  withAi?: boolean
  aiContext?: string
  className?: string
  disabled?: boolean
  id?: string
  name?: string
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder,
  withAi = true,
  aiContext,
  className,
  disabled,
  id,
  name,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    handleInput()
  }

  const handleGenerate = async () => {
    if (isGenerating || disabled) return
    setIsGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-text', {
        body: {
          field_context: aiContext || name || placeholder || 'texto rico longo',
          current_text: value || '',
        },
      })
      if (error) throw error
      if (data?.generated_text) {
        let text = data.generated_text
        text = text.replace(/\n/g, '<br>')
        if (onChange) onChange(text)
        if (editorRef.current) {
          editorRef.current.innerHTML = text
        }
      }
    } catch (err) {
      toast.error('Erro ao gerar texto com IA')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div
      className={cn(
        'border rounded-md border-input bg-background overflow-hidden',
        className,
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .rich-text-editor-content[contenteditable]:empty::before {
          content: attr(placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          display: block;
        }
      `,
        }}
      />
      <div className="flex items-center flex-wrap gap-1 border-b bg-muted/50 p-1">
        <Toggle
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            execCommand('bold')
          }}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            execCommand('italic')
          }}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            execCommand('insertUnorderedList')
          }}
          aria-label="List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            execCommand('insertOrderedList')
          }}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            const url = window.prompt('URL do link:')
            if (url) execCommand('createLink', url)
          }}
          aria-label="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            execCommand('formatBlock', 'H1')
          }}
          aria-label="H1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            execCommand('formatBlock', 'H2')
          }}
          aria-label="H2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            execCommand('formatBlock', 'H3')
          }}
          aria-label="H3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        {withAi && (
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                handleGenerate()
              }}
              disabled={isGenerating || disabled}
              className="flex items-center gap-1 text-xs px-2 py-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-md transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Gerar com IA
            </button>
          </div>
        )}
      </div>
      <div
        id={id}
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        className="rich-text-editor-content min-h-[120px] max-h-[400px] overflow-y-auto p-3 focus:outline-none prose prose-sm max-w-none dark:prose-invert"
        placeholder={placeholder}
      />
    </div>
  )
}
