import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, History } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  created_at: string
  changed_by: string
  profiles?: {
    name: string
    email: string
  }
}

export default function SystemDataHistory() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id, action, created_at, changed_by')
          .eq('table_name', 'system_data')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        // Manually fetch profiles since we can't guarantee the join exists safely in this schema structure without knowing exact FK setup
        const userIds = [...new Set(data?.map((log) => log.changed_by).filter(Boolean))] as string[]
        let profilesMap: Record<string, { name: string; email: string }> = {}

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds)

          if (profiles) {
            profilesMap = profiles.reduce(
              (acc, profile) => {
                acc[profile.id] = {
                  name: profile.name || 'Desconhecido',
                  email: profile.email || '',
                }
                return acc
              },
              {} as Record<string, { name: string; email: string }>,
            )
          }
        }

        const enrichedLogs = data?.map((log) => ({
          ...log,
          profiles: log.changed_by ? profilesMap[log.changed_by] : undefined,
        })) as AuditLog[]

        setLogs(enrichedLogs || [])
      } catch (err) {
        console.error('Error fetching audit logs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50">
        <History className="h-10 w-10 mb-3 text-slate-300" />
        <p className="font-medium text-slate-600">Nenhum registro encontrado</p>
        <p className="text-sm">As alterações nos dados do sistema aparecerão aqui.</p>
      </div>
    )
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT':
        return (
          <Badge variant="default" className="bg-blue-500">
            Criação
          </Badge>
        )
      case 'UPDATE':
        return (
          <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">
            Atualização
          </Badge>
        )
      case 'DELETE':
        return <Badge variant="destructive">Exclusão</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Responsável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
              <TableCell className="font-medium">
                {log.created_at
                  ? format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                  : '-'}
              </TableCell>
              <TableCell>{getActionBadge(log.action)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">
                    {log.profiles?.name || 'Sistema / Admin'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {log.profiles?.email || log.changed_by}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
