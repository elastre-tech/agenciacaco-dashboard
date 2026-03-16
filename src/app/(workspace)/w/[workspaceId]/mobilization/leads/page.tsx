'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Search, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import type { Lead, LeadTemperature } from '@/types/database'
import LeadsTable, { type SortField } from './LeadsTable'

const SOURCES = ['all', 'instagram', 'facebook', 'whatsapp', 'website', 'field', 'event', 'referral'] as const
const TEMPS: (LeadTemperature | 'all')[] = ['all', 'hot', 'warm', 'cold']
const PER_PAGE = 10

const TEMP_BADGE: Record<LeadTemperature, { bg: string; text: string; label: string }> = {
  hot: { bg: 'bg-danger/10', text: 'text-danger', label: 'Quentes' },
  warm: { bg: 'bg-warning/10', text: 'text-warning', label: 'Mornos' },
  cold: { bg: 'bg-info/10', text: 'text-info', label: 'Frios' },
}

const TEMP_ORDER: Record<string, number> = { hot: 0, warm: 1, cold: 2 }

export default function LeadsPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tempFilter, setTempFilter] = useState<LeadTemperature | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()

    async function fetchLeads() {
      try {
        const { data } = await supabase
          .from('leads')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false })

        setAllLeads(data ?? [])
      } catch {
        console.error('Failed to fetch leads')
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [workspaceId])

  const neighborhoods = useMemo(() => {
    const set = new Set(allLeads.map((l) => l.neighborhood).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [allLeads])

  const tempCounts = useMemo(() => ({
    hot: allLeads.filter((l) => l.temperature === 'hot').length,
    warm: allLeads.filter((l) => l.temperature === 'warm').length,
    cold: allLeads.filter((l) => l.temperature === 'cold').length,
  }), [allLeads])

  const filtered = useMemo(() => {
    let result = allLeads

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.full_name.toLowerCase().includes(q) ||
          (l.email?.toLowerCase().includes(q)) ||
          (l.phone?.includes(q))
      )
    }

    if (tempFilter !== 'all') {
      result = result.filter((l) => l.temperature === tempFilter)
    }

    if (sourceFilter !== 'all') {
      result = result.filter((l) => l.source === sourceFilter)
    }

    if (neighborhoodFilter !== 'all') {
      result = result.filter((l) => l.neighborhood === neighborhoodFilter)
    }

    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortField === 'full_name') {
        cmp = a.full_name.localeCompare(b.full_name, 'pt-BR')
      } else if (sortField === 'created_at') {
        cmp = a.created_at.localeCompare(b.created_at)
      } else if (sortField === 'temperature') {
        cmp = (TEMP_ORDER[a.temperature] ?? 3) - (TEMP_ORDER[b.temperature] ?? 3)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [allLeads, search, tempFilter, sourceFilter, neighborhoodFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageLeads = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  useEffect(() => { setPage(0) }, [search, tempFilter, sourceFilter, neighborhoodFilter])

  const handleSort = useCallback((field: SortField) => {
    setSortDir((prev) => (sortField === field ? (prev === 'asc' ? 'desc' : 'asc') : 'desc'))
    setSortField(field)
  }, [sortField])

  const toggleId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allOnPage = pageLeads.map((l) => l.id)
      const allSelected = allOnPage.every((id) => prev.has(id))
      const next = new Set(prev)
      allOnPage.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
      return next
    })
  }, [pageLeads])

  async function bulkChangeTemp(temp: LeadTemperature) {
    if (selectedIds.size === 0) return
    const supabase = createClient()

    try {
      const ids = Array.from(selectedIds)
      await supabase
        .from('leads')
        .update({ temperature: temp, updated_at: new Date().toISOString() })
        .in('id', ids)
        .eq('workspace_id', workspaceId)

      setAllLeads((prev) =>
        prev.map((l) => (selectedIds.has(l.id) ? { ...l, temperature: temp } : l))
      )
      setSelectedIds(new Set())
    } catch {
      console.error('Failed to update lead temperatures')
    }
  }

  function exportSelected() {
    const rows = allLeads.filter((l) => selectedIds.has(l.id))
    const header = 'Nome,Email,Telefone,Bairro,Origem,Temperatura,Criado'
    const csv = [
      header,
      ...rows.map((l) =>
        [l.full_name, l.email ?? '', l.phone ?? '', l.neighborhood ?? '', l.source, l.temperature, l.created_at].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-dark-300" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">Leads</h2>
        <p className="font-body text-sm text-dark-300">
          {allLeads.length.toLocaleString('pt-BR')} leads cadastrados.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou telefone..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-surface font-body text-sm text-dark-700 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface font-body text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'Todas origens' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          value={neighborhoodFilter}
          onChange={(e) => setNeighborhoodFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-surface font-body text-sm text-dark-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">Todos bairros</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TEMPS.map((t) => {
          const isActive = tempFilter === t
          const count = t === 'all' ? allLeads.length : tempCounts[t]
          const style = t !== 'all' ? TEMP_BADGE[t] : null

          return (
            <button
              key={t}
              onClick={() => setTempFilter(t)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-sm border transition-colors',
                isActive
                  ? style ? `${style.bg} ${style.text} border-current` : 'bg-dark-700 text-white border-dark-700'
                  : 'bg-surface text-dark-400 border-border hover:border-dark-200'
              )}
            >
              {t === 'all' ? 'Todos' : style?.label}
              <span className={cn(
                'font-mono text-xs px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-white/20' : 'bg-dark-50'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 rounded-lg border border-primary/20">
          <span className="font-body text-sm text-dark-700 font-medium">
            {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
          </span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) bulkChangeTemp(e.target.value as LeadTemperature)
              e.target.value = ''
            }}
            className="px-2 py-1 rounded border border-border bg-surface font-body text-xs text-dark-700 focus:outline-none"
          >
            <option value="" disabled>Alterar temperatura</option>
            <option value="hot">Quente</option>
            <option value="warm">Morno</option>
            <option value="cold">Frio</option>
          </select>
          <button
            onClick={exportSelected}
            className="inline-flex items-center gap-1 px-3 py-1 rounded border border-border bg-surface font-body text-xs text-dark-700 hover:bg-dark-50 transition-colors"
          >
            <Download size={12} />
            Exportar Selecionados
          </button>
        </div>
      )}

      <div className="bg-surface rounded-card shadow-card border border-border/50">
        <LeadsTable
          leads={pageLeads}
          selectedIds={selectedIds}
          onToggle={toggleId}
          onToggleAll={toggleAll}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-dark-300">
          {filtered.length === 0 ? 'Nenhum resultado' : `${page * PER_PAGE + 1}–${Math.min((page + 1) * PER_PAGE, filtered.length)} de ${filtered.length}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1.5 rounded hover:bg-dark-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-dark-400" />
          </button>
          <span className="font-mono text-xs text-dark-400 px-2">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded hover:bg-dark-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-dark-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
