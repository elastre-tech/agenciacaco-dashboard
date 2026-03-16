interface ScenarioConfig {
  id: string
  label: string
  description: string
  emoji: string
  metrics: MetricsProfile
  alerts: AlertProfile[]
  leads: LeadsProfile
  sentiment: SentimentProfile
  crisis: CrisisProfile
  waste: WasteProfile
}

interface MetricsProfile {
  reachBase: number
  reachTrend: 'up' | 'down' | 'flat' | 'spike'
  cplBase: number
  cplTrend: 'up' | 'down' | 'flat' | 'spike'
  leadsBase: number
  leadsTrend: 'up' | 'down' | 'flat' | 'spike'
  budgetTotal: number
  budgetSpentRatio: number
  engagementBase: number
  volatility: number
}

interface AlertProfile {
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'acknowledged' | 'resolved'
  source: string
  hoursAgo: number
}

interface LeadsProfile {
  total: number
  hotRatio: number
  warmRatio: number
  coldRatio: number
  recentConversionRate: number
}

interface SentimentProfile {
  positiveRatio: number
  negativeRatio: number
  neutralRatio: number
  mentionsPerDay: number
  emergingTerms: { term: string; growth: number }[]
}

interface CrisisProfile {
  events: {
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    status: 'monitoring' | 'escalated' | 'contained' | 'resolved'
    impact: number
    daysAgo: number
  }[]
}

interface WasteProfile {
  detections: {
    channel: string
    amount: number
    reason: string
    daysAgo: number
    resolved: boolean
  }[]
}

export type { ScenarioConfig, MetricsProfile, AlertProfile, LeadsProfile, SentimentProfile, CrisisProfile, WasteProfile }

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'stable',
    label: 'Campanha Estável',
    description: 'Métricas saudáveis, sem crises, crescimento orgânico lento. O dia a dia de uma campanha bem gerenciada.',
    emoji: '⚖️',
    metrics: {
      reachBase: 45000,
      reachTrend: 'flat',
      cplBase: 6.5,
      cplTrend: 'flat',
      leadsBase: 120,
      leadsTrend: 'up',
      budgetTotal: 150000,
      budgetSpentRatio: 0.55,
      engagementBase: 4.2,
      volatility: 0.08,
    },
    alerts: [
      { title: 'Lembrete: renovar criativos da campanha', description: 'Criativos ativos há mais de 15 dias — considere atualizar para evitar fadiga.', severity: 'low', status: 'active', source: 'Meta Ads', hoursAgo: 12 },
      { title: 'Engajamento estável no Instagram', description: 'Taxa de engajamento manteve-se entre 4-5% na última semana.', severity: 'low', status: 'resolved', source: 'Instagram', hoursAgo: 48 },
    ],
    leads: { total: 480, hotRatio: 0.2, warmRatio: 0.45, coldRatio: 0.35, recentConversionRate: 0.12 },
    sentiment: {
      positiveRatio: 0.55,
      negativeRatio: 0.12,
      neutralRatio: 0.33,
      mentionsPerDay: 85,
      emergingTerms: [
        { term: '#RobertoFaz', growth: 12 },
        { term: 'saúde pública floripa', growth: 8 },
      ],
    },
    crisis: { events: [] },
    waste: {
      detections: [
        { channel: 'Google Ads', amount: 340, reason: 'Palavras-chave negativas ausentes gerando cliques irrelevantes', daysAgo: 5, resolved: true },
      ],
    },
  },
  {
    id: 'growth',
    label: 'Crescimento Acelerado',
    description: 'Campanha em ascensão. Leads disparando, alcance crescendo, CPL caindo. O sonho de todo coordenador.',
    emoji: '🚀',
    metrics: {
      reachBase: 85000,
      reachTrend: 'up',
      cplBase: 4.2,
      cplTrend: 'down',
      leadsBase: 280,
      leadsTrend: 'up',
      budgetTotal: 200000,
      budgetSpentRatio: 0.42,
      engagementBase: 6.8,
      volatility: 0.12,
    },
    alerts: [
      { title: 'CPL atingiu mínimo histórico', description: 'Custo por lead caiu para R$ 3,80 — melhor resultado da campanha.', severity: 'low', status: 'active', source: 'Meta Ads', hoursAgo: 3 },
      { title: 'Alcance orgânico subiu 45%', description: 'Posts sobre saúde pública viralizaram no Instagram.', severity: 'medium', status: 'active', source: 'Instagram', hoursAgo: 8 },
      { title: 'Nova região ativada: Continente', description: 'Interações no bairro Estreito superaram meta em 30%.', severity: 'low', status: 'active', source: 'Campo', hoursAgo: 24 },
    ],
    leads: { total: 920, hotRatio: 0.35, warmRatio: 0.4, coldRatio: 0.25, recentConversionRate: 0.22 },
    sentiment: {
      positiveRatio: 0.68,
      negativeRatio: 0.08,
      neutralRatio: 0.24,
      mentionsPerDay: 180,
      emergingTerms: [
        { term: '#RobertoFaz', growth: 85 },
        { term: '#Floripa2026', growth: 62 },
        { term: 'debate prefeito', growth: 45 },
        { term: 'saúde pública', growth: 38 },
      ],
    },
    crisis: { events: [] },
    waste: {
      detections: [
        { channel: 'Google Ads', amount: 180, reason: 'Horários de baixa conversão detectados entre 23h-5h', daysAgo: 3, resolved: true },
      ],
    },
  },
  {
    id: 'bot-attack',
    label: 'Crise / Ataque de Bots',
    description: 'Ataque coordenado com bots, fake news, e menções negativas massivas. Momento de resposta rápida.',
    emoji: '🤖',
    metrics: {
      reachBase: 120000,
      reachTrend: 'spike',
      cplBase: 14.5,
      cplTrend: 'spike',
      leadsBase: 45,
      leadsTrend: 'down',
      budgetTotal: 150000,
      budgetSpentRatio: 0.72,
      engagementBase: 8.5,
      volatility: 0.35,
    },
    alerts: [
      { title: 'CRÍTICO: Ataque de bots detectado', description: 'Volume anômalo de menções negativas (3200% acima da média) com padrão de automação identificado. IPs concentrados em 3 data centers.', severity: 'critical', status: 'active', source: 'Social Listening', hoursAgo: 1 },
      { title: 'Fake news em circulação', description: 'Notícia falsa sobre desvio de verba compartilhada 4.500 vezes em 2 horas. Origem: perfis com menos de 30 dias de criação.', severity: 'critical', status: 'active', source: 'WhatsApp', hoursAgo: 2 },
      { title: 'Sentimento negativo em alta', description: 'Índice de sentimento caiu de 0.62 para -0.34 nas últimas 6 horas. Queda concentrada no Twitter e Facebook.', severity: 'high', status: 'active', source: 'Social Listening', hoursAgo: 3 },
      { title: 'CPL disparou 180%', description: 'Custo por lead saltou de R$ 5,20 para R$ 14,50 — possível impacto da crise na conversão de anúncios.', severity: 'high', status: 'active', source: 'Meta Ads', hoursAgo: 4 },
      { title: 'Perfis falsos mencionando candidato', description: '847 perfis criados nas últimas 48h estão disseminando conteúdo negativo coordenado.', severity: 'high', status: 'acknowledged', source: 'Twitter', hoursAgo: 5 },
      { title: 'Queda no engajamento orgânico', description: 'Engajamento orgânico caiu 40% — seguidores reais estão evitando interagir durante a crise.', severity: 'medium', status: 'active', source: 'Instagram', hoursAgo: 8 },
    ],
    leads: { total: 350, hotRatio: 0.08, warmRatio: 0.25, coldRatio: 0.67, recentConversionRate: 0.04 },
    sentiment: {
      positiveRatio: 0.12,
      negativeRatio: 0.72,
      neutralRatio: 0.16,
      mentionsPerDay: 1200,
      emergingTerms: [
        { term: 'desvio de verba', growth: 3200 },
        { term: '#ForaRoberto', growth: 2800 },
        { term: 'candidato corrupto', growth: 1500 },
        { term: 'fake news eleição', growth: 900 },
        { term: 'bots políticos', growth: 650 },
      ],
    },
    crisis: {
      events: [
        { title: 'Ataque coordenado de bots', description: 'Rede de bots identificada disseminando fake news sobre corrupção. Mais de 800 perfis automatizados detectados com padrão similar de postagem.', severity: 'critical', status: 'escalated', impact: 9.2, daysAgo: 0 },
        { title: 'Fake news viral no WhatsApp', description: 'Áudio falso atribuído ao candidato circulando em grupos de WhatsApp na grande Florianópolis. Já alcançou estimados 50.000 ouvintes.', severity: 'critical', status: 'monitoring', impact: 8.7, daysAgo: 0 },
        { title: 'Tentativa de hack na página oficial', description: 'Detectadas 340 tentativas de login na página oficial do Facebook nas últimas 3 horas.', severity: 'high', status: 'contained', impact: 6.5, daysAgo: 0 },
      ],
    },
    waste: {
      detections: [
        { channel: 'Meta Ads', amount: 4200, reason: 'Anúncios rodando durante pico de crise — audiência hostil não converte', daysAgo: 0, resolved: false },
        { channel: 'Google Ads', amount: 1800, reason: 'Buscas de marca contaminadas por termos negativos da crise', daysAgo: 0, resolved: false },
        { channel: 'Instagram', amount: 950, reason: 'Impulsionamento de posts durante período de sentimento negativo extremo', daysAgo: 0, resolved: false },
      ],
    },
  },
  {
    id: 'budget-waste',
    label: 'Desperdício de Verba',
    description: 'Orçamento sendo mal alocado. CPL alto, canais ineficientes, alertas de desperdício em cascata.',
    emoji: '💸',
    metrics: {
      reachBase: 38000,
      reachTrend: 'down',
      cplBase: 18.7,
      cplTrend: 'up',
      leadsBase: 65,
      leadsTrend: 'down',
      budgetTotal: 180000,
      budgetSpentRatio: 0.83,
      engagementBase: 2.1,
      volatility: 0.15,
    },
    alerts: [
      { title: 'Orçamento 83% consumido', description: 'Apenas 17% do orçamento restante com 45 dias até a eleição. Taxa de consumo insustentável.', severity: 'critical', status: 'active', source: 'Finanças', hoursAgo: 1 },
      { title: 'CPL acima do benchmark', description: 'CPL de R$ 18,70 está 187% acima do benchmark de R$ 6,50 para campanhas municipais.', severity: 'high', status: 'active', source: 'Meta Ads', hoursAgo: 6 },
      { title: 'Google Ads com CTR de 0.3%', description: 'Taxa de clique muito abaixo do esperado (benchmark: 2.1%). Criativos precisam de revisão urgente.', severity: 'high', status: 'active', source: 'Google Ads', hoursAgo: 12 },
      { title: 'Canal WhatsApp com ROI negativo', description: 'Investimento de R$ 12.000 em WhatsApp gerou apenas 8 leads convertidos.', severity: 'medium', status: 'active', source: 'WhatsApp', hoursAgo: 24 },
      { title: 'Audiência saturada na Ilha', description: 'Frequência média de 8.4x na região da Ilha — público já viu os mesmos anúncios muitas vezes.', severity: 'medium', status: 'acknowledged', source: 'Meta Ads', hoursAgo: 48 },
    ],
    leads: { total: 280, hotRatio: 0.1, warmRatio: 0.3, coldRatio: 0.6, recentConversionRate: 0.05 },
    sentiment: {
      positiveRatio: 0.35,
      negativeRatio: 0.28,
      neutralRatio: 0.37,
      mentionsPerDay: 55,
      emergingTerms: [
        { term: 'campanha cara', growth: 25 },
        { term: 'dinheiro público', growth: 18 },
      ],
    },
    crisis: {
      events: [
        { title: 'Auditoria interna de gastos', description: 'Equipe financeira identificou padrão de gastos acelerados em canais de baixa conversão.', severity: 'medium', status: 'monitoring', impact: 5.5, daysAgo: 2 },
      ],
    },
    waste: {
      detections: [
        { channel: 'Google Ads', amount: 8500, reason: 'Campanhas de display com CTR < 0.5% rodando há 3 semanas sem otimização', daysAgo: 0, resolved: false },
        { channel: 'Meta Ads', amount: 6200, reason: 'Segmentação ampla demais — 60% das impressões fora da região eleitoral', daysAgo: 1, resolved: false },
        { channel: 'WhatsApp', amount: 3400, reason: 'Listas de broadcast com taxa de opt-out de 34% — base desqualificada', daysAgo: 2, resolved: false },
        { channel: 'Instagram', amount: 2100, reason: 'Impulsionamento de posts de imagem estática com engajamento abaixo de 1%', daysAgo: 3, resolved: false },
        { channel: 'Events', amount: 1800, reason: 'Eventos em bairros já saturados com custo por contato de R$ 45', daysAgo: 5, resolved: true },
      ],
    },
  },
  {
    id: 'viral',
    label: 'Viralização Positiva',
    description: 'Conteúdo viralizou organicamente. Alcance explodiu, leads em massa, sentimento extremamente positivo.',
    emoji: '🔥',
    metrics: {
      reachBase: 320000,
      reachTrend: 'spike',
      cplBase: 2.1,
      cplTrend: 'down',
      leadsBase: 580,
      leadsTrend: 'spike',
      budgetTotal: 200000,
      budgetSpentRatio: 0.38,
      engagementBase: 12.4,
      volatility: 0.25,
    },
    alerts: [
      { title: 'Conteúdo viral detectado', description: 'Vídeo do candidato no mercado público atingiu 2.3M de visualizações em 18 horas. Compartilhamentos crescendo exponencialmente.', severity: 'medium', status: 'active', source: 'Instagram', hoursAgo: 1 },
      { title: 'Leads acima da capacidade', description: 'Fluxo de 580 leads/dia excede capacidade de atendimento da equipe (meta: 200/dia). Priorizar leads hot.', severity: 'high', status: 'active', source: 'CRM', hoursAgo: 2 },
      { title: 'Menções positivas em alta histórica', description: 'Volume de menções positivas 420% acima da média. Hashtag #RobertoFaz em trending nacional.', severity: 'low', status: 'active', source: 'Social Listening', hoursAgo: 4 },
      { title: 'Veículos de mídia solicitando entrevista', description: '3 portais de notícia e 1 TV regional entraram em contato para entrevistas.', severity: 'low', status: 'active', source: 'Assessoria', hoursAgo: 6 },
    ],
    leads: { total: 1850, hotRatio: 0.45, warmRatio: 0.35, coldRatio: 0.2, recentConversionRate: 0.32 },
    sentiment: {
      positiveRatio: 0.82,
      negativeRatio: 0.05,
      neutralRatio: 0.13,
      mentionsPerDay: 2400,
      emergingTerms: [
        { term: '#RobertoFaz', growth: 4200 },
        { term: 'vídeo mercado público', growth: 3100 },
        { term: '#PrefeitudeVerdade', growth: 1800 },
        { term: 'candidato gente como a gente', growth: 950 },
        { term: 'floripa merece', growth: 720 },
      ],
    },
    crisis: { events: [] },
    waste: {
      detections: [
        { channel: 'Google Ads', amount: 220, reason: 'Pausar campanhas pagas — alcance orgânico já superou metas', daysAgo: 0, resolved: false },
      ],
    },
  },
]
