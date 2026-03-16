'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { MetricsDaily } from '@/types/database'

interface ReachLeadsChartProps {
  data: MetricsDaily[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-dark-700 text-white px-3 py-2 rounded-lg shadow-lg">
      <p className="font-body text-xs text-dark-200 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="font-body text-xs text-dark-200">
            {p.dataKey === 'reach' ? 'Alcance' : 'Leads'}:
          </span>
          <span className="font-mono text-xs font-medium">
            {p.value.toLocaleString('pt-BR')}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ReachLeadsChart({ data }: ReachLeadsChartProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    reach: Number(d.total_reach),
    leads: Number(d.leads_count),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }} barGap={2}>
        <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9A9A9A', fontFamily: 'var(--font-dm-sans)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="reach"
          tick={{ fontSize: 11, fill: '#9A9A9A', fontFamily: 'var(--font-jetbrains)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          yAxisId="leads"
          orientation="right"
          tick={{ fontSize: 11, fill: '#9A9A9A', fontFamily: 'var(--font-jetbrains)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="font-body text-xs text-dark-400">
              {value === 'reach' ? 'Alcance' : 'Leads'}
            </span>
          )}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          yAxisId="reach"
          dataKey="reach"
          fill="#FFD100"
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
          animationDuration={300}
          animationEasing="ease-in-out"
        />
        <Bar
          yAxisId="leads"
          dataKey="leads"
          fill="#3B82F6"
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
          animationDuration={300}
          animationEasing="ease-in-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
