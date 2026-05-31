/* Textarea Component - A component that displays a textarea - from shadcn/ui (exposes Textarea) */
import * as React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  withAi?: boolean
  aiContext?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, withAi, aiContext, value, onChange, ...props }, ref) => {
    const [isGenerating, setIsGenerating] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    const showAi = withAi !== false && !props.disabled && !props.readOnly

    const handleGenerate = async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isGenerating || props.disabled) return

      setIsGenerating(true)
      try {
        const { data, error } = await supabase.functions.invoke('generate-ai-text', {
          body: {
            field_context: aiContext || props.name || props.placeholder || 'campo de texto longo',
            current_text: value || '',
            max_length: props.maxLength || 1000,
          },
        })
        if (error) throw error
        if (data?.generated_text && textareaRef.current) {
          const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value',
          )?.set

          nativeTextareaValueSetter?.call(textareaRef.current, data.generated_text)
          const ev = new Event('input', { bubbles: true })
          textareaRef.current.dispatchEvent(ev)

          if (onChange) {
            onChange(ev as any)
          }
        }
      } catch (error) {
        toast.error('Erro ao gerar texto com IA')
      } finally {
        setIsGenerating(false)
      }
    }

    return (
      <div className={cn('relative flex w-full', className)}>
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            showAi && 'pr-10',
          )}
          ref={(node) => {
            textareaRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          value={value}
          onChange={onChange}
          {...props}
        />
        {showAi && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || props.disabled}
            className="absolute right-3 top-3 text-muted-foreground hover:text-amber-500 disabled:opacity-50 transition-colors"
            title="Gerar texto com IA"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
