-- ============================================================
-- 补 progress 表缺失的 4 个字段（2026-10-22）
--
-- 问题：前端保存学习进度时会写入
--         learned_country_attractions / done_dialogues /
--         done_reading / learned_resources
--       但 progress 表里没有这 4 列，Supabase 返回
--         PGRST204: Could not find the 'done_dialogues' column
--       结果：每次保存进度都是 400 失败，进度实际只存在浏览器本地，
--             换设备就丢，教师端也看不到学生真实进度。
--
-- 影响：不影响浏览和使用，只影响进度入库。修完即恢复正常。
-- 执行位置：Supabase Dashboard → SQL Editor（整段执行一次）
-- ============================================================

alter table public.progress
  add column if not exists learned_country_attractions jsonb not null default '[]'::jsonb,
  add column if not exists done_dialogues             jsonb not null default '[]'::jsonb,
  add column if not exists done_reading               jsonb not null default '[]'::jsonb,
  add column if not exists learned_resources          jsonb not null default '[]'::jsonb;

-- ---------- 自检：应返回 4 行 ----------
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'progress'
  and column_name in ('learned_country_attractions',
                      'done_dialogues',
                      'done_reading',
                      'learned_resources')
order by column_name;
