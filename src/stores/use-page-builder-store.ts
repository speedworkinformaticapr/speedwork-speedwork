import { useState, useEffect } from 'react'

export interface PageBlock {
  id: string
  type: string
  name: string
  order: number
  data: any
  isHidden?: boolean
}

export interface PageBuilderState {
  pageId: string | null
  title: string
  slug: string
  isPublished: boolean
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  displayOrder: number
  blocks: PageBlock[]
  selectedBlockId: string | null
  activeTab: 'properties' | 'builder' | 'block_properties'
  status: 'loading' | 'idle' | 'saving' | 'error'
  errorMessage: string | null
  isPreview: boolean
}

type Listener = () => void
let listeners: Listener[] = []

let state: PageBuilderState = {
  pageId: null,
  title: '',
  slug: '',
  isPublished: false,
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  displayOrder: 0,
  blocks: [],
  selectedBlockId: null,
  activeTab: 'properties',
  status: 'loading',
  errorMessage: null,
  isPreview: false,
}

export const setPageBuilderState = (
  newState: Partial<PageBuilderState> | ((prev: PageBuilderState) => Partial<PageBuilderState>),
) => {
  const updated = typeof newState === 'function' ? newState(state) : newState
  state = { ...state, ...updated }
  listeners.forEach((l) => l())
}

export const getPageBuilderState = () => state

export default function usePageBuilderStore() {
  const [localState, setLocalState] = useState(state)

  useEffect(() => {
    const listener = () => setLocalState(state)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  return { state: localState, setState: setPageBuilderState }
}
