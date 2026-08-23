import React, { createContext, useContext, useState, useEffect } from 'react'

export interface AdminHeaderContent {
  title?: React.ReactNode
  controls?: React.ReactNode
}

interface AdminHeaderContextType {
  setHeader: (content: AdminHeaderContent | null) => void
  headerContent: AdminHeaderContent | null
}

const AdminHeaderContext = createContext<AdminHeaderContextType>({
  setHeader: () => {},
  headerContent: null,
})

export function AdminHeaderProvider({ children }: { children: React.ReactNode }) {
  const [headerContent, setHeader] = useState<AdminHeaderContent | null>(null)

  return (
    <AdminHeaderContext.Provider value={{ setHeader, headerContent }}>
      {children}
    </AdminHeaderContext.Provider>
  )
}

export function useAdminHeader() {
  return useContext(AdminHeaderContext)
}

export function SetAdminHeader({
  title,
  controls,
}: {
  title?: React.ReactNode
  controls?: React.ReactNode
}) {
  const { setHeader } = useAdminHeader()

  useEffect(() => {
    setHeader({ title, controls })
    return () => {
      setHeader(null)
    }
  }, [title, controls, setHeader])

  return null
}
