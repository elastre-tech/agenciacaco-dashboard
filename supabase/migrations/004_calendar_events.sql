create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  agency_id uuid references agencies(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean default false,
  color text default '#3B82F6',
  created_by uuid not null references profiles(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  constraint calendar_event_scope check (
    (workspace_id is not null and agency_id is null) or
    (workspace_id is null and agency_id is not null)
  )
);

create index idx_calendar_events_workspace on calendar_events(workspace_id);
create index idx_calendar_events_agency on calendar_events(agency_id);
create index idx_calendar_events_start on calendar_events(start_at);

alter table calendar_events enable row level security;

create policy "workspace members can view workspace events"
  on calendar_events for select
  using (
    workspace_id is not null
    and exists (
      select 1 from workspace_members wm
      where wm.workspace_id = calendar_events.workspace_id
        and wm.profile_id = auth.uid()
    )
  );

create policy "agency members can view workspace events"
  on calendar_events for select
  using (
    workspace_id is not null
    and exists (
      select 1 from agency_members am
      join workspaces w on w.agency_id = am.agency_id
      where w.id = calendar_events.workspace_id
        and am.profile_id = auth.uid()
    )
  );

create policy "agency members can view agency events"
  on calendar_events for select
  using (
    agency_id is not null
    and exists (
      select 1 from agency_members am
      where am.agency_id = calendar_events.agency_id
        and am.profile_id = auth.uid()
    )
  );

create policy "coordinators can manage workspace events"
  on calendar_events for all
  using (
    workspace_id is not null
    and exists (
      select 1 from workspace_members wm
      where wm.workspace_id = calendar_events.workspace_id
        and wm.profile_id = auth.uid()
        and wm.role = 'campaign_coordinator'
    )
  );

create policy "agency members can manage workspace events"
  on calendar_events for all
  using (
    workspace_id is not null
    and exists (
      select 1 from agency_members am
      join workspaces w on w.agency_id = am.agency_id
      where w.id = calendar_events.workspace_id
        and am.profile_id = auth.uid()
    )
  );

create policy "agency members can manage agency events"
  on calendar_events for all
  using (
    agency_id is not null
    and exists (
      select 1 from agency_members am
      where am.agency_id = calendar_events.agency_id
        and am.profile_id = auth.uid()
    )
  );
