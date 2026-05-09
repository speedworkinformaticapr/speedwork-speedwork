import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AIGenerateButtonProps {
  onGenerate: (text: string) => void
  fieldContext: string
  currentText?: string
  maxLength?: number
  className?: string
}

export function AIGenerateButton({
  onGenerate,
  fieldContext,
  currentText = '',
  maxLength,
  className = '',
}: AIGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const { data: sysData } = await supabase.from('system_data').select('ai_context').single()
      const aiContext = sysData?.ai_context || ''

      const { data, error } = await supabase.functions.invoke('generate-ai-text', {
        body: {
          field_context: fieldContext,
          current_text: currentText,
          system_context: aiContext,
          max_length: maxLength,
        },
      })

      if (error) throw error

      if (data?.generated_text) {
        onGenerate(data.generated_text)
        toast({
          title: 'Texto gerado com sucesso!',
          description: 'O campo foi preenchido com a sugestão da IA.',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar texto',
        description: error.message || 'Houve um erro na comunicação com a IA.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 ${className}`}
      onClick={handleGenerate}
      disabled={isGenerating}
      title="Gerar com IA"
    >
      {isGenerating ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3 mr-1" />
      )}
      Gerar
    </Button>
  )
}
