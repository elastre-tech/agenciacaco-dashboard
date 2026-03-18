-- Fix calendar RLS: allow all workspace members to manage events (not just coordinators)
drop policy if exists "coordinators can manage workspace events" on calendar_events;

create policy "workspace members can manage workspace events"
  on calendar_events for all
  using (
    workspace_id is not null
    and exists (
      select 1 from workspace_members wm
      where wm.workspace_id = calendar_events.workspace_id
        and wm.profile_id = auth.uid()
    )
  );

-- Support tickets table
create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text not null,
  screenshot_url text,
  page_url text,
  user_email text,
  browser_info text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_by uuid not null references profiles(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_support_tickets_status on support_tickets(status);
create index idx_support_tickets_created on support_tickets(created_at);

alter table support_tickets enable row level security;

create policy "authenticated users can create tickets"
  on support_tickets for insert
  with check (auth.uid() = created_by);

create policy "users can view own tickets"
  on support_tickets for select
  using (auth.uid() = created_by);

create policy "agency members can view all tickets"
  on support_tickets for select
  using (
    exists (
      select 1 from agency_members am
      where am.profile_id = auth.uid()
    )
  );

create policy "agency members can update tickets"
  on support_tickets for update
  using (
    exists (
      select 1 from agency_members am
      where am.profile_id = auth.uid()
    )
  );
