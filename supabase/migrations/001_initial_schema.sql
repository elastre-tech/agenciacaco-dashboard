-- Dashboard Politico 360 - Initial Schema

-- Enums

create type agency_role as enum ('agency_owner', 'agency_admin');
create type workspace_role as enum ('campaign_coordinator', 'intelligence_analyst', 'performance_manager', 'field_mobilizer');
create type lead_temperature as enum ('hot', 'warm', 'cold');
create type alert_severity as enum ('critical', 'high', 'medium', 'low');
create type alert_status as enum ('active', 'acknowledged', 'resolved');
create type report_format as enum ('pdf', 'excel');
create type report_status as enum ('pending', 'generating', 'completed', 'failed');
create type mention_sentiment as enum ('positive', 'negative', 'neutral');
create type crisis_severity as enum ('critical', 'high', 'medium', 'low');
create type crisis_status as enum ('monitoring', 'escalated', 'contained', 'resolved');
create type integration_provider as enum ('meta_ads', 'google_ads', 'whatsapp', 'instagram', 'tiktok');

-- Core multi-tenant tables

create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#FFD100',
  secondary_color text default '#1A1A1A',
  background_color text default '#F8F8F6',
  custom_domain text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  role agency_role not null,
  invited_at timestamptz default now() not null,
  accepted_at timestamptz,
  unique (agency_id, profile_id)
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references agencies on delete cascade,
  name text not null,
  slug text not null,
  candidate_name text,
  candidate_party text,
  election_type text,
  election_year int,
  city text,
  state text,
  logo_url text,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (agency_id, slug)
);

create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  role workspace_role not null,
  created_at timestamptz default now() not null,
  unique (workspace_id, profile_id)
);

-- Integrations

create table integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  provider integration_provider not null,
  is_connected boolean default false not null,
  config jsonb default '{}' not null,
  last_sync_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Module 1 - Painel Geral

create table metrics_daily (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  date date not null,
  total_reach bigint,
  impressions bigint,
  clicks int,
  leads_count int,
  cpl numeric(10, 2),
  budget_spent numeric(12, 2),
  budget_total numeric(12, 2),
  engagement_rate numeric(5, 2),
  created_at timestamptz default now() not null
);

create table intelligence_alerts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  title text not null,
  description text,
  severity alert_severity not null,
  status alert_status default 'active' not null,
  source text,
  created_at timestamptz default now() not null,
  resolved_at timestamptz
);

create table channel_budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  channel text not null,
  allocated numeric(12, 2),
  spent numeric(12, 2),
  month date not null,
  created_at timestamptz default now() not null
);

-- Module 2 - Territorial

create table territorial_interactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  neighborhood text,
  interaction_type text not null,
  notes text,
  recorded_at timestamptz not null,
  created_at timestamptz default now() not null
);

create table qr_codes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  label text not null,
  code text unique not null,
  url text not null,
  scans_count int default 0 not null,
  location text,
  created_at timestamptz default now() not null
);

-- Module 3 - Mobilization / CRM

create table leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  full_name text not null,
  email text,
  phone text,
  temperature lead_temperature,
  source text,
  neighborhood text,
  notes text,
  converted_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table whatsapp_metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  date date not null,
  messages_sent int,
  messages_delivered int,
  messages_read int,
  responses int,
  opt_outs int,
  created_at timestamptz default now() not null
);

create table mobilization_funnel (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  stage text not null,
  count int not null,
  date date not null,
  created_at timestamptz default now() not null
);

-- Module 4 - Finance

create table waste_detections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  channel text not null,
  amount numeric(12, 2) not null,
  reason text,
  detected_at timestamptz not null,
  resolved boolean default false not null,
  created_at timestamptz default now() not null
);

-- Module 5 - Reports

create table reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  title text not null,
  format report_format not null,
  status report_status default 'pending' not null,
  file_url text,
  filters jsonb,
  generated_by uuid references profiles(id),
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

-- Module 6 - Social Listening

create table listening_terms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  term text not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

create table mentions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  term_id uuid not null references listening_terms on delete cascade,
  source text not null,
  content text,
  sentiment mention_sentiment,
  author text,
  url text,
  published_at timestamptz,
  created_at timestamptz default now() not null
);

create table emerging_terms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  term text not null,
  frequency int,
  growth_rate numeric(5, 2),
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz default now() not null
);

-- Module 7 - Competitive Intelligence

create table share_of_voice (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  candidate_name text not null,
  mentions_count int,
  sentiment_score numeric(3, 2),
  period_start date not null,
  period_end date not null,
  created_at timestamptz default now() not null
);

create table digital_dominance (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  candidate_name text not null,
  platform text not null,
  followers int,
  engagement_rate numeric(5, 2),
  posts_count int,
  measured_at timestamptz not null,
  created_at timestamptz default now() not null
);

-- Module 8 - Risk / Crisis

create table crisis_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  title text not null,
  description text,
  severity crisis_severity not null,
  status crisis_status default 'monitoring' not null,
  source text,
  impact_score numeric(3, 1),
  started_at timestamptz not null,
  resolved_at timestamptz,
  created_at timestamptz default now() not null
);

create table crisis_alert_configs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  trigger_type text not null,
  trigger_value text,
  is_active boolean default true not null,
  notify_roles text[] default '{campaign_coordinator}',
  created_at timestamptz default now() not null
);

-- Module 9 - Election History

create table election_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  election_year int not null,
  election_type text,
  city text,
  state char(2),
  candidate_name text not null,
  party text,
  votes_received int,
  total_votes int,
  vote_percentage numeric(5, 2),
  zone text,
  section text,
  neighborhood text,
  is_elected boolean,
  created_at timestamptz default now() not null
);

-- Audit

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid,
  performed_at timestamptz default now() not null
);

-- Indexes: foreign keys

create index idx_agency_members_agency_id on agency_members (agency_id);
create index idx_agency_members_profile_id on agency_members (profile_id);
create index idx_workspaces_agency_id on workspaces (agency_id);
create index idx_workspace_members_workspace_id on workspace_members (workspace_id);
create index idx_workspace_members_profile_id on workspace_members (profile_id);
create index idx_integrations_workspace_id on integrations (workspace_id);
create index idx_mentions_term_id on mentions (term_id);
create index idx_reports_generated_by on reports (generated_by);

-- Indexes: workspace_id on module tables

create index idx_metrics_daily_workspace_id on metrics_daily (workspace_id);
create index idx_intelligence_alerts_workspace_id on intelligence_alerts (workspace_id);
create index idx_channel_budgets_workspace_id on channel_budgets (workspace_id);
create index idx_territorial_interactions_workspace_id on territorial_interactions (workspace_id);
create index idx_qr_codes_workspace_id on qr_codes (workspace_id);
create index idx_leads_workspace_id on leads (workspace_id);
create index idx_whatsapp_metrics_workspace_id on whatsapp_metrics (workspace_id);
create index idx_mobilization_funnel_workspace_id on mobilization_funnel (workspace_id);
create index idx_waste_detections_workspace_id on waste_detections (workspace_id);
create index idx_reports_workspace_id on reports (workspace_id);
create index idx_listening_terms_workspace_id on listening_terms (workspace_id);
create index idx_mentions_workspace_id on mentions (workspace_id);
create index idx_emerging_terms_workspace_id on emerging_terms (workspace_id);
create index idx_share_of_voice_workspace_id on share_of_voice (workspace_id);
create index idx_digital_dominance_workspace_id on digital_dominance (workspace_id);
create index idx_crisis_events_workspace_id on crisis_events (workspace_id);
create index idx_crisis_alert_configs_workspace_id on crisis_alert_configs (workspace_id);
create index idx_election_history_workspace_id on election_history (workspace_id);

-- Indexes: date columns and composite workspace+date

create index idx_metrics_daily_date on metrics_daily (date);
create index idx_metrics_daily_ws_date on metrics_daily (workspace_id, date);
create index idx_channel_budgets_month on channel_budgets (month);
create index idx_channel_budgets_ws_month on channel_budgets (workspace_id, month);
create index idx_whatsapp_metrics_date on whatsapp_metrics (date);
create index idx_whatsapp_metrics_ws_date on whatsapp_metrics (workspace_id, date);
create index idx_mobilization_funnel_date on mobilization_funnel (date);
create index idx_mobilization_funnel_ws_date on mobilization_funnel (workspace_id, date);
create index idx_mentions_published_at on mentions (published_at);
create index idx_share_of_voice_period on share_of_voice (period_start, period_end);
create index idx_digital_dominance_measured_at on digital_dominance (measured_at);
create index idx_crisis_events_started_at on crisis_events (started_at);
create index idx_election_history_year on election_history (election_year);
create index idx_audit_log_table_record on audit_log (table_name, record_id);
create index idx_audit_log_performed_at on audit_log (performed_at);

-- Indexes: commonly filtered columns

create index idx_intelligence_alerts_status on intelligence_alerts (status);
create index idx_intelligence_alerts_severity on intelligence_alerts (severity);
create index idx_leads_temperature on leads (temperature);
create index idx_crisis_events_status on crisis_events (status);
create index idx_crisis_events_severity on crisis_events (severity);
create index idx_reports_status on reports (status);
create index idx_integrations_provider on integrations (provider);

-- RLS helper functions

create or replace function get_user_agency_ids(p_user_id uuid)
returns uuid[]
language sql
stable
security definer
as $$
  select coalesce(array_agg(agency_id), '{}')
  from agency_members
  where profile_id = p_user_id and accepted_at is not null;
$$;

create or replace function get_user_workspace_ids(p_user_id uuid)
returns uuid[]
language sql
stable
security definer
as $$
  select coalesce(array_agg(workspace_id), '{}')
  from workspace_members
  where profile_id = p_user_id;
$$;

create or replace function is_agency_member(p_user_id uuid, p_agency_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from agency_members
    where profile_id = p_user_id
      and agency_id = p_agency_id
      and accepted_at is not null
  );
$$;

create or replace function is_workspace_member(p_user_id uuid, p_workspace_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from workspace_members
    where profile_id = p_user_id
      and workspace_id = p_workspace_id
  );
$$;

-- Helper to check agency role

create or replace function has_agency_role(p_user_id uuid, p_agency_id uuid, p_role agency_role)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from agency_members
    where profile_id = p_user_id
      and agency_id = p_agency_id
      and role = p_role
      and accepted_at is not null
  );
$$;

-- Helper to check workspace role

create or replace function has_workspace_role(p_user_id uuid, p_workspace_id uuid, p_roles workspace_role[])
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from workspace_members
    where profile_id = p_user_id
      and workspace_id = p_workspace_id
      and role = any(p_roles)
  );
$$;

-- Helper to get agency_id from workspace

create or replace function get_workspace_agency_id(p_workspace_id uuid)
returns uuid
language sql
stable
security definer
as $$
  select agency_id from workspaces where id = p_workspace_id;
$$;

-- Enable RLS on all tables

alter table agencies enable row level security;
alter table profiles enable row level security;
alter table agency_members enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table integrations enable row level security;
alter table metrics_daily enable row level security;
alter table intelligence_alerts enable row level security;
alter table channel_budgets enable row level security;
alter table territorial_interactions enable row level security;
alter table qr_codes enable row level security;
alter table leads enable row level security;
alter table whatsapp_metrics enable row level security;
alter table mobilization_funnel enable row level security;
alter table waste_detections enable row level security;
alter table reports enable row level security;
alter table listening_terms enable row level security;
alter table mentions enable row level security;
alter table emerging_terms enable row level security;
alter table share_of_voice enable row level security;
alter table digital_dominance enable row level security;
alter table crisis_events enable row level security;
alter table crisis_alert_configs enable row level security;
alter table election_history enable row level security;
alter table audit_log enable row level security;

-- RLS: profiles

create policy profiles_select on profiles
  for select using (id = auth.uid());

create policy profiles_update on profiles
  for update using (id = auth.uid());

-- RLS: agencies

create policy agencies_select on agencies
  for select using (id = any(get_user_agency_ids(auth.uid())));

create policy agencies_update on agencies
  for update using (has_agency_role(auth.uid(), id, 'agency_owner'));

-- RLS: agency_members

create policy agency_members_select on agency_members
  for select using (is_agency_member(auth.uid(), agency_id));

create policy agency_members_insert on agency_members
  for insert with check (has_agency_role(auth.uid(), agency_id, 'agency_owner'));

create policy agency_members_delete on agency_members
  for delete using (has_agency_role(auth.uid(), agency_id, 'agency_owner'));

-- RLS: workspaces

create policy workspaces_select on workspaces
  for select using (is_agency_member(auth.uid(), agency_id));

create policy workspaces_insert on workspaces
  for insert with check (
    has_agency_role(auth.uid(), agency_id, 'agency_owner')
    or has_agency_role(auth.uid(), agency_id, 'agency_admin')
  );

create policy workspaces_update on workspaces
  for update using (
    has_agency_role(auth.uid(), agency_id, 'agency_owner')
    or has_agency_role(auth.uid(), agency_id, 'agency_admin')
  );

-- RLS: workspace_members

create policy workspace_members_select on workspace_members
  for select using (is_workspace_member(auth.uid(), workspace_id));

-- Macro for workspace-scoped read policies (all workspace members can read)
-- Applied individually below since Postgres has no macro system

create policy integrations_select on integrations
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy integrations_insert on integrations
  for insert with check (
    has_agency_role(auth.uid(), get_workspace_agency_id(workspace_id), 'agency_owner')
    or has_agency_role(auth.uid(), get_workspace_agency_id(workspace_id), 'agency_admin')
  );

create policy integrations_update on integrations
  for update using (
    has_agency_role(auth.uid(), get_workspace_agency_id(workspace_id), 'agency_owner')
    or has_agency_role(auth.uid(), get_workspace_agency_id(workspace_id), 'agency_admin')
  );

-- Module 1: metrics_daily, intelligence_alerts, channel_budgets

create policy metrics_daily_select on metrics_daily
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy metrics_daily_insert on metrics_daily
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'performance_manager']::workspace_role[])
  );

create policy intelligence_alerts_select on intelligence_alerts
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy intelligence_alerts_insert on intelligence_alerts
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

create policy intelligence_alerts_update on intelligence_alerts
  for update using (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

create policy channel_budgets_select on channel_budgets
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy channel_budgets_insert on channel_budgets
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'performance_manager']::workspace_role[])
  );

create policy channel_budgets_update on channel_budgets
  for update using (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'performance_manager']::workspace_role[])
  );

-- Module 2: territorial

create policy territorial_interactions_select on territorial_interactions
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy territorial_interactions_insert on territorial_interactions
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'field_mobilizer']::workspace_role[])
  );

create policy qr_codes_select on qr_codes
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy qr_codes_insert on qr_codes
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'field_mobilizer']::workspace_role[])
  );

-- Module 3: leads, whatsapp_metrics, mobilization_funnel

create policy leads_select on leads
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy leads_insert on leads
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'field_mobilizer']::workspace_role[])
  );

create policy leads_update on leads
  for update using (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'field_mobilizer']::workspace_role[])
  );

create policy whatsapp_metrics_select on whatsapp_metrics
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy whatsapp_metrics_insert on whatsapp_metrics
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'performance_manager']::workspace_role[])
  );

create policy mobilization_funnel_select on mobilization_funnel
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy mobilization_funnel_insert on mobilization_funnel
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'performance_manager']::workspace_role[])
  );

-- Module 4: waste_detections

create policy waste_detections_select on waste_detections
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy waste_detections_insert on waste_detections
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'performance_manager']::workspace_role[])
  );

create policy waste_detections_update on waste_detections
  for update using (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'performance_manager']::workspace_role[])
  );

-- Module 5: reports

create policy reports_select on reports
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy reports_insert on reports
  for insert with check (is_workspace_member(auth.uid(), workspace_id));

-- Module 6: listening_terms, mentions, emerging_terms

create policy listening_terms_select on listening_terms
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy listening_terms_insert on listening_terms
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

create policy listening_terms_update on listening_terms
  for update using (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

create policy mentions_select on mentions
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy mentions_insert on mentions
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

create policy emerging_terms_select on emerging_terms
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy emerging_terms_insert on emerging_terms
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

-- Module 7: share_of_voice, digital_dominance

create policy share_of_voice_select on share_of_voice
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy share_of_voice_insert on share_of_voice
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

create policy digital_dominance_select on digital_dominance
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy digital_dominance_insert on digital_dominance
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

-- Module 8: crisis_events, crisis_alert_configs

create policy crisis_events_select on crisis_events
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy crisis_events_insert on crisis_events
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

create policy crisis_events_update on crisis_events
  for update using (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

create policy crisis_alert_configs_select on crisis_alert_configs
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy crisis_alert_configs_insert on crisis_alert_configs
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator']::workspace_role[])
  );

create policy crisis_alert_configs_update on crisis_alert_configs
  for update using (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator']::workspace_role[])
  );

-- Module 9: election_history

create policy election_history_select on election_history
  for select using (is_workspace_member(auth.uid(), workspace_id));

create policy election_history_insert on election_history
  for insert with check (
    has_workspace_role(auth.uid(), workspace_id, array['campaign_coordinator', 'intelligence_analyst']::workspace_role[])
  );

-- Audit log: only agency owners can view, system inserts via trigger (definer)

create policy audit_log_select on audit_log
  for select using (
    performed_by = auth.uid()
  );

-- Trigger: updated_at

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_agencies_updated_at
  before update on agencies
  for each row execute function set_updated_at();

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_workspaces_updated_at
  before update on workspaces
  for each row execute function set_updated_at();

create trigger trg_integrations_updated_at
  before update on integrations
  for each row execute function set_updated_at();

create trigger trg_leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- Trigger: audit log

create or replace function fn_audit_log()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    insert into audit_log (table_name, record_id, action, new_data, performed_by)
    values (tg_table_name, new.id, tg_op, to_jsonb(new), auth.uid());
    return new;
  elsif tg_op = 'UPDATE' then
    insert into audit_log (table_name, record_id, action, old_data, new_data, performed_by)
    values (tg_table_name, new.id, tg_op, to_jsonb(old), to_jsonb(new), auth.uid());
    return new;
  elsif tg_op = 'DELETE' then
    insert into audit_log (table_name, record_id, action, old_data, performed_by)
    values (tg_table_name, old.id, tg_op, to_jsonb(old), auth.uid());
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_agencies_audit
  after insert or update or delete on agencies
  for each row execute function fn_audit_log();

create trigger trg_workspaces_audit
  after insert or update or delete on workspaces
  for each row execute function fn_audit_log();

create trigger trg_leads_audit
  after insert or update or delete on leads
  for each row execute function fn_audit_log();

create trigger trg_crisis_events_audit
  after insert or update or delete on crisis_events
  for each row execute function fn_audit_log();
