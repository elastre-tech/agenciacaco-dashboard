'use client'

import { cn } from '@/lib/utils/format'

interface DensityCell {
  neighborhood: string
  time_slot: string
  count: number
}

interface DensityGridProps {
  data: DensityCell[]
  className?: string
}

const TIME_SLOTS = ['Manhã', 'Tarde', 'Noite']

function intensityClass(count: number, max: number): string {
  if (max === 0 || count === 0) return 'bg-dark-50'
  const ratio = count / max
  if (ratio <= 0.25) return 'bg-primary/20'
  if (ratio <= 0.5) return 'bg-primary/40'
  if (ratio <= 0.75) return 'bg-primary/70'
  return 'bg-primary'
}

export default function DensityGrid({ data, className }: DensityGridProps) {
  const neighborhoods = Array.from(new Set(data.map((d) => d.neighborhood))).sort()
  const max = Math.max(...data.map((d) => d.count), 0)

  const lookup = new Map<string, number>()
  for (const d of data) {
    lookup.set(`${d.neighborhood}::${d.time_slot}`, d.count)
  }

  if (!neighborhoods.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-6">
        Sem dados de interações para o período.
      </p>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `minmax(120px, 1fr) repeat(${TIME_SLOTS.length}, minmax(80px, 1fr))`,
        }}
      >
        <div className="p-2" />
        {TIME_SLOTS.map((slot) => (
          <div
            key={slot}
            className="p-2 text-center font-heading text-xs font-semibold text-dark-400"
          >
            {slot}
          </div>
        ))}

        {neighborhoods.map((hood) => (
          <>
            <div
              key={`label-${hood}`}
              className="p-2 font-body text-xs text-dark-500 truncate flex items-center"
            >
              {hood}
            </div>
            {TIME_SLOTS.map((slot) => {
              const count = lookup.get(`${hood}::${slot}`) ?? 0
              return (
                <div
                  key={`${hood}-${slot}`}
                  className={cn(
                    'rounded-md m-0.5 flex items-center justify-center min-h-[32px] transition-colors',
                    intensityClass(count, max),
                  )}
                  title={`${hood} · ${slot}: ${count}`}
                >
                  <span className="font-mono text-xs text-dark-600">
                    {count > 0 ? count : ''}
                  </span>
                </div>
              )
            })}
          </>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="font-body text-[10px] text-dark-300">Menos</span>
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <div
            key={r}
            className={cn('w-4 h-4 rounded-sm', intensityClass(r * max, max))}
          />
        ))}
        <span className="font-body text-[10px] text-dark-300">Mais</span>
      </div>
    </div>
  )
}
