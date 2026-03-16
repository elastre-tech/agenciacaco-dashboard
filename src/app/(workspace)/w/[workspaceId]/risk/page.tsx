'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldAlert,
  Activity,
  ThermometerSun,
  MessageSquare,
  Bell,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import AlertBadge from '@/components/ui/AlertBadge'
import ReputationThermometer from '@/components/workspace/ReputationThermometer'
import { cn } from '@/lib/utils/format'
import type { AlertSeverity } from '@/types/database'

interface CrisisEvent {
  id: string
  workspace_id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'monitoring' | 'escalated' | 'contained' | 'resolved'
  source: string
  impact_score: number
  started_at: string
  resolved_at: string | null
  created_at: string
}

interface MentionSentimentCount {
  sentiment: string
  count: number
}

const statusStyles: Record<CrisisEvent['status'], string> = {
  monitoring: 'bg-warning/10 text-warning',
  escalated: 'bg-danger/10 text-danger',
  contained: 'bg-info/10 text-info',
  resolved: 'bg-success/10 text-success',
}

const statusLabels: Record<CrisisEvent['status'], string> = {
  monitoring: 'Monitorando',
  escalated: 'Escalado',
  contained: 'Contido',
  resolved: 'Resolvido',
}

function computeReputationScore(sentiments: MentionSentimentCount[]) {
  const pos = sentiments.find((s) => s.sentiment === 'positive')?.count ?? 0
  const neu = sentiments.find((s) => s.sentiment === 'neutral')?.count ?? 0
  const neg = sentiments.find((s) => s.sentiment === 'negative')?.count ?? 0
  const total = pos + neu + neg
  const score = total > 0 ? Math.round(((pos - neg) / total) * 100) : 0
  return { score, breakdown: { positive: pos, neutral: neu, negative: neg }, total }
}

export default function RiskRadarPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [crises, setCrises] = useState<CrisisEvent[]>([])
  const [sentiments, setSentiments] = useState<MentionSentimentCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      try {
        const [crisesRes, sentimentRes] = await Promise.all([
          supabase
            .from('crisis_events')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('started_at', { ascending: false }),
          supabase
            .rpc('get_mention_sentiment_counts', { p_workspace_id: workspaceId }),
        ])

        setCrises(crisesRes.data ?? [])
        setSentiments(sentimentRes.data ?? [])
      } catch {
        console.error('Failed to fetch risk data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [workspaceId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-dark-300" />
      </div>
    )
  }

  const reputation = computeReputationScore(sentiments)
  const activeCrises = crises.filter((c) => c.status !== 'resolved')
  const avgImpact = crises.length > 0
    ? Math.round(crises.reduce((sum, c) => sum + c.impact_score, 0) / crises.length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Radar de Risco e Crise
          </h2>
          <p className="font-body text-sm text-dark-300">
            Monitore crises, sentimento e reputação em tempo real.
          </p>
        </div>
        <Link
          href={`/w/${workspaceId}/risk/alerts`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-dark-700 font-body text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Bell size={14} />
          Configurar Alertas
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Crises Ativas"
          value={String(activeCrises.length)}
          icon={ShieldAlert}
          className={activeCrises.length > 0 ? 'ring-1 ring-danger/30' : undefined}
        />
        <KPICard
          label="Impacto Médio"
          value={String(avgImpact)}
          icon={Activity}
        />
        <KPICard
          label="Score de Reputação"
          value={reputation.score > 0 ? `+${reputation.score}` : String(reputation.score)}
          icon={ThermometerSun}
        />
        <KPICard
          label="Menções Monitoradas"
          value={reputation.total.toLocaleString('pt-BR')}
          icon={MessageSquare}
        />
      </div>

      <ChartCard title="Termômetro de Reputação" subtitle="Baseado no sentimento das menções">
        <ReputationThermometer score={reputation.score} breakdown={reputation.breakdown} />
      </ChartCard>

      <ChartCard title="Linha do Tempo de Crises" subtitle={`${crises.length} eventos registrados`}>
        {crises.length === 0 ? (
          <p className="font-body text-sm text-dark-300 text-center py-8">
            Nenhum evento de crise registrado.
          </p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {crises.map((crisis) => (
                <CrisisTimelineCard key={crisis.id} crisis={crisis} />
              ))}
            </div>
          </div>
        )}
      </ChartCard>

      {activeCrises.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading text-sm font-semibold text-dark-700">
            Crises Ativas em Detalhe
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeCrises.map((crisis) => (
              <ActiveCrisisCard key={crisis.id} crisis={crisis} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CrisisTimelineCard({ crisis }: { crisis: CrisisEvent }) {
  return (
    <div className="relative">
      <div className="absolute -left-[18px] top-3 w-3 h-3 rounded-full border-2 border-surface bg-dark-300" />
      <div className="bg-surface rounded-card shadow-card border border-border/50 p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-heading text-sm font-semibold text-dark-700">{crisis.title}</h4>
          <div className="flex items-center gap-2 shrink-0">
            <AlertBadge severity={crisis.severity as AlertSeverity} />
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-body',
              statusStyles[crisis.status]
            )}>
              {statusLabels[crisis.status]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 font-body text-xs text-dark-300">
          <span>Fonte: {crisis.source}</span>
          <span>Impacto: {crisis.impact_score}</span>
          <span>
            {formatDistanceToNow(new Date(crisis.started_at), { addSuffix: true, locale: ptBR })}
          </span>
          {crisis.resolved_at && (
            <span className="text-success">
              Resolvido em {format(new Date(crisis.resolved_at), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ActiveCrisisCard({ crisis }: { crisis: CrisisEvent }) {
  const impactPercent = Math.min(100, Math.max(0, crisis.impact_score))

  return (
    <div className="bg-surface rounded-card shadow-card border border-border/50 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-heading text-sm font-semibold text-dark-700">{crisis.title}</h4>
        <div className="flex items-center gap-2 shrink-0">
          <AlertBadge severity={crisis.severity as AlertSeverity} />
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-body',
            statusStyles[crisis.status]
          )}>
            {statusLabels[crisis.status]}
          </span>
        </div>
      </div>
      <p className="font-body text-xs text-dark-400 leading-relaxed">{crisis.description}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-dark-300">Impacto</span>
          <span className="font-mono text-xs font-medium text-dark-700">{crisis.impact_score}</span>
        </div>
        <div className="h-2 rounded-full bg-dark-50 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              impactPercent >= 75 ? 'bg-danger' : impactPercent >= 50 ? 'bg-warning' : 'bg-info'
            )}
            style={{ width: `${impactPercent}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 font-body text-xs text-dark-300">
        <span>Fonte: {crisis.source}</span>
        <span>
          Iniciado {formatDistanceToNow(new Date(crisis.started_at), { addSuffix: true, locale: ptBR })}
        </span>
      </div>
    </div>
  )
}
