'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import type { ChannelBudget } from '@/types/database'

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  whatsapp: 'WhatsApp',
  field_operations: 'Campo',
  events: 'Eventos',
}

const CHANNEL_COLORS: Record<string, string> = {
  meta_ads: '#3B82F6',
  google_ads: '#22C55E',
  whatsapp: '#F59E0B',
  field_operations: '#8B5CF6',
  events: '#EF4444',
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface SimulatedImpact {
  channel: string
  cplChange: number
  reachChange: number
}

function computeImpacts(
  original: Record<string, number>,
  proposed: Record<string, number>,
): SimulatedImpact[] {
  return Object.keys(original).map((channel) => {
    const orig = original[channel] || 1
    const prop = proposed[channel] || 0
    const ratio = prop / orig
    const cplChange = ratio > 0 ? ((1 / ratio) - 1) * 100 : 0
    const reachChange = (ratio - 1) * 100
    return { channel, cplChange, reachChange }
  })
}

export default function SimulatorPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [budgets, setBudgets] = useState<ChannelBudget[]>([])
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [originalAllocations, setOriginalAllocations] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchBudgets() {
      try {
        const { data } = await supabase
          .from('channel_budgets')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('channel', { ascending: true })

        const items = data ?? []
        setBudgets(items)

        const initial: Record<string, number> = {}
        items.forEach((b) => { initial[b.channel] = Number(b.allocated) })
        setAllocations(initial)
        setOriginalAllocations(initial)
      } catch {
        console.error('Failed to fetch channel budgets')
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [workspaceId])

  const totalBudget = budgets.reduce((s, b) => s + Number(b.allocated), 0)
  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0)
  const diff = totalAllocated - totalBudget
  const isOverBudget = diff > 1
  const isUnderBudget = diff < -1

  const handleSliderChange = useCallback((channel: string, value: number) => {
    setAllocations((prev) => ({ ...prev, [channel]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setAllocations({ ...originalAllocations })
  }, [originalAllocations])

  const impacts = computeImpacts(originalAllocations, allocations)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-dark-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/w/${workspaceId}/finance`}
          className="p-2 rounded-lg hover:bg-dark-50 transition-colors duration-200"
        >
          <ArrowLeft size={18} className="text-dark-400" />
        </Link>
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Simulador de Realocação de Orçamento
          </h2>
          <p className="font-body text-sm text-dark-300">
            Ajuste a distribuição entre canais e veja o impacto estimado.
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border/50 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-semibold text-dark-700 text-sm">
              Alocação por Canal
            </h3>
            <p className="font-body text-xs text-dark-300 mt-0.5">
              Arraste os controles para redistribuir o orçamento
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 font-body text-xs text-dark-400 hover:bg-dark-50 transition-colors duration-200"
          >
            <RotateCcw size={14} />
            Restaurar
          </button>
        </div>

        <div className="space-y-5">
          {budgets.map((b) => {
            const value = allocations[b.channel] ?? 0
            const color = CHANNEL_COLORS[b.channel] ?? '#9A9A9A'

            return (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-heading text-sm font-medium text-dark-700">
                      {CHANNEL_LABELS[b.channel] ?? b.channel}
                    </span>
                  </div>
                  <span className="font-mono text-sm text-dark-700">
                    {formatCurrency(value)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={totalBudget}
                  step={100}
                  value={value}
                  onChange={(e) => handleSliderChange(b.channel, Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-dark-50"
                  style={{
                    accentColor: color,
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="font-body text-xs text-dark-300">
                    Atual: {formatCurrency(Number(b.allocated))}
                  </span>
                  <span className={cn(
                    'font-mono text-xs',
                    value > Number(b.allocated) ? 'text-success' : value < Number(b.allocated) ? 'text-danger' : 'text-dark-300'
                  )}>
                    {value >= Number(b.allocated) ? '+' : ''}
                    {formatCurrency(value - Number(b.allocated))}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={cn(
        'bg-surface rounded-card shadow-card border p-5',
        isOverBudget ? 'border-danger/50' : isUnderBudget ? 'border-warning/50' : 'border-border/50'
      )}>
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm font-semibold text-dark-700">
            Total Alocado
          </span>
          <div className="flex items-center gap-3">
            <span className={cn(
              'font-mono text-lg font-bold',
              isOverBudget ? 'text-danger' : isUnderBudget ? 'text-warning' : 'text-dark-700'
            )}>
              {formatCurrency(totalAllocated)}
            </span>
            <span className="font-body text-sm text-dark-300">
              / {formatCurrency(totalBudget)}
            </span>
          </div>
        </div>
        {(isOverBudget || isUnderBudget) && (
          <p className={cn(
            'font-body text-xs mt-2',
            isOverBudget ? 'text-danger' : 'text-warning'
          )}>
            {isOverBudget
              ? `Excede o orçamento em ${formatCurrency(Math.abs(diff))}`
              : `${formatCurrency(Math.abs(diff))} abaixo do orçamento total`}
          </p>
        )}
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border/50 p-5">
        <h3 className="font-heading font-semibold text-dark-700 text-sm mb-4">
          Impacto Estimado
        </h3>
        <div className="space-y-3">
          {impacts.map((impact) => (
            <div
              key={impact.channel}
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CHANNEL_COLORS[impact.channel] ?? '#9A9A9A' }}
                />
                <span className="font-body text-sm text-dark-700">
                  {CHANNEL_LABELS[impact.channel] ?? impact.channel}
                </span>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  {impact.cplChange <= 0
                    ? <TrendingDown size={14} className="text-success" />
                    : <TrendingUp size={14} className="text-danger" />}
                  <span className={cn(
                    'font-mono text-xs',
                    impact.cplChange <= 0 ? 'text-success' : 'text-danger'
                  )}>
                    CPL {impact.cplChange >= 0 ? '+' : ''}{impact.cplChange.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {impact.reachChange >= 0
                    ? <TrendingUp size={14} className="text-success" />
                    : <TrendingDown size={14} className="text-danger" />}
                  <span className={cn(
                    'font-mono text-xs',
                    impact.reachChange >= 0 ? 'text-success' : 'text-danger'
                  )}>
                    Alcance {impact.reachChange >= 0 ? '+' : ''}{impact.reachChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
