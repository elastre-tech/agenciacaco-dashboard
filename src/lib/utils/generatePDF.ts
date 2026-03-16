import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { createClient } from '@/lib/supabase/client'

interface AutoTableDoc extends jsPDF {
  autoTable: (options: Record<string, unknown>) => void
  lastAutoTable: { finalY: number }
}

const PRIMARY_COLOR = '#FFD100'
const DARK_COLOR = '#1A1A1A'
const HEADER_HEIGHT = 40

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

function addBrandedHeader(doc: jsPDF, title: string, dateRange: { start: string; end: string }) {
  doc.setFillColor(PRIMARY_COLOR)
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), HEADER_HEIGHT, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(DARK_COLOR)
  doc.text('Dashboard 360', 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(title, 14, 28)

  const rangeText = `${dateRange.start} — ${dateRange.end}`
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.text(rangeText, pageWidth - 14 - doc.getTextWidth(rangeText), 28)
}

function addSectionHeader(doc: jsPDF, label: string, yPos: number): number {
  if (yPos > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage()
    yPos = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(DARK_COLOR)
  doc.text(label, 14, yPos)

  doc.setDrawColor(PRIMARY_COLOR)
  doc.setLineWidth(0.8)
  doc.line(14, yPos + 2, 80, yPos + 2)

  return yPos + 10
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
    .limit(100)
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

function addMetricsTable(doc: jsPDF, metrics: Record<string, unknown>[], startY: number): number {
  if (!metrics.length) return startY + 6

  const rows = metrics.map((m) => [
    String(m.date ?? ''),
    Number(m.total_reach ?? 0).toLocaleString('pt-BR'),
    Number(m.impressions ?? 0).toLocaleString('pt-BR'),
    Number(m.clicks ?? 0).toLocaleString('pt-BR'),
    Number(m.leads_count ?? 0).toLocaleString('pt-BR'),
    `R$ ${Number(m.cpl ?? 0).toFixed(2)}`,
  ])

  ;(doc as AutoTableDoc).autoTable({
    startY,
    head: [['Data', 'Alcance', 'Impressões', 'Cliques', 'Leads', 'CPL']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 209, 0], textColor: [26, 26, 26], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 8
}

function addLeadsTable(doc: jsPDF, leads: Record<string, unknown>[], startY: number): number {
  if (!leads.length) return startY + 6

  const rows = leads.slice(0, 30).map((l) => [
    String(l.full_name ?? ''),
    String(l.temperature ?? ''),
    String(l.source ?? ''),
    String(l.neighborhood ?? '-'),
    String(l.created_at ?? '').slice(0, 10),
  ])

  ;(doc as AutoTableDoc).autoTable({
    startY,
    head: [['Nome', 'Temperatura', 'Fonte', 'Bairro', 'Criado em']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 209, 0], textColor: [26, 26, 26], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 8
}

function addBudgetTable(doc: jsPDF, budgets: Record<string, unknown>[], startY: number): number {
  if (!budgets.length) return startY + 6

  const rows = budgets.map((b) => [
    String(b.channel ?? ''),
    `R$ ${Number(b.allocated ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${Number(b.spent ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    String(b.month ?? ''),
  ])

  ;(doc as AutoTableDoc).autoTable({
    startY,
    head: [['Canal', 'Alocado', 'Gasto', 'Mês']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 209, 0], textColor: [26, 26, 26], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  })

  return (doc as AutoTableDoc).lastAutoTable.finalY + 8
}

function addPlaceholderText(doc: jsPDF, label: string, yPos: number): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Dados do módulo "${label}" serão exibidos aqui quando disponíveis.`, 14, yPos)
  return yPos + 10
}

export async function generatePDF(
  title: string,
  dateRange: { start: string; end: string },
  modules: string[],
  workspaceId: string,
): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  addBrandedHeader(doc, title, dateRange)

  let yPos = HEADER_HEIGHT + 12

  const dataCache: Record<string, unknown[]> = {}

  const needsMetrics = modules.includes('painel-geral')
  const needsLeads = modules.includes('mobilizacao')
  const needsBudgets = modules.includes('financas')

  const fetches = await Promise.allSettled([
    needsMetrics ? fetchMetricsDaily(workspaceId, dateRange.start, dateRange.end) : Promise.resolve([]),
    needsLeads ? fetchLeads(workspaceId) : Promise.resolve([]),
    needsBudgets ? fetchBudgets(workspaceId) : Promise.resolve([]),
  ])

  dataCache.metrics = fetches[0].status === 'fulfilled' ? fetches[0].value : []
  dataCache.leads = fetches[1].status === 'fulfilled' ? fetches[1].value : []
  dataCache.budgets = fetches[2].status === 'fulfilled' ? fetches[2].value : []

  for (const moduleKey of modules) {
    const label = MODULE_LABELS[moduleKey] ?? moduleKey
    yPos = addSectionHeader(doc, label, yPos)

    if (moduleKey === 'painel-geral') {
      yPos = addMetricsTable(doc, dataCache.metrics as Record<string, unknown>[], yPos)
    } else if (moduleKey === 'mobilizacao') {
      yPos = addLeadsTable(doc, dataCache.leads as Record<string, unknown>[], yPos)
    } else if (moduleKey === 'financas') {
      yPos = addBudgetTable(doc, dataCache.budgets as Record<string, unknown>[], yPos)
    } else {
      yPos = addPlaceholderText(doc, label, yPos)
    }
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.text(`Dashboard 360 — Página ${i} de ${pageCount}`, 14, pageHeight - 8)
  }

  return doc.output('blob')
}
