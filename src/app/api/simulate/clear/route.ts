import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TABLES_TO_CLEAR = [
  'mentions',
  'metrics_daily',
  'intelligence_alerts',
  'channel_budgets',
  'leads',
  'territorial_interactions',
  'whatsapp_metrics',
  'mobilization_funnel',
  'waste_detections',
  'emerging_terms',
  'share_of_voice',
  'digital_dominance',
  'crisis_events',
  'qr_codes',
]

export async function POST(request: NextRequest) {
  try {
    const { workspaceId } = await request.json()

    if (!workspaceId || typeof workspaceId !== 'string') {
      return NextResponse.json({ error: 'workspace_id é obrigatório' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let clearedCount = 0
    for (const table of TABLES_TO_CLEAR) {
      const { count } = await supabase
        .from(table)
        .delete({ count: 'exact' })
        .eq('workspace_id', workspaceId)

      clearedCount += count ?? 0
    }

    return NextResponse.json({
      success: true,
      clearedRows: clearedCount,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    console.error('Clear error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
