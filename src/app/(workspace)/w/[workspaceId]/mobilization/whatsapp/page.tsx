'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Send,
  CheckCheck,
  Eye,
  MessageSquareReply,
  UserMinus,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { ModulePageSkeleton } from '@/components/ui/Skeleton'
import KPICard from '@/components/ui/KPICard'
import ChartCard from '@/components/ui/ChartCard'
import WhatsAppLineChart from '@/components/charts/WhatsAppLineChart'
import type { WhatsAppMetrics } from '@/types/database'

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function ResponseBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  const labelMap: Record<string, string> = {
    responses: 'Respostas',
    opt_outs: 'Opt-outs',
  }

  return (
    <div className="bg-dark-700 text-white px-3 py-2 rounded-lg shadow-lg">
      <p className="font-body text-xs text-dark-200 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="font-body text-xs text-dark-200">
            {labelMap[p.dataKey] ?? p.dataKey}:
          </span>
          <span className="font-mono text-xs font-medium">
            {p.value.toLocaleString('pt-BR')}
          </span>
        </div>
      ))}
    </div>
  )
}

function computeWAKPIs(metrics: WhatsAppMetrics[]) {
  const totalSent = metrics.reduce((s, m) => s + Number(m.messages_sent), 0)
  const totalDelivered = metrics.reduce((s, m) => s + Number(m.messages_delivered), 0)
  const totalRead = metrics.reduce((s, m) => s + Number(m.messages_read), 0)
  const totalResponses = metrics.reduce((s, m) => s + Number(m.responses), 0)
  const totalOptOuts = metrics.reduce((s, m) => s + Number(m.opt_outs), 0)

  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
  const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0
  const responseRate = totalRead > 0 ? (totalResponses / totalRead) * 100 : 0

  return {
    totalSent: totalSent.toLocaleString('pt-BR'),
    deliveryRate: `${deliveryRate.toFixed(1)}%`,
    readRate: `${readRate.toFixed(1)}%`,
    responseRate: `${responseRate.toFixed(1)}%`,
    optOuts: String(totalOptOuts),
  }
}

export default function WhatsAppMetricsPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [metrics, setMetrics] = useState<WhatsAppMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchMetrics() {
      try {
        const { data } = await supabase
          .from('whatsapp_metrics')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('date', { ascending: true })
          .limit(30)

        setMetrics(data ?? [])
      } catch {
        console.error('Failed to fetch WhatsApp metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [workspaceId])

  if (loading) {
    return <ModulePageSkeleton kpis={4} charts={2} />
  }

  const kpis = computeWAKPIs(metrics)

  const barData = metrics.map((m) => ({
    date: formatDate(m.date),
    responses: Number(m.responses),
    opt_outs: Number(m.opt_outs),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
          Métricas WhatsApp
        </h2>
        <p className="font-body text-sm text-dark-300">
          Desempenho de mensagens nos últimos 30 dias.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Mensagens Enviadas" value={kpis.totalSent} icon={Send} />
        <KPICard label="Taxa de Entrega" value={kpis.deliveryRate} icon={CheckCheck} />
        <KPICard label="Taxa de Leitura" value={kpis.readRate} icon={Eye} />
        <KPICard label="Taxa de Resposta" value={kpis.responseRate} icon={MessageSquareReply} />
        <KPICard
          label="Opt-outs"
          value={kpis.optOuts}
          icon={UserMinus}
          className={Number(kpis.optOuts) > 0 ? 'ring-1 ring-warning/30' : undefined}
        />
      </div>

      <ChartCard
        title="Volume de Mensagens"
        subtitle="Enviadas, entregues e lidas por dia"
      >
        {metrics.length > 0 ? (
          <WhatsAppLineChart data={metrics} />
        ) : (
          <p className="font-body text-sm text-dark-300 py-8 text-center">
            Sem dados disponíveis.
          </p>
        )}
      </ChartCard>

      <ChartCard
        title="Respostas vs Opt-outs"
        subtitle="Engajamento e descadastros diários"
      >
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={barData}
              margin={{ top: 5, right: 5, bottom: 0, left: -10 }}
              barGap={2}
            >
              <CartesianGrid
                stroke="#F5F5F5"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9A9A9A' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9A9A9A' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ResponseBarTooltip />} />
              <Legend
                formatter={(value: string) => (
                  <span className="font-body text-xs text-dark-400">
                    {value === 'responses' ? 'Respostas' : 'Opt-outs'}
                  </span>
                )}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="responses"
                fill="#22C55E"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
                animationDuration={300}
                animationEasing="ease-in-out"
              />
              <Bar
                dataKey="opt_outs"
                fill="#EF4444"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
                animationDuration={300}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="font-body text-sm text-dark-300 py-8 text-center">
            Sem dados disponíveis.
          </p>
        )}
      </ChartCard>
    </div>
  )
}
