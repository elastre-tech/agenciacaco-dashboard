import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { PermissionModule } from '@/types/database'

interface PermissionUpdate {
  module: PermissionModule
  can_view: boolean
  can_edit: boolean
}

export async function PUT(request: NextRequest) {
  try {
    const { profileId, workspaceId, permissions } = await request.json() as {
      profileId: string
      workspaceId: string
      permissions: PermissionUpdate[]
    }

    if (!profileId || !workspaceId || !permissions) {
      return NextResponse.json(
        { error: 'profileId, workspaceId e permissions são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const callerId = authData?.user?.id
    if (!callerId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: callerMembership } = await supabase
      .from('agency_members')
      .select('role')
      .eq('profile_id', callerId)
      .limit(1)
      .maybeSingle()

    if (!callerMembership) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const admin = createAdminClient()

    const rows = permissions.map((p) => ({
      workspace_id: workspaceId,
      profile_id: profileId,
      module: p.module,
      can_view: p.can_view,
      can_edit: p.can_edit,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await admin
      .from('user_permissions')
      .upsert(rows, { onConflict: 'workspace_id,profile_id,module' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/users/permissions error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
