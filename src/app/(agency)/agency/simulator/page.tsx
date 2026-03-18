'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Play, Sparkles, Check, ExternalLink, Zap, MessageSquare, ChevronDown, FolderKanban, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import { SCENARIOS } from '@/lib/simulator/scenarios'

const showSimulator = process.env.NEXT_PUBLIC_SHOW_SIMULATOR === 'true'

interface SimResult {
  success: boolean
  scenario: string
  description?: string
  totalRows: number
  insertions: { table: string; count: number }[]
  error?: string
}

interface WorkspaceOption {
  id: string
  name: string
  candidate_name: string
}

export default function SimulatorPage() {
  const router = useRouter()

  useEffect(() => {
    if (!showSimulator) {
      router.replace('/agency')
    }
  }, [router])

  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([])
  const [workspaceId, setWorkspaceId] = useState<string>('')
  const [loadingWs, setLoadingWs] = useState(true)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [clearing, setClearing] = useState(false)

  const [aiAvailable, setAiAvailable] = useState(false)
  const [mode, setMode] = useState<'prebuilt' | 'ai'>('prebuilt')
  const [customPrompt, setCustomPrompt] = useState('')

  const fetchWorkspaces = useCallback(async () => {
    const supabase = createClient()
    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user

      let agencyIds: string[] = []
      if (user) {
        const { data: memberships } = await supabase
          .from('agency_members')
          .select('agency_id')
          .eq('profile_id', user.id)

        if (memberships && memberships.length > 0) {
          agencyIds = Array.from(new Set(memberships.map((m) => m.agency_id)))
        }
      }

      let query = supabase
        .from('workspaces')
        .select('id, name, candidate_name')
        .eq('is_active', true)
        .order('name')

      if (agencyIds.length > 0) {
        query = query.in('agency_id', agencyIds)
      }

      const { data } = await query
      const ws = (data ?? []) as WorkspaceOption[]
      setWorkspaces(ws)
      if (ws.length > 0) {
        setWorkspaceId(ws[0].id)
      }
    } catch {
      console.error('Failed to fetch workspaces')
    } finally {
      setLoadingWs(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    fetch('/api/simulate/custom')
      .then((r) => r.json())
      .then((data) => setAiAvailable(data.available))
      .catch(() => setAiAvailable(false))
  }, [])

  async function handleRunPrebuilt() {
    if (!selectedId || !workspaceId || running) return
    setRunning(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: selectedId, workspaceId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro desconhecido')
        return
      }

      setResult(data)
    } catch {
      setError('Falha na conexão com o servidor')
    } finally {
      setRunning(false)
    }
  }

  async function handleRunAI() {
    if (!customPrompt.trim() || !workspaceId || running) return
    setRunning(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/simulate/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customPrompt, workspaceId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro desconhecido')
        return
      }

      setResult(data)
    } catch {
      setError('Falha na conexão com o servidor')
    } finally {
      setRunning(false)
    }
  }

  async function handleClear() {
    if (!workspaceId || clearing) return
    setClearing(true)
    setError(null)

    try {
      const res = await fetch('/api/simulate/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao limpar dados')
        return
      }

      setResult(null)
    } catch {
      setError('Falha na conexão com o servidor')
    } finally {
      setClearing(false)
    }
  }

  const selectedScenario = SCENARIOS.find((s) => s.id === selectedId)

  if (loadingWs) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-dark-300" />
      </div>
    )
  }

  if (workspaces.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <FolderKanban size={48} className="text-dark-200 mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-dark-700 text-lg mb-2">
          Nenhum workspace encontrado
        </h2>
        <p className="font-body text-sm text-dark-300 mb-6">
          Crie um workspace primeiro para poder simular cenários.
        </p>
        <Link
          href="/agency/workspaces/new"
          className="bg-primary text-dark font-heading font-semibold rounded-lg px-6 py-3 hover:bg-primary-500 transition-colors inline-flex items-center gap-2"
        >
          Criar Workspace
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Zap size={22} className="text-primary" />
          <h2 className="font-heading text-xl font-bold text-dark-700">
            Simulador de Cenários
          </h2>
        </div>
        <p className="font-body text-sm text-dark-300 ml-[34px]">
          Gere dados realistas para demonstrar como a plataforma reage a diferentes situações de campanha.
        </p>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border/50 p-4">
        <label className="block font-body text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
          Workspace alvo
        </label>
        <div className="relative">
          <select
            value={workspaceId}
            onChange={(e) => {
              setWorkspaceId(e.target.value)
              setResult(null)
              setError(null)
            }}
            className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border border-dark-100 bg-background font-body text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name} — {ws.candidate_name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 pointer-events-none" />
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="font-body text-[11px] text-dark-300">
            A simulação substitui todos os dados existentes neste workspace.
          </p>
          <button
            onClick={handleClear}
            disabled={clearing || running}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger/30 text-danger font-body text-xs font-medium hover:bg-danger/5 transition-colors',
              (clearing || running) && 'opacity-40 cursor-not-allowed'
            )}
          >
            {clearing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Limpar Dados
          </button>
        </div>
      </div>

      {aiAvailable && (
        <div className="flex gap-1 bg-dark-50 rounded-lg p-1 w-fit">
          <button
            onClick={() => setMode('prebuilt')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md font-heading text-sm font-semibold transition-colors',
              mode === 'prebuilt'
                ? 'bg-surface shadow-sm text-dark-700'
                : 'text-dark-400 hover:text-dark-600'
            )}
          >
            <Play size={14} />
            Cenários Prontos
          </button>
          <button
            onClick={() => setMode('ai')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md font-heading text-sm font-semibold transition-colors',
              mode === 'ai'
                ? 'bg-surface shadow-sm text-dark-700'
                : 'text-dark-400 hover:text-dark-600'
            )}
          >
            <Sparkles size={14} />
            Prompt IA
          </button>
        </div>
      )}

      {mode === 'prebuilt' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => {
                  setSelectedId(scenario.id)
                  setResult(null)
                  setError(null)
                }}
                className={cn(
                  'text-left p-5 rounded-card border-2 transition-all',
                  selectedId === scenario.id
                    ? 'border-primary bg-primary/5 shadow-card'
                    : 'border-border/50 bg-surface hover:border-dark-200 hover:shadow-card'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">{scenario.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-semibold text-dark-700 mb-1">
                      {scenario.label}
                    </h3>
                    <p className="font-body text-sm text-dark-400 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedScenario && (
            <ScenarioPreview scenario={selectedScenario} />
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleRunPrebuilt}
              disabled={!selectedId || running}
              className={cn(
                'bg-primary text-dark font-heading font-semibold rounded-lg px-6 py-3 hover:bg-primary-500 transition-colors inline-flex items-center gap-2',
                (!selectedId || running) && 'opacity-40 cursor-not-allowed'
              )}
            >
              {running ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Gerando dados...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Rodar Simulação
                </>
              )}
            </button>

            {result?.success && (
              <a
                href={`/w/${workspaceId}/dashboard`}
                target="_blank"
                className="border border-dark-200 text-dark-600 hover:bg-dark-50 font-heading font-semibold rounded-lg px-5 py-3 transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Ver Dashboard
              </a>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-surface rounded-card shadow-card border border-border/50 p-6">
            <div className="flex items-start gap-3 mb-4">
              <MessageSquare size={20} className="text-primary mt-0.5" />
              <div>
                <h3 className="font-heading font-semibold text-dark-700 mb-1">
                  Descreva o cenário
                </h3>
                <p className="font-body text-sm text-dark-400">
                  Descreva em linguagem natural o cenário que deseja simular. A IA vai interpretar e gerar dados compatíveis.
                </p>
              </div>
            </div>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: O candidato foi flagrado em um vídeo polêmico que viralizou no TikTok. A oposição está usando o vídeo em campanhas pagas. O sentimento público está se dividindo..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-background font-body text-sm text-dark-700 placeholder:text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />

            <div className="mt-3 flex items-center gap-2 text-dark-300">
              <Sparkles size={12} />
              <span className="font-body text-xs">Powered by Claude — custo aproximado: ~$0.01 por simulação</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRunAI}
              disabled={!customPrompt.trim() || running}
              className={cn(
                'bg-primary text-dark font-heading font-semibold rounded-lg px-6 py-3 hover:bg-primary-500 transition-colors inline-flex items-center gap-2',
                (!customPrompt.trim() || running) && 'opacity-40 cursor-not-allowed'
              )}
            >
              {running ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  IA gerando cenário...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Gerar com IA
                </>
              )}
            </button>

            {result?.success && (
              <a
                href={`/w/${workspaceId}/dashboard`}
                target="_blank"
                className="border border-dark-200 text-dark-600 hover:bg-dark-50 font-heading font-semibold rounded-lg px-5 py-3 transition-colors inline-flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Ver Dashboard
              </a>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20">
          <p className="font-body text-sm text-danger">{error}</p>
        </div>
      )}

      {result?.success && (
        <ResultPanel result={result} />
      )}
    </div>
  )
}

function ScenarioPreview({ scenario }: { scenario: typeof SCENARIOS[number] }) {
  const criticalAlerts = scenario.alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length
  const activeAlerts = scenario.alerts.filter((a) => a.status === 'active').length

  return (
    <div className="bg-surface rounded-card shadow-card border border-border/50 p-5">
      <h4 className="font-heading text-sm font-semibold text-dark-500 uppercase tracking-wider mb-4">
        Preview do cenário
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PreviewStat label="Alcance/dia" value={scenario.metrics.reachBase.toLocaleString('pt-BR')} trend={scenario.metrics.reachTrend} />
        <PreviewStat label="CPL" value={`R$ ${scenario.metrics.cplBase.toFixed(2)}`} trend={scenario.metrics.cplTrend} invertTrend />
        <PreviewStat label="Leads/dia" value={String(scenario.metrics.leadsBase)} trend={scenario.metrics.leadsTrend} />
        <PreviewStat label="Engajamento" value={`${scenario.metrics.engagementBase}%`} trend="flat" />
        <PreviewStat label="Total Leads" value={scenario.leads.total.toLocaleString('pt-BR')} />
        <PreviewStat label="Sentimento +" value={`${Math.round(scenario.sentiment.positiveRatio * 100)}%`} />
        <PreviewStat label="Alertas Ativos" value={String(activeAlerts)} highlight={criticalAlerts > 0 ? 'danger' : undefined} />
        <PreviewStat label="Menções/dia" value={scenario.sentiment.mentionsPerDay.toLocaleString('pt-BR')} />
      </div>
    </div>
  )
}

function PreviewStat({
  label,
  value,
  trend,
  invertTrend,
  highlight,
}: {
  label: string
  value: string
  trend?: string
  invertTrend?: boolean
  highlight?: 'danger'
}) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : trend === 'spike' ? '⚡' : null
  const isPositive = invertTrend
    ? trend === 'down'
    : trend === 'up' || trend === 'spike'

  return (
    <div>
      <p className="font-body text-[11px] text-dark-300 mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className={cn(
          'font-mono text-lg font-semibold',
          highlight === 'danger' ? 'text-danger' : 'text-dark-700'
        )}>
          {value}
        </p>
        {trendIcon && (
          <span className={cn(
            'text-xs font-semibold',
            isPositive ? 'text-success' : 'text-danger'
          )}>
            {trendIcon}
          </span>
        )}
      </div>
    </div>
  )
}

function ResultPanel({ result }: { result: SimResult }) {
  return (
    <div className="bg-success/5 border border-success/20 rounded-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
          <Check size={14} className="text-success" />
        </div>
        <h4 className="font-heading font-semibold text-dark-700">
          Simulação concluída
        </h4>
      </div>

      <p className="font-body text-sm text-dark-500 mb-3">
        Cenário <strong>&ldquo;{result.scenario}&rdquo;</strong> gerou{' '}
        <strong>{result.totalRows.toLocaleString('pt-BR')} registros</strong> em{' '}
        {result.insertions.length} tabelas.
      </p>

      {result.description && (
        <p className="font-body text-sm text-dark-400 italic mb-3">
          {result.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {result.insertions.map((ins) => (
          <span
            key={ins.table}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border/50 font-mono text-[11px] text-dark-500"
          >
            {ins.table}: {ins.count}
          </span>
        ))}
      </div>
    </div>
  )
}
