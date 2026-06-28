-- SQL Schema for ASM ERP (Supabase with RLS Enabled)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  subscription_ends_at timestamptz default (now() + interval '3 days'),
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
  created_at timestamptz default now()
);

-- 3. Services
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  organization_id uuid references organizations(id) on delete cascade,
  created_at timestamptz default now()
);

-- 4. Brands
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- 5. Models
create table if not exists models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- 6. Welcome Screens
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

-- 7. Game Records
create table if not exists game_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  username text,
  game_id text,
  start_time timestamptz default now(),
  play_time integer default 0,
  score integer default 0
);

-- 8. Records (Orders)
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

-- Enable Realtime publication
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table 
    organizations, 
    users, 
    services, 
    brands, 
    models, 
    welcome_screens, 
    game_records, 
    records;
commit;

-- 9. Trigger to sync auth.users to public.users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  user_status text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'Master');
  user_status := case 
    when user_role = 'SenMaster' then 'Approved' 
    when user_role = 'Superadmin' then 'Approved'
    else 'Pending' 
  end;

  -- Update auth.users app_metadata for JWT claims
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || 
                          jsonb_build_object('role', user_role, 'status', user_status)
  where id = new.id;

  -- Insert into public.users
  insert into public.users (id, username, name, phone, role, status, organization_id)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    user_role,
    user_status,
    (new.raw_user_meta_data->>'organization_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. RPC function to update user claims and profile
create or replace function public.update_user_claims(
  target_user_id uuid, 
  new_role text, 
  new_status text, 
  new_org_id uuid,
  new_name text,
  new_phone text
)
returns void as $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || 
                          jsonb_build_object('role', new_role, 'status', new_status),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || 
                           jsonb_build_object('organization_id', new_org_id, 'name', new_name, 'phone', new_phone)
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

-- 11. Enable Row-Level Security (RLS)
alter table organizations enable row level security;
alter table users enable row level security;
alter table services enable row level security;
alter table brands enable row level security;
alter table models enable row level security;
alter table welcome_screens enable row level security;
alter table game_records enable row level security;
alter table records enable row level security;

-- 12. Define RLS policies

-- Organizations
create policy "Allow select organizations for everyone" on organizations for select using (true);
create policy "Allow insert organizations for everyone" on organizations for insert with check (true);
create policy "Allow write organizations for Superadmin" on organizations for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Users
create policy "Allow select users for same org or Superadmin" on users for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin' 
    or organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid
    or id = auth.uid()
  );
create policy "Allow insert users for everyone" on users for insert with check (true);
create policy "Allow update users for self, Superadmin, or SenMaster" on users for update
  using (
    id = auth.uid() 
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster' 
      and organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid
    )
  );

-- Services
create policy "Allow select services for same org or Superadmin" on services for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin' 
    or organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid
  );
create policy "Allow write services for Superadmin or SenMaster" on services for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'SenMaster' 
      and organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid
    )
  );

-- Brands
create policy "Allow select brands for everyone" on brands for select using (true);
create policy "Allow write brands for Superadmin" on brands for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Models
create policy "Allow select models for everyone" on models for select using (true);
create policy "Allow write models for Superadmin" on models for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Welcome Screens
create policy "Allow select welcome_screens for everyone" on welcome_screens for select using (true);
create policy "Allow write welcome_screens for Superadmin" on welcome_screens for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- Game Records
create policy "Allow select game_records for everyone" on game_records for select using (true);
create policy "Allow insert game_records for authenticated" on game_records for insert
  with check (auth.uid() is not null);

-- Records
create policy "Allow all records for same org or Superadmin" on records for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid
  );
