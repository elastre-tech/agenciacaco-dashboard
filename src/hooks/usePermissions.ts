import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PermissionModule, UserPermission } from '@/types/database'

interface PermissionsState {
  permissions: UserPermission[]
  isAgencyMember: boolean
  loading: boolean
  canView: (module: PermissionModule) => boolean
  canEdit: (module: PermissionModule) => boolean
}

export function usePermissions(workspaceId: string): PermissionsState {
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [isAgencyMember, setIsAgencyMember] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchPermissions = useCallback(async () => {
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id

    if (!userId) {
      setLoading(false)
      return
    }

    const { data: agencyMembership } = await supabase
      .from('agency_members')
      .select('role')
      .eq('profile_id', userId)
      .limit(1)
      .maybeSingle()

    if (agencyMembership) {
      setIsAgencyMember(true)
      setLoading(false)
      return
    }

    const { data: perms } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('profile_id', userId)

    setPermissions(perms ?? [])
    setLoading(false)
  }, [workspaceId])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const canView = useCallback((module: PermissionModule): boolean => {
    if (isAgencyMember) return true
    if (permissions.length === 0) return true
    const perm = permissions.find((p) => p.module === module)
    return perm?.can_view ?? true
  }, [isAgencyMember, permissions])

  const canEdit = useCallback((module: PermissionModule): boolean => {
    if (isAgencyMember) return true
    if (permissions.length === 0) return false
    const perm = permissions.find((p) => p.module === module)
    return perm?.can_edit ?? false
  }, [isAgencyMember, permissions])

  return { permissions, isAgencyMember, loading, canView, canEdit }
}
