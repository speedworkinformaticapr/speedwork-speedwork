import { format } from 'date-fns'
import { Appointment } from '@/services/appointments'

export function parseTime(timeStr?: string | null): number | null {
  if (!timeStr) return null
  const parts = timeStr.split(':')
  if (parts.length < 2) return null
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}:00`
}

export function formatTimeShort(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export function getFreeBlocksForDate(
  date: Date,
  existingAppointments: Appointment[],
  businessHours: any,
) {
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayKey = dayKeys[date.getDay()]
  const config = businessHours?.[dayKey]
  if (!config || !config.is_open) return []

  const openMin = parseTime(config.open_time) || 0
  const closeMin = parseTime(config.close_time) || 0
  const lunchStart = parseTime(config.lunch_start)
  const lunchEnd = parseTime(config.lunch_end)

  let blocks = []
  if (lunchStart !== null && lunchEnd !== null && lunchStart < lunchEnd) {
    blocks.push({ start: openMin, end: lunchStart })
    blocks.push({ start: lunchEnd, end: closeMin })
  } else {
    blocks.push({ start: openMin, end: closeMin })
  }

  const dStr = format(date, 'yyyy-MM-dd')
  const apps = existingAppointments.filter((a) => a.date === dStr && a.status !== 'Cancelado')

  for (const app of apps) {
    const appStart = parseTime(app.start_time)
    const appEnd = parseTime(app.end_time)
    if (appStart === null || appEnd === null) continue

    const newBlocks: { start: number; end: number }[] = []
    for (const b of blocks) {
      if (appEnd <= b.start || appStart >= b.end) {
        newBlocks.push(b)
      } else {
        if (appStart > b.start) newBlocks.push({ start: b.start, end: appStart })
        if (appEnd < b.end) newBlocks.push({ start: appEnd, end: b.end })
      }
    }
    blocks = newBlocks
  }

  return blocks.filter((b) => b.end > b.start)
}

export function getValidSlotsForDate(
  date: Date,
  totalMinutes: number,
  existingAppointments: Appointment[],
  businessHours: any,
) {
  const blocks = getFreeBlocksForDate(date, existingAppointments, businessHours)
  const slots: number[] = []

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  for (const block of blocks) {
    if (block.end - block.start >= totalMinutes) {
      for (let start = block.start; start <= block.end - totalMinutes; start += 30) {
        if (isToday && start <= nowMin) continue
        slots.push(start)
      }
    }
  }
  return slots
}

export function checkIsDelayed(app: Appointment) {
  if (app.status === 'Concluído' || app.status === 'Cancelado') return false

  const now = new Date()
  const parts = app.date.split('-')
  const appDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (appDate < today) return true
  if (appDate > today) return false

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const startMin = parseTime(app.start_time) || 0
  const endMin = parseTime(app.end_time) || 0
  const duration = endMin - startMin

  if (app.status === 'Pendente' || app.status === 'Confirmado') {
    return nowMin > startMin
  }

  if (app.status === 'Em Andamento' || app.status === 'Pausado') {
    let currentExecuted = app.executed_minutes || 0
    if (app.status === 'Em Andamento' && app.last_started_at) {
      const diffMs = now.getTime() - new Date(app.last_started_at).getTime()
      currentExecuted += Math.floor(diffMs / 60000)
    }
    return currentExecuted > duration
  }

  return false
}

export const getStatusColor = (s: string) => {
  switch (s) {
    case 'Confirmado':
      return 'bg-green-100 text-green-700'
    case 'Concluído':
      return 'bg-gray-100 text-gray-700'
    case 'Em Andamento':
      return 'bg-blue-100 text-blue-700'
    case 'Pausado':
      return 'bg-orange-100 text-orange-700'
    case 'Cancelado':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-yellow-100 text-yellow-700'
  }
}
