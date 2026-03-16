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

interface ElectionData {
  candidate_name: string
  party: string
  votes_received: number
  vote_percentage: number
  election_year: number
  is_elected: boolean
}

interface ElectionComparisonChartProps {
  data: ElectionData[]
}

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#FFD100', '#EF4444']
const WINNER_STROKE = '#FFD100'

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Record<string, unknown>; name: string; value: number }> }) {
  if (!active || !payload?.length) return null

  const entry = payload[0]
  const raw = entry.payload

  return (
    <div className="bg-dark-700 text-white px-3 py-2 rounded-lg shadow-lg min-w-[160px]">
      <p className="font-heading font-semibold text-sm mb-1">
        {String(raw.candidate ?? raw.candidate_name ?? '')}
      </p>
      <p className="font-body text-xs text-dark-200">{String(raw.party ?? '')}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mt-1">
          <span className="font-body text-xs text-dark-200">{p.name}</span>
          <span className="font-mono text-xs font-semibold">{p.value.toFixed(1)}%</span>
        </div>
      ))}
      {raw.votes !== undefined && (
        <p className="font-mono text-xs text-dark-200 mt-1">
          {Number(raw.votes).toLocaleString('pt-BR')} votos
        </p>
      )}
    </div>
  )
}

function SingleYearChart({ data }: { data: ElectionData[] }) {
  const sorted = [...data].sort((a, b) => b.vote_percentage - a.vote_percentage)

  const chartData = sorted.map((d, i) => ({
    candidate: d.candidate_name,
    party: d.party,
    percentage: d.vote_percentage,
    votes: d.votes_received,
    is_elected: d.is_elected,
    colorIndex: i % COLORS.length,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, bottom: 0, left: 10 }}
      >
        <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" vertical={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#9A9A9A' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="candidate"
          tick={{ fontSize: 11, fill: '#9A9A9A' }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar
          dataKey="percentage"
          radius={[0, 4, 4, 0]}
          animationDuration={300}
          animationEasing="ease-in-out"
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.candidate}
              fill={COLORS[entry.colorIndex]}
              stroke={entry.is_elected ? WINNER_STROKE : 'transparent'}
              strokeWidth={entry.is_elected ? 2 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function MultiYearChart({ data }: { data: ElectionData[] }) {
  const years = Array.from(new Set(data.map((d) => d.election_year))).sort()
  const candidates = Array.from(new Set(data.map((d) => d.candidate_name)))

  const chartData = candidates.map((name) => {
    const row: Record<string, unknown> = { candidate: name }
    const entry = data.find((d) => d.candidate_name === name)
    row.party = entry?.party ?? ''

    years.forEach((year) => {
      const match = data.find((d) => d.candidate_name === name && d.election_year === year)
      row[String(year)] = match?.vote_percentage ?? 0
    })

    return row
  })

  chartData.sort((a, b) => {
    const lastYear = String(years[years.length - 1])
    return (b[lastYear] as number) - (a[lastYear] as number)
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 0, left: 10 }}>
        <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="candidate"
          tick={{ fontSize: 11, fill: '#9A9A9A' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9A9A9A' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        {years.map((year, i) => (
          <Bar
            key={year}
            dataKey={String(year)}
            name={String(year)}
            fill={COLORS[i % COLORS.length]}
            radius={[4, 4, 0, 0]}
            animationDuration={300}
            animationEasing="ease-in-out"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function ElectionComparisonChart({ data }: ElectionComparisonChartProps) {
  if (!data.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-10">
        Sem dados para exibir.
      </p>
    )
  }

  const years = Array.from(new Set(data.map((d) => d.election_year)))
  const isMultiYear = years.length > 1

  return isMultiYear ? <MultiYearChart data={data} /> : <SingleYearChart data={data} />
}

export type { ElectionData, ElectionComparisonChartProps }
