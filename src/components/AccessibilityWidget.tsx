import { useState, useEffect } from 'react'
import { useSystemData } from '@/hooks/use-system-data'
import { Accessibility, ZoomIn, ZoomOut, Type, Contrast } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AccessibilityWidget() {
  const { data: systemData } = useSystemData()
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`
  }, [fontSize])

  useEffect(() => {
    if (highContrast) {
      document.documentElement.style.filter = 'contrast(1.25)'
    } else {
      document.documentElement.style.filter = 'none'
    }
  }, [highContrast])

  if (systemData?.integrations?.accessibility_enabled === false) {
    return null
  }

  return (
    <div className="fixed bottom-24 right-6 z-[60] animate-fade-in-up">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-[#0d47a1] hover:bg-[#1565c0] text-white shadow-lg border-2 border-white/20"
          >
            <Accessibility className="h-7 w-7" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Opções de Acessibilidade
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setFontSize((prev) => Math.min(prev + 10, 150))}
            className="cursor-pointer py-3"
          >
            <ZoomIn className="mr-3 h-5 w-5 text-green-600" />
            <span className="font-medium">Aumentar Texto</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setFontSize((prev) => Math.max(prev - 10, 70))}
            className="cursor-pointer py-3"
          >
            <ZoomOut className="mr-3 h-5 w-5 text-green-600" />
            <span className="font-medium">Diminuir Texto</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setFontSize(100)} className="cursor-pointer py-3">
            <Type className="mr-3 h-5 w-5 text-green-600" />
            <span className="font-medium">Tamanho Original</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setHighContrast(!highContrast)}
            className="cursor-pointer py-3"
          >
            <Contrast className="mr-3 h-5 w-5 text-green-600" />
            <span className="font-medium">Alternar Alto Contraste</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
