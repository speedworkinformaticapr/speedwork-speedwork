import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function MapBlock({ data }: { data: any }) {
  const [address, setAddress] = useState('')

  useEffect(() => {
    supabase
      .from('system_data')
      .select('*')
      .single()
      .then(({ data: sys }) => {
        if (sys) {
          const fullAddress = `${sys.address_street || ''}, ${sys.address_number || ''} - ${sys.address_city || ''}, ${sys.address_state || ''}`
          setAddress(fullAddress)
        }
      })
  }, [])

  const sizeClass =
    data?.size === 'large' ? 'h-[500px]' : data?.size === 'small' ? 'h-[250px]' : 'h-[350px]'

  if (!address) return <div className={`w-full bg-muted animate-pulse ${sizeClass}`} />

  const encodedAddress = encodeURIComponent(address)

  return (
    <div className={`w-full relative ${sizeClass}`}>
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
        allowFullScreen
      ></iframe>
    </div>
  )
}
