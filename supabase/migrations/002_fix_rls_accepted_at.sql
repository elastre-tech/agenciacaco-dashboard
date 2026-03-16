-- The has_agency_role function requires accepted_at IS NOT NULL,
-- but direct inserts (owner bootstrapping, immediate acceptance) leave it NULL.
-- Fix: treat NULL accepted_at as "accepted" (only pending if explicitly set to a future date).

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
  );
$$;

-- Also fix is_agency_member to not require accepted_at
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
  );
$$;

-- Fix get_user_agency_ids to not require accepted_at
create or replace function get_user_agency_ids(p_user_id uuid)
returns uuid[]
language sql
stable
security definer
as $$
  select coalesce(array_agg(agency_id), '{}')
  from agency_members
  where profile_id = p_user_id;
$$;

-- Fix get_user_workspace_ids to not require accepted_at
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

-- Allow agency owners/admins to insert workspace_members for their workspaces
create policy workspace_members_insert on workspace_members
  for insert with check (
    has_agency_role(
      auth.uid(),
      get_workspace_agency_id(workspace_id),
      'agency_owner'
    )
    or has_agency_role(
      auth.uid(),
      get_workspace_agency_id(workspace_id),
      'agency_admin'
    )
  );

-- Allow agency owners/admins to insert listening_terms (for wizard)
-- This supplements the existing workspace_role-based policy
create policy listening_terms_insert_agency on listening_terms
  for insert with check (
    has_agency_role(
      auth.uid(),
      get_workspace_agency_id(workspace_id),
      'agency_owner'
    )
    or has_agency_role(
      auth.uid(),
      get_workspace_agency_id(workspace_id),
      'agency_admin'
    )
  );

-- Allow agency members to read workspace_members for workspaces in their agency
create policy workspace_members_select_agency on workspace_members
  for select using (
    is_agency_member(auth.uid(), get_workspace_agency_id(workspace_id))
  );
