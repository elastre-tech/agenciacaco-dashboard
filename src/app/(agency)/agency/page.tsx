'use client'

import { useEffect, useState } from 'react'
import { Building2, DollarSign, UserCheck, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import WorkspaceCard from '@/components/agency/WorkspaceCard'
import CplComparisonChart from '@/components/agency/CplComparisonChart'
import GlobalAlertsFeed from '@/components/agency/GlobalAlertsFeed'
import type { Workspace, MetricsDaily, IntelligenceAlert } from '@/types/database'

interface WorkspaceData {
  workspace: Workspace
  latestMetrics: MetricsDaily | null
  alertsCount: number
}

interface AlertWithWorkspace extends IntelligenceAlert {
  workspace_name: string
}

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AgencyDashboardPage() {
  const [workspacesData, setWorkspacesData] = useState<WorkspaceData[]>([])
  const [globalAlerts, setGlobalAlerts] = useState<AlertWithWorkspace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const supabase = createClient()
      let workspaces: Workspace[] = []

      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user

      if (user) {
        const { data: memberships } = await supabase
          .from('agency_members')
          .select('agency_id')
          .eq('profile_id', user.id)

        if (memberships && memberships.length > 0) {
          const agencyIds = Array.from(new Set(memberships.map((m) => m.agency_id)))
          const { data } = await supabase
            .from('workspaces')
            .select('*')
            .in('agency_id', agencyIds)

          workspaces = data ?? []
        }
      }

      if (workspaces.length === 0) {
        const { data } = await supabase.from('workspaces').select('*').limit(20)
        workspaces = data ?? []
      }

      if (workspaces.length === 0) {
        setLoading(false)
        return
      }

      const workspaceIds = workspaces.map((w) => w.id)
      const workspaceMap = new Map(workspaces.map((w) => [w.id, w]))

      const { data: allMetrics } = await supabase
        .from('metrics_daily')
        .select('*')
        .in('workspace_id', workspaceIds)
        .order('date', { ascending: false })

      const latestMetricsMap = new Map<string, MetricsDaily>()
      if (allMetrics) {
        for (const m of allMetrics) {
          if (!latestMetricsMap.has(m.workspace_id)) {
            latestMetricsMap.set(m.workspace_id, m as MetricsDaily)
          }
        }
      }

      const { data: activeAlerts } = await supabase
        .from('intelligence_alerts')
        .select('*')
        .in('workspace_id', workspaceIds)
        .eq('status', 'active')

      const alertsCountMap = new Map<string, number>()
      if (activeAlerts) {
        for (const a of activeAlerts) {
          alertsCountMap.set(a.workspace_id, (alertsCountMap.get(a.workspace_id) ?? 0) + 1)
        }
      }

      const data: WorkspaceData[] = workspaces.map((workspace) => ({
        workspace,
        latestMetrics: latestMetricsMap.get(workspace.id) ?? null,
        alertsCount: alertsCountMap.get(workspace.id) ?? 0,
      }))

      setWorkspacesData(data)

      const { data: recentAlerts } = await supabase
        .from('intelligence_alerts')
        .select('*')
        .in('workspace_id', workspaceIds)
        .order('created_at', { ascending: false })
        .limit(8)

      const alertsWithNames: AlertWithWorkspace[] = (recentAlerts ?? []).map((alert) => ({
        ...(alert as IntelligenceAlert),
        workspace_name: workspaceMap.get(alert.workspace_id)?.candidate_name ?? 'Desconhecido',
      }))

      setGlobalAlerts(alertsWithNames)
    } catch (err) {
      console.error('Failed to fetch agency dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (workspacesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Building2 size={48} className="text-dark-200 mb-4" />
        <h2 className="font-heading font-semibold text-dark-700 text-lg mb-2">
          Nenhum workspace encontrado
        </h2>
        <p className="font-body text-sm text-dark-300">
          Crie um workspace para começar a acompanhar suas campanhas.
        </p>
      </div>
    )
  }

  const totalWorkspaces = workspacesData.length
  const totalSpent = workspacesData.reduce((sum, d) => sum + (d.latestMetrics?.budget_spent ?? 0), 0)
  const totalLeads = workspacesData.reduce((sum, d) => sum + (d.latestMetrics?.leads_count ?? 0), 0)
  const criticalAlerts = globalAlerts.filter((a) => a.severity === 'critical' && a.status === 'active').length

  const cplData = workspacesData
    .filter((d) => d.latestMetrics)
    .map((d) => ({
      name: d.workspace.candidate_name,
      cpl: d.latestMetrics!.cpl,
    }))
    .sort((a, b) => a.cpl - b.cpl)

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-dark-700 text-2xl mb-1">
          Dashboard da Agência
        </h1>
        <p className="font-body text-sm text-dark-300">
          Visão consolidada de todos os workspaces e campanhas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Workspaces" value={String(totalWorkspaces)} icon={Building2} />
        <KPICard label="Total Gasto" value={formatCurrency(totalSpent)} icon={DollarSign} />
        <KPICard label="Total Leads" value={totalLeads.toLocaleString('pt-BR')} icon={UserCheck} />
        <KPICard label="Alertas Críticos" value={String(criticalAlerts)} icon={ShieldAlert} />
      </div>

      <div className="mb-8">
        <h2 className="font-heading font-semibold text-dark-700 text-lg mb-4">
          Workspaces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspacesData.map((d) => (
            <WorkspaceCard
              key={d.workspace.id}
              workspace={d.workspace}
              latestMetrics={d.latestMetrics}
              alertsCount={d.alertsCount}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="CPL por Workspace" subtitle="Custo por lead mais recente">
          <CplComparisonChart data={cplData} />
        </ChartCard>

        <ChartCard title="Alertas Recentes" subtitle="Últimos alertas de todos os workspaces">
          <GlobalAlertsFeed alerts={globalAlerts} />
        </ChartCard>
      </div>
    </>
  )
}
