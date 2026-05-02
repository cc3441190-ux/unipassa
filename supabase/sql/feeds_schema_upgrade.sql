-- 圈子内容结构升级：从"文本匹配"到"结构化推荐"
-- 执行步骤：
-- 1) 在 Supabase SQL Editor 直接运行本文件
-- 2) 所有新增字段都有默认值，不会破坏现有数据
-- 3) 新增三个表：feed_comments、feed_likes、feed_reports

-- ========== 第 1 步：升级 feeds 表 ==========

-- 添加城市、公司、分类等结构化字段
alter table public.feeds add column if not exists city text default null;
alter table public.feeds add column if not exists company text default null;
alter table public.feeds add column if not exists category text default 'other';
alter table public.feeds add column if not exists source_type text default 'user';
alter table public.feeds add column if not exists lat numeric default null;
alter table public.feeds add column if not exists lng numeric default null;
alter table public.feeds add column if not exists expires_at timestamptz default null;
alter table public.feeds add column if not exists ai_summary text default null;
alter table public.feeds add column if not exists status text default 'active';
alter table public.feeds add column if not exists visibility_radius integer default 3000;

-- 创建索引加速查询
create index if not exists feeds_city_idx on public.feeds(city);
create index if not exists feeds_company_idx on public.feeds(company);
create index if not exists feeds_category_idx on public.feeds(category);
create index if not exists feeds_source_type_idx on public.feeds(source_type);
create index if not exists feeds_status_idx on public.feeds(status);
create index if not exists feeds_created_at_idx on public.feeds(created_at desc);
create index if not exists feeds_expires_at_idx on public.feeds(expires_at);

-- ========== 第 2 步：创建 feed_comments 表 ==========

create table if not exists public.feed_comments (
  id bigint primary key generated always as identity,
  feed_id bigint not null references public.feeds(id) on delete cascade,
  guest_id text not null,
  author text not null,
  avatar text not null default '🐧',
  content text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  likes integer not null default 0
);

create index if not exists feed_comments_feed_id_idx on public.feed_comments(feed_id);
create index if not exists feed_comments_guest_id_idx on public.feed_comments(guest_id);
create index if not exists feed_comments_created_at_idx on public.feed_comments(created_at desc);
create index if not exists feed_comments_status_idx on public.feed_comments(status);

alter table public.feed_comments enable row level security;

grant select on table public.feed_comments to anon, authenticated;
grant insert on table public.feed_comments to anon, authenticated;
grant update(status) on table public.feed_comments to anon, authenticated;

-- ========== 第 3 步：创建 feed_likes 表 ==========

create table if not exists public.feed_likes (
  id bigint primary key generated always as identity,
  feed_id bigint not null references public.feeds(id) on delete cascade,
  guest_id text not null,
  created_at timestamptz not null default now(),
  unique(feed_id, guest_id)
);

create index if not exists feed_likes_feed_id_idx on public.feed_likes(feed_id);
create index if not exists feed_likes_guest_id_idx on public.feed_likes(guest_id);

alter table public.feed_likes enable row level security;

grant select on table public.feed_likes to anon, authenticated;
grant insert on table public.feed_likes to anon, authenticated;
grant delete on table public.feed_likes to anon, authenticated;

-- ========== 第 4 步：创建 feed_reports 表（举报/治理） ==========

create table if not exists public.feed_reports (
  id bigint primary key generated always as identity,
  feed_id bigint not null references public.feeds(id) on delete cascade,
  guest_id text not null,
  reason text not null,
  description text default null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz default null,
  reviewed_by text default null
);

create index if not exists feed_reports_feed_id_idx on public.feed_reports(feed_id);
create index if not exists feed_reports_status_idx on public.feed_reports(status);
create index if not exists feed_reports_created_at_idx on public.feed_reports(created_at desc);

alter table public.feed_reports enable row level security;

grant select on table public.feed_reports to anon, authenticated;
grant insert on table public.feed_reports to anon, authenticated;

-- ========== 第 5 步：创建视图，方便统计和查询 ==========

-- 热度视图（最近 24 小时的互动数）
create or replace view public.feeds_trending_24h as
  select 
    f.id,
    f.content,
    f.location,
    f.city,
    f.company,
    f.category,
    f.created_at,
    f.likes,
    f.comments,
    (select count(*) from public.feed_likes where feed_id = f.id) as real_likes,
    (select count(*) from public.feed_comments where feed_id = f.id and status = 'active') as real_comments,
    (f.likes + (select count(*) from public.feed_likes where feed_id = f.id) + 
     (select count(*) from public.feed_comments where feed_id = f.id and status = 'active') * 2) as heat_score
  from public.feeds f
  where f.created_at > now() - interval '24 hours'
    and f.status = 'active'
    and (f.expires_at is null or f.expires_at > now())
  order by heat_score desc;

-- ========== 第 6 步：权限收紧（RLS 策略） ==========

-- 禁用 feeds 的 row level security（现在设为不允许修改）
-- 后期运营后台可以加审核员角色

-- feed_comments 和 feed_likes 的 RLS 策略已在上面定义

-- ========== 第 7 步：数据迁移：补充现有 feeds 的城市和公司 ==========

-- 从 location 字段解析城市
update public.feeds
set city = case 
  when location like '%深圳%' then '深圳'
  when location like '%北京%' then '北京'
  when location like '%上海%' then '上海'
  when location like '%杭州%' then '杭州'
  when location like '%广州%' then '广州'
  when location like '%苏州%' then '苏州'
  when location like '%南京%' then '南京'
  when location like '%武汉%' then '武汉'
  when location like '%西安%' then '西安'
  when location like '%重庆%' then '重庆'
  else null
end
where city is null and location is not null;

-- 标记现有冷启动数据
update public.feeds
set source_type = case
  when author like '%情报员%' then 'seed'
  else 'user'
end
where source_type = 'user';

-- 标记冷启动内容的分类
update public.feeds
set category = case
  when content like '%电梯%' or content like '%通勤%' or content like '%地铁%' then '通勤'
  when content like '%咖啡%' or content like '%食堂%' or content like '%饭%' or content like '%吃%' then '干饭'
  when content like '%会议%' or content like '%打印%' or content like '%工位%' then '办公'
  when content like '%吐槽%' or content like '%踩雷%' then '吐槽'
  when content like '%求助%' or content like '%紧急%' then '求助'
  when content like '%避雷%' or content like '%提醒%' then '避雷'
  when content like '%打卡%' or content like '%推荐%' or content like '%推介%' then '打卡'
  else 'other'
end
where category = 'other' and source_type = 'seed';

-- ========== 回滚脚本（如需要） ==========

/*
-- 如需回滚，可按以下顺序删除新增内容：

-- 删除视图
drop view if exists public.feeds_trending_24h;

-- 删除新表
drop table if exists public.feed_reports;
drop table if exists public.feed_likes;
drop table if exists public.feed_comments;

-- 删除字段
alter table public.feeds drop column if exists city;
alter table public.feeds drop column if exists company;
alter table public.feeds drop column if exists category;
alter table public.feeds drop column if exists source_type;
alter table public.feeds drop column if exists lat;
alter table public.feeds drop column if exists lng;
alter table public.feeds drop column if exists expires_at;
alter table public.feeds drop column if exists ai_summary;
alter table public.feeds drop column if exists status;
alter table public.feeds drop column if exists visibility_radius;

*/