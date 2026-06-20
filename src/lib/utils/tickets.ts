export function formatSLA(ticket: any, configs: any[]) {
  if (!ticket.sla_started_at) return { text: 'N/A', expired: false, paused: false }
  if (ticket.status === 'Resolvido' || ticket.status === 'Fechado') {
    return { text: 'Finalizado', expired: false, paused: false }
  }

  const start = new Date(ticket.sla_started_at).getTime()
  const end = ticket.sla_paused_at ? new Date(ticket.sla_paused_at).getTime() : Date.now()
  const elapsedMinutes = (end - start - Number(ticket.total_paused_time_ms || 0)) / 60000

  const config = configs.find((c: any) => c.priority === ticket.priority)
  const total = config?.resolution_time_minutes || 240
  const remaining = total - elapsedMinutes

  const absRemaining = Math.abs(remaining)
  const h = Math.floor(absRemaining / 60)
  const m = Math.floor(absRemaining % 60)
  const text = `${h}h ${m}m`

  return {
    text: remaining < 0 ? `-${text}` : text,
    expired: remaining < 0,
    paused: !!ticket.sla_paused_at,
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'P1':
      return 'bg-red-500 text-white hover:bg-red-600'
    case 'P2':
      return 'bg-orange-500 text-white hover:bg-orange-600'
    case 'P3':
      return 'bg-yellow-500 text-white hover:bg-yellow-600'
    case 'P4':
      return 'bg-blue-500 text-white hover:bg-blue-600'
    default:
      return 'bg-gray-500 text-white'
  }
}
