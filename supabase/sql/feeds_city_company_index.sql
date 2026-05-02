-- feeds 同城/同公司过滤索引（优化查询性能）
-- 在 Supabase SQL Editor 中执行此文件
create index if not exists idx_feeds_city    on public.feeds (city);
create index if not exists idx_feeds_company on public.feeds (company);

-- 复合索引：同时按 created_at 排序场景
create index if not exists idx_feeds_city_created    on public.feeds (city, created_at desc);
create index if not exists idx_feeds_company_created on public.feeds (company, created_at desc);
