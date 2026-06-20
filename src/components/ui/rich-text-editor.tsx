import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface RichTextEditorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  value?: string
  onChange?: (value: string) => void
  withAi?: boolean
  aiContext?: string
  disabled?: boolean
  name?: string
}

export const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value = '', onChange, withAi, aiContext, className, disabled, name, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const { toast } = useToast()

    React.useImperativeHandle(ref, () => internalRef.current as HTMLDivElement)

    React.useEffect(() => {
      if (internalRef.current && value !== internalRef.current.innerHTML) {
        if (document.activeElement !== internalRef.current) {
          internalRef.current.innerHTML = value || ''
        }
      }
    }, [value])

    const execCommand = (command: string, val: string | undefined = undefined) => {
      if (disabled) return
      internalRef.current?.focus()
      document.execCommand(command, false, val)
      if (onChange && internalRef.current) {
        onChange(internalRef.current.innerHTML)
      }
    }

    const handleInput = () => {
      if (onChange && internalRef.current) {
        onChange(internalRef.current.innerHTML)
      }
    }

    const handleGenerateAI = async () => {
      if (!withAi) return
      setIsGenerating(true)
      try {
        const { data: sysData } = await supabase.from('system_data').select('ai_context').single()
        const systemContext = sysData?.ai_context || ''
        const currentText = internalRef.current?.innerText || ''

        const { data, error } = await supabase.functions.invoke('generate-ai-text', {
          body: {
            field_context: aiContext || 'Melhore ou continue o texto',
            current_text: currentText,
            system_context: systemContext,
          },
        })

        if (error) throw error

        if (data?.generated_text) {
          const textToInsert = data.generated_text.replace(/\n/g, '<br/>')
          if (internalRef.current && document.activeElement !== internalRef.current) {
            internalRef.current.focus()
            const range = document.createRange()
            const sel = window.getSelection()
            if (sel) {
              range.selectNodeContents(internalRef.current)
              range.collapse(false)
              sel.removeAllRanges()
              sel.addRange(range)
            }
          }
          execCommand('insertHTML', textToInsert)
          toast({
            title: 'Texto gerado',
            description: 'A sugestão da IA foi inserida no editor.',
          })
        }
      } catch (error: any) {
        toast({
          title: 'Erro ao gerar',
          description: error.message || 'Erro na comunicação com a IA.',
          variant: 'destructive',
        })
      } finally {
        setIsGenerating(false)
      }
    }

    const FONT_FAMILIES = [
      { name: 'Arial', value: 'Arial' },
      { name: 'Times New Roman', value: 'Times New Roman' },
      { name: 'Courier New', value: 'Courier New' },
      { name: 'Georgia', value: 'Georgia' },
      { name: 'Verdana', value: 'Verdana' },
    ]

    const FONT_SIZES = [
      { name: 'Pequeno', value: '2' },
      { name: 'Normal', value: '3' },
      { name: 'Médio', value: '4' },
      { name: 'Grande', value: '5' },
      { name: 'Extra Grande', value: '6' },
    ]

    return (
      <div
        className={cn(
          'border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 flex flex-col bg-background',
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              execCommand('bold')
            }}
            disabled={disabled}
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              execCommand('italic')
            }}
            disabled={disabled}
            title="Itálico"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Select disabled={disabled} onValueChange={(val) => execCommand('fontName', val)}>
            <SelectTrigger className="h-8 w-[130px] border-none bg-transparent hover:bg-muted/50 px-2 shadow-none focus:ring-0">
              <SelectValue placeholder="Fonte" />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select disabled={disabled} onValueChange={(val) => execCommand('fontSize', val)}>
            <SelectTrigger className="h-8 w-[110px] border-none bg-transparent hover:bg-muted/50 px-2 shadow-none focus:ring-0">
              <SelectValue placeholder="Tamanho" />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => (
                <SelectItem key={size.name} value={size.value}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div
            className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted/50 text-foreground group"
            title="Cor do Texto"
          >
            <Palette className="h-4 w-4" />
            <input
              type="color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              onChange={(e) => execCommand('foreColor', e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              execCommand('justifyLeft')
            }}
            disabled={disabled}
            title="Alinhar à Esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              execCommand('justifyCenter')
            }}
            disabled={disabled}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              execCommand('justifyRight')
            }}
            disabled={disabled}
            title="Alinhar à Direita"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              execCommand('justifyFull')
            }}
            disabled={disabled}
            title="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          {withAi && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.preventDefault()
                  handleGenerateAI()
                }}
                disabled={isGenerating || disabled}
                title="Gerar com IA"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1" />
                )}
                <span className="text-xs font-medium">IA</span>
              </Button>
            </>
          )}
        </div>

        <div
          ref={internalRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onBlur={handleInput}
          className={cn(
            'p-3 min-h-[150px] outline-none prose prose-sm max-w-none dark:prose-invert break-words',
            disabled && 'opacity-50 cursor-not-allowed bg-muted',
          )}
          {...props}
        />
      </div>
    )
  },
)
RichTextEditor.displayName = 'RichTextEditor'
