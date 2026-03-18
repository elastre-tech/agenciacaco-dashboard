'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  MapPin,
  QrCode,
  CalendarDays,
  Activity,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import { ModulePageSkeleton } from '@/components/ui/Skeleton'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import DensityGrid from '@/components/charts/DensityGrid'
import type { TerritorialInteraction, QRCode } from '@/types/database'

const TerritoryMap = dynamic(
  () => import('@/components/workspace/TerritoryMap'),
  { ssr: false, loading: () => <MapPlaceholder /> },
)

function MapPlaceholder() {
  return (
    <div className="flex items-center justify-center h-[400px] bg-dark-50 rounded-lg">
      <Loader2 size={24} className="animate-spin text-dark-300" />
    </div>
  )
}

const INTERACTION_TYPES = ['visit', 'event', 'canvassing', 'meeting'] as const
const INTERACTION_LABELS: Record<string, string> = {
  visit: 'Visita',
  event: 'Evento',
  canvassing: 'Porta a porta',
  meeting: 'Reunião',
}

const INTERACTION_COLORS: Record<string, string> = {
  visit: 'bg-blue-500',
  event: 'bg-[#FFD100]',
  canvassing: 'bg-green-500',
  meeting: 'bg-purple-500',
}

function classifyTimeSlot(dateStr: string): string {
  const hour = new Date(dateStr).getHours()
  if (hour >= 6 && hour < 12) return 'Manhã'
  if (hour >= 12 && hour < 18) return 'Tarde'
  return 'Noite'
}

export default function TerritoryPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string

  const [interactions, setInteractions] = useState<TerritorialInteraction[]>([])
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    new Set(INTERACTION_TYPES),
  )

  const toggleType = useCallback((type: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      try {
        const [interactionsRes, qrRes] = await Promise.all([
          supabase
            .from('territorial_interactions')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('recorded_at', { ascending: false }),
          supabase
            .from('qr_codes')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('scans_count', { ascending: false })
            .limit(5),
        ])

        setInteractions(interactionsRes.data ?? [])
        setQrCodes(qrRes.data ?? [])
      } catch {
        console.error('Failed to fetch territory data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [workspaceId])

  const filtered = useMemo(() => {
    return interactions.filter((i) => {
      if (!activeTypes.has(i.interaction_type)) return false
      if (dateFrom && i.recorded_at < dateFrom) return false
      if (dateTo && i.recorded_at > `${dateTo}T23:59:59`) return false
      return true
    })
  }, [interactions, activeTypes, dateFrom, dateTo])

  const densityData = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of filtered) {
      const slot = classifyTimeSlot(i.recorded_at)
      const key = `${i.neighborhood}::${slot}`
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([key, count]) => {
      const [neighborhood, time_slot] = key.split('::')
      return { neighborhood, time_slot, count }
    })
  }, [filtered])

  const neighborhoodCount = useMemo(
    () => new Set(filtered.map((i) => i.neighborhood)).size,
    [filtered],
  )

  if (loading) {
    return <ModulePageSkeleton kpis={4} charts={2} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          Análise Territorial
        </h2>
        <p className="font-body text-sm text-dark-300">
          Mapeamento de interações e cobertura territorial da campanha.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total de Interações"
          value={String(filtered.length)}
          icon={Activity}
        />
        <KPICard
          label="Bairros Cobertos"
          value={String(neighborhoodCount)}
          icon={MapPin}
        />
        <KPICard
          label="Dias com Atividade"
          value={String(new Set(filtered.map((i) => i.recorded_at.slice(0, 10))).size)}
          icon={CalendarDays}
        />
        <KPICard
          label="QR Codes Ativos"
          value={String(qrCodes.length)}
          icon={QrCode}
        />
      </div>

      <FiltersBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        activeTypes={activeTypes}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onToggleType={toggleType}
      />

      <ChartCard title="Mapa Territorial" subtitle="Florianópolis">
        <TerritoryMap interactions={filtered} />
      </ChartCard>

      <ChartCard
        title="Densidade por Período"
        subtitle="Interações por bairro e faixa horária"
      >
        <DensityGrid data={densityData} />
      </ChartCard>

      <ChartCard
        title="Top QR Codes"
        subtitle="Por número de leituras"
        action={
          <Link
            href={`/w/${workspaceId}/territory/qr-codes`}
            className="inline-flex items-center gap-1 text-xs font-body text-primary hover:underline"
          >
            Ver todos <ArrowRight size={12} />
          </Link>
        }
      >
        <QrSummaryTable qrCodes={qrCodes} />
      </ChartCard>
    </div>
  )
}

function FiltersBar({
  dateFrom,
  dateTo,
  activeTypes,
  onDateFromChange,
  onDateToChange,
  onToggleType,
}: {
  dateFrom: string
  dateTo: string
  activeTypes: Set<string>
  onDateFromChange: (v: string) => void
  onDateToChange: (v: string) => void
  onToggleType: (type: string) => void
}) {
  return (
    <div className="bg-surface rounded-card shadow-card border border-border/50 p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="font-body text-xs text-dark-400">De</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="font-mono text-xs border border-border rounded-md px-2 py-1.5 bg-background text-dark-700 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="font-body text-xs text-dark-400">Até</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="font-mono text-xs border border-border rounded-md px-2 py-1.5 bg-background text-dark-700 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="h-5 w-px bg-border/50 hidden sm:block" />
      <div className="flex flex-wrap items-center gap-3">
        {INTERACTION_TYPES.map((type) => (
          <label
            key={type}
            className="inline-flex items-center gap-1.5 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={activeTypes.has(type)}
              onChange={() => onToggleType(type)}
              className="sr-only peer"
            />
            <span
              className={cn(
                'w-3 h-3 rounded-sm border border-border/50 transition-colors',
                activeTypes.has(type)
                  ? INTERACTION_COLORS[type]
                  : 'bg-dark-50',
              )}
            />
            <span className="font-body text-xs text-dark-500">
              {INTERACTION_LABELS[type]}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function QrSummaryTable({ qrCodes }: { qrCodes: QRCode[] }) {
  if (!qrCodes.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-6">
        Nenhum QR code cadastrado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border/50">
            <th className="font-heading text-xs font-semibold text-dark-400 pb-2">
              Label
            </th>
            <th className="font-heading text-xs font-semibold text-dark-400 pb-2">
              Local
            </th>
            <th className="font-heading text-xs font-semibold text-dark-400 pb-2 text-right">
              Leituras
            </th>
          </tr>
        </thead>
        <tbody>
          {qrCodes.map((qr) => (
            <tr key={qr.id} className="border-b border-border/30 last:border-0">
              <td className="font-body text-sm text-dark-700 py-2">{qr.label}</td>
              <td className="font-body text-sm text-dark-400 py-2">
                {qr.location ?? '—'}
              </td>
              <td className="font-mono text-sm text-dark-700 py-2 text-right">
                {qr.scans_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
