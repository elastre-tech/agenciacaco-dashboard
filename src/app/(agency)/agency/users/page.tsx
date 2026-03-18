'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  UserCog,
  UserPlus,
  Loader2,
  MoreVertical,
  ChevronDown,
  Shield,
  KeyRound,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import { TablePageSkeleton, SkeletonTable } from '@/components/ui/Skeleton'
import type { UserPermission } from '@/types/database'
import CreateUserModal from '@/components/agency/CreateUserModal'
import PermissionsModal from '@/components/agency/PermissionsModal'

interface WorkspaceOption {
  id: string
  name: string
  candidate_name: string
}

interface WorkspaceUser {
  id: string
  email: string
  full_name: string
  role: string
  is_agency_member: boolean
  status: 'active' | 'pending'
  permissions: UserPermission[]
}

const ROLE_LABELS: Record<string, string> = {
  campaign_coordinator: 'Coordenador',
  intelligence_analyst: 'Analista',
  performance_manager: 'Gestor',
  field_mobilizer: 'Mobilizador',
}

export default function UsersPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([])
  const [workspaceId, setWorkspaceId] = useState('')
  const [loadingWs, setLoadingWs] = useState(true)

  const [users, setUsers] = useState<WorkspaceUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [permUser, setPermUser] = useState<WorkspaceUser | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState<string | null>(null)

  const fetchWorkspaces = useCallback(async () => {
    const supabase = createClient()
    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) return

      const { data: memberships } = await supabase
        .from('agency_members')
        .select('agency_id')
        .eq('profile_id', user.id)

      if (!memberships || memberships.length === 0) return

      const agencyIds = Array.from(new Set(memberships.map((m) => m.agency_id)))

      const { data } = await supabase
        .from('workspaces')
        .select('id, name, candidate_name')
        .in('agency_id', agencyIds)
        .eq('is_active', true)
        .order('name')

      const ws = (data ?? []) as WorkspaceOption[]
      setWorkspaces(ws)
      if (ws.length > 0) setWorkspaceId(ws[0].id)
    } catch {
      console.error('Failed to fetch workspaces')
    } finally {
      setLoadingWs(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    if (!workspaceId) return
    setLoadingUsers(true)

    try {
      const res = await fetch(`/api/users?workspaceId=${workspaceId}`)
      const data = await res.json()
      setUsers(data.users ?? [])
    } catch {
      console.error('Failed to fetch users')
    } finally {
      setLoadingUsers(false)
    }
  }, [workspaceId])

  useEffect(() => { fetchWorkspaces() }, [fetchWorkspaces])
  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleResetPassword(user: WorkspaceUser) {
    setResetLoading(user.id)
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      if (res.ok) {
        alert(`Email de redefinição enviado para ${user.email}`)
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao enviar email')
      }
    } catch {
      alert('Erro de conexão')
    } finally {
      setResetLoading(null)
      setActionMenuId(null)
    }
  }

  const selectedWs = workspaces.find((w) => w.id === workspaceId)

  if (loadingWs) {
    return <TablePageSkeleton cols={6} />
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <UserCog size={48} className="text-dark-200 mb-4" />
        <h3 className="font-heading font-semibold text-dark-700 mb-1">Nenhum workspace encontrado</h3>
        <p className="font-body text-sm text-dark-300">Crie um workspace primeiro para gerenciar usuários.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Gerenciamento de Usuários
          </h2>
          <p className="font-body text-sm text-dark-300">
            Crie usuários, defina cargos e controle permissões por módulo.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={!workspaceId}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors disabled:opacity-50"
        >
          <UserPlus size={16} />
          Criar Usuário
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="font-body text-sm text-dark-400 whitespace-nowrap">Workspace:</label>
        <div className="relative">
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[240px]"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name} — {ws.candidate_name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 pointer-events-none" />
        </div>
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border/50 overflow-hidden">
        {loadingUsers ? (
          <SkeletonTable cols={6} rows={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Nome</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Cargo</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Permissões</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user, idx) => {
                  const viewCount = user.permissions.filter((p) => p.can_view).length
                  const editCount = user.permissions.filter((p) => p.can_edit).length
                  const permSummary = user.is_agency_member
                    ? 'Acesso total'
                    : user.permissions.length === 0
                      ? 'Padrão'
                      : `${viewCount} ver · ${editCount} editar`

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        'transition-colors hover:bg-primary-50',
                        idx % 2 === 1 && 'bg-dark-50/30'
                      )}
                    >
                      <td className="px-5 py-3.5 font-body text-sm text-dark-700 font-medium">
                        {user.full_name || 'Sem nome'}
                      </td>
                      <td className="px-5 py-3.5 font-body text-sm text-dark-400">
                        {user.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium font-body bg-info/10 text-info">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {user.status === 'active' ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium font-body bg-success/10 text-success">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium font-body bg-warning/10 text-warning">
                            Convite Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-body text-xs text-dark-400">
                        {permSummary}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {!user.is_agency_member && (
                          <div className="relative inline-block">
                            <button
                              onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                              className="p-1.5 rounded hover:bg-dark-50 transition-colors"
                            >
                              <MoreVertical size={16} className="text-dark-400" />
                            </button>
                            {actionMenuId === user.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-lg shadow-lg border border-border z-20">
                                <button
                                  onClick={() => {
                                    setPermUser(user)
                                    setActionMenuId(null)
                                  }}
                                  className="w-full text-left px-4 py-2.5 font-body text-sm text-dark-700 hover:bg-dark-50 rounded-t-lg transition-colors flex items-center gap-2"
                                >
                                  <Shield size={14} />
                                  Permissões
                                </button>
                                <button
                                  onClick={() => handleResetPassword(user)}
                                  disabled={resetLoading === user.id}
                                  className="w-full text-left px-4 py-2.5 font-body text-sm text-dark-700 hover:bg-dark-50 rounded-b-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                  {resetLoading === user.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <KeyRound size={14} />
                                  )}
                                  Redefinir Senha
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 && !loadingUsers && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center font-body text-sm text-dark-300">
                      Nenhum usuário neste workspace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && selectedWs && (
        <CreateUserModal
          workspaceId={workspaceId}
          workspaceName={selectedWs.name}
          onClose={() => setShowCreate(false)}
          onCreated={fetchUsers}
        />
      )}

      {permUser && (
        <PermissionsModal
          profileId={permUser.id}
          workspaceId={workspaceId}
          userName={permUser.full_name || permUser.email}
          currentPermissions={permUser.permissions}
          onClose={() => setPermUser(null)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  )
}
