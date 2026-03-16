import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/client'

const MODULE_LABELS: Record<string, string> = {
  'painel-geral': 'Painel Geral',
  'territorio': 'Território',
  'mobilizacao': 'Mobilização',
  'financas': 'Finanças',
  'social-listening': 'Social Listening',
  'competidores': 'Competidores',
  'risco-crise': 'Risco e Crise',
  'historico': 'Histórico',
}

async function fetchMetricsDaily(workspaceId: string, start: string, end: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('metrics_daily')
    .select('*')
    .eq('workspace_id', workspaceId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })
  return data ?? []
}

async function fetchLeads(workspaceId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(500)
  return data ?? []
}

async function fetchBudgets(workspaceId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('channel_budgets')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('channel', { ascending: true })
  return data ?? []
}

function createMetricsSheet(wb: XLSX.WorkBook, metrics: Record<string, unknown>[]) {
  const rows = metrics.map((m) => ({
    Data: m.date,
    'Alcance Total': m.total_reach,
    Impressões: m.impressions,
    Cliques: m.clicks,
    Leads: m.leads_count,
    CPL: m.cpl,
    'Orçamento Gasto': m.budget_spent,
    'Orçamento Total': m.budget_total,
    'Taxa de Engajamento': m.engagement_rate,
  }))

  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Mensagem: 'Nenhum dado encontrado' }])
  setColumnWidths(ws, rows.length ? Object.keys(rows[0]).length : 1)
  XLSX.utils.book_append_sheet(wb, ws, 'Painel Geral')
}

function createLeadsSheet(wb: XLSX.WorkBook, leads: Record<string, unknown>[]) {
  const rows = leads.map((l) => ({
    Nome: l.full_name,
    Email: l.email ?? '-',
    Telefone: l.phone ?? '-',
    Temperatura: l.temperature,
    Fonte: l.source,
    Bairro: l.neighborhood ?? '-',
    Notas: l.notes ?? '-',
    'Convertido em': l.converted_at ?? '-',
    'Criado em': String(l.created_at ?? '').slice(0, 10),
  }))

  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Mensagem: 'Nenhum dado encontrado' }])
  setColumnWidths(ws, rows.length ? Object.keys(rows[0]).length : 1)
  XLSX.utils.book_append_sheet(wb, ws, 'Mobilização')
}

function createBudgetsSheet(wb: XLSX.WorkBook, budgets: Record<string, unknown>[]) {
  const rows = budgets.map((b) => ({
    Canal: b.channel,
    Alocado: b.allocated,
    Gasto: b.spent,
    Mês: b.month,
  }))

  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Mensagem: 'Nenhum dado encontrado' }])
  setColumnWidths(ws, rows.length ? Object.keys(rows[0]).length : 1)
  XLSX.utils.book_append_sheet(wb, ws, 'Finanças')
}

function createSummarySheet(wb: XLSX.WorkBook, moduleKey: string, label: string) {
  const ws = XLSX.utils.json_to_sheet([
    { Módulo: label, Status: 'Dados detalhados serão adicionados em versões futuras.' },
  ])
  setColumnWidths(ws, 2)
  XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31))
}

function setColumnWidths(ws: XLSX.WorkSheet, colCount: number) {
  ws['!cols'] = Array.from({ length: colCount }, () => ({ wch: 18 }))
}

export async function generateExcel(
  title: string,
  dateRange: { start: string; end: string },
  modules: string[],
  workspaceId: string,
): Promise<Blob> {
  const wb = XLSX.utils.book_new()

  const needsMetrics = modules.includes('painel-geral')
  const needsLeads = modules.includes('mobilizacao')
  const needsBudgets = modules.includes('financas')

  const fetches = await Promise.allSettled([
    needsMetrics ? fetchMetricsDaily(workspaceId, dateRange.start, dateRange.end) : Promise.resolve([]),
    needsLeads ? fetchLeads(workspaceId) : Promise.resolve([]),
    needsBudgets ? fetchBudgets(workspaceId) : Promise.resolve([]),
  ])

  const metricsData = fetches[0].status === 'fulfilled' ? fetches[0].value : []
  const leadsData = fetches[1].status === 'fulfilled' ? fetches[1].value : []
  const budgetsData = fetches[2].status === 'fulfilled' ? fetches[2].value : []

  for (const moduleKey of modules) {
    const label = MODULE_LABELS[moduleKey] ?? moduleKey

    if (moduleKey === 'painel-geral') {
      createMetricsSheet(wb, metricsData as Record<string, unknown>[])
    } else if (moduleKey === 'mobilizacao') {
      createLeadsSheet(wb, leadsData as Record<string, unknown>[])
    } else if (moduleKey === 'financas') {
      createBudgetsSheet(wb, budgetsData as Record<string, unknown>[])
    } else {
      createSummarySheet(wb, moduleKey, label)
    }
  }

  if (wb.SheetNames.length === 0) {
    const ws = XLSX.utils.json_to_sheet([{ Título: title, Período: `${dateRange.start} a ${dateRange.end}` }])
    XLSX.utils.book_append_sheet(wb, ws, 'Resumo')
  }

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
