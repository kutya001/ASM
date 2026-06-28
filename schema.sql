-- SQL Schema for ASM ERP (Supabase)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- 2. Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
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
  -- Remove publication if exists (to avoid errors)
  drop publication if exists supabase_realtime;
  
  -- Re-create publication for all tables
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
