'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Bell,
  Plus,
  Trash2,
  Loader2,
  Search,
  TrendingDown,
  BarChart3,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import { TablePageSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

interface CrisisAlertConfig {
  id: string
  workspace_id: string
  trigger_type: string
  trigger_value: string
  is_active: boolean
  notify_roles: string[]
  created_at: string
}

type TriggerType = 'keyword' | 'sentiment_drop' | 'mention_spike'

const triggerMeta: Record<TriggerType, { label: string; icon: typeof Search; style: string }> = {
  keyword: { label: 'Palavra-chave', icon: Search, style: 'bg-info/10 text-info' },
  sentiment_drop: { label: 'Queda de Sentimento', icon: TrendingDown, style: 'bg-danger/10 text-danger' },
  mention_spike: { label: 'Pico de Menções', icon: BarChart3, style: 'bg-warning/10 text-warning' },
}

export default function AlertsConfigPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [configs, setConfigs] = useState<CrisisAlertConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [newTriggerType, setNewTriggerType] = useState<TriggerType>('keyword')
  const [newTriggerValue, setNewTriggerValue] = useState('')
  const [newActive, setNewActive] = useState(true)

  const fetchConfigs = useCallback(async () => {
    const supabase = createClient()
    try {
      const { data } = await supabase
        .from('crisis_alert_configs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
      setConfigs(data ?? [])
    } catch {
      console.error('Failed to fetch alert configs')
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  async function handleCreate() {
    if (!newTriggerValue.trim()) return
    setSaving(true)
    const supabase = createClient()
    try {
      await supabase.from('crisis_alert_configs').insert({
        workspace_id: workspaceId,
        trigger_type: newTriggerType,
        trigger_value: newTriggerValue.trim(),
        is_active: newActive,
        notify_roles: [],
      })
      setNewTriggerValue('')
      setNewTriggerType('keyword')
      setNewActive(true)
      await fetchConfigs()
    } catch {
      console.error('Failed to create alert config')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(config: CrisisAlertConfig) {
    const supabase = createClient()
    try {
      await supabase
        .from('crisis_alert_configs')
        .update({ is_active: !config.is_active })
        .eq('id', config.id)
      setConfigs((prev) =>
        prev.map((c) => (c.id === config.id ? { ...c, is_active: !c.is_active } : c))
      )
    } catch {
      console.error('Failed to toggle alert config')
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    try {
      await supabase.from('crisis_alert_configs').delete().eq('id', id)
      setConfigs((prev) => prev.filter((c) => c.id !== id))
    } catch {
      console.error('Failed to delete alert config')
    }
  }

  if (loading) {
    return <TablePageSkeleton cols={5} />
  }

  if (!configs.length) {
    return (
      <EmptyState
        icon={Bell}
        title="Nenhum alerta configurado"
        description="Configure alertas para ser notificado sobre eventos de crise."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/w/${workspaceId}/risk`}
          className="p-2 rounded-lg hover:bg-dark-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-dark-400" />
        </Link>
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Configuração de Alertas
          </h2>
          <p className="font-body text-sm text-dark-300">
            Defina gatilhos para monitoramento de crises.
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border/50 p-5 space-y-4">
        <h3 className="font-heading text-sm font-semibold text-dark-700">Novo Alerta</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label className="font-body text-xs text-dark-300">Tipo de Gatilho</label>
            <select
              value={newTriggerType}
              onChange={(e) => setNewTriggerType(e.target.value as TriggerType)}
              className="block w-48 px-3 py-2 rounded-lg border border-border bg-surface font-body text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="keyword">Palavra-chave</option>
              <option value="sentiment_drop">Queda de Sentimento</option>
              <option value="mention_spike">Pico de Menções</option>
            </select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="font-body text-xs text-dark-300">
              {newTriggerType === 'keyword' ? 'Palavra ou frase' : 'Limite (%)'}
            </label>
            <input
              type={newTriggerType === 'keyword' ? 'text' : 'number'}
              value={newTriggerValue}
              onChange={(e) => setNewTriggerValue(e.target.value)}
              placeholder={newTriggerType === 'keyword' ? 'ex: escândalo' : 'ex: 20'}
              className="block w-full px-3 py-2 rounded-lg border border-border bg-surface font-body text-sm text-dark-700 placeholder:text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-body text-xs text-dark-300">Ativo</label>
            <button
              type="button"
              onClick={() => setNewActive(!newActive)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                newActive ? 'bg-success' : 'bg-dark-100'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 rounded-full bg-surface transition-transform shadow-sm',
                newActive ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !newTriggerValue.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-dark-700 font-body text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Criar Alerta
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-50">
              <th className="text-left px-4 py-3 font-body text-xs uppercase text-dark-300 tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase text-dark-300 tracking-wider">Valor</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase text-dark-300 tracking-wider">Notificar</th>
              <th className="text-center px-4 py-3 font-body text-xs uppercase text-dark-300 tracking-wider">Status</th>
              <th className="text-right px-4 py-3 font-body text-xs uppercase text-dark-300 tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-dark-300">
                  Nenhum alerta configurado.
                </td>
              </tr>
            ) : (
              configs.map((config, idx) => {
                const meta = triggerMeta[config.trigger_type as TriggerType] ?? triggerMeta.keyword
                const TriggerIcon = meta.icon
                return (
                  <tr
                    key={config.id}
                    className={cn(
                      'border-t border-border/50 hover:bg-primary/5 transition-colors',
                      idx % 2 === 1 && 'bg-dark-50/30'
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium font-body',
                        meta.style
                      )}>
                        <TriggerIcon size={12} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-dark-700">
                      {config.trigger_value}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-dark-300">
                      {config.notify_roles.length > 0
                        ? config.notify_roles.join(', ')
                        : 'Todos'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(config)}
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          config.is_active ? 'bg-success' : 'bg-dark-100'
                        )}
                      >
                        <span className={cn(
                          'inline-block h-3.5 w-3.5 rounded-full bg-surface transition-transform shadow-sm',
                          config.is_active ? 'translate-x-[18px]' : 'translate-x-0.5'
                        )} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-1.5 rounded-lg text-dark-300 hover:text-danger hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
