import { cn } from '@/lib/utils/format'

interface SkeletonLineProps {
  className?: string
}

export function SkeletonLine({ className }: SkeletonLineProps) {
  return (
    <div className={cn('h-4 bg-dark-100 rounded animate-pulse', className)} />
  )
}

export function SkeletonKPICard() {
  return (
    <div className="bg-surface rounded-card shadow-card p-5 border border-border/50">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-dark-100 animate-pulse" />
        <div className="w-14 h-5 rounded-full bg-dark-100 animate-pulse" />
      </div>
      <div className="h-9 w-28 bg-dark-100 rounded animate-pulse mb-1" />
      <div className="h-4 w-20 bg-dark-100 rounded animate-pulse" />
    </div>
  )
}

export function SkeletonKPIRow({ count = 4 }: { count?: number }) {
  return (
    <div className={cn(
      'grid gap-4',
      count === 2 && 'grid-cols-1 sm:grid-cols-2',
      count === 3 && 'grid-cols-1 sm:grid-cols-3',
      count >= 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonKPICard key={i} />
      ))}
    </div>
  )
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface rounded-card shadow-card border border-border/50 p-5', className)}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="h-4 w-32 bg-dark-100 rounded animate-pulse" />
          <div className="h-3 w-24 bg-dark-100 rounded animate-pulse mt-1.5" />
        </div>
      </div>
      <div className="h-[200px] bg-dark-50 rounded-lg animate-pulse" />
    </div>
  )
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  const widths = ['w-24', 'w-32', 'w-20', 'w-28', 'w-16', 'w-24', 'w-20']
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={cn('h-4 bg-dark-100 rounded animate-pulse', widths[i % widths.length])} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="bg-surface rounded-card shadow-card border border-border/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-dark-50">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-3 w-16 bg-dark-100 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DashboardSkeleton({ charts = 2, kpis = 4 }: { charts?: number; kpis?: number }) {
  return (
    <div className="space-y-6">
      <SkeletonKPIRow count={kpis} />
      <div className={cn(
        'grid gap-4',
        charts === 1 && 'grid-cols-1',
        charts === 2 && 'grid-cols-1 lg:grid-cols-2',
        charts >= 3 && 'grid-cols-1 lg:grid-cols-2'
      )}>
        {Array.from({ length: charts }).map((_, i) => (
          <SkeletonChart key={i} />
        ))}
      </div>
    </div>
  )
}

export function TablePageSkeleton({ kpis = 0, cols = 5 }: { kpis?: number; cols?: number }) {
  return (
    <div className="space-y-6">
      {kpis > 0 && <SkeletonKPIRow count={kpis} />}
      <SkeletonTable cols={cols} />
    </div>
  )
}

export function ModulePageSkeleton({ kpis = 4, charts = 2 }: { kpis?: number; charts?: number }) {
  return (
    <div className="space-y-6">
      <SkeletonKPIRow count={kpis} />
      <div className={cn(
        'grid gap-4',
        charts <= 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2'
      )}>
        {Array.from({ length: charts }).map((_, i) => (
          <SkeletonChart key={i} />
        ))}
      </div>
      <SkeletonTable cols={5} rows={3} />
    </div>
  )
}
