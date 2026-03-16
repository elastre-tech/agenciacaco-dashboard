'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import AlertBadge from '@/components/ui/AlertBadge'
import type { IntelligenceAlert } from '@/types/database'
import { cn } from '@/lib/utils/format'

interface AlertsFeedProps {
  alerts: IntelligenceAlert[]
}

const statusConfig = {
  active: { icon: AlertTriangle, color: 'text-warning' },
  acknowledged: { icon: Clock, color: 'text-info' },
  resolved: { icon: CheckCircle, color: 'text-success' },
} as const

export default function AlertsFeed({ alerts }: AlertsFeedProps) {
  if (!alerts.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-8">
        Nenhum alerta recente.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {alerts.map((alert, idx) => {
        const StatusIcon = statusConfig[alert.status].icon
        const statusColor = statusConfig[alert.status].color

        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-dark-50/50 transition-colors',
              idx !== alerts.length - 1 && 'border-b border-border/50'
            )}
          >
            <StatusIcon size={16} className={cn('mt-0.5 flex-shrink-0', statusColor)} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-body text-sm text-dark-700 font-medium truncate">
                  {alert.title}
                </p>
                <AlertBadge severity={alert.severity} />
              </div>
              <p className="font-body text-xs text-dark-300 line-clamp-1">
                {alert.description}
              </p>
            </div>

            <span className="font-body text-[11px] text-dark-300 flex-shrink-0 mt-0.5">
              {formatDistanceToNow(new Date(alert.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        )
      })}
    </div>
  )
}
