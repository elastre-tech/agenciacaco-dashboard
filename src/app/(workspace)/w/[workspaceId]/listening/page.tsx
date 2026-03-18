'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Ear,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ArrowRight,
  Twitter,
  Instagram,
  Facebook,
  Newspaper,
  BookOpen,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import { ModulePageSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import SentimentTrendChart from '@/components/charts/SentimentTrendChart'
import type { MentionSentiment } from '@/types/database'

interface Mention {
  id: string
  workspace_id: string
  term_id: string
  source: string
  content: string
  sentiment: MentionSentiment
  author: string
  url: string
  published_at: string
  created_at: string
}

interface EmergingTerm {
  id: string
  workspace_id: string
  term: string
  frequency: number
  growth_rate: number
  avg_sentiment?: number
  first_seen_at: string
  last_seen_at: string
  created_at: string
}

type TimeRange = '24h' | '7d' | '30d'

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '24h': '24h',
  '7d': '7 dias',
  '30d': '30 dias',
}

const SOURCE_ICONS: Record<string, typeof Twitter> = {
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  news: Newspaper,
  blog: BookOpen,
}

const SENTIMENT_STYLES: Record<MentionSentiment, string> = {
  positive: 'bg-success/10 text-success',
  negative: 'bg-danger/10 text-danger',
  neutral: 'bg-dark-50 text-dark-400',
}

const SENTIMENT_LABELS: Record<MentionSentiment, string> = {
  positive: 'Positivo',
  negative: 'Negativo',
  neutral: 'Neutro',
}

function getDateThreshold(range: TimeRange): string {
  const now = new Date()
  const days = range === '24h' ? 1 : range === '7d' ? 7 : 30
  now.setDate(now.getDate() - days)
  return now.toISOString()
}

function buildSentimentTrend(mentions: Mention[]) {
  const grouped = new Map<string, { positive: number; neutral: number; negative: number }>()

  for (const m of mentions) {
    const day = m.published_at.slice(0, 10)
    const entry = grouped.get(day) ?? { positive: 0, neutral: 0, negative: 0 }
    entry[m.sentiment] += 1
    grouped.set(day, entry)
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }))
}

function getTermSentimentColor(avgSentiment?: number): string {
  if (avgSentiment === undefined) return 'bg-dark-100 text-dark-500'
  if (avgSentiment > 0.2) return 'bg-success/10 text-success'
  if (avgSentiment < -0.2) return 'bg-danger/10 text-danger'
  return 'bg-dark-100 text-dark-500'
}

export default function ListeningPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [mentions, setMentions] = useState<Mention[]>([])
  const [emergingTerms, setEmergingTerms] = useState<EmergingTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<TimeRange>('7d')

  useEffect(() => {
    const supabase = createClient()
    const threshold = getDateThreshold(range)

    async function fetchData() {
      setLoading(true)
      try {
        const [mentionsRes, termsRes] = await Promise.all([
          supabase
            .from('mentions')
            .select('*')
            .eq('workspace_id', workspaceId)
            .gte('published_at', threshold)
            .order('published_at', { ascending: false }),
          supabase
            .from('emerging_terms')
            .select('*')
            .eq('workspace_id', workspaceId)
            .gte('last_seen_at', threshold)
            .order('frequency', { ascending: false }),
        ])

        setMentions(mentionsRes.data ?? [])
        setEmergingTerms(termsRes.data ?? [])
      } catch {
        console.error('Failed to fetch listening data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [workspaceId, range])

  if (loading) {
    return <ModulePageSkeleton kpis={4} charts={2} />
  }

  if (!mentions.length && !emergingTerms.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Nenhuma menção encontrada"
        description="Adicione termos de monitoramento para começar a rastrear menções."
        action={{ label: 'Gerenciar Termos', href: `/w/${workspaceId}/listening/terms` }}
      />
    )
  }

  const totalMentions = mentions.length
  const positiveCount = mentions.filter((m) => m.sentiment === 'positive').length
  const negativeCount = mentions.filter((m) => m.sentiment === 'negative').length
  const positivePct = totalMentions > 0 ? ((positiveCount / totalMentions) * 100).toFixed(1) : '0'
  const negativePct = totalMentions > 0 ? ((negativeCount / totalMentions) * 100).toFixed(1) : '0'
  const trendData = buildSentimentTrend(mentions)
  const recentMentions = mentions.slice(0, 10)

  const termSizes = emergingTerms.length > 0
    ? (() => {
        const maxFreq = Math.max(...emergingTerms.map((t) => t.frequency))
        const minFreq = Math.min(...emergingTerms.map((t) => t.frequency))
        const range = maxFreq - minFreq || 1
        return emergingTerms.map((t) => ({
          ...t,
          size: 0.75 + ((t.frequency - minFreq) / range) * 1.5,
        }))
      })()
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Social Listening
          </h2>
          <p className="font-body text-sm text-dark-300">
            Monitore menções, sentimento e termos emergentes em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-heading text-sm font-medium transition-colors duration-200',
                range === key
                  ? 'bg-primary text-dark-700'
                  : 'bg-dark-50 text-dark-400 hover:bg-dark-100'
              )}
            >
              {TIME_RANGE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total de Menções"
          value={String(totalMentions)}
          icon={Ear}
        />
        <KPICard
          label="Positivas"
          value={`${positivePct}%`}
          icon={ThumbsUp}
        />
        <KPICard
          label="Negativas"
          value={`${negativePct}%`}
          icon={ThumbsDown}
        />
        <KPICard
          label="Termos Emergentes"
          value={String(emergingTerms.length)}
          icon={Sparkles}
        />
      </div>

      <ChartCard
        title="Termos Emergentes"
        subtitle="Tamanho proporcional à frequência, cor indica sentimento médio"
      >
        {termSizes.length === 0 ? (
          <p className="font-body text-sm text-dark-300 text-center py-8">
            Nenhum termo emergente no período selecionado.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 py-2">
            {termSizes.map((t) => (
              <span
                key={t.id}
                className={cn(
                  'inline-flex items-center px-3 py-1.5 rounded-full font-heading font-medium transition-transform hover:scale-105 cursor-default',
                  getTermSentimentColor(t.avg_sentiment)
                )}
                style={{ fontSize: `${t.size}rem` }}
              >
                {t.term}
                <span className="ml-1.5 text-xs opacity-60">{t.frequency}</span>
              </span>
            ))}
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Tendência de Sentimento"
        subtitle="Menções positivas, neutras e negativas por dia"
      >
        {trendData.length === 0 ? (
          <p className="font-body text-sm text-dark-300 text-center py-8">
            Sem dados suficientes para o período.
          </p>
        ) : (
          <SentimentTrendChart data={trendData} />
        )}
      </ChartCard>

      <ChartCard
        title="Menções Recentes"
        subtitle="Últimas menções capturadas"
        action={
          <Link
            href={`/w/${workspaceId}/listening/terms`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-dark-700 font-heading font-semibold text-xs hover:bg-primary/90 transition-colors duration-200"
          >
            Gerenciar Termos
            <ArrowRight size={14} />
          </Link>
        }
      >
        {recentMentions.length === 0 ? (
          <p className="font-body text-sm text-dark-300 text-center py-8">
            Nenhuma menção encontrada no período.
          </p>
        ) : (
          <div className="max-h-[480px] overflow-y-auto -mx-5 px-5">
            <div className="space-y-3">
              {recentMentions.map((mention) => {
                const SourceIcon = SOURCE_ICONS[mention.source] ?? Newspaper
                return (
                  <div
                    key={mention.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-dark-50/50 hover:bg-primary-50 transition-colors duration-150"
                  >
                    <div className="p-2 rounded-lg bg-surface border border-border/50 shrink-0">
                      <SourceIcon size={16} className="text-dark-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-dark-700 line-clamp-2">
                        {mention.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-body text-xs text-dark-300">
                          {mention.author}
                        </span>
                        <span className="text-dark-200">·</span>
                        <span className="font-body text-xs text-dark-300">
                          {formatDistanceToNow(new Date(mention.published_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={cn(
                      'shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium font-body',
                      SENTIMENT_STYLES[mention.sentiment]
                    )}>
                      {SENTIMENT_LABELS[mention.sentiment]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  )
}
