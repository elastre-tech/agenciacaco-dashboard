'use client'

import { cn } from '@/lib/utils/format'

interface ReputationBreakdown {
  positive: number
  neutral: number
  negative: number
}

interface ReputationThermometerProps {
  score: number
  breakdown: ReputationBreakdown
  className?: string
}

function clampScore(score: number) {
  return Math.max(-100, Math.min(100, score))
}

function scoreToPercent(score: number) {
  return ((clampScore(score) + 100) / 200) * 100
}

export default function ReputationThermometer({ score, breakdown, className }: ReputationThermometerProps) {
  const clamped = clampScore(score)
  const percent = scoreToPercent(clamped)
  const total = breakdown.positive + breakdown.neutral + breakdown.negative
  const pctPositive = total > 0 ? ((breakdown.positive / total) * 100).toFixed(1) : '0.0'
  const pctNeutral = total > 0 ? ((breakdown.neutral / total) * 100).toFixed(1) : '0.0'
  const pctNegative = total > 0 ? ((breakdown.negative / total) * 100).toFixed(1) : '0.0'

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative pt-8 pb-6">
        <div
          className="absolute top-0 font-mono text-sm font-bold text-dark-700 -translate-x-1/2"
          style={{ left: `${percent}%` }}
        >
          {clamped > 0 ? '+' : ''}{clamped}
        </div>

        <div className="relative h-4 rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(to right, #EF4444 0%, #F59E0B 50%, #22C55E 100%)',
          }}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-2 border-dark-700 rotate-45 shadow-md z-10"
            style={{ left: `${percent}%` }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="font-body text-xs text-danger font-medium">Crise</span>
          <span className="font-body text-xs text-warning font-medium">Neutro</span>
          <span className="font-body text-xs text-success font-medium">Excelente</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="font-body text-xs text-dark-300">
            {breakdown.positive} positivas ({pctPositive}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-warning" />
          <span className="font-body text-xs text-dark-300">
            {breakdown.neutral} neutras ({pctNeutral}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-danger" />
          <span className="font-body text-xs text-dark-300">
            {breakdown.negative} negativas ({pctNegative}%)
          </span>
        </div>
      </div>
    </div>
  )
}
