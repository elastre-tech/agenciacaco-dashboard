'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/format'
import type { Workspace, MetricsDaily } from '@/types/database'

interface WorkspaceCardProps {
  workspace: Workspace
  latestMetrics: MetricsDaily | null
  alertsCount: number
}

function getHealthColor(cpl: number, alerts: number): string {
  if (cpl < 8 && alerts === 0) return 'bg-success'
  if (cpl < 12 || alerts <= 2) return 'bg-warning'
  return 'bg-danger'
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

export default function WorkspaceCard({ workspace, latestMetrics, alertsCount }: WorkspaceCardProps) {
  const cpl = latestMetrics?.cpl ?? 0
  const reach = latestMetrics?.total_reach ?? 0
  const leads = latestMetrics?.leads_count ?? 0
  const healthColor = getHealthColor(cpl, alertsCount)

  return (
    <Link
      href={`/w/${workspace.id}/dashboard`}
      target="_blank"
      className="block bg-surface rounded-card shadow-card border border-border/50 p-5 hover:shadow-card-hover transition-shadow group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', healthColor)} />
            <h3 className="font-heading font-semibold text-dark-700 truncate group-hover:text-primary transition-colors">
              {workspace.candidate_name}
            </h3>
          </div>
          <p className="font-body text-xs text-dark-300">
            {workspace.city}, {workspace.state}
          </p>
        </div>

        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-body flex-shrink-0',
          workspace.is_active
            ? 'bg-success/10 text-success'
            : 'bg-dark-100 text-dark-400'
        )}>
          {workspace.is_active ? 'Ativo' : 'Pausado'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="font-body text-[11px] text-dark-300 mb-0.5">CPL</p>
          <p className="font-mono text-sm font-semibold text-dark-700">
            {formatCurrency(cpl)}
          </p>
        </div>
        <div>
          <p className="font-body text-[11px] text-dark-300 mb-0.5">Alcance</p>
          <p className="font-mono text-sm font-semibold text-dark-700">
            {reach.toLocaleString('pt-BR')}
          </p>
        </div>
        <div>
          <p className="font-body text-[11px] text-dark-300 mb-0.5">Leads</p>
          <p className="font-mono text-sm font-semibold text-dark-700">
            {leads.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {alertsCount > 0 && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
          <AlertTriangle size={14} className="text-danger" />
          <span className="font-body text-xs text-danger font-medium">
            {alertsCount} alerta{alertsCount > 1 ? 's' : ''} ativo{alertsCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </Link>
  )
}
