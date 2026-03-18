'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import {
  Search,
  Plus,
  MoreHorizontal,
  LayoutDashboard,
  Pause,
  Play,
  Archive,
  ArrowUpDown,
  FolderKanban,
} from 'lucide-react'
import { TablePageSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

interface Workspace {
  id: string
  name: string
  candidate_name: string
  city: string
  state: string
  is_active: boolean
  created_at: string
  updated_at: string
  member_count: number
}

type SortKey = 'name' | 'created_at'

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  async function fetchWorkspaces() {
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
        .select('*, workspace_members(count)')

      if (agencyIds.length > 0) {
        query = query.in('agency_id', agencyIds)
      }

      const { data, error } = await query.order('name', { ascending: true })

      if (error) throw error

      const mapped: Workspace[] = (data ?? []).map((w: Record<string, unknown>) => ({
        id: w.id as string,
        name: w.name as string,
        candidate_name: (w.candidate_name as string) ?? '',
        city: (w.city as string) ?? '',
        state: (w.state as string) ?? '',
        is_active: w.is_active !== false,
        created_at: w.created_at as string,
        updated_at: (w.updated_at as string) ?? (w.created_at as string),
        member_count:
          Array.isArray(w.workspace_members) && w.workspace_members[0]
            ? Number((w.workspace_members[0] as { count: number }).count)
            : 0,
      }))

      setWorkspaces(mapped)
    } catch {
      console.error('Failed to fetch workspaces')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(workspace: Workspace) {
    const supabase = createClient()
    try {
      await supabase
        .from('workspaces')
        .update({ is_active: !workspace.is_active })
        .eq('id', workspace.id)

      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === workspace.id ? { ...w, is_active: !w.is_active } : w,
        ),
      )
    } catch {
      console.error('Failed to toggle workspace status')
    }
    setOpenMenu(null)
  }

  const filtered = workspaces
    .filter((w) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        w.name.toLowerCase().includes(q) ||
        w.candidate_name.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  function formatDate(dateStr: string) {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return <TablePageSkeleton cols={7} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Workspaces
          </h2>
          <p className="font-body text-sm text-dark-300">
            Gerencie os workspaces de campanha da sua agência.
          </p>
        </div>
        <Link
          href="/agency/workspaces/new"
          className="bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-2.5 hover:bg-primary-500 inline-flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Novo Workspace
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            type="text"
            placeholder="Buscar por nome ou candidato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setSortBy(sortBy === 'name' ? 'created_at' : 'name')}
          className="border border-dark-200 text-dark-500 hover:bg-dark-50 rounded-lg px-4 py-3 inline-flex items-center gap-2 font-body text-sm transition-colors"
        >
          <ArrowUpDown size={14} />
          {sortBy === 'name' ? 'Nome' : 'Recentes'}
        </button>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border/50 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Nenhum workspace encontrado"
            description={search ? 'Tente ajustar sua busca.' : 'Crie um workspace para começar a acompanhar campanhas.'}
            action={!search ? { label: 'Novo Workspace', href: '/agency/workspaces/new' } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-dark-50">
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-5 py-3">Nome</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-5 py-3">Candidato</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-5 py-3">Cidade/UF</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-5 py-3">Status</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-5 py-3">Membros</th>
                  <th className="text-left text-xs uppercase text-dark-300 font-heading px-5 py-3">Última Atividade</th>
                  <th className="text-right text-xs uppercase text-dark-300 font-heading px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, idx) => (
                  <tr
                    key={w.id}
                    className={cn(
                      'border-t border-border/50 transition-colors hover:bg-primary-50',
                      idx % 2 === 1 && 'bg-dark-50/30',
                    )}
                  >
                    <td className="px-5 py-3 font-body text-sm text-dark-700 font-medium">{w.name}</td>
                    <td className="px-5 py-3 font-body text-sm text-dark-500">{w.candidate_name || '-'}</td>
                    <td className="px-5 py-3 font-body text-sm text-dark-500">
                      {w.city && w.state ? `${w.city}/${w.state}` : w.city || w.state || '-'}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge active={w.is_active} />
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-dark-500">{w.member_count}</td>
                    <td className="px-5 py-3 font-body text-sm text-dark-400">{formatDate(w.updated_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenu(openMenu === w.id ? null : w.id)}
                          className="p-1.5 rounded hover:bg-dark-50 text-dark-400 transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenu === w.id && (
                          <ActionsMenu
                            workspace={w}
                            onToggle={() => toggleActive(w)}
                            onClose={() => setOpenMenu(null)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        active
          ? 'bg-success/10 text-success'
          : 'bg-dark-50 text-dark-300',
      )}
    >
      {active ? 'Ativo' : 'Pausado'}
    </span>
  )
}

function ActionsMenu({
  workspace,
  onToggle,
  onClose,
}: {
  workspace: Workspace
  onToggle: () => void
  onClose: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 z-20 bg-surface rounded-lg shadow-lg border border-border/50 py-1 w-48">
        <Link
          href={`/w/${workspace.id}/dashboard`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 font-body text-sm text-dark-600 hover:bg-dark-50 transition-colors w-full"
        >
          <LayoutDashboard size={14} />
          Abrir Dashboard
        </Link>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2 font-body text-sm text-dark-600 hover:bg-dark-50 transition-colors w-full text-left"
        >
          {workspace.is_active ? <Pause size={14} /> : <Play size={14} />}
          {workspace.is_active ? 'Pausar' : 'Ativar'}
        </button>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 font-body text-sm text-dark-200 w-full text-left cursor-not-allowed"
        >
          <Archive size={14} />
          Arquivar
        </button>
      </div>
    </>
  )
}
