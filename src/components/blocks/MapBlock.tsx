import { useEffect, useState } from 'react'
import { useSystemData } from '@/hooks/use-system-data'

export function MapBlock({ data: blockData }: { data: any }) {
  const { data: sysData, loading } = useSystemData()
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (sysData) {
      const parts = [
        sysData.address_street,
        sysData.address_number,
        sysData.address_city,
        sysData.address_state,
      ].filter(Boolean)

      setAddress(parts.join(', '))
    }
  }, [sysData])

  const sizeClass =
    blockData?.size === 'large'
      ? 'h-[500px]'
      : blockData?.size === 'small'
        ? 'h-[250px]'
        : 'h-[350px]'

  if (loading) {
    return (
      <div className="container mx-auto px-4 my-12">
        <div className={`w-full bg-muted animate-pulse rounded-2xl ${sizeClass}`} />
      </div>
    )
  }

  if (!address) {
    return (
      <div className="container mx-auto px-4 my-12">
        <div
          className={`w-full ${sizeClass} bg-muted flex items-center justify-center rounded-2xl shadow-sm text-muted-foreground`}
        >
          Endereço não configurado no sistema.
        </div>
      </div>
    )
  }

  const encodedAddress = encodeURIComponent(address)

  return (
    <div className="container mx-auto px-4 my-12">
      <div className={`w-full relative rounded-2xl overflow-hidden shadow-lg ${sizeClass}`}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}
