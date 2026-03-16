import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId')
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId é obrigatório' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const callerId = authData?.user?.id
    if (!callerId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: membership } = await supabase
      .from('agency_members')
      .select('role')
      .eq('profile_id', callerId)
      .limit(1)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const admin = createAdminClient()

    const { data: members, error: membersError } = await admin
      .from('workspace_members')
      .select('profile_id, role')
      .eq('workspace_id', workspaceId)

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 })
    }

    if (!members || members.length === 0) {
      return NextResponse.json({ users: [] })
    }

    const profileIds = members.map((m) => m.profile_id)

    const { data: profiles } = await admin
      .from('profiles')
      .select('id, email, full_name, avatar_url, created_at, updated_at')
      .in('id', profileIds)

    const { data: permissions } = await admin
      .from('user_permissions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .in('profile_id', profileIds)

    const { data: authUsers } = await admin.auth.admin.listUsers()
    const authMap = new Map(
      (authUsers?.users ?? []).map((u) => [u.id, u])
    )

    const isAgencyMemberSet = new Set<string>()
    const { data: agencyMembers } = await admin
      .from('agency_members')
      .select('profile_id')
      .in('profile_id', profileIds)

    agencyMembers?.forEach((am) => isAgencyMemberSet.add(am.profile_id))

    const users = (profiles ?? []).map((profile) => {
      const member = members.find((m) => m.profile_id === profile.id)
      const userPerms = (permissions ?? []).filter((p) => p.profile_id === profile.id)
      const authUser = authMap.get(profile.id)
      const hasSignedIn = !!authUser?.last_sign_in_at

      return {
        ...profile,
        role: member?.role ?? 'unknown',
        is_agency_member: isAgencyMemberSet.has(profile.id),
        status: hasSignedIn ? 'active' : 'pending',
        permissions: userPerms,
      }
    })

    return NextResponse.json({ users })
  } catch (err) {
    console.error('GET /api/users error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
