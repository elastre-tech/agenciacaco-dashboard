import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string }

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
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

    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : ''}/auth/callback`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email de redefinição enviado para ' + email,
    })
  } catch (err) {
    console.error('POST /api/users/reset-password error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
