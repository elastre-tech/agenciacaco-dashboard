import type { ScenarioConfig } from './scenarios'

const NEIGHBORHOODS = [
  'Centro', 'Trindade', 'Agronômica', 'Itacorubi', 'Córrego Grande',
  'Santa Mônica', 'Pantanal', 'Saco dos Limões', 'Costeira do Pirajubaé',
  'Carianos', 'Ribeirão da Ilha', 'Campeche', 'Armação', 'Pântano do Sul',
  'Rio Tavares', 'Lagoa da Conceição', 'Barra da Lagoa', 'Ingleses',
  'Canasvieiras', 'Jurerê', 'Estreito', 'Capoeiras', 'Coqueiros',
  'Abraão', 'Balneário', 'Kobrasol', 'Campinas', 'Santo Antônio de Lisboa',
]

const COORDS: Record<string, [number, number]> = {
  'Centro': [-27.5954, -48.5480],
  'Trindade': [-27.5870, -48.5210],
  'Agronômica': [-27.5830, -48.5380],
  'Itacorubi': [-27.5780, -48.5080],
  'Lagoa da Conceição': [-27.5970, -48.4650],
  'Ingleses': [-27.4350, -48.3940],
  'Canasvieiras': [-27.4270, -48.4620],
  'Estreito': [-27.5940, -48.5700],
  'Capoeiras': [-27.5990, -48.5770],
  'Coqueiros': [-27.5870, -48.5770],
  'Campeche': [-27.6690, -48.4800],
  'Ribeirão da Ilha': [-27.7100, -48.5660],
  'Santo Antônio de Lisboa': [-27.5090, -48.5220],
}

const LEAD_NAMES = [
  'João Pedro Silva', 'Maria Fernanda Costa', 'Carlos Eduardo Santos',
  'Ana Luísa Oliveira', 'Pedro Henrique Lima', 'Juliana Martins',
  'Rafael Almeida', 'Camila Rodrigues', 'Lucas Barbosa', 'Fernanda Pereira',
  'Gustavo Souza', 'Isabela Carvalho', 'Thiago Ribeiro', 'Larissa Gonçalves',
  'Bruno Nascimento', 'Patrícia Araujo', 'Diego Moreira', 'Amanda Correia',
  'Vinícius Teixeira', 'Bianca Ferreira', 'Matheus Dias', 'Carolina Lopes',
  'Leonardo Cardoso', 'Gabriela Mendes', 'André Vieira', 'Natália Castro',
  'Felipe Rocha', 'Letícia Nunes', 'Ricardo Freitas', 'Mariana Azevedo',
  'Rodrigo Campos', 'Vanessa Monteiro', 'Daniel Pinto', 'Priscila Ramos',
  'Marcelo Cunha', 'Tatiana Melo', 'Eduardo Batista', 'Aline Fonseca',
  'Caio Guimarães', 'Renata Macedo', 'Guilherme Duarte', 'Paula Andrade',
  'Henrique Moura', 'Débora Gomes', 'Alexandre Brito', 'Cláudia Xavier',
  'Fabrício Leal', 'Jéssica Prado', 'Leandro Coelho', 'Simone Medeiros',
]

const SOURCES = ['Instagram', 'Facebook', 'WhatsApp', 'Google Ads', 'Evento Presencial', 'Indicação', 'Website', 'TikTok']
const MENTION_SOURCES = ['twitter', 'instagram', 'facebook', 'portal_noticias', 'blog', 'youtube', 'tiktok', 'reddit']

const DEFAULT_LISTENING_TERMS = [
  'Roberto Menezes',
  'Prefeito Florianópolis',
  '#RobertoFaz',
  'eleições 2026 floripa',
  'PSD Florianópolis',
  'Ana Clara Rodrigues',
  'Carlos Eduardo Lima',
  'Fernanda Bastos',
]

const COMPETITORS = [
  { name: 'Ana Clara Rodrigues', party: 'PT' },
  { name: 'Carlos Eduardo Lima', party: 'MDB' },
  { name: 'Fernanda Bastos', party: 'PSOL' },
]

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function hoursAgo(n: number): Date {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function applyTrend(base: number, dayIndex: number, totalDays: number, trend: string, volatility: number): number {
  const progress = dayIndex / totalDays
  const noise = 1 + (Math.random() - 0.5) * volatility * 2

  // Weekend dip
  const date = daysAgo(totalDays - dayIndex)
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const weekendFactor = isWeekend ? 0.7 : 1

  let trendMultiplier = 1
  switch (trend) {
    case 'up':
      trendMultiplier = 0.6 + progress * 0.8
      break
    case 'down':
      trendMultiplier = 1.4 - progress * 0.8
      break
    case 'spike':
      trendMultiplier = progress < 0.7 ? 0.5 + progress * 0.5 : 0.85 + (progress - 0.7) * 5
      break
    case 'flat':
    default:
      trendMultiplier = 1
      break
  }

  return Math.max(0, base * trendMultiplier * noise * weekendFactor)
}

export { DEFAULT_LISTENING_TERMS }

export function generateSimulationData(scenario: ScenarioConfig, workspaceId: string, termIds?: string[]) {
  const { metrics, alerts, leads, sentiment, crisis, waste } = scenario
  const days = 30
  const now = new Date()

  const metricsDaily = Array.from({ length: days }, (_, i) => {
    const reach = Math.round(applyTrend(metrics.reachBase, i, days, metrics.reachTrend, metrics.volatility))
    const leadsCount = Math.round(applyTrend(metrics.leadsBase, i, days, metrics.leadsTrend, metrics.volatility))
    const cpl = Number(applyTrend(metrics.cplBase, i, days, metrics.cplTrend, metrics.volatility).toFixed(2))
    const budgetSpent = Number((metrics.budgetTotal * metrics.budgetSpentRatio * (i + 1) / days).toFixed(2))
    const engagement = Number(applyTrend(metrics.engagementBase, i, days, 'flat', metrics.volatility).toFixed(2))

    return {
      workspace_id: workspaceId,
      date: dateStr(daysAgo(days - i)),
      total_reach: reach,
      impressions: Math.round(reach * rand(1.8, 2.5)),
      clicks: Math.round(reach * rand(0.02, 0.06)),
      leads_count: leadsCount,
      cpl,
      budget_spent: budgetSpent,
      budget_total: metrics.budgetTotal,
      engagement_rate: engagement,
    }
  })

  const intelligenceAlerts = alerts.map((a) => ({
    workspace_id: workspaceId,
    title: a.title,
    description: a.description,
    severity: a.severity,
    status: a.status,
    source: a.source,
    created_at: hoursAgo(a.hoursAgo).toISOString(),
    resolved_at: a.status === 'resolved' ? hoursAgo(Math.max(0, a.hoursAgo - randInt(2, 12))).toISOString() : null,
  }))

  const channelBudgets = [
    { channel: 'Meta Ads', ratio: 0.35 },
    { channel: 'Google Ads', ratio: 0.25 },
    { channel: 'WhatsApp', ratio: 0.15 },
    { channel: 'Operações de Campo', ratio: 0.15 },
    { channel: 'Eventos', ratio: 0.10 },
  ].map((ch) => ({
    workspace_id: workspaceId,
    channel: ch.channel,
    allocated: Number((metrics.budgetTotal * ch.ratio).toFixed(2)),
    spent: Number((metrics.budgetTotal * ch.ratio * metrics.budgetSpentRatio * rand(0.8, 1.2)).toFixed(2)),
    month: dateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
  }))

  const leadsData = Array.from({ length: leads.total }, (_, i) => {
    let temperature: 'hot' | 'warm' | 'cold'
    const r = Math.random()
    if (r < leads.hotRatio) temperature = 'hot'
    else if (r < leads.hotRatio + leads.warmRatio) temperature = 'warm'
    else temperature = 'cold'

    const createdDaysAgo = Math.floor(Math.random() * 30)
    const converted = temperature === 'hot' && Math.random() < leads.recentConversionRate

    return {
      workspace_id: workspaceId,
      full_name: LEAD_NAMES[i % LEAD_NAMES.length],
      email: `lead${i + 1}@email.com`,
      phone: `(48) 9${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
      temperature,
      source: pick(SOURCES),
      neighborhood: pick(NEIGHBORHOODS),
      notes: null,
      converted_at: converted ? daysAgo(Math.max(0, createdDaysAgo - randInt(1, 5))).toISOString() : null,
      created_at: daysAgo(createdDaysAgo).toISOString(),
    }
  })

  const territorialInteractions = Array.from({ length: 40 }, () => {
    const hood = pick(NEIGHBORHOODS)
    const coords = COORDS[hood] ?? [-27.5954 + rand(-0.08, 0.08), -48.5480 + rand(-0.08, 0.08)]

    return {
      workspace_id: workspaceId,
      latitude: Number((coords[0] + rand(-0.005, 0.005)).toFixed(7)),
      longitude: Number((coords[1] + rand(-0.005, 0.005)).toFixed(7)),
      neighborhood: hood,
      interaction_type: pick(['door_to_door', 'event', 'qr_scan', 'form', 'whatsapp']),
      notes: null,
      recorded_at: daysAgo(randInt(0, 29)).toISOString(),
    }
  })

  const whatsappMetrics = Array.from({ length: days }, (_, i) => {
    const sent = randInt(200, 600)
    const delivered = Math.round(sent * rand(0.88, 0.96))
    const read = Math.round(delivered * rand(0.55, 0.78))
    return {
      workspace_id: workspaceId,
      date: dateStr(daysAgo(days - i)),
      messages_sent: sent,
      messages_delivered: delivered,
      messages_read: read,
      responses: Math.round(read * rand(0.08, 0.22)),
      opt_outs: randInt(0, 8),
    }
  })

  const funnelStages = ['awareness', 'interest', 'consideration', 'action', 'advocate']
  const mobilizationFunnel = funnelStages.map((stage, i) => ({
    workspace_id: workspaceId,
    stage,
    count: Math.round(leads.total * (1 - i * 0.18) * rand(0.85, 1.15)),
    date: dateStr(now),
  }))

  const wasteDetections = waste.detections.map((w) => ({
    workspace_id: workspaceId,
    channel: w.channel,
    amount: w.amount,
    reason: w.reason,
    detected_at: daysAgo(w.daysAgo).toISOString(),
    resolved: w.resolved,
  }))

  const totalMentions = sentiment.mentionsPerDay * 15
  const availableTermIds = termIds && termIds.length > 0 ? termIds : []
  const mentions = availableTermIds.length === 0 ? [] : Array.from({ length: Math.min(totalMentions, 200) }, () => {
    let sentimentValue: 'positive' | 'negative' | 'neutral'
    const r = Math.random()
    if (r < sentiment.positiveRatio) sentimentValue = 'positive'
    else if (r < sentiment.positiveRatio + sentiment.negativeRatio) sentimentValue = 'negative'
    else sentimentValue = 'neutral'

    return {
      workspace_id: workspaceId,
      term_id: pick(availableTermIds),
      source: pick(MENTION_SOURCES),
      content: null,
      sentiment: sentimentValue,
      author: `@user_${randInt(1000, 99999)}`,
      url: null,
      published_at: daysAgo(randInt(0, 14)).toISOString(),
    }
  })

  const emergingTerms = sentiment.emergingTerms.map((t) => ({
    workspace_id: workspaceId,
    term: t.term,
    frequency: Math.round(t.growth * rand(5, 15)),
    growth_rate: Math.min(t.growth, 999.99),
    first_seen_at: daysAgo(randInt(3, 14)).toISOString(),
    last_seen_at: hoursAgo(randInt(0, 12)).toISOString(),
  }))

  const candidateName = 'Roberto Menezes'
  const allCandidates = [
    { name: candidateName, party: 'PSD' },
    ...COMPETITORS,
  ]

  const shareOfVoice = []
  for (let weekIdx = 0; weekIdx < 4; weekIdx++) {
    const periodStart = daysAgo((4 - weekIdx) * 7)
    const periodEnd = daysAgo((3 - weekIdx) * 7)
    for (const candidate of allCandidates) {
      const isMain = candidate.name === candidateName
      let mentionsCount: number
      let sentimentScore: number

      if (isMain) {
        mentionsCount = Math.round(sentiment.mentionsPerDay * 7 * rand(0.35, 0.5))
        sentimentScore = Number(Math.max(-9.99, Math.min(9.99, sentiment.positiveRatio - sentiment.negativeRatio)).toFixed(2))
      } else {
        mentionsCount = Math.round(sentiment.mentionsPerDay * 7 * rand(0.1, 0.25))
        sentimentScore = Number(Math.max(-9.99, Math.min(9.99, rand(-0.2, 0.4))).toFixed(2))
      }

      shareOfVoice.push({
        workspace_id: workspaceId,
        candidate_name: candidate.name,
        mentions_count: mentionsCount,
        sentiment_score: sentimentScore,
        period_start: dateStr(periodStart),
        period_end: dateStr(periodEnd),
      })
    }
  }

  const platforms = ['instagram', 'facebook', 'twitter']
  const digitalDominance = allCandidates.flatMap((candidate) =>
    platforms.map((platform) => {
      const isMain = candidate.name === candidateName
      return {
        workspace_id: workspaceId,
        candidate_name: candidate.name,
        platform,
        followers: isMain ? randInt(25000, 55000) : randInt(5000, 30000),
        engagement_rate: Number(rand(isMain ? 3.5 : 1.0, isMain ? 8.0 : 4.5).toFixed(2)),
        posts_count: randInt(20, 80),
        measured_at: now.toISOString(),
      }
    })
  )

  const crisisEvents = crisis.events.map((e) => ({
    workspace_id: workspaceId,
    title: e.title,
    description: e.description,
    severity: e.severity,
    status: e.status,
    source: 'Social Listening',
    impact_score: Math.min(e.impact, 99.9),
    started_at: daysAgo(e.daysAgo).toISOString(),
    resolved_at: e.status === 'resolved' ? hoursAgo(randInt(1, 24)).toISOString() : null,
  }))

  const qrCodes = [
    { label: 'Material Centro', code: `SIM-${Date.now()}-01`, url: 'https://roberto2026.com.br/centro', location: 'Centro' },
    { label: 'Panfleto Trindade', code: `SIM-${Date.now()}-02`, url: 'https://roberto2026.com.br/trindade', location: 'Trindade' },
    { label: 'Banner Estreito', code: `SIM-${Date.now()}-03`, url: 'https://roberto2026.com.br/estreito', location: 'Estreito' },
    { label: 'Evento Lagoa', code: `SIM-${Date.now()}-04`, url: 'https://roberto2026.com.br/lagoa', location: 'Lagoa da Conceição' },
    { label: 'Adesivo Ingleses', code: `SIM-${Date.now()}-05`, url: 'https://roberto2026.com.br/ingleses', location: 'Ingleses' },
  ].map((qr) => ({
    workspace_id: workspaceId,
    ...qr,
    scans_count: randInt(15, 350),
  }))

  return {
    metricsDaily,
    intelligenceAlerts,
    channelBudgets,
    leads: leadsData,
    territorialInteractions,
    whatsappMetrics,
    mobilizationFunnel,
    wasteDetections,
    mentions,
    emergingTerms,
    shareOfVoice,
    digitalDominance,
    crisisEvents,
    qrCodes,
  }
}
