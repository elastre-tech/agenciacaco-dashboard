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
import type { MetricsDaily } from '@/types/database'

interface CPLTrendChartProps {
  data: MetricsDaily[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-dark-700 text-white px-3 py-2 rounded-lg shadow-lg">
      <p className="font-body text-xs text-dark-200 mb-1">{label}</p>
      <p className="font-mono font-semibold text-sm">
        R$ {payload[0].value.toFixed(2)}
      </p>
    </div>
  )
}

export default function CPLTrendChart({ data }: CPLTrendChartProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    cpl: Number(d.cpl),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="cplGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickFormatter={(v) => `R$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cpl"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#cplGradient)"
          animationDuration={300}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
