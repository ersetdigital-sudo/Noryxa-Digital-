-- =============================================
-- Profiles table — syncs with Supabase Auth
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies
-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile (on signup)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 4. Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 6. Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
