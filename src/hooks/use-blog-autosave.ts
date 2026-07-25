import { useState, useEffect, useRef, useCallback, type RefObject } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { blogService } from '@/services/blog'
import { supabase } from '@/lib/supabase/client'

export type SaveState = 'idle' | 'saving' | 'saved'

interface UseBlogAutosaveOptions {
  form: UseFormReturn<any>
  postId: string | undefined
  ready: boolean
  formRef: RefObject<HTMLFormElement>
}

export function useBlogAutosave({ form, postId, ready, formRef }: UseBlogAutosaveOptions) {
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(postId)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const lastSavedRef = useRef<string>('')
  const currentPostIdRef = useRef<string | undefined>(postId)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    currentPostIdRef.current = currentPostId
  }, [currentPostId])

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => {
      lastSavedRef.current = JSON.stringify(form.getValues())
      setHasUnsavedChanges(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [ready, form])

  const performSave = useCallback(
    async (isAutoSave: boolean) => {
      if (isSavingRef.current) return
      const valuesToSave = form.getValues()
      const serializedToSave = JSON.stringify(valuesToSave)
      if (serializedToSave === lastSavedRef.current) return

      isSavingRef.current = true
      setSaveState('saving')

      try {
        if (currentPostIdRef.current) {
          await blogService.updatePost(currentPostIdRef.current, valuesToSave)
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          const newPost = await blogService.createPost({
            ...valuesToSave,
            status: 'draft',
            author_id: user?.id,
          })
          setCurrentPostId(newPost.id)
          currentPostIdRef.current = newPost.id
        }

        lastSavedRef.current = serializedToSave
        const currentSerialized = JSON.stringify(form.getValues())
        setHasUnsavedChanges(currentSerialized !== serializedToSave)
        setSaveState('saved')

        if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
        savedDisplayTimerRef.current = setTimeout(() => setSaveState('idle'), 2000)

        if (isAutoSave) {
          toast.success('Rascunho salvo automaticamente')
        }
      } catch {
        setSaveState('idle')
      } finally {
        isSavingRef.current = false
      }
    },
    [form],
  )

  useEffect(() => {
    if (!ready) return
    const subscription = form.watch((values) => {
      const serialized = JSON.stringify(values)
      if (serialized === lastSavedRef.current) return

      setHasUnsavedChanges(true)

      if (!currentPostIdRef.current) {
        performSave(true)
        return
      }

      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = setTimeout(() => performSave(true), 30000)
    })
    return () => subscription.unsubscribe()
  }, [ready, form, performSave])

  useEffect(() => {
    if (!ready || !hasUnsavedChanges) return
    const formEl = formRef.current
    if (!formEl) return
    const handleBlur = () => {
      if (!isSavingRef.current) performSave(true)
    }
    formEl.addEventListener('focusout', handleBlur)
    return () => formEl.removeEventListener('focusout', handleBlur)
  }, [ready, hasUnsavedChanges, performSave, formRef])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || isSavingRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
      if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
    }
  }, [])

  const markSaved = useCallback(() => {
    lastSavedRef.current = JSON.stringify(form.getValues())
    setHasUnsavedChanges(false)
  }, [form])

  return { saveState, currentPostId, hasUnsavedChanges, markSaved }
}
