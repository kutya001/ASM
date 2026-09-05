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

-- 8.5. Subscription Logs (Journal)
create table if not exists subscription_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  max_users integer not null default 3,
  amount numeric not null default 1500,
  created_at timestamptz default now()
);

-- 8.6. Support Tickets (Заявки)
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade,
  category text not null,
  description text not null,
  status text not null default 'Открыта',
  created_at timestamptz default now()
);

-- 8.7. Page Views (Логи кликов страниц)
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  organization_id uuid references organizations(id) on delete cascade,
  page_name text not null,
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
    records,
    subscription_logs,
    support_tickets,
    page_views;
commit;

-- 9. Trigger to sync auth.users to public.users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  user_status text;
  org_id text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'Master');
  user_status := case 
    when user_role = 'SenMaster' then 'Approved' 
    when user_role = 'Superadmin' then 'Approved'
    else 'Pending' 
  end;
  org_id := new.raw_user_meta_data->>'organization_id';

  -- Update auth.users app_metadata for JWT claims (secure app_metadata)
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || 
                          jsonb_build_object(
                            'role', user_role, 
                            'status', user_status,
                            'organization_id', org_id
                          )
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
    org_id::uuid
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
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
    or id = auth.uid()
  );
create policy "Allow insert users for everyone" on users for insert with check (true);
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

-- Services
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
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin'
    or organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
  );

-- 13. Subscription Logs RLS & Policies
alter table subscription_logs enable row level security;

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

-- 14. Support Tickets RLS & Policies
alter table support_tickets enable row level security;

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

-- 15. Page Views RLS & Policies
alter table page_views enable row level security;

create policy "Allow insert page_views for authenticated" on page_views for insert
  with check (auth.uid() is not null);

create policy "Allow select page_views for Superadmin" on page_views for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Superadmin');

-- 16. Admin Update User Password RPC (Superadmin power)
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

-- 17. Admin Delete User RPC (Superadmin and SenMaster power)
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

