'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { WhatsAppMetrics } from '@/types/database'

interface WhatsAppLineChartProps {
  data: WhatsAppMetrics[]
}

const LINE_CONFIG = [
  { key: 'messages_sent', label: 'Enviadas', color: '#1A1A1A' },
  { key: 'messages_delivered', label: 'Entregues', color: '#3B82F6' },
  { key: 'messages_read', label: 'Lidas', color: '#22C55E' },
] as const

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  const labelMap: Record<string, string> = {
    messages_sent: 'Enviadas',
    messages_delivered: 'Entregues',
    messages_read: 'Lidas',
  }

  return (
    <div className="bg-dark-700 text-white px-3 py-2 rounded-lg shadow-lg">
      <p className="font-body text-xs text-dark-200 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="font-body text-xs text-dark-200">
            {labelMap[p.dataKey] ?? p.dataKey}:
          </span>
          <span className="font-mono text-xs font-medium">
            {p.value.toLocaleString('pt-BR')}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function WhatsAppLineChart({ data }: WhatsAppLineChartProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    messages_sent: Number(d.messages_sent),
    messages_delivered: Number(d.messages_delivered),
    messages_read: Number(d.messages_read),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 5, bottom: 0, left: -10 }}
      >
        <CartesianGrid
          stroke="#F5F5F5"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9A9A9A' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9A9A9A' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => {
            const cfg = LINE_CONFIG.find((c) => c.key === value)
            return (
              <span className="font-body text-xs text-dark-400">
                {cfg?.label ?? value}
              </span>
            )
          }}
          iconType="circle"
          iconSize={8}
        />
        {LINE_CONFIG.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={300}
            animationEasing="ease-in-out"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
