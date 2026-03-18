'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Wallet,
  Receipt,
  AlertTriangle,
  Gauge,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ModulePageSkeleton } from '@/components/ui/Skeleton'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import CPLTrendChart from '@/components/charts/CPLTrendChart'
import BudgetUtilizationChart from '@/components/charts/BudgetUtilizationChart'
import WasteDetectionCards from '@/components/finance/WasteDetectionCards'
import type { ChannelBudget, WasteDetection, MetricsDaily } from '@/types/database'

interface FinanceData {
  budgets: ChannelBudget[]
  wastes: WasteDetection[]
  metrics: MetricsDaily[]
}

function computeFinanceKPIs(budgets: ChannelBudget[], wastes: WasteDetection[]) {
  const totalBudget = budgets.reduce((s, b) => s + Number(b.allocated), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0)
  const totalWaste = wastes.reduce((s, w) => s + Number(w.amount), 0)
  const efficiency = totalSpent > 0
    ? ((totalSpent - totalWaste) / totalSpent) * 100
    : 100

  return { totalBudget, totalSpent, totalWaste, efficiency }
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`
  return `R$ ${value.toFixed(2)}`
}

export default function FinancePage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchFinanceData() {
      try {
        const [budgetsRes, wastesRes, metricsRes] = await Promise.all([
          supabase
            .from('channel_budgets')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('channel', { ascending: true }),
          supabase
            .from('waste_detections')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('detected_at', { ascending: false }),
          supabase
            .from('metrics_daily')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('date', { ascending: true })
            .limit(30),
        ])

        setData({
          budgets: budgetsRes.data ?? [],
          wastes: wastesRes.data ?? [],
          metrics: metricsRes.data ?? [],
        })
      } catch {
        console.error('Failed to fetch finance data')
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceData()
  }, [workspaceId])

  if (loading) {
    return <ModulePageSkeleton kpis={4} charts={3} />
  }

  if (!data) {
    return (
      <p className="font-body text-sm text-dark-300 text-center py-20">
        Erro ao carregar dados financeiros.
      </p>
    )
  }

  const kpis = computeFinanceKPIs(data.budgets, data.wastes)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Eficiência e Finanças
          </h2>
          <p className="font-body text-sm text-dark-300">
            Controle orçamentário, desperdícios e custo por resultado.
          </p>
        </div>
        <Link
          href={`/w/${workspaceId}/finance/simulator`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-dark-700 font-heading font-semibold text-sm hover:bg-primary/90 transition-colors duration-200"
        >
          Simulador
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Orçamento Total"
          value={formatCurrency(kpis.totalBudget)}
          icon={Wallet}
        />
        <KPICard
          label="Total Gasto"
          value={formatCurrency(kpis.totalSpent)}
          icon={Receipt}
        />
        <KPICard
          label="Desperdício Detectado"
          value={formatCurrency(kpis.totalWaste)}
          icon={AlertTriangle}
          className={kpis.totalWaste > 0 ? 'ring-1 ring-danger/30' : undefined}
        />
        <KPICard
          label="Eficiência Orçamentária"
          value={`${kpis.efficiency.toFixed(1)}%`}
          icon={Gauge}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ChartCard
          title="Utilização por Canal"
          subtitle="Alocado vs gasto por canal"
          className="lg:col-span-2"
        >
          <BudgetUtilizationChart data={data.budgets} />
        </ChartCard>

        <ChartCard
          title="Tendência de CPL"
          subtitle="Custo por lead nos últimos 30 dias"
          className="lg:col-span-3"
        >
          <CPLTrendChart data={data.metrics} />
        </ChartCard>
      </div>

      <ChartCard
        title="Desperdícios Detectados"
        subtitle={`${data.wastes.filter((w) => !w.resolved).length} pendente(s) de resolução`}
      >
        <WasteDetectionCards detections={data.wastes} />
      </ChartCard>
    </div>
  )
}
