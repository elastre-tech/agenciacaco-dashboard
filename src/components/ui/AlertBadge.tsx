import { cn } from '@/lib/utils/format'
import type { AlertSeverity } from '@/types/database'

const severityStyles: Record<AlertSeverity, string> = {
  critical: 'bg-danger/10 text-danger border-danger/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-info/10 text-info border-info/20',
  low: 'bg-dark-50 text-dark-400 border-dark-100',
}

interface AlertBadgeProps {
  severity: AlertSeverity
  className?: string
}

export default function AlertBadge({ severity, className }: AlertBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-body uppercase tracking-wider border',
      severityStyles[severity],
      className
    )}>
      {severity}
    </span>
  )
}
