-- 允许前端用 anon key 向 public.scenes 插入新局（「AI 帮我攒个局」发布）
-- 在 Supabase SQL Editor 中执行；若已能 insert 可跳过。

grant usage on schema public to anon, authenticated;

-- 若表在 public 下且尚未授权：
grant select, insert on table public.scenes to anon, authenticated;

-- 若已开启 RLS，需增加策略（按你项目实际调整；示例为允许所有人读、认证/匿名可插）：
-- alter table public.scenes enable row level security;
-- drop policy if exists "scenes_read_all" on public.scenes;
-- create policy "scenes_read_all" on public.scenes for select using (true);
-- drop policy if exists "scenes_insert_anon" on public.scenes;
-- create policy "scenes_insert_anon" on public.scenes for insert with check (true);
