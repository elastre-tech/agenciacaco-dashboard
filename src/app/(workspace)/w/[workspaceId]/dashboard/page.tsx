'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Eye, DollarSign, Users, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import CPLTrendChart from '@/components/charts/CPLTrendChart'
import BudgetDonutChart from '@/components/charts/BudgetDonutChart'
import ReachLeadsChart from '@/components/charts/ReachLeadsChart'
import AlertsFeed from '@/components/workspace/AlertsFeed'
import type { MetricsDaily, IntelligenceAlert, ChannelBudget } from '@/types/database'

interface DashboardData {
  metrics: MetricsDaily[]
  alerts: IntelligenceAlert[]
  budgets: ChannelBudget[]
}

function computeKPIs(metrics: MetricsDaily[], alerts: IntelligenceAlert[]) {
  if (!metrics.length) {
    return { reach: '0', cpl: 'R$ 0', leads: '0', activeAlerts: '0', trends: {} }
  }

  const latest = metrics[metrics.length - 1]
  const previous = metrics.length > 1 ? metrics[metrics.length - 2] : null

  const totalReach = metrics.reduce((sum, m) => sum + Number(m.total_reach), 0)
  const totalLeads = metrics.reduce((sum, m) => sum + Number(m.leads_count), 0)
  const avgCPL = metrics.reduce((sum, m) => sum + Number(m.cpl), 0) / metrics.length
  const activeAlerts = alerts.filter((a) => a.status === 'active').length

  function calcTrend(current: number, prev: number | null) {
    if (!prev || prev === 0) return undefined
    const pct = ((current - prev) / prev) * 100
    return { value: Math.round(Math.abs(pct) * 10) / 10, direction: pct >= 0 ? 'up' as const : 'down' as const }
  }

  return {
    reach: totalReach >= 1_000_000
      ? `${(totalReach / 1_000_000).toFixed(1)}M`
      : `${(totalReach / 1000).toFixed(0)}k`,
    cpl: `R$ ${avgCPL.toFixed(2)}`,
    leads: totalLeads.toLocaleString('pt-BR'),
    activeAlerts: String(activeAlerts),
    trends: {
      reach: previous ? calcTrend(Number(latest.total_reach), Number(previous.total_reach)) : undefined,
      cpl: previous ? calcTrend(Number(latest.cpl), Number(previous.cpl)) : undefined,
      leads: previous ? calcTrend(Number(latest.leads_count), Number(previous.leads_count)) : undefined,
    },
  }
}

export default function WorkspaceDashboardPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchDashboard() {
      try {
        const [metricsRes, alertsRes, budgetsRes] = await Promise.all([
          supabase
            .from('metrics_daily')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('date', { ascending: true })
            .limit(30),
          supabase
            .from('intelligence_alerts')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('channel_budgets')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('channel', { ascending: true }),
        ])

        setData({
          metrics: metricsRes.data ?? [],
          alerts: alertsRes.data ?? [],
          budgets: budgetsRes.data ?? [],
        })
      } catch {
        console.error('Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [workspaceId])

  if (loading) {
    return <DashboardSkeleton kpis={4} charts={3} />
  }

  if (!data) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-20">
        Erro ao carregar dados.
      </p>
    )
  }

  if (data.metrics.length === 0 && data.alerts.length === 0 && data.budgets.length === 0) {
    return (
      <EmptyState
        icon={Eye}
        title="Nenhum dado disponível"
        description="Os dados do painel aparecerão aqui quando a campanha começar a gerar métricas."
      />
    )
  }

  const kpis = computeKPIs(data.metrics, data.alerts)

  // CPL trend is "good" when going down, so invert the direction for display
  const cplTrend = kpis.trends.cpl
    ? { value: kpis.trends.cpl.value, direction: kpis.trends.cpl.direction === 'up' ? 'down' as const : 'up' as const }
    : undefined

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          Painel Geral 360
        </h2>
        <p className="font-body text-sm text-dark-300">
          Visão consolidada da campanha nos últimos 30 dias.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Alcance Total"
          value={kpis.reach}
          icon={Eye}
          trend={kpis.trends.reach}
        />
        <KPICard
          label="CPL Médio"
          value={kpis.cpl}
          icon={DollarSign}
          trend={cplTrend}
        />
        <KPICard
          label="Leads Gerados"
          value={kpis.leads}
          icon={Users}
          trend={kpis.trends.leads}
        />
        <KPICard
          label="Alertas Ativos"
          value={kpis.activeAlerts}
          icon={ShieldAlert}
          className={Number(kpis.activeAlerts) > 0 ? 'ring-1 ring-warning/30' : undefined}
        />
      </div>

      {/* Asymmetric grid — budget chart narrower, CPL wider */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ChartCard
          title="Distribuição de Orçamento"
          subtitle="Gasto por canal no mês"
          className="lg:col-span-2"
        >
          <BudgetDonutChart data={data.budgets} />
        </ChartCard>

        <ChartCard
          title="Tendência de CPL"
          subtitle="Custo por lead — últimos 30 dias"
          className="lg:col-span-3"
        >
          <CPLTrendChart data={data.metrics} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Alcance vs Leads"
          subtitle="Comparativo diário"
          className="lg:col-span-2"
        >
          <ReachLeadsChart data={data.metrics} />
        </ChartCard>

        <ChartCard
          title="Alertas de Inteligência"
          subtitle={`${data.alerts.filter((a) => a.status === 'active').length} ativos`}
          className="lg:col-span-1"
        >
          <div className="max-h-[260px] overflow-y-auto -mx-2 px-2">
            <AlertsFeed alerts={data.alerts} />
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
