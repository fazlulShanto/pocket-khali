-- ============================================================
-- Pocket Khali — incomes table migration
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Create the incomes table
create table if not exists public.incomes (
  id         uuid primary key default gen_random_uuid(),
  local_id   bigint not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric(14, 2) not null,
  currency   text not null default 'BDT',
  source     text not null,
  description text not null default '',
  notes      text,
  date       timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  -- ensures upsert conflict resolution works correctly
  unique (user_id, local_id)
);

-- 2. Index for efficient per-user queries ordered by updated_at (used by pull sync)
create index if not exists incomes_user_updated_at_idx
  on public.incomes (user_id, updated_at asc);

-- 3. Enable Row Level Security
alter table public.incomes enable row level security;

-- 4. RLS Policy: users can only see their own income records
create policy "Users can select own incomes"
  on public.incomes for select
  using (auth.uid() = user_id);

-- 5. RLS Policy: users can insert their own income records
create policy "Users can insert own incomes"
  on public.incomes for insert
  with check (auth.uid() = user_id);

-- 6. RLS Policy: users can update their own income records
create policy "Users can update own incomes"
  on public.incomes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. RLS Policy: users can delete their own income records
create policy "Users can delete own incomes"
  on public.incomes for delete
  using (auth.uid() = user_id);
