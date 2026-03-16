'use client'

import { cn } from '@/lib/utils/format'
import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export default function ChartCard({ title, subtitle, children, className, action }: ChartCardProps) {
  return (
    <div className={cn(
      'bg-surface rounded-card shadow-card border border-border/50 p-5',
      className
    )}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-heading font-semibold text-dark-700 text-sm">
            {title}
          </h3>
          {subtitle && (
            <p className="font-body text-xs text-dark-300 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
