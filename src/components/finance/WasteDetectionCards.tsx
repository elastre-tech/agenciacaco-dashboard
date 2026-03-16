'use client'

import { AlertTriangle, CheckCircle2, Megaphone, Globe, MessageCircle, MapPin, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils/format'
import type { WasteDetection } from '@/types/database'

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  whatsapp: 'WhatsApp',
  field_operations: 'Campo',
  events: 'Eventos',
}

const CHANNEL_ICONS: Record<string, typeof Megaphone> = {
  meta_ads: Megaphone,
  google_ads: Globe,
  whatsapp: MessageCircle,
  field_operations: MapPin,
  events: CalendarDays,
}

interface WasteDetectionCardsProps {
  detections: WasteDetection[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function WasteDetectionCards({ detections }: WasteDetectionCardsProps) {
  if (!detections.length) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-8">
        Nenhum desperdício detectado.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {detections.map((d) => {
        const Icon = CHANNEL_ICONS[d.channel] ?? AlertTriangle
        return (
          <div
            key={d.id}
            className={cn(
              'bg-surface rounded-card shadow-card border border-border/50 p-5',
              d.resolved && 'opacity-60'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-danger/10">
                  <Icon size={16} className="text-danger" />
                </div>
                <span className="font-heading text-sm font-semibold text-dark-700">
                  {CHANNEL_LABELS[d.channel] ?? d.channel}
                </span>
              </div>
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-body',
                d.resolved
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
              )}>
                {d.resolved ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {d.resolved ? 'Resolvido' : 'Pendente'}
              </span>
            </div>

            <p className="font-mono font-bold text-2xl text-danger mb-2">
              R$ {Number(d.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>

            <p className="font-body text-sm text-dark-400 mb-3 line-clamp-2">
              {d.reason}
            </p>

            <p className="font-body text-xs text-dark-300">
              Detectado em {formatDate(d.detected_at)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
