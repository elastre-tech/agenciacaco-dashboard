'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ShareOfVoiceEntry {
  candidate_name: string
  mentions_count: number
  sentiment_score: number
  period_start: string
  period_end: string
}

interface ShareOfVoiceChartProps {
  data: ShareOfVoiceEntry[]
}

const CANDIDATE_COLORS: Record<string, string> = {
  'Roberto Menezes': '#FFD100',
  'Ana Clara': '#3B82F6',
  'Carlos Eduardo': '#22C55E',
  'Fernanda': '#8B5CF6',
}

function formatPeriod(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

interface TooltipEntry {
  name: string
  value: number
  color: string
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-dark-700 text-white px-4 py-3 rounded-lg shadow-lg">
      <p className="font-body text-xs text-dark-200 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-body text-xs text-dark-200 flex-1">{entry.name}</span>
            <span className="font-mono text-sm font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ShareOfVoiceChart({ data }: ShareOfVoiceChartProps) {
  const periods = Array.from(new Set(data.map((d) => d.period_start))).sort()
  const candidates = Array.from(new Set(data.map((d) => d.candidate_name)))

  const chartData = periods.map((period) => {
    const row: Record<string, number | string> = { period: formatPeriod(period) }
    candidates.forEach((candidate) => {
      const entry = data.find(
        (d) => d.period_start === period && d.candidate_name === candidate,
      )
      row[candidate] = entry?.mentions_count ?? 0
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
        <defs>
          {candidates.map((candidate) => {
            const color = CANDIDATE_COLORS[candidate] ?? '#9CA3AF'
            return (
              <linearGradient key={candidate} id={`sov-${candidate.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )
          })}
        </defs>
        <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 11, fill: '#9A9A9A', fontFamily: 'var(--font-dm-sans)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9A9A9A', fontFamily: 'var(--font-jetbrains)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {candidates.map((candidate) => {
          const color = CANDIDATE_COLORS[candidate] ?? '#9CA3AF'
          return (
            <Area
              key={candidate}
              type="monotone"
              dataKey={candidate}
              stackId="sov"
              stroke={color}
              strokeWidth={2}
              fill={`url(#sov-${candidate.replace(/\s/g, '')})`}
              animationDuration={300}
              animationEasing="ease-in-out"
            />
          )
        })}
      </AreaChart>
    </ResponsiveContainer>
  )
}
