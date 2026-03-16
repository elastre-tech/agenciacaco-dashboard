'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CplDataPoint {
  name: string
  cpl: number
}

interface CplComparisonChartProps {
  data: CplDataPoint[]
}

function getCplColor(cpl: number): string {
  if (cpl < 8) return '#22C55E'
  if (cpl < 12) return '#F59E0B'
  return '#EF4444'
}

export default function CplComparisonChart({ data }: CplComparisonChartProps) {
  if (!data.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-8">
        Sem dados de CPL disponíveis.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={data.length * 48 + 24}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <XAxis
          type="number"
          tickFormatter={(v: number) => `R$${v}`}
          tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 12, fontFamily: 'var(--font-body)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [`R$ ${Number(value).toFixed(2).replace('.', ',')}`, 'CPL']}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #E8E8E8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontSize: 12,
          }}
        />
        <Bar dataKey="cpl" radius={[0, 4, 4, 0]} barSize={24}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={getCplColor(entry.cpl)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
