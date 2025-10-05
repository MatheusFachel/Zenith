-- Create extension for gen_random_uuid if not exists
create extension if not exists pgcrypto;

-- Table: public.transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null default now(),
  type text not null check (type in ('income','expense')),
  category text not null,
  description text,
  amount numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.transactions enable row level security;

-- Policies
create policy "Users can read own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- Indexes
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
