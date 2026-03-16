'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ChannelBudget } from '@/types/database'

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  whatsapp: 'WhatsApp',
  field_operations: 'Campo',
  events: 'Eventos',
}

const CHANNEL_COLORS: Record<string, string> = {
  meta_ads: '#3B82F6',
  google_ads: '#22C55E',
  whatsapp: '#F59E0B',
  field_operations: '#8B5CF6',
  events: '#EF4444',
}

interface BudgetUtilizationChartProps {
  data: ChannelBudget[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { channel: string; allocated: number; spent: number; pct: number } }> }) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload

  return (
    <div className="bg-dark-700 text-white px-3 py-2 rounded-lg shadow-lg">
      <p className="font-body text-xs text-dark-200 mb-1">
        {CHANNEL_LABELS[item.channel] ?? item.channel}
      </p>
      <p className="font-mono text-sm">
        R$ {item.spent.toLocaleString('pt-BR')} / R$ {item.allocated.toLocaleString('pt-BR')}
      </p>
      <p className="font-body text-xs text-dark-300 mt-0.5">
        {item.pct.toFixed(1)}% utilizado
      </p>
    </div>
  )
}

export default function BudgetUtilizationChart({ data }: BudgetUtilizationChartProps) {
  const chartData = data.map((b) => ({
    channel: b.channel,
    label: CHANNEL_LABELS[b.channel] ?? b.channel,
    allocated: Number(b.allocated),
    spent: Number(b.spent),
    pct: b.allocated > 0 ? (Number(b.spent) / Number(b.allocated)) * 100 : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 56)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 50, bottom: 0, left: 10 }}
      >
        <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" vertical={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#9A9A9A', fontFamily: 'var(--font-jetbrains)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: '#4A4A4A', fontFamily: 'var(--font-dm-sans)' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
        <Bar
          dataKey="allocated"
          radius={[4, 4, 4, 4]}
          barSize={20}
          opacity={0.25}
          animationDuration={300}
          animationEasing="ease-in-out"
        >
          {chartData.map((entry) => (
            <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] ?? '#9A9A9A'} />
          ))}
        </Bar>
        <Bar
          dataKey="spent"
          radius={[4, 4, 4, 4]}
          barSize={20}
          animationDuration={300}
          animationEasing="ease-in-out"
          label={(props) => {
            const { x, y, width, index } = props as { x: number; y: number; width: number; index: number }
            const pct = chartData[index]?.pct ?? 0
            return (
              <text
                x={x + width + 6}
                y={y + 14}
                fill="#4A4A4A"
                fontSize={11}
                fontFamily="var(--font-jetbrains)"
              >
                {pct.toFixed(0)}%
              </text>
            )
          }}
        >
          {chartData.map((entry) => (
            <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] ?? '#9A9A9A'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
