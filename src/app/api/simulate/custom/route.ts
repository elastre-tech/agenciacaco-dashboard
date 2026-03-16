import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSimulationData, DEFAULT_LISTENING_TERMS } from '@/lib/simulator/generator'
import type { ScenarioConfig } from '@/lib/simulator/scenarios'

const TABLES_TO_CLEAR = [
  'mentions', 'metrics_daily', 'intelligence_alerts', 'channel_budgets', 'leads',
  'territorial_interactions', 'whatsapp_metrics', 'mobilization_funnel',
  'waste_detections', 'emerging_terms', 'share_of_voice',
  'digital_dominance', 'crisis_events', 'qr_codes',
]

const SYSTEM_PROMPT = `You are a political campaign data simulator for a Brazilian municipal election campaign.
The candidate is Roberto Menezes (PSD), running for mayor of Florianópolis, SC in 2026.
Competitors: Ana Clara Rodrigues (PT), Carlos Eduardo Lima (MDB), Fernanda Bastos (PSOL).

Given a scenario description, generate a JSON configuration object that defines the data profile.
Return ONLY valid JSON, no markdown, no explanation.

The JSON must follow this exact structure:
{
  "id": "custom",
  "label": "Short label in Portuguese",
  "description": "One sentence description in Portuguese",
  "emoji": "one emoji",
  "metrics": {
    "reachBase": number (daily reach, 10000-500000),
    "reachTrend": "up" | "down" | "flat" | "spike",
    "cplBase": number (cost per lead in BRL, 1.5-25.0),
    "cplTrend": "up" | "down" | "flat" | "spike",
    "leadsBase": number (daily leads, 10-800),
    "leadsTrend": "up" | "down" | "flat" | "spike",
    "budgetTotal": number (total budget BRL, 50000-300000),
    "budgetSpentRatio": number (0.1-0.95),
    "engagementBase": number (percentage, 0.5-15.0),
    "volatility": number (0.05-0.40)
  },
  "alerts": [array of 2-6 alerts, each: {
    "title": "string in Portuguese",
    "description": "detailed description in Portuguese",
    "severity": "critical" | "high" | "medium" | "low",
    "status": "active" | "acknowledged" | "resolved",
    "source": "string",
    "hoursAgo": number (0-72)
  }],
  "leads": {
    "total": number (100-2000),
    "hotRatio": number (0.05-0.50),
    "warmRatio": number (0.20-0.50),
    "coldRatio": number (remaining to sum to 1.0),
    "recentConversionRate": number (0.02-0.35)
  },
  "sentiment": {
    "positiveRatio": number (0.05-0.90),
    "negativeRatio": number (0.05-0.80),
    "neutralRatio": number (remaining to sum to 1.0),
    "mentionsPerDay": number (20-3000),
    "emergingTerms": [array of 2-5: {"term": "string", "growth": number (5-5000)}]
  },
  "crisis": {
    "events": [array of 0-4 events: {
      "title": "string in Portuguese",
      "description": "string in Portuguese",
      "severity": "critical" | "high" | "medium" | "low",
      "status": "monitoring" | "escalated" | "contained" | "resolved",
      "impact": number (1.0-10.0),
      "daysAgo": number (0-7)
    }]
  },
  "waste": {
    "detections": [array of 0-5: {
      "channel": "string",
      "amount": number (100-10000),
      "reason": "string in Portuguese",
      "daysAgo": number (0-7),
      "resolved": boolean
    }]
  }
}

Make the data realistic and internally consistent. If the scenario is a crisis, metrics should reflect it (high CPL, low leads, negative sentiment). If it's positive, the opposite. Be creative with alerts and emerging terms that match the scenario.`

export async function POST(request: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 400 })
  }

  try {
    const { prompt, workspaceId } = await request.json()

    if (!workspaceId || typeof workspaceId !== 'string') {
      return NextResponse.json({ error: 'workspace_id é obrigatório' }, { status: 400 })
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return NextResponse.json({ error: 'Prompt muito curto' }, { status: 400 })
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text()
      console.error('Anthropic API error:', errBody)
      return NextResponse.json({ error: 'Erro na API Claude' }, { status: 500 })
    }

    const aiResult = await anthropicResponse.json()
    const textBlock = aiResult.content?.find((b: { type: string }) => b.type === 'text')
    if (!textBlock) {
      return NextResponse.json({ error: 'Resposta vazia da IA' }, { status: 500 })
    }

    let scenarioConfig: ScenarioConfig
    try {
      scenarioConfig = JSON.parse(textBlock.text)
    } catch {
      console.error('Failed to parse AI response:', textBlock.text)
      return NextResponse.json({ error: 'IA retornou JSON inválido' }, { status: 500 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    for (const table of TABLES_TO_CLEAR) {
      await supabase.from(table).delete().eq('workspace_id', workspaceId)
    }

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

    const data = generateSimulationData(scenarioConfig, workspaceId, termIds)

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

    const insertions: { table: string; count: number }[] = []
    for (const { table, rows } of inserts) {
      if (rows.length === 0) continue
      const { error } = await supabase.from(table).insert(rows)
      if (error) {
        console.error(`Failed to insert into ${table}:`, error.message)
        return NextResponse.json({ error: `Erro ao inserir em ${table}: ${error.message}` }, { status: 500 })
      }
      insertions.push({ table, count: rows.length })
    }

    return NextResponse.json({
      success: true,
      scenario: scenarioConfig.label,
      description: scenarioConfig.description,
      insertions,
      totalRows: insertions.reduce((sum, i) => sum + i.count, 0),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    console.error('Custom simulation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY
  return NextResponse.json({ available: hasKey })
}
