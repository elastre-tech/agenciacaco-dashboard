import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserRole {
  isAgencyMember: boolean
  agencyRole: string | null
  workspaceRole: string | null
  loading: boolean
}

export function useUserRole(workspaceId?: string): UserRole {
  const [state, setState] = useState<UserRole>({
    isAgencyMember: false,
    agencyRole: null,
    workspaceRole: null,
    loading: true,
  })

  const fetchRoles = useCallback(async () => {
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id

    if (!userId) {
      setState({ isAgencyMember: false, agencyRole: null, workspaceRole: null, loading: false })
      return
    }

    const { data: agencyMembership } = await supabase
      .from('agency_members')
      .select('role')
      .eq('profile_id', userId)
      .limit(1)
      .maybeSingle()

    let workspaceRole: string | null = null
    if (workspaceId) {
      const { data: wsMembership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('profile_id', userId)
        .eq('workspace_id', workspaceId)
        .limit(1)
        .maybeSingle()

      workspaceRole = wsMembership?.role ?? null
    }

    setState({
      isAgencyMember: !!agencyMembership,
      agencyRole: agencyMembership?.role ?? null,
      workspaceRole,
      loading: false,
    })
  }, [workspaceId])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return state
}
