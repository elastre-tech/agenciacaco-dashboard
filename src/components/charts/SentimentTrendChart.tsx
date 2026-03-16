'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface SentimentDataPoint {
  date: string
  positive: number
  neutral: number
  negative: number
}

interface SentimentTrendChartProps {
  data: SentimentDataPoint[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { dataKey: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  const labels: Record<string, string> = {
    positive: 'Positivas',
    neutral: 'Neutras',
    negative: 'Negativas',
  }

  return (
    <div className="bg-dark-700 text-white px-3 py-2 rounded-lg shadow-lg">
      <p className="font-body text-xs text-dark-200 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-mono text-sm" style={{ color: entry.color }}>
          {labels[entry.dataKey]}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export default function SentimentTrendChart({ data }: SentimentTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    date: formatDate(d.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
        <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
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
        <Line
          type="monotone"
          dataKey="positive"
          stroke="#22C55E"
          strokeWidth={2}
          dot={false}
          animationDuration={300}
          animationEasing="ease-in-out"
        />
        <Line
          type="monotone"
          dataKey="neutral"
          stroke="#9A9A9A"
          strokeWidth={2}
          dot={false}
          animationDuration={300}
          animationEasing="ease-in-out"
        />
        <Line
          type="monotone"
          dataKey="negative"
          stroke="#EF4444"
          strokeWidth={2}
          dot={false}
          animationDuration={300}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
