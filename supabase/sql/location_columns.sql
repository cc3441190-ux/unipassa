-- 真实定位能力所需字段
-- 1) scenes 保存局的坐标（用于按距离排序）
-- 2) app_guest_data 保存用户最近位置（用于跨端恢复）

alter table public.scenes
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.app_guest_data
  add column if not exists user_location jsonb;

