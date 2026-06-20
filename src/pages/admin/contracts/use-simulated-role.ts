import { useState, useEffect } from 'react'

export function useSimulatedRole() {
  const [role, setRole] = useState(() => localStorage.getItem('cms_role') || 'Admin')

  useEffect(() => {
    localStorage.setItem('cms_role', role)
  }, [role])

  return { role, setRole }
}
