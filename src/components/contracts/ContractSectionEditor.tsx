// Editor WYSIWYG (RichTextEditor) com painel lateral de variáveis do contrato:
// usado nas guias da tela Editar Modelo. O painel lista as variáveis
// detectáveis (CONTRACT_VARIABLES), mostra quais estão em uso e insere o
// placeholder {{chave}} na posição do cursor. A inserção usa o mesmo caminho do
// editor (document.execCommand insertHTML) — sem fakes de cursor na mão.
import * as React from 'react'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ContractVariablesPanel } from '@/components/contracts/ContractVariablesPanel'

export interface ContractSectionEditorProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  minHeight?: string
  /** Altura máxima da área de texto; com ela a rolagem fica interna no corpo. */
  maxHeight?: string
  /** Classe extra para a área de texto (ex.: contract-doc-editor do contrato). */
  contentClassName?: string
  /** Rótulo acessível do campo de conteúdo para esta seção/aba. */
  label: string
  /** ID opcional para o aria-labelledby do editor. */
  labelId?: string
}

/**
 * Refs expostas do editor de seção: o pai controla a inserção de variáveis.
 */
export interface ContractSectionEditorHandle {
  /** Insere um fragmento HTML no cursor atual do editor. */
  insertHtml: (html: string) => void
}

export const ContractSectionEditor = React.forwardRef<
  ContractSectionEditorHandle,
  ContractSectionEditorProps
>(({ value, onChange, disabled, minHeight, maxHeight, contentClassName, label, labelId }, ref) => {
  const editorRef = React.useRef<HTMLDivElement | null>(null)

  React.useImperativeHandle(ref, () => ({
    insertHtml: (html: string) => {
      const el = editorRef.current
      if (!el) return
      el.focus()
      document.execCommand('insertHTML', false, html)
      if (onChange) onChange(el.innerHTML)
    },
  }))

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-start">
      <div className="flex-1 min-w-0 w-full">
        <RichTextEditor
          ref={editorRef}
          value={value}
          onChange={onChange}
          disabled={disabled}
          minHeight={minHeight}
          maxHeight={maxHeight}
          contentClassName={contentClassName}
          aria-label={label}
          aria-labelledby={labelId}
        />
      </div>
      <ContractVariablesPanel
        className="xl:w-80 w-full shrink-0"
        texto={value || ''}
        onInserir={(ph) => {
          editorRef.current?.focus()
          document.execCommand('insertHTML', false, ph)
          if (onChange && editorRef.current) onChange(editorRef.current.innerHTML)
        }}
      />
    </div>
  )
})
ContractSectionEditor.displayName = 'ContractSectionEditor'
