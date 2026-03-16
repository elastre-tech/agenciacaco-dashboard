export const AGENCY_ROLES = ['agency_owner', 'agency_admin'] as const
export const WORKSPACE_ROLES = [
  'campaign_coordinator',
  'intelligence_analyst',
  'performance_manager',
  'field_mobilizer',
] as const

export type AgencyRole = (typeof AGENCY_ROLES)[number]
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]
export type Role = AgencyRole | WorkspaceRole
