import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { ALL_MODULES, type PermissionModule } from '@/types/database'

interface PermissionInput {
  module: PermissionModule
  can_view: boolean
  can_edit: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, workspaceId, role, permissions } = await request.json() as {
      fullName: string
      email: string
      workspaceId: string
      role: string
      permissions?: PermissionInput[]
    }

    if (!fullName || !email || !workspaceId || !role) {
      return NextResponse.json(
        { error: 'fullName, email, workspaceId e role são obrigatórios' },
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
      return NextResponse.json({ error: 'Acesso negado — apenas membros da agência' }, { status: 403 })
    }

    const admin = createAdminClient()

    const { data: invite, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
    })

    if (inviteError) {
      if (inviteError.message?.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado no sistema' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    const userId = invite.user.id

    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
    }

    const { error: memberError } = await admin
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        profile_id: userId,
        role,
      })

    if (memberError) {
      console.error('Workspace member insert error:', memberError)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    const permRows = (permissions ?? ALL_MODULES.map((m) => ({
      module: m,
      can_view: true,
      can_edit: false,
    }))).map((p) => ({
      workspace_id: workspaceId,
      profile_id: userId,
      module: p.module,
      can_view: p.can_view,
      can_edit: p.can_edit,
    }))

    const { error: permError } = await admin
      .from('user_permissions')
      .insert(permRows)

    if (permError) {
      console.error('Permissions insert error:', permError)
    }

    return NextResponse.json({
      success: true,
      userId,
      message: 'Convite enviado para ' + email,
    })
  } catch (err) {
    console.error('POST /api/users/create error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
