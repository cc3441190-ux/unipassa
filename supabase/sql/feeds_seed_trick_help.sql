-- 小邪招 + 紧急求助 冷启动内容
-- 用法：在 Supabase SQL Editor 中执行本文件
-- 内容：小邪招 10 条 + 紧急求助 10 条

-- 兼容老表结构：若缺少结构化字段则先补齐
alter table public.feeds add column if not exists category text default 'other';
alter table public.feeds add column if not exists city text default null;
alter table public.feeds add column if not exists company text default null;
alter table public.feeds add column if not exists source_type text default 'user';
alter table public.feeds add column if not exists status text default 'active';

insert into public.feeds
  (avatar, author, location, created_at, content, has_image, tags, likes, comments, category, city, company, source_type, status)
values
  -- ==================== 小邪招（10） ====================
  ('🤫','冷启动情报员-邪招01','深圳·南山区 科技园', now() - interval '18 minutes','午休后第一场会总犯困？会前 3 分钟去接一杯温水，开场先复述目标，状态会快很多。', false, array['🤫 小邪招','深圳','效率'], 29, 6, 'trick', '深圳', null, 'seed', 'active'),
  ('🧠','冷启动情报员-邪招02','北京·海淀区 西二旗', now() - interval '43 minutes','和陌生同事第一次协作，先发“我先给你一个可改版本”，推进速度比“你怎么看”更快。', false, array['🤫 小邪招','北京','协作'], 35, 8, 'trick', '北京', null, 'seed', 'active'),
  ('📝','冷启动情报员-邪招03','上海·徐汇区 漕河泾', now() - interval '1 hour 10 minutes','做周报时把“做了什么”改成“产生了什么结果”，同样字数，感知价值会明显提高。', false, array['🤫 小邪招','上海','周报'], 31, 7, 'trick', '上海', null, 'seed', 'active'),
  ('🧩','冷启动情报员-邪招04','杭州·滨江区 江南大道', now() - interval '1 hour 45 minutes','会上被点名答不全时，先说结论+风险，再补细节，既稳住场面又不显得慌。', false, array['🤫 小邪招','杭州','会议'], 27, 5, 'trick', '杭州', null, 'seed', 'active'),
  ('⏱️','冷启动情报员-邪招05','广州·天河区 珠江新城', now() - interval '2 hours 30 minutes','任务太多时用 25 分钟“清障冲刺”：只处理最卡的一件事，焦虑会立刻下降。', false, array['🤫 小邪招','广州','时间管理'], 24, 4, 'trick', '广州', null, 'seed', 'active'),
  ('📦','冷启动情报员-邪招06','重庆·渝北区 光电园', now() - interval '3 hours 15 minutes','需求没讲清楚先别开干，先回一句“我理解的目标是…”，能省掉一半返工。', false, array['🤫 小邪招','重庆','需求沟通'], 22, 4, 'trick', '重庆', null, 'seed', 'active'),
  ('☕','冷启动情报员-邪招07','苏州·工业园区 金鸡湖', now() - interval '4 hours 8 minutes','下午低能量别硬撑，站起来走 5 分钟+喝水，再回来先做最简单一项，容易重新进入节奏。', false, array['🤫 小邪招','苏州','状态恢复'], 20, 3, 'trick', '苏州', null, 'seed', 'active'),
  ('📌','冷启动情报员-邪招08','南京·建邺区 河西', now() - interval '5 hours 2 minutes','跨组对接时，每次只推进一个“可确认项”，别一次丢 5 个问题，回复率更高。', false, array['🤫 小邪招','南京','跨组协作'], 18, 3, 'trick', '南京', null, 'seed', 'active'),
  ('🎯','冷启动情报员-邪招09','武汉·洪山区 光谷', now() - interval '6 hours 12 minutes','被临时加需求时先问“截止时间和优先级”，再接单，能有效避免无底洞任务。', false, array['🤫 小邪招','武汉','优先级'], 23, 5, 'trick', '武汉', null, 'seed', 'active'),
  ('🧯','冷启动情报员-邪招10','西安·雁塔区 高新路', now() - interval '7 hours 4 minutes','线上沟通吵起来时，先把争议点写成三行文字，情绪会降下来，决策会更快。', false, array['🤫 小邪招','西安','冲突处理'], 19, 4, 'trick', '西安', null, 'seed', 'active'),

  -- ==================== 紧急求助（10） ====================
  ('🆘','冷启动情报员-求助01','深圳·福田区 车公庙', now() - interval '16 minutes','紧急求助：明早 9:30 要做 5 分钟项目同步，我现在只有零散信息，谁有“1页汇报模板”？', false, array['🆘 紧急求助','深圳','汇报'], 33, 9, 'help', '深圳', null, 'seed', 'active'),
  ('📣','冷启动情报员-求助02','北京·朝阳区 望京', now() - interval '38 minutes','紧急求助：被安排临时主持站会，有没有“开场30秒+收尾30秒”的话术模板？', false, array['🆘 紧急求助','北京','主持'], 30, 8, 'help', '北京', null, 'seed', 'active'),
  ('🧪','冷启动情报员-求助03','上海·浦东新区 张江', now() - interval '1 hour 6 minutes','紧急求助：线上评审里被追问实验口径，我担心答偏，有没有快速自检清单？', false, array['🆘 紧急求助','上海','评审'], 26, 7, 'help', '上海', null, 'seed', 'active'),
  ('📄','冷启动情报员-求助04','杭州·余杭区 仓前', now() - interval '1 hour 42 minutes','紧急求助：今晚要交周报，但我不知道怎么写“风险和下一步”，求一个可直接套用的写法。', false, array['🆘 紧急求助','杭州','周报'], 24, 6, 'help', '杭州', null, 'seed', 'active'),
  ('🧭','冷启动情报员-求助05','广州·天河区 体育西', now() - interval '2 hours 20 minutes','紧急求助：需求反复变更，我怕做错方向。遇到这种情况先和谁对齐最稳？', false, array['🆘 紧急求助','广州','需求变更'], 21, 5, 'help', '广州', null, 'seed', 'active'),
  ('💬','冷启动情报员-求助06','重庆·江北区 观音桥', now() - interval '3 hours 2 minutes','紧急求助：要催一个跨组同学给数据，但不想显得咄咄逼人，有高情商催办话术吗？', false, array['🆘 紧急求助','重庆','沟通'], 22, 5, 'help', '重庆', null, 'seed', 'active'),
  ('🧱','冷启动情报员-求助07','苏州·高新区 狮山', now() - interval '4 hours 25 minutes','紧急求助：今天连续开会没产出，我想在群里同步进度，怎么写才不显得“没做事”？', false, array['🆘 紧急求助','苏州','进度同步'], 18, 4, 'help', '苏州', null, 'seed', 'active'),
  ('🗂️','冷启动情报员-求助08','南京·鼓楼区 新街口', now() - interval '5 hours 14 minutes','紧急求助：接到新任务但背景不全，第一次问需求方应该问哪三件事最关键？', false, array['🆘 紧急求助','南京','任务澄清'], 20, 4, 'help', '南京', null, 'seed', 'active'),
  ('🔧','冷启动情报员-求助09','武汉·武昌区 中南路', now() - interval '6 hours 9 minutes','紧急求助：我做的方案被说“不够落地”，有没有快速补充执行细节的方法？', false, array['🆘 紧急求助','武汉','方案落地'], 23, 5, 'help', '武汉', null, 'seed', 'active'),
  ('🚨','冷启动情报员-求助10','西安·碑林区 南门', now() - interval '7 hours 1 minutes','紧急求助：今晚要给老板发一段项目异常说明，怎么写才能客观、不甩锅、又能给解决方案？', false, array['🆘 紧急求助','西安','异常说明'], 25, 6, 'help', '西安', null, 'seed', 'active')
;

-- 可选回滚（仅删除本文件插入）
-- delete from public.feeds
-- where author like '冷启动情报员-邪招%'
--    or author like '冷启动情报员-求助%';

