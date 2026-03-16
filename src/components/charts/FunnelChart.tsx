'use client'

import { cn } from '@/lib/utils/format'

interface FunnelStage {
  stage: string
  count: number
}

interface FunnelChartProps {
  data: FunnelStage[]
}

const STAGE_LABELS: Record<string, string> = {
  awareness: 'Conhecimento',
  interest: 'Interesse',
  consideration: 'Consideração',
  action: 'Ação',
  advocate: 'Promotor',
}

const STAGE_COLORS = [
  'bg-[#FFD100]',
  'bg-[#E5BE00]',
  'bg-[#9AB3DB]',
  'bg-[#6998CE]',
  'bg-[#3B82F6]',
]

export default function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-3">
      {data.map((stage, idx) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 12)
        const label = STAGE_LABELS[stage.stage] ?? stage.stage

        return (
          <div key={stage.stage} className="flex items-center gap-3">
            <span className="font-body text-xs text-dark-400 w-24 text-right shrink-0">
              {label}
            </span>
            <div className="flex-1 relative">
              <div
                className={cn(
                  'h-9 rounded-md flex items-center justify-end pr-3 transition-all duration-300 ease-in-out',
                  STAGE_COLORS[idx % STAGE_COLORS.length]
                )}
                style={{ width: `${widthPct}%` }}
              >
                <span className="font-mono text-xs font-semibold text-dark-700">
                  {stage.count.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
