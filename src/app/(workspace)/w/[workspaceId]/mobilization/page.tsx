'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Flame,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import FunnelChart from '@/components/charts/FunnelChart'
import type { Lead, WhatsAppMetrics, MobilizationFunnel } from '@/types/database'
import type { LeadTemperature } from '@/types/database'

interface MobilizationData {
  leads: Lead[]
  whatsapp: WhatsAppMetrics[]
  funnel: MobilizationFunnel[]
}

const TEMP_STYLES: Record<LeadTemperature, { bg: string; text: string; label: string }> = {
  hot: { bg: 'bg-danger/10', text: 'text-danger', label: 'Quentes' },
  warm: { bg: 'bg-warning/10', text: 'text-warning', label: 'Mornos' },
  cold: { bg: 'bg-info/10', text: 'text-info', label: 'Frios' },
}

function computeKPIs(data: MobilizationData) {
  const totalLeads = data.leads.length
  const hotLeads = data.leads.filter((l) => l.temperature === 'hot').length

  const recentWA = data.whatsapp
  const totalSent = recentWA.reduce((s, m) => s + Number(m.messages_sent), 0)
  const totalDelivered = recentWA.reduce((s, m) => s + Number(m.messages_delivered), 0)
  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0

  const funnelStages = data.funnel
  const first = funnelStages.find((f) => f.stage === 'awareness')
  const last = funnelStages.find((f) => f.stage === 'advocate')
  const conversionRate =
    first && last && first.count > 0
      ? (last.count / first.count) * 100
      : 0

  return {
    totalLeads: totalLeads.toLocaleString('pt-BR'),
    hotLeads: String(hotLeads),
    deliveryRate: `${deliveryRate.toFixed(1)}%`,
    conversionRate: `${conversionRate.toFixed(1)}%`,
  }
}

function countByTemp(leads: Lead[], temp: LeadTemperature) {
  return leads.filter((l) => l.temperature === temp).length
}

export default function MobilizationPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [data, setData] = useState<MobilizationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tempFilter, setTempFilter] = useState<LeadTemperature | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      try {
        const [leadsRes, waRes, funnelRes] = await Promise.all([
          supabase
            .from('leads')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false }),
          supabase
            .from('whatsapp_metrics')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('date', { ascending: true })
            .limit(30),
          supabase
            .from('mobilization_funnel')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: true }),
        ])

        setData({
          leads: leadsRes.data ?? [],
          whatsapp: waRes.data ?? [],
          funnel: funnelRes.data ?? [],
        })
      } catch {
        console.error('Failed to fetch mobilization data')
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

  if (!data) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-20">
        Erro ao carregar dados de mobilização.
      </p>
    )
  }

  const kpis = computeKPIs(data)
  const funnelData = data.funnel.map((f) => ({ stage: f.stage, count: Number(f.count) }))

  const filteredLeads = tempFilter
    ? data.leads.filter((l) => l.temperature === tempFilter)
    : data.leads
  const recentLeads = filteredLeads.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          Mobilização e CRM
        </h2>
        <p className="font-body text-sm text-dark-300">
          Gerencie leads, acompanhe o funil de mobilização e métricas de WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Leads" value={kpis.totalLeads} icon={Users} />
        <KPICard
          label="Leads Quentes"
          value={kpis.hotLeads}
          icon={Flame}
          className="ring-1 ring-danger/20"
        />
        <KPICard label="Taxa de Entrega WhatsApp" value={kpis.deliveryRate} icon={MessageCircle} />
        <KPICard label="Conversão do Funil" value={kpis.conversionRate} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ChartCard
          title="Funil de Mobilização"
          subtitle="Jornada do eleitor"
          className="lg:col-span-3"
        >
          {funnelData.length > 0 ? (
            <FunnelChart data={funnelData} />
          ) : (
            <p className="font-body text-sm text-dark-300 py-8 text-center">
              Sem dados de funil.
            </p>
          )}
        </ChartCard>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-heading font-semibold text-dark-700 text-sm">
            Segmentação Rápida
          </h3>
          {(['hot', 'warm', 'cold'] as LeadTemperature[]).map((temp) => {
            const style = TEMP_STYLES[temp]
            const count = countByTemp(data.leads, temp)
            const isActive = tempFilter === temp

            return (
              <button
                key={temp}
                onClick={() => setTempFilter(isActive ? null : temp)}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-card border transition-all duration-200',
                  isActive
                    ? `${style.bg} border-current ${style.text}`
                    : 'bg-surface border-border/50 hover:border-dark-200'
                )}
              >
                <span className={cn('font-body text-sm font-medium', isActive ? style.text : 'text-dark-700')}>
                  {style.label}
                </span>
                <span className={cn('font-mono text-lg font-bold', isActive ? style.text : 'text-dark-700')}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <ChartCard
        title="Leads Recentes"
        subtitle={tempFilter ? `Filtrado: ${TEMP_STYLES[tempFilter].label}` : 'Últimos cadastros'}
        action={
          <Link
            href={`/w/${workspaceId}/mobilization/leads`}
            className="inline-flex items-center gap-1 font-body text-xs text-primary hover:underline"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        }
      >
        {recentLeads.length > 0 ? (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-dark-50">
                  <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Nome</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Telefone</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Bairro</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Temperatura</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-body font-medium px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={cn(
                      'hover:bg-primary-50 transition-colors',
                      idx % 2 === 0 ? 'bg-white' : 'bg-dark-50'
                    )}
                  >
                    <td className="px-4 py-3 font-body text-sm text-dark-700">{lead.full_name}</td>
                    <td className="px-4 py-3 font-mono text-sm text-dark-400">{lead.phone ?? '—'}</td>
                    <td className="px-4 py-3 font-body text-sm text-dark-400">{lead.neighborhood ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium font-body',
                        TEMP_STYLES[lead.temperature].bg,
                        TEMP_STYLES[lead.temperature].text
                      )}>
                        {TEMP_STYLES[lead.temperature].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-dark-300">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-body text-sm text-dark-300 py-6 text-center">
            Nenhum lead encontrado.
          </p>
        )}
      </ChartCard>

      <div className="flex justify-end">
        <Link
          href={`/w/${workspaceId}/mobilization/whatsapp`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 text-white font-body text-sm hover:bg-dark-600 transition-colors"
        >
          <MessageCircle size={16} />
          Métricas WhatsApp
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
