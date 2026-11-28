// Painel de variáveis do editor de modelo de contrato: lista as variáveis
// detectáveis (CONTRACT_VARIABLES) agrupadas por grupo, mostra quais estão em
// uso no texto ativo e insere a variável no cursor do RichTextEditor.
// O texto ativo (do conteúdo visível na aba) é passado pelo pai via prop.
import { useMemo, useState } from 'react'
import { ChevronDown, Variable } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  CONTRACT_VARIABLES,
  variaveisUsadas,
  placeholder,
  buscaVariavel,
} from '@/lib/contract-variables'
import type { ContractVariable } from '@/lib/contract-variables'

export interface ContractVariablesPanelProps {
  /** Conteúdo (HTML ou texto) da seção aberta no editor — para marcar em uso. */
  texto: string
  /** Callback chamado com o placeholder "{{chave}}" para inserir no cursor. */
  onInserir: (placeholderTexto: string) => void
  className?: string
}

export function ContractVariablesPanel({
  texto,
  onInserir,
  className,
}: ContractVariablesPanelProps) {
  const [busca, setBusca] = useState('')
  // Todos os grupos começam fechados ao abrir a tela; o clique alterna cada um.
  const [abertos, setAbertos] = useState<Record<string, boolean>>({})

  const usadas = useMemo(() => variaveisUsadas(texto || ''), [texto])

  const grupos = useMemo(() => {
    const mapa = new Map<string, ContractVariable[]>()
    const termo = busca.trim().toLowerCase()
    for (const v of CONTRACT_VARIABLES) {
      if (
        termo &&
        !v.descricao.toLowerCase().includes(termo) &&
        !v.chave.toLowerCase().includes(termo) &&
        !v.grupo.toLowerCase().includes(termo)
      )
        continue
      const lista = mapa.get(v.grupo) || []
      lista.push(v)
      mapa.set(v.grupo, lista)
    }
    return Array.from(mapa.entries())
  }, [busca])

  const inserir = (chave: string) => {
    // Normaliza com o placeholder completo se o pai passar algo estrito.
    const info = buscaVariavel(chave)
    onInserir(placeholder(chave))
    void info
  }

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Variable className="h-4 w-4 text-primary" />
          Variáveis do Contrato
        </CardTitle>
        <CardDescription>
          Clique para inserir no cursor. O gerador V6 substitui automaticamente.
        </CardDescription>
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar variável..."
          className="h-8 mt-2"
          aria-label="Buscar variável"
        />
      </CardHeader>
      {/* Sem max-h/overflow: o painel cresce com o conteúdo; se a lista passar
          da tela, a rolagem fica na própria página. */}
      <CardContent className="flex-1 pt-0 space-y-1">
        {grupos.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma variável encontrada.
          </p>
        )}
        {grupos.map(([grupo, vars]) => {
          const aberto = abertos[grupo] ?? false
          return (
            <div key={grupo} className="rounded-md border">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 rounded-md"
                onClick={() => setAbertos((prev) => ({ ...prev, [grupo]: !aberto }))}
                aria-expanded={aberto}
              >
                <span>
                  {grupo}
                  <span className="ml-2 text-xs text-muted-foreground">({vars.length})</span>
                </span>
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', !aberto && '-rotate-90')}
                />
              </button>
              {aberto && (
                <ul className="px-2 pb-2 space-y-1">
                  {vars.map((v) => {
                    const emUso = usadas.has(v.chave)
                    return (
                      <li key={v.chave}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'w-full justify-start h-auto py-1.5 px-2 font-mono text-xs',
                            emUso && 'bg-primary/10 text-primary',
                          )}
                          onClick={() => inserir(v.chave)}
                          title={`${v.descricao}${v.exemplo ? ` — ex.: ${v.exemplo}` : ''}`}
                        >
                          <span className="truncate text-left">
                            {`{{${v.chave}}}`}
                            {emUso && <span className="ml-1 font-sans">✓ em uso</span>}
                          </span>
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
