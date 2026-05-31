/* Input Component - A component that displays an input - from shadcn/ui (exposes Input) */
import * as React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface InputProps extends React.ComponentProps<'input'> {
  withAi?: boolean
  aiContext?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, withAi, aiContext, value, onChange, ...props }, ref) => {
    const [isGenerating, setIsGenerating] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement | null>(null)

    const excludeNames = [
      'id',
      'cpf',
      'cnpj',
      'cep',
      'phone',
      'email',
      'password',
      'code',
      'token',
      'valor',
      'price',
      'numero',
      'number',
    ]
    const isExcludedType = [
      'password',
      'number',
      'email',
      'tel',
      'url',
      'search',
      'date',
      'time',
      'datetime-local',
      'file',
      'color',
      'checkbox',
      'radio',
    ].includes(type || 'text')
    const isExcludedName = excludeNames.some((n) => props.name?.toLowerCase().includes(n))

    const showAi =
      withAi !== false && !isExcludedType && !isExcludedName && !props.disabled && !props.readOnly

    const handleGenerate = async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isGenerating || props.disabled) return

      setIsGenerating(true)
      try {
        const { data, error } = await supabase.functions.invoke('generate-ai-text', {
          body: {
            field_context: aiContext || props.name || props.placeholder || 'campo de texto',
            current_text: value || '',
            max_length: props.maxLength || 255,
          },
        })
        if (error) throw error
        if (data?.generated_text && inputRef.current) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value',
          )?.set

          nativeInputValueSetter?.call(inputRef.current, data.generated_text)
          const ev = new Event('input', { bubbles: true })
          inputRef.current.dispatchEvent(ev)

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
      <div className={cn('relative flex w-full items-center', className)}>
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            showAi && 'pr-10',
          )}
          ref={(node) => {
            inputRef.current = node
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-amber-500 disabled:opacity-50 transition-colors"
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
Input.displayName = 'Input'

export { Input }
