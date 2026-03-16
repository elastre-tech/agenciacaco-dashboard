import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SCENARIOS } from '@/lib/simulator/scenarios'
import { generateSimulationData, DEFAULT_LISTENING_TERMS } from '@/lib/simulator/generator'

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
    const { scenarioId, workspaceId } = await request.json()

    if (!workspaceId || typeof workspaceId !== 'string') {
      return NextResponse.json({ error: 'workspace_id é obrigatório' }, { status: 400 })
    }

    const scenario = SCENARIOS.find((s) => s.id === scenarioId)
    if (!scenario) {
      return NextResponse.json({ error: 'Cenário não encontrado' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione ao .env.local.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    for (const table of TABLES_TO_CLEAR) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('workspace_id', workspaceId)

      if (error) {
        console.error(`Failed to clear ${table}:`, error.message)
      }
    }

    // Ensure listening terms exist for this workspace (needed for mentions FK)
    const { data: existingTerms } = await supabase
      .from('listening_terms')
      .select('id')
      .eq('workspace_id', workspaceId)

    let termIds = (existingTerms ?? []).map((t) => t.id as string)

    if (termIds.length === 0) {
      const termsToInsert = DEFAULT_LISTENING_TERMS.map((term) => ({
        workspace_id: workspaceId,
        term,
        is_active: true,
      }))
      const { data: newTerms } = await supabase
        .from('listening_terms')
        .insert(termsToInsert)
        .select('id')

      termIds = (newTerms ?? []).map((t) => t.id as string)
    }

    const data = generateSimulationData(scenario, workspaceId, termIds)

    const insertions: { table: string; count: number }[] = []

    const inserts = [
      { table: 'metrics_daily', rows: data.metricsDaily },
      { table: 'intelligence_alerts', rows: data.intelligenceAlerts },
      { table: 'channel_budgets', rows: data.channelBudgets },
      { table: 'leads', rows: data.leads },
      { table: 'territorial_interactions', rows: data.territorialInteractions },
      { table: 'whatsapp_metrics', rows: data.whatsappMetrics },
      { table: 'mobilization_funnel', rows: data.mobilizationFunnel },
      { table: 'waste_detections', rows: data.wasteDetections },
      { table: 'mentions', rows: data.mentions },
      { table: 'emerging_terms', rows: data.emergingTerms },
      { table: 'share_of_voice', rows: data.shareOfVoice },
      { table: 'digital_dominance', rows: data.digitalDominance },
      { table: 'crisis_events', rows: data.crisisEvents },
      { table: 'qr_codes', rows: data.qrCodes },
    ]

    for (const { table, rows } of inserts) {
      if (rows.length === 0) continue

      const { error } = await supabase.from(table).insert(rows)

      if (error) {
        console.error(`Failed to insert into ${table}:`, error.message)
        return NextResponse.json(
          { error: `Erro ao inserir em ${table}: ${error.message}` },
          { status: 500 }
        )
      }

      insertions.push({ table, count: rows.length })
    }

    return NextResponse.json({
      success: true,
      scenario: scenario.label,
      insertions,
      totalRows: insertions.reduce((sum, i) => sum + i.count, 0),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    console.error('Simulation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
