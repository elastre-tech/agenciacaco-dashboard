'use client'

import { useEffect, useState, useCallback } from 'react'
import { LifeBuoy, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import { formatDateTimeBR } from '@/lib/utils/format'
import { TablePageSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { SupportTicket, SupportTicketStatus } from '@/types/database'

const STATUS_CONFIG: Record<SupportTicketStatus, { label: string; style: string; icon: typeof Clock }> = {
  open: { label: 'Aberto', style: 'bg-warning/10 text-warning', icon: AlertCircle },
  in_progress: { label: 'Em Andamento', style: 'bg-info/10 text-info', icon: Clock },
  resolved: { label: 'Resolvido', style: 'bg-success/10 text-success', icon: CheckCircle },
  closed: { label: 'Fechado', style: 'bg-dark-50 text-dark-300', icon: XCircle },
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    setTickets((data as SupportTicket[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  async function handleStatusChange(ticketId: string, newStatus: SupportTicketStatus) {
    const supabase = createClient()
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    if (!error) await fetchTickets()
  }

  if (loading) return <TablePageSkeleton cols={6} />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">Chamados</h2>
        <p className="font-body text-sm text-dark-300">
          Gerencie tickets de suporte reportados pelos usuários.
        </p>
      </div>

      {!tickets.length ? (
        <EmptyState
          icon={LifeBuoy}
          title="Nenhum chamado registrado"
          description="Quando usuários reportarem problemas, os chamados aparecerão aqui."
        />
      ) : (
        <div className="bg-surface rounded-card shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-dark-50">
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Descrição</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Email</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Página</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Status</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">Data</th>
                  <th className="text-right text-xs uppercase text-dark-300 font-heading px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, idx) => {
                  const config = STATUS_CONFIG[ticket.status]
                  return (
                    <tr
                      key={ticket.id}
                      className={cn(
                        'border-t border-border/50 transition-colors hover:bg-primary-50',
                        idx % 2 === 1 && 'bg-dark-50/30'
                      )}
                    >
                      <td className="px-4 py-3 font-body text-sm text-dark-700 max-w-[300px]">
                        <p className="truncate">{ticket.description}</p>
                        {ticket.screenshot_url && (
                          <a
                            href={ticket.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-info hover:underline"
                          >
                            Ver captura
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-dark-400">
                        {ticket.user_email ?? '-'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-dark-400 max-w-[200px]">
                        <span className="truncate block">{ticket.page_url ?? '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-body text-xs font-medium',
                          config.style
                        )}>
                          <config.icon size={12} />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-dark-300">
                        {formatDateTimeBR(ticket.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as SupportTicketStatus)}
                          className="rounded-lg border border-dark-100 bg-surface px-2 py-1 font-body text-xs text-dark-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="open">Aberto</option>
                          <option value="in_progress">Em Andamento</option>
                          <option value="resolved">Resolvido</option>
                          <option value="closed">Fechado</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
