'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Users,
  Crown,
  ShieldCheck,
  Clock,
  UserPlus,
  X,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/format'
import KPICard from '@/components/ui/KPICard'

interface AgencyMember {
  id: string
  agency_id: string
  profile_id: string
  role: 'agency_owner' | 'agency_admin'
  invited_at: string
  accepted_at: string | null
  profile?: {
    full_name: string | null
    email: string
  }
}

const ROLE_CONFIG = {
  agency_owner: {
    label: 'Proprietário',
    bg: 'bg-primary/10',
    text: 'text-primary-700',
  },
  agency_admin: {
    label: 'Administrador',
    bg: 'bg-info/10',
    text: 'text-info',
  },
} as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AgencyTeamPage() {
  const [members, setMembers] = useState<AgencyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'agency_owner' | 'agency_admin'>('agency_admin')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    const supabase = createClient()

    try {
      const { data: userData } = await supabase.auth.getUser()
      let query = supabase
        .from('agency_members')
        .select('*, profile:profiles(full_name, email)')

      if (userData?.user) {
        const { data: myMembership } = await supabase
          .from('agency_members')
          .select('agency_id')
          .eq('profile_id', userData.user.id)
          .limit(1)
          .single()

        if (myMembership) {
          query = query.eq('agency_id', myMembership.agency_id)
        }
      }

      const { data } = await query.order('invited_at', { ascending: true })
      setMembers((data as AgencyMember[]) ?? [])
    } catch {
      console.error('Failed to fetch team members')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const kpis = useMemo(() => ({
    total: members.length,
    owners: members.filter((m) => m.role === 'agency_owner').length,
    admins: members.filter((m) => m.role === 'agency_admin').length,
    pending: members.filter((m) => !m.accepted_at).length,
  }), [members])

  async function handleInvite() {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    setInviteError('')

    const supabase = createClient()

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.trim().toLowerCase())
        .single()

      if (!profile) {
        setInviteError('Perfil não encontrado para este email.')
        setInviteLoading(false)
        return
      }

      const agencyId = members[0]?.agency_id
      if (!agencyId) {
        setInviteError('Agência não encontrada.')
        setInviteLoading(false)
        return
      }

      const { error } = await supabase.from('agency_members').insert({
        agency_id: agencyId,
        profile_id: profile.id,
        role: inviteRole,
        invited_at: new Date().toISOString(),
      })

      if (error) {
        setInviteError('Erro ao enviar convite. O membro já pode existir.')
        setInviteLoading(false)
        return
      }

      setShowInvite(false)
      setInviteEmail('')
      setInviteRole('agency_admin')
      await fetchMembers()
    } catch {
      console.error('Failed to send invite')
      setInviteError('Erro inesperado ao enviar convite.')
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleToggleRole(member: AgencyMember) {
    const supabase = createClient()
    const newRole = member.role === 'agency_owner' ? 'agency_admin' : 'agency_owner'

    try {
      await supabase
        .from('agency_members')
        .update({ role: newRole })
        .eq('id', member.id)

      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
      )
    } catch {
      console.error('Failed to update member role')
    }

    setActionMenuId(null)
  }

  async function handleDeactivate(memberId: string) {
    const supabase = createClient()

    try {
      await supabase.from('agency_members').delete().eq('id', memberId)
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    } catch {
      console.error('Failed to deactivate member')
    }

    setActionMenuId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-dark-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dark-700 mb-1">
            Equipe da Ag&ecirc;ncia
          </h2>
          <p className="font-body text-sm text-dark-300">
            Gerencie membros e permiss&otilde;es da sua ag&ecirc;ncia.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors"
        >
          <UserPlus size={16} />
          Convidar Membro
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total de Membros" value={String(kpis.total)} icon={Users} />
        <KPICard label="Proprietários" value={String(kpis.owners)} icon={Crown} />
        <KPICard label="Administradores" value={String(kpis.admins)} icon={ShieldCheck} />
        <KPICard label="Convites Pendentes" value={String(kpis.pending)} icon={Clock} />
      </div>

      <div className="bg-surface rounded-card shadow-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Cargo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">Convidado em</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-dark-300 uppercase tracking-wider font-heading">A&ccedil;&otilde;es</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {members.map((member, idx) => {
                const role = ROLE_CONFIG[member.role]
                const accepted = !!member.accepted_at
                const name = member.profile?.full_name || 'Sem nome'
                const email = member.profile?.email || '-'

                return (
                  <tr
                    key={member.id}
                    className={cn(
                      'transition-colors hover:bg-primary-50',
                      idx % 2 === 1 && 'bg-dark-50/30'
                    )}
                  >
                    <td className="px-5 py-3.5 font-body text-sm text-dark-700 font-medium">{name}</td>
                    <td className="px-5 py-3.5 font-body text-sm text-dark-400">{email}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-medium font-body', role.bg, role.text)}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {accepted ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium font-body bg-success/10 text-success">Ativo</span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium font-body bg-warning/10 text-warning">Pendente</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-body text-sm text-dark-400">{formatDate(member.invited_at)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenuId(actionMenuId === member.id ? null : member.id)}
                          className="p-1.5 rounded hover:bg-dark-50 transition-colors"
                        >
                          <MoreVertical size={16} className="text-dark-400" />
                        </button>
                        {actionMenuId === member.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-surface rounded-lg shadow-lg border border-border z-20">
                            <button
                              onClick={() => handleToggleRole(member)}
                              className="w-full text-left px-4 py-2.5 font-body text-sm text-dark-700 hover:bg-dark-50 rounded-t-lg transition-colors"
                            >
                              Alterar Cargo
                            </button>
                            <button
                              onClick={() => handleDeactivate(member.id)}
                              className="w-full text-left px-4 py-2.5 font-body text-sm text-danger hover:bg-danger/5 rounded-b-lg transition-colors"
                            >
                              Desativar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-body text-sm text-dark-300">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-dark-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card shadow-card border border-border/50 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-dark-700 text-lg">Convidar Membro</h3>
              <button
                onClick={() => { setShowInvite(false); setInviteError('') }}
                className="p-1.5 rounded hover:bg-dark-50 transition-colors"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="membro@exemplo.com"
                  className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">Cargo</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'agency_owner' | 'agency_admin')}
                  className="w-full px-4 py-3 rounded-lg border border-dark-100 bg-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="agency_admin">Administrador</option>
                  <option value="agency_owner">Proprietário</option>
                </select>
              </div>

              {inviteError && (
                <p className="font-body text-sm text-danger">{inviteError}</p>
              )}

              <button
                onClick={handleInvite}
                disabled={inviteLoading || !inviteEmail.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-dark font-heading font-semibold text-sm hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteLoading && <Loader2 size={16} className="animate-spin" />}
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
