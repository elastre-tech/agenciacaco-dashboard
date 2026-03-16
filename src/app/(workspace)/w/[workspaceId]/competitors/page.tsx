'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Megaphone, Globe, MessageCircle, ThumbsUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import ShareOfVoiceChart from '@/components/charts/ShareOfVoiceChart'
import CandidateCard from '@/components/workspace/CandidateCard'

interface ShareOfVoice {
  id: string
  workspace_id: string
  candidate_name: string
  mentions_count: number
  sentiment_score: number
  period_start: string
  period_end: string
  created_at: string
}

interface DigitalDominance {
  id: string
  workspace_id: string
  candidate_name: string
  platform: string
  followers: number
  engagement_rate: number
  posts_count: number
  measured_at: string
  created_at: string
}

const MAIN_CANDIDATE = 'Roberto Menezes'

function computeKPIs(sov: ShareOfVoice[], dominance: DigitalDominance[]) {
  const latestPeriod = sov.reduce((latest, s) =>
    s.period_start > latest ? s.period_start : latest, '',
  )
  const latestEntries = sov.filter((s) => s.period_start === latestPeriod)
  const totalMentions = latestEntries.reduce((sum, s) => sum + s.mentions_count, 0)

  const mainEntry = latestEntries.find((s) => s.candidate_name === MAIN_CANDIDATE)
  const shareOfVoice = totalMentions > 0 && mainEntry
    ? (mainEntry.mentions_count / totalMentions) * 100
    : 0

  const mainDominance = dominance.filter((d) => d.candidate_name === MAIN_CANDIDATE)
  const leadingPlatform = mainDominance.length
    ? mainDominance.reduce((best, d) => d.engagement_rate > best.engagement_rate ? d : best)
    : null

  const competitorMentions = latestEntries
    .filter((s) => s.candidate_name !== MAIN_CANDIDATE)
    .reduce((sum, s) => sum + s.mentions_count, 0)

  const sentimentScore = mainEntry?.sentiment_score ?? 0

  return {
    shareOfVoice,
    leadingPlatform: leadingPlatform?.platform ?? '-',
    competitorMentions,
    sentimentScore,
  }
}

function buildCandidateData(sov: ShareOfVoice[], dominance: DigitalDominance[]) {
  const latestPeriod = sov.reduce((latest, s) =>
    s.period_start > latest ? s.period_start : latest, '',
  )
  const latestEntries = sov.filter((s) => s.period_start === latestPeriod)
  const candidates = Array.from(new Set(sov.map((s) => s.candidate_name)))

  return candidates.map((name) => {
    const entry = latestEntries.find((s) => s.candidate_name === name)
    const platforms = dominance.filter((d) => d.candidate_name === name)
    const topPlatform = platforms.length
      ? platforms.reduce((best, d) => d.engagement_rate > best.engagement_rate ? d : best)
      : null
    const totalFollowers = platforms.reduce((sum, d) => sum + d.followers, 0)

    return {
      name,
      mentions: entry?.mentions_count ?? 0,
      sentimentScore: entry?.sentiment_score ?? 0,
      topPlatform: {
        name: topPlatform?.platform ?? '-',
        engagement: topPlatform?.engagement_rate ?? 0,
      },
      totalFollowers,
      isMainCandidate: name === MAIN_CANDIDATE,
    }
  }).sort((a, b) => (a.isMainCandidate ? -1 : b.isMainCandidate ? 1 : b.mentions - a.mentions))
}

function buildDominanceTable(dominance: DigitalDominance[]) {
  const platforms = Array.from(new Set(dominance.map((d) => d.platform)))
  const candidates = Array.from(new Set(dominance.map((d) => d.candidate_name)))

  const leaders: Record<string, string> = {}
  platforms.forEach((platform) => {
    const entries = dominance.filter((d) => d.platform === platform)
    if (entries.length) {
      const leader = entries.reduce((best, d) =>
        d.engagement_rate > best.engagement_rate ? d : best,
      )
      leaders[platform] = leader.candidate_name
    }
  })

  return { platforms, candidates, leaders }
}

export default function CompetitorsPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [sov, setSov] = useState<ShareOfVoice[]>([])
  const [dominance, setDominance] = useState<DigitalDominance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      try {
        const [sovRes, domRes] = await Promise.all([
          supabase
            .from('share_of_voice')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('period_start', { ascending: true }),
          supabase
            .from('digital_dominance')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('measured_at', { ascending: false }),
        ])

        setSov(sovRes.data ?? [])
        setDominance(domRes.data ?? [])
      } catch {
        console.error('Failed to fetch competitive intelligence data')
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

  if (!sov.length && !dominance.length) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <p className="font-body text-sm text-dark-300 text-center py-20">
          Nenhum dado competitivo disponível.
        </p>
      </div>
    )
  }

  const kpis = computeKPIs(sov, dominance)
  const candidateCards = buildCandidateData(sov, dominance)
  const table = buildDominanceTable(dominance)

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Seu Share of Voice"
          value={`${kpis.shareOfVoice.toFixed(1)}%`}
          icon={Megaphone}
        />
        <KPICard
          label="Plataforma Líder"
          value={kpis.leadingPlatform}
          icon={Globe}
        />
        <KPICard
          label="Menções Concorrentes"
          value={kpis.competitorMentions.toLocaleString('pt-BR')}
          icon={MessageCircle}
        />
        <KPICard
          label="Seu Sentimento"
          value={`${(kpis.sentimentScore * 100).toFixed(0)}%`}
          icon={ThumbsUp}
        />
      </div>

      <ChartCard
        title="Share of Voice"
        subtitle="Participação nas menções totais por semana"
      >
        <ShareOfVoiceChart data={sov} />
      </ChartCard>

      <div>
        <h3 className="font-heading font-semibold text-dark-700 text-sm mb-3">
          Comparativo de Candidatos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {candidateCards.map((c) => (
            <CandidateCard key={c.name} {...c} />
          ))}
        </div>
      </div>

      <ChartCard
        title="Dominância Digital"
        subtitle="Desempenho por plataforma de cada candidato"
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-dark-50">
                <th className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3">
                  Candidato
                </th>
                {table.platforms.map((platform) => (
                  <th
                    key={platform}
                    className="text-left text-xs uppercase text-dark-300 font-heading px-4 py-3"
                    colSpan={3}
                  >
                    {platform}
                  </th>
                ))}
              </tr>
              <tr className="bg-dark-50 border-t border-border/30">
                <th className="px-4 py-2" />
                {table.platforms.map((platform) => (
                  <SubHeaders key={platform} />
                ))}
              </tr>
            </thead>
            <tbody>
              {table.candidates.map((candidate, idx) => (
                <tr
                  key={candidate}
                  className={cn(
                    'border-t border-border/50 transition-colors hover:bg-primary-50',
                    idx % 2 === 1 && 'bg-dark-50/30',
                  )}
                >
                  <td className="px-4 py-3 font-body text-sm text-dark-700 font-medium">
                    {candidate}
                  </td>
                  {table.platforms.map((platform) => {
                    const entry = dominance.find(
                      (d) => d.candidate_name === candidate && d.platform === platform,
                    )
                    const isLeader = table.leaders[platform] === candidate
                    return (
                      <DominanceCells
                        key={`${candidate}-${platform}`}
                        followers={entry?.followers ?? 0}
                        engagementRate={entry?.engagement_rate ?? 0}
                        postsCount={entry?.posts_count ?? 0}
                        isLeader={isLeader}
                      />
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
        Inteligência Competitiva
      </h2>
      <p className="font-body text-sm text-dark-300">
        Monitore concorrentes, share of voice e dominância digital.
      </p>
    </div>
  )
}

function SubHeaders() {
  return (
    <>
      <th className="text-left text-[10px] uppercase text-dark-300 font-body px-4 py-2">
        Seguidores
      </th>
      <th className="text-left text-[10px] uppercase text-dark-300 font-body px-4 py-2">
        Eng. Rate
      </th>
      <th className="text-left text-[10px] uppercase text-dark-300 font-body px-4 py-2">
        Posts
      </th>
    </>
  )
}

function DominanceCells({
  followers,
  engagementRate,
  postsCount,
  isLeader,
}: {
  followers: number
  engagementRate: number
  postsCount: number
  isLeader: boolean
}) {
  const cellClass = cn(
    'px-4 py-3 font-mono text-xs',
    isLeader ? 'bg-primary/10 text-dark-700 font-semibold' : 'text-dark-400',
  )

  return (
    <>
      <td className={cellClass}>
        {followers >= 1000 ? `${(followers / 1000).toFixed(1)}k` : followers}
      </td>
      <td className={cellClass}>{engagementRate.toFixed(1)}%</td>
      <td className={cellClass}>{postsCount}</td>
    </>
  )
}
