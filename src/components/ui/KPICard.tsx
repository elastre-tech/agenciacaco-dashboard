'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/format'

interface KPICardProps {
  label: string
  value: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  icon: LucideIcon
  className?: string
}

export default function KPICard({ label, value, trend, icon: Icon, className }: KPICardProps) {
  const trendPositive = trend?.direction === 'up'

  return (
    <div className={cn(
      'bg-surface rounded-card shadow-card p-5 border border-border/50',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-dark-50">
          <Icon size={18} className="text-dark-400" />
        </div>
        {trend && (
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-body',
            trendPositive
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          )}>
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <p className="font-mono font-bold text-3xl text-dark-700 mb-1 tracking-tight">
        {value}
      </p>
      <p className="font-body text-sm text-dark-300">
        {label}
      </p>
    </div>
  )
}
