export type AgencyRole = 'agency_owner' | 'agency_admin'
export type WorkspaceRole = 'campaign_coordinator' | 'intelligence_analyst' | 'performance_manager' | 'field_mobilizer'
export type LeadTemperature = 'hot' | 'warm' | 'cold'
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type MentionSentiment = 'positive' | 'negative' | 'neutral'
export type CrisisStatus = 'monitoring' | 'escalated' | 'contained' | 'resolved'

export interface Agency {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  background_color: string
  custom_domain: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  agency_id: string
  name: string
  slug: string
  candidate_name: string
  candidate_party: string
  election_type: string
  election_year: number
  city: string
  state: string
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MetricsDaily {
  id: string
  workspace_id: string
  date: string
  total_reach: number
  impressions: number
  clicks: number
  leads_count: number
  cpl: number
  budget_spent: number
  budget_total: number
  engagement_rate: number
  created_at: string
}

export interface IntelligenceAlert {
  id: string
  workspace_id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  created_at: string
  resolved_at: string | null
}

export interface ChannelBudget {
  id: string
  workspace_id: string
  channel: string
  allocated: number
  spent: number
  month: string
  created_at: string
}

export interface Lead {
  id: string
  workspace_id: string
  full_name: string
  email: string | null
  phone: string | null
  temperature: LeadTemperature
  source: string
  neighborhood: string | null
  notes: string | null
  converted_at: string | null
  created_at: string
  updated_at: string
}

export interface TerritorialInteraction {
  id: string
  workspace_id: string
  latitude: number
  longitude: number
  neighborhood: string
  interaction_type: string
  notes: string | null
  recorded_at: string
  created_at: string
}

export interface QRCode {
  id: string
  workspace_id: string
  label: string
  code: string
  url: string
  scans_count: number
  location: string | null
  created_at: string
}

export interface WhatsAppMetrics {
  id: string
  workspace_id: string
  date: string
  messages_sent: number
  messages_delivered: number
  messages_read: number
  responses: number
  opt_outs: number
  created_at: string
}

export interface MobilizationFunnel {
  id: string
  workspace_id: string
  stage: string
  count: number
  date: string
  created_at: string
}

export interface WasteDetection {
  id: string
  workspace_id: string
  channel: string
  amount: number
  reason: string
  detected_at: string
  resolved: boolean
  created_at: string
}

export type PermissionModule =
  | 'dashboard'
  | 'territory'
  | 'mobilization'
  | 'finance'
  | 'reports'
  | 'listening'
  | 'competitors'
  | 'risk'
  | 'history'

export const ALL_MODULES: PermissionModule[] = [
  'dashboard',
  'territory',
  'mobilization',
  'finance',
  'reports',
  'listening',
  'competitors',
  'risk',
  'history',
]

export const MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: 'Painel Geral',
  territory: 'Território',
  mobilization: 'Mobilização',
  finance: 'Finanças',
  reports: 'Relatórios',
  listening: 'Social Listening',
  competitors: 'Competidores',
  risk: 'Risco e Crise',
  history: 'Histórico',
}

export interface UserPermission {
  id: string
  workspace_id: string
  profile_id: string
  module: PermissionModule
  can_view: boolean
  can_edit: boolean
  created_at: string
  updated_at: string
}

export type ReportFormat = 'pdf' | 'excel'
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed'

export interface Report {
  id: string
  workspace_id: string
  title: string
  format: ReportFormat
  status: ReportStatus
  file_url: string | null
  filters: Record<string, unknown> | null
  generated_by: string
  created_at: string
  completed_at: string | null
}
