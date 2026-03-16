'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Trophy, Vote, MapPin, BarChart3, Map, Loader2, ArrowUpDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import ChartCard from '@/components/ui/ChartCard'
import KPICard from '@/components/ui/KPICard'
import ElectionComparisonChart from '@/components/charts/ElectionComparisonChart'
import type { ElectionData } from '@/components/charts/ElectionComparisonChart'

interface ElectionHistory {
  id: string
  workspace_id: string
  election_year: number
  election_type: string
  city: string
  state: string
  candidate_name: string
  party: string
  votes_received: number
  total_votes: number
  vote_percentage: number
  zone: string
  section: string
  neighborhood: string
  is_elected: boolean
  created_at: string
}

type SortField = 'candidate_name' | 'party' | 'zone' | 'section' | 'votes_received' | 'vote_percentage'
type SortDir = 'asc' | 'desc'

function isConsolidated(row: ElectionHistory) {
  const s = row.section?.toLowerCase() ?? ''
  const z = row.zone?.toLowerCase() ?? ''
  return s === 'consolidado' || z === 'consolidado' || (s === '' && z === '')
}

function ResultBadge({ elected }: { elected: boolean }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded text-xs font-medium',
      elected ? 'bg-success/10 text-success' : 'bg-dark-50 text-dark-300'
    )}>
      {elected ? 'Eleito' : 'Não Eleito'}
    </span>
  )
}

interface ElectionSummary {
  year: number
  type: string
  city: string
  candidate: string
  party: string
  votes: number
  percentage: number
  elected: boolean
}

function buildSummaries(rows: ElectionHistory[]): ElectionSummary[] {
  const consolidated = rows.filter(isConsolidated)
  const grouped: Record<number, ElectionHistory[]> = {}

  consolidated.forEach((r) => {
    if (!grouped[r.election_year]) grouped[r.election_year] = []
    grouped[r.election_year].push(r)
  })

  const summaries: ElectionSummary[] = []

  Object.entries(grouped).forEach(([yearStr, candidates]) => {
    const year = Number(yearStr)
    const winner = candidates.reduce((best, c) =>
      c.votes_received > best.votes_received ? c : best
    , candidates[0])

    summaries.push({
      year,
      type: winner.election_type,
      city: winner.city,
      candidate: winner.candidate_name,
      party: winner.party,
      votes: winner.votes_received,
      percentage: winner.vote_percentage,
      elected: winner.is_elected,
    })
  })

  return summaries.sort((a, b) => b.year - a.year)
}

function buildChartData(rows: ElectionHistory[]): ElectionData[] {
  return rows.filter(isConsolidated).map((r) => ({
    candidate_name: r.candidate_name,
    party: r.party,
    votes_received: r.votes_received,
    vote_percentage: r.vote_percentage,
    election_year: r.election_year,
    is_elected: r.is_elected,
  }))
}

function SummaryCards({ summaries }: { summaries: ElectionSummary[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {summaries.map((s) => (
        <div
          key={`${s.year}-${s.candidate}`}
          className="bg-surface rounded-card shadow-card border border-border/50 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono font-bold text-lg text-dark-700">{s.year}</span>
            <ResultBadge elected={s.elected} />
          </div>
          <p className="font-heading font-semibold text-dark-700 text-sm mb-0.5">{s.candidate}</p>
          <p className="font-body text-xs text-dark-300 mb-3">{s.party}</p>
          <div className="flex items-center gap-3 text-xs font-body text-dark-400 mb-2">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {s.city}
            </span>
            <span className="flex items-center gap-1">
              <Vote size={12} />
              {s.type}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono font-bold text-2xl text-dark-700">
                {s.votes.toLocaleString('pt-BR')}
              </p>
              <p className="font-body text-xs text-dark-300">votos</p>
            </div>
            <span className="font-mono font-semibold text-lg text-info">
              {s.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ZoneResultsTable({ rows }: { rows: ElectionHistory[] }) {
  const [sortField, setSortField] = useState<SortField>('votes_received')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const zoneRows = useMemo(
    () => rows.filter((r) => !isConsolidated(r)),
    [rows]
  )

  const sorted = useMemo(() => {
    return [...zoneRows].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [zoneRows, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const columns: { key: SortField; label: string }[] = [
    { key: 'candidate_name', label: 'Candidato' },
    { key: 'party', label: 'Partido' },
    { key: 'zone', label: 'Zona' },
    { key: 'section', label: 'Seção' },
    { key: 'votes_received', label: 'Votos' },
    { key: 'vote_percentage', label: '% Votos' },
  ]

  if (!sorted.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-8">
        Sem dados de zonas disponíveis.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-dark-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-xs font-medium uppercase text-dark-300 cursor-pointer select-none"
                onClick={() => toggleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <ArrowUpDown
                    size={12}
                    className={cn(
                      'transition-colors',
                      sortField === col.key ? 'text-dark-700' : 'text-dark-200'
                    )}
                  />
                </span>
              </th>
            ))}
            <th className="px-4 py-3 text-xs font-medium uppercase text-dark-300">Eleito</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.id}
              className={cn(
                'border-b border-border/30 transition-colors hover:bg-primary-50',
                i % 2 === 0 ? 'bg-white' : 'bg-dark-50'
              )}
            >
              <td className="px-4 py-3 font-body text-sm text-dark-700 font-medium">{row.candidate_name}</td>
              <td className="px-4 py-3 font-body text-sm text-dark-400">{row.party}</td>
              <td className="px-4 py-3 font-mono text-sm text-dark-400">{row.zone}</td>
              <td className="px-4 py-3 font-mono text-sm text-dark-400">{row.section}</td>
              <td className="px-4 py-3 font-mono text-sm text-dark-700 font-semibold">
                {row.votes_received.toLocaleString('pt-BR')}
              </td>
              <td className="px-4 py-3 font-mono text-sm text-info font-semibold">
                {row.vote_percentage.toFixed(1)}%
              </td>
              <td className="px-4 py-3">
                <ResultBadge elected={row.is_elected} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function HistoryPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [data, setData] = useState<ElectionHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchHistory() {
      try {
        const { data: rows } = await supabase
          .from('election_history')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('election_year', { ascending: false })

        setData(rows ?? [])
      } catch {
        console.error('Failed to fetch election history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [workspaceId])

  const summaries = useMemo(() => buildSummaries(data), [data])
  const chartData = useMemo(() => buildChartData(data), [data])

  const totalVotes = useMemo(() => {
    const consolidated = data.filter(isConsolidated)
    return consolidated.reduce((sum, r) => sum + r.votes_received, 0)
  }, [data])

  const years = useMemo(
    () => Array.from(new Set(data.map((d) => d.election_year))),
    [data]
  )

  const totalCandidates = useMemo(
    () => Array.from(new Set(data.map((d) => d.candidate_name))).length,
    [data]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-dark-300" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-20">
        Nenhum dado de histórico eleitoral encontrado.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          Histórico Eleitoral
        </h2>
        <p className="font-body text-sm text-dark-300">
          Desempenho em eleições anteriores com detalhamento por zona e seção.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Eleições Registradas"
          value={String(years.length)}
          icon={Vote}
        />
        <KPICard
          label="Total de Votos"
          value={totalVotes.toLocaleString('pt-BR')}
          icon={BarChart3}
        />
        <KPICard
          label="Candidatos"
          value={String(totalCandidates)}
          icon={Trophy}
        />
        <KPICard
          label="Cidades"
          value={String(Array.from(new Set(data.map((d) => d.city))).length)}
          icon={MapPin}
        />
      </div>

      <SummaryCards summaries={summaries} />

      <ChartCard
        title="Resultados por Zona"
        subtitle="Detalhamento de votos por zona e seção eleitoral"
      >
        <ZoneResultsTable rows={data} />
      </ChartCard>

      <ChartCard
        title="Comparativo entre Ciclos"
        subtitle={years.length > 1
          ? `Percentual de votos por candidato em ${years.length} eleições`
          : 'Distribuição de votos por candidato'
        }
      >
        <ElectionComparisonChart data={chartData} />
      </ChartCard>

      <ChartCard
        title="Mapa de Calor por Região"
        subtitle="Distribuição geográfica de votos"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 rounded-full bg-dark-50 mb-3">
            <Map size={24} className="text-dark-300" />
          </div>
          <p className="font-body text-sm text-dark-400 max-w-sm">
            Mapa de calor por região disponível com dados georreferenciados
          </p>
        </div>
      </ChartCard>
    </div>
  )
}
