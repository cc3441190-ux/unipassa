-- relationships 表：记录双向搭子关系
-- 加入局成功后写入，两用户均可查询到对方
create table if not exists public.relationships (
  id          bigserial primary key,
  guest_id_a  text not null,
  guest_id_b  text not null,
  scene_id    bigint,
  type        text default 'dazi',          -- dazi / blocked
  status      text default 'active',        -- active / removed
  created_at  timestamptz default now(),
  constraint  uniq_pair unique (guest_id_a, guest_id_b, scene_id)
);

-- 索引：单用户查所有搭子
create index if not exists idx_rel_a on public.relationships (guest_id_a, status);
create index if not exists idx_rel_b on public.relationships (guest_id_b, status);

-- RLS: 任何人可以读写（与 scenes anon 策略一致）
alter table public.relationships enable row level security;
create policy "anon read relationships"  on public.relationships for select using (true);
create policy "anon insert relationships" on public.relationships for insert with check (true);
create policy "anon update relationships" on public.relationships for update using (true);
