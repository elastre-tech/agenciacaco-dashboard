'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { ChannelBudget } from '@/types/database'

interface BudgetDonutChartProps {
  data: ChannelBudget[]
}

const CHANNEL_COLORS: Record<string, string> = {
  meta_ads: '#3B82F6',
  google_ads: '#22C55E',
  whatsapp: '#F59E0B',
  field_operations: '#8B5CF6',
  events: '#EF4444',
}

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  whatsapp: 'WhatsApp',
  field_operations: 'Campo',
  events: 'Eventos',
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { channel: string; spent: number; allocated: number } }[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="bg-dark-700 text-white px-3 py-2 rounded-lg shadow-lg">
      <p className="font-body text-xs text-dark-200 mb-1">
        {CHANNEL_LABELS[item.channel] ?? item.channel}
      </p>
      <p className="font-mono font-semibold text-sm">
        R$ {Number(item.spent).toLocaleString('pt-BR')}
      </p>
      <p className="font-body text-[11px] text-dark-300">
        de R$ {Number(item.allocated).toLocaleString('pt-BR')}
      </p>
    </div>
  )
}

export default function BudgetDonutChart({ data }: BudgetDonutChartProps) {
  const chartData = data.map((d) => ({
    channel: d.channel,
    spent: Number(d.spent),
    allocated: Number(d.allocated),
  }))

  const totalSpent = chartData.reduce((acc, d) => acc + d.spent, 0)

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-[180px] h-[180px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="spent"
              animationDuration={300}
              animationEasing="ease-in-out"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.channel}
                  fill={CHANNEL_COLORS[entry.channel] ?? '#9A9A9A'}
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono font-bold text-lg text-dark-700">
            {(totalSpent / 1000).toFixed(0)}k
          </span>
          <span className="font-body text-[11px] text-dark-300">gasto</span>
        </div>
      </div>

      <div className="space-y-2.5 flex-1 min-w-0">
        {chartData.map((item) => {
          const pct = totalSpent > 0 ? ((item.spent / totalSpent) * 100).toFixed(0) : '0'
          return (
            <div key={item.channel} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CHANNEL_COLORS[item.channel] ?? '#9A9A9A' }}
              />
              <span className="font-body text-xs text-dark-500 truncate flex-1">
                {CHANNEL_LABELS[item.channel] ?? item.channel}
              </span>
              <span className="font-mono text-xs text-dark-400">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
