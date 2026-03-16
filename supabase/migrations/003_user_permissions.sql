-- User permissions: one row per user per module per workspace
create table if not exists user_permissions (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  module text not null,
  can_view boolean not null default true,
  can_edit boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (workspace_id, profile_id, module)
);

alter table user_permissions enable row level security;

-- Agency members can manage permissions for workspaces in their agency
create policy "agency_members_manage_permissions"
  on user_permissions for all
  using (
    exists (
      select 1 from agency_members am
      join workspaces w on w.agency_id = am.agency_id
      where am.profile_id = auth.uid()
        and w.id = user_permissions.workspace_id
    )
  );

-- Users can read their own permissions
create policy "users_read_own_permissions"
  on user_permissions for select
  using (profile_id = auth.uid());

-- Agency members can read profiles of users in their workspaces
create policy "agency_members_read_workspace_profiles"
  on profiles for select
  using (
    exists (
      select 1 from agency_members am
      join workspaces w on w.agency_id = am.agency_id
      join workspace_members wm on wm.workspace_id = w.id
      where am.profile_id = auth.uid()
        and wm.profile_id = profiles.id
    )
  );
