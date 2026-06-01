import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status }: { status: string }) {
  let colorClass = 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200'
  const s = status.toLowerCase()

  if (s.includes('pendente')) {
    colorClass = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200'
  } else if (s.includes('andamento')) {
    colorClass = 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
  } else if (s.includes('aprovado') || s.includes('fechada')) {
    colorClass = 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
  } else if (s.includes('rejeitado') || s.includes('cancelado') || s.includes('não aprovado')) {
    colorClass = 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
  } else if (s.includes('ajustes') || s.includes('aguardando')) {
    colorClass = 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200'
  }

  return (
    <Badge variant="outline" className={`${colorClass} whitespace-nowrap`}>
      {status}
    </Badge>
  )
}
