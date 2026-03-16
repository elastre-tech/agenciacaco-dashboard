'use client'

import { Users, TrendingUp, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils/format'

interface CandidateCardProps {
  name: string
  mentions: number
  sentimentScore: number
  topPlatform: { name: string; engagement: number }
  totalFollowers: number
  isMainCandidate?: boolean
}

function sentimentColor(score: number) {
  if (score > 0.6) return 'bg-success'
  if (score > 0.4) return 'bg-warning'
  return 'bg-danger'
}

function sentimentLabel(score: number) {
  if (score > 0.6) return 'Positivo'
  if (score > 0.4) return 'Neutro'
  return 'Negativo'
}

function formatFollowers(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(value)
}

export default function CandidateCard({
  name,
  mentions,
  sentimentScore,
  topPlatform,
  totalFollowers,
  isMainCandidate,
}: CandidateCardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-card shadow-card border border-border/50 p-5',
        isMainCandidate && 'ring-2 ring-primary',
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center font-heading font-bold text-sm',
          isMainCandidate ? 'bg-primary text-dark-700' : 'bg-dark-50 text-dark-400',
        )}>
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-heading font-semibold text-dark-700 text-sm">{name}</h4>
          {isMainCandidate && (
            <span className="font-body text-[11px] text-primary-600 font-medium">
              Seu candidato
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-dark-300 flex items-center gap-1.5">
            <MessageCircle size={13} />
            Menções
          </span>
          <span className="font-mono text-sm font-semibold text-dark-700">
            {mentions.toLocaleString('pt-BR')}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-body text-xs text-dark-300">Sentimento</span>
            <span className={cn(
              'font-mono text-xs font-medium',
              sentimentScore > 0.6 ? 'text-success' : sentimentScore > 0.4 ? 'text-warning' : 'text-danger',
            )}>
              {(sentimentScore * 100).toFixed(0)}% {sentimentLabel(sentimentScore)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-dark-50 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', sentimentColor(sentimentScore))}
              style={{ width: `${sentimentScore * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-dark-300 flex items-center gap-1.5">
            <TrendingUp size={13} />
            {topPlatform.name}
          </span>
          <span className="font-mono text-sm font-semibold text-dark-700">
            {topPlatform.engagement.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-dark-300 flex items-center gap-1.5">
            <Users size={13} />
            Seguidores
          </span>
          <span className="font-mono text-sm font-semibold text-dark-700">
            {formatFollowers(totalFollowers)}
          </span>
        </div>
      </div>
    </div>
  )
}
