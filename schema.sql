-- SQL Schema for ASM ERP (Supabase with RLS Enabled)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  subscription_ends_at timestamptz default (now() + interval '3 days'),
  max_users integer default 3,
  created_at timestamptz default now()
);

-- 2. Users
create table if not exists users (
  id uuid primary key, -- References auth.users(id)
  username text not null unique,
  name text,
  phone text,
  role text not null default 'Master',
  status text not null default 'Pending',
  organization_id uuid references organizations(id) on delete cascade,
  last_login_at timestamptz,
  created_at timestamptz default now()
);

-- 3. Service Categories
create table if not exists service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- 4. Global Services (Templates)
create table if not exists global_services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references service_categories(id) on delete cascade,
  name text not null,
  default_price numeric not null default 0,
  created_at timestamptz default now()
);

-- 5. Services (Tenant Services)
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  organization_id uuid references organizations(id) on delete cascade,
  category_id uuid references service_categories(id) on delete set null,
  global_service_id uuid references global_services(id) on delete set null,
  is_custom boolean not null default false,
  created_at timestamptz default now()
);

-- 6. Brands
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- 7. Models
create table if not exists models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- 8. Organization Brands & Models (Junction Tables for Tenant Vehicle Scope)
create table if not exists organization_brands (
  organization_id uuid references organizations(id) on delete cascade,
  brand_id uuid references brands(id) on delete cascade,
  primary key (organization_id, brand_id)
);

create table if not exists organization_models (
  organization_id uuid references organizations(id) on delete cascade,
  model_id uuid references models(id) on delete cascade,
  primary key (organization_id, model_id)
);

-- 9. Welcome Screens
create table if not exists welcome_screens (
  id text primary key,
  title text,
  text text,
  created_at timestamptz default now()
);

-- Initialize default welcome screen info
insert into welcome_screens (id, title, text)
values ('welcome_main', 'Добро пожаловать в ASM ERP', 'Система автоматизации автосервисов.')
on conflict (id) do nothing;

-- 10. Game Records
create table if not exists game_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  username text,
  game_id text,
  start_time timestamptz default now(),
  play_time integer default 0,
  score integer default 0
);

-- 11. Records (Orders)
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  phone text,
  car_number text,
  brand_id uuid references brands(id) on delete set null,
  model_id uuid references models(id) on delete set null,
  master_id uuid references users(id) on delete set null,
  start_time timestamptz default now(),
  end_time timestamptz,
  status text not null default 'Открыт',
  services_json jsonb default '[]'::jsonb,
  additional_services text,
  total_amount numeric not null default 0,
  comment text,
  is_paid boolean not null default false,
  organization_id uuid references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- 12. Subscription Logs (Journal)
create table if not exists subscription_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  max_users integer not null default 3,
  amount numeric not null default 1500,
  created_at timestamptz default now()
);

-- 13. Support Tickets (Заявки)
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade,
  category text not null,
  description text not null,
  status text not null default 'Открыта',
  created_at timestamptz default now()
);

-- 14. Page Views (Логи кликов страниц)
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade,
  page_name text not null,
  created_at timestamptz default now()
);

-- Indexes for performance & query optimization
create index if not exists idx_records_org_master on records (organization_id, master_id);
create index if not exists idx_records_start_time on records (start_time desc);
create index if not exists idx_records_status on records (status);
create index if not exists idx_services_org on services (organization_id);
create index if not exists idx_models_brand on models (brand_id);
create index if not exists idx_global_services_cat on global_services (category_id);
create index if not exists idx_page_views_created on page_views (created_at desc);
create index if not exists idx_support_tickets_user on support_tickets (user_id);
create index if not exists idx_support_tickets_org on support_tickets (organization_id);

-- Enable Realtime publication
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table 
    organizations, 
    users, 
    services, 
    service_categories,
    global_services,
    brands, 
    models, 
    organization_brands,
    organization_models,
    welcome_screens, 
    game_records, 
    records,
    subscription_logs,
    support_tickets,
    page_views;
commit;

-- 15. Trigger to sync auth.users to public.users with Security Guard against Superadmin self-assignment
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_role text;
  assigned_role text;
  assigned_status text;
  org_id uuid;
  existing_senmaster_count int;
begin
  raw_role := coalesce(new.raw_user_meta_data->>'role', 'Master');
  
  -- Parse organization_id if provided
  org_id := null;
  if new.raw_user_meta_data->>'organization_id' is not null and new.raw_user_meta_data->>'organization_id' != '' then
    begin
      org_id := (new.raw_user_meta_data->>'organization_id')::uuid;
    exception when others then
      org_id := null;
    end;
  end if;

  -- Security Guard 1: Never allow assigning 'Superadmin' via user-provided metadata
  if raw_role = 'Superadmin' then
    assigned_role := 'Master';
    assigned_status := 'Pending';
  elsif raw_role = 'SenMaster' and org_id is not null then
    -- Check if this organization already has a SenMaster
    select count(*) into existing_senmaster_count 
    from public.users 
    where organization_id = org_id and role = 'SenMaster';

    if existing_senmaster_count = 0 then
      -- First master / creator of this organization is the approved SenMaster
      assigned_role := 'SenMaster';
      assigned_status := 'Approved';
    else
      -- Organization already has an owner; additional masters must be regular Masters and Pending approval
      assigned_role := 'Master';
      assigned_status := 'Pending';
    end if;
  else
    assigned_role := 'Master';
    assigned_status := 'Pending';
  end if;

  -- Insert into public.users
  insert into public.users (id, username, role, status, organization_id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    assigned_role,
    assigned_status,
    org_id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update set
    role = excluded.role,
    status = excluded.status,
    organization_id = excluded.organization_id,
    name = coalesce(nullif(excluded.name, ''), public.users.name),
    phone = coalesce(nullif(excluded.phone, ''), public.users.phone);

  -- Synchronize auth.users app_metadata for JWT claims
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || 
                          jsonb_build_object(
                            'role', assigned_role, 
                            'status', assigned_status,
                            'organization_id', org_id
                          )
  where id = new.id;

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 16. RPC function to update user claims and profile (Secured with role checks)
create or replace function public.update_user_claims(
  target_user_id uuid, 
  new_role text, 
  new_status text, 
  new_org_id uuid,
  new_name text,
  new_phone text
)
returns void as $$
declare
  caller_id uuid;
  caller_role text;
  caller_org text;
  target_current_org text;
  target_current_role text;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'Unauthorized: Authentication required';
  end if;

  caller_role := auth.jwt() -> 'app_metadata' ->> 'role';
  caller_org := auth.jwt() -> 'app_metadata' ->> 'organization_id';

  select organization_id::text, role into target_current_org, target_current_role
  from public.users
  where id = target_user_id;

  -- Security Verification
  if caller_role = 'Superadmin' then
    -- Superadmin has full authority
    null;
  elsif caller_role = 'SenMaster' then
    -- SenMaster can ONLY update Masters within their own organization
    if caller_org is null or target_current_org is null or caller_org != target_current_org then
      raise exception 'Unauthorized: Cannot modify users of another organization';
    end if;
    if target_current_role = 'Superadmin' or new_role = 'Superadmin' then
      raise exception 'Unauthorized: Cannot grant or modify Superadmin privileges';
    end if;
    if new_org_id is not null and new_org_id::text != caller_org then
      raise exception 'Unauthorized: Cannot move users to another organization';
    end if;
  else
    raise exception 'Unauthorized: Insufficient permissions to update user claims';
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || 
                          jsonb_build_object(
                            'role', new_role, 
                            'status', new_status,
                            'organization_id', new_org_id
                          ),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || 
                           jsonb_build_object(
                             'organization_id', new_org_id, 
                             'name', new_name, 
                             'phone', new_phone
                           )
  where id = target_user_id;

  update public.users
  set role = new_role,
      status = new_status,
      organization_id = new_org_id,
      name = new_name,
      phone = new_phone
  where id = target_user_id;
end;
$$ language plpgsql security definer;

-- 17. Enable Row-Level Security (RLS) on all tables
alter table organizations enable row level security;
alter table users enable row level security;
alter table service_categories enable row level security;
alter table global_services enable row level security;
alter table services enable row level security;
alter table brands enable row level security;
alter table models enable row level security;
alter table organization_brands enable row level security;
alter table organization_models enable row level security;
alter table welcome_screens enable row level security;
alter table game_records enable row level security;
alter table records enable row level security;
alter table subscription_logs enable row level security;
alter table support_tickets enable row level security;
alter table page_views enable row level security;

-- 18. Define RLS policies

-- Organizations
create policy "Allow select organizations for everyone" on organizations for select using (true);
create policy "Allow insert organizations for authenticated or anon registration" on organizations for insert with check (true);
create policy "Allow update organizations for Superadmin or SenMaster of own org" on organizations for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster'
      and id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    )
  );
create policy "Allow delete organizations for Superadmin" on organizations for delete
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Users
create policy "Allow select users for same org or Superadmin" on users for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin' 
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    or id = auth.uid()
  );
create policy "Allow insert users for system trigger" on users for insert with check (true);
create policy "Allow update users for self, Superadmin, or SenMaster" on users for update
  using (
    id = auth.uid() 
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster' 
      and organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    )
  );
create policy "Allow delete users for Superadmin or SenMaster" on users for delete
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster' 
      and organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
      and role = 'Master'
    )
  );

-- Service Categories (Global dictionary)
create policy "Allow select service_categories for everyone" on service_categories for select using (true);
create policy "Allow write service_categories for Superadmin" on service_categories for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Global Services (Global templates)
create policy "Allow select global_services for everyone" on global_services for select using (true);
create policy "Allow write global_services for Superadmin" on global_services for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Tenant Services
create policy "Allow select services for same org or Superadmin" on services for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin' 
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
  );
create policy "Allow write services for Superadmin or SenMaster" on services for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster' 
      and organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    )
  );

-- Brands & Models
create policy "Allow select brands for everyone" on brands for select using (true);
create policy "Allow write brands for Superadmin" on brands for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

create policy "Allow select models for everyone" on models for select using (true);
create policy "Allow write models for Superadmin" on models for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Organization Brands & Models (Tenant vehicle preferences)
create policy "Allow select organization_brands for same org or Superadmin" on organization_brands for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
  );
create policy "Allow write organization_brands for Superadmin or SenMaster" on organization_brands for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster'
      and organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    )
  );

create policy "Allow select organization_models for same org or Superadmin" on organization_models for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
  );
create policy "Allow write organization_models for Superadmin or SenMaster" on organization_models for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster'
      and organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    )
  );

-- Welcome Screens
create policy "Allow select welcome_screens for everyone" on welcome_screens for select using (true);
create policy "Allow write welcome_screens for Superadmin" on welcome_screens for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Game Records
create policy "Allow select game_records for everyone" on game_records for select using (true);
create policy "Allow insert game_records for authenticated" on game_records for insert
  with check (auth.uid() is not null);
create policy "Allow update game_records for owner" on game_records for update
  using (user_id = auth.uid());

-- Records (Orders) with tenant & role isolation
create policy "Allow select records for authorized roles" on records for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
      and (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster'
        or master_id = auth.uid()
      )
    )
  );

create policy "Allow insert records for org members" on records for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
      and (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster'
        or master_id = auth.uid()
      )
    )
  );

create policy "Allow update records for authorized roles" on records for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
      and (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster'
        or (
          master_id = auth.uid()
          and status = 'Открыт'
        )
      )
    )
  );

create policy "Allow delete records for Superadmin or SenMaster" on records for delete
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster'
      and organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    )
  );

-- Subscription Logs RLS & Policies
create policy "Allow select subscription_logs for same org or Superadmin" on subscription_logs for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
  );

create policy "Allow write subscription_logs for Superadmin" on subscription_logs for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

create policy "Allow insert subscription_logs for same org or Superadmin" on subscription_logs for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
  );

-- Support Tickets RLS & Policies
create policy "Allow select support_tickets for owner or Superadmin" on support_tickets for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or user_id = auth.uid()
  );

create policy "Allow insert support_tickets for authenticated" on support_tickets for insert
  with check (auth.uid() is not null);

create policy "Allow update support_tickets for owner or Superadmin" on support_tickets for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or user_id = auth.uid()
  );

create policy "Allow delete support_tickets for owner or Superadmin" on support_tickets for delete
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or user_id = auth.uid()
  );

-- Page Views RLS & Policies
create policy "Allow insert page_views for authenticated" on page_views for insert
  with check (auth.uid() is not null);

create policy "Allow select page_views for Superadmin" on page_views for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- 19. Admin Update User Password RPC (Superadmin power)
create or replace function public.admin_update_user_password(target_user_id uuid, new_password text)
returns void as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') != 'Superadmin' then
    raise exception 'Unauthorized: Only Superadmins can change passwords';
  end if;

  update auth.users
  set encrypted_password = crypt(new_password, gen_salt('bf'))
  where id = target_user_id;
end;
$$ language plpgsql security definer;

-- 20. Admin Delete User RPC (Superadmin and SenMaster power)
create or replace function public.admin_delete_user(target_user_id uuid)
returns void as $$
declare
  caller_role text;
  caller_org text;
  target_org text;
  target_role text;
begin
  caller_role := auth.jwt() -> 'app_metadata' ->> 'role';
  caller_org := auth.jwt() -> 'app_metadata' ->> 'organization_id';

  select organization_id::text, role into target_org, target_role
  from public.users
  where id = target_user_id;

  if caller_role = 'Superadmin' then
    if target_user_id = auth.uid() then
      raise exception 'Нельзя удалить собственный аккаунт администратора';
    end if;
  elsif caller_role = 'SenMaster' then
    if target_user_id = auth.uid() then
      raise exception 'Нельзя удалить самого себя';
    end if;
    if caller_org is null or target_org is null or caller_org != target_org then
      raise exception 'Нет доступа к удалению пользователя другой организации';
    end if;
    if target_role != 'Master' then
      raise exception 'Старший мастер может удалять только мастеров своей организации';
    end if;
  else
    raise exception 'Недостаточно прав для удаления пользователя';
  end if;

  delete from public.users where id = target_user_id;
  delete from auth.users where id = target_user_id;
end;
$$ language plpgsql security definer;
