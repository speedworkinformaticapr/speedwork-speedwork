import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useFinancialGridData(records: any[]) {
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const [partners, setPartners] = useState<Record<string, any>>({})
  const [accounts, setAccounts] = useState<Record<string, any>>({})

  useEffect(() => {
    const idSet = new Set<string>()
    const acctIdSet = new Set<string>()
    records.forEach((r) => {
      if (r.client_id) idSet.add(r.client_id)
      if (r.conta_origem_id) acctIdSet.add(r.conta_origem_id)
      if (r.conta_destino_id) acctIdSet.add(r.conta_destino_id)
      ;(r.financial_charges || []).forEach((c: any) => {
        if (c.profile_id) idSet.add(c.profile_id)
        if (c.conta_origem_id) acctIdSet.add(c.conta_origem_id)
        if (c.conta_destino_id) acctIdSet.add(c.conta_destino_id)
      })
    })

    if (idSet.size > 0) {
      supabase
        .from('profiles')
        .select('id, name, cpf_cnpj, document')
        .in('id', [...idSet])
        .then(({ data }) => {
          const map: Record<string, any> = {}
          data?.forEach((p) => (map[p.id] = p))
          setProfiles(map)
        })
    } else {
      setProfiles({})
    }

    if (acctIdSet.size > 0) {
      supabase
        .from('plano_contas')
        .select('id, codigo_estrutural, nome, natureza')
        .in('id', [...acctIdSet])
        .then(({ data }) => {
          const map: Record<string, any> = {}
          data?.forEach((p) => (map[p.id] = p))
          setAccounts(map)
        })
    } else {
      setAccounts({})
    }

    const names = records.map((r) => r.client_name).filter(Boolean) as string[]
    const uniqueNames = [...new Set(names)]
    if (uniqueNames.length > 0) {
      supabase
        .from('financial_partners')
        .select('name, document, type')
        .in('name', uniqueNames)
        .then(({ data }) => {
          const map: Record<string, any> = {}
          data?.forEach((p) => (map[p.name] = p))
          setPartners(map)
        })
    } else {
      setPartners({})
    }
  }, [records])

  return { profiles, partners, accounts }
}
