-- 游客/设备维度：把除 feeds/scenes 外的个人数据同步到 Supabase
-- 在 Supabase SQL Editor 中执行

create table if not exists public.app_guest_data (
  guest_id text primary key,
  user_profile jsonb,
  joined_ids jsonb not null default '[]'::jsonb,
  dazis jsonb not null default '[]'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  ai_chat jsonb not null default '[]'::jsonb,
  app_state text not null default 'onboarding',
  active_tab text not null default 'home',
  updated_at timestamptz not null default now()
);

create index if not exists app_guest_data_updated_at_idx on public.app_guest_data (updated_at desc);

alter table public.app_guest_data disable row level security;

grant select, insert, update, delete on table public.app_guest_data to anon, authenticated;
 