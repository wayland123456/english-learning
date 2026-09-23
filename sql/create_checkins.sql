-- ============================================================
-- 英语背诵打卡 · 数据表 checkins
-- 用法：Supabase Dashboard → SQL Editor → New query → 全文粘贴 → Run
-- ============================================================

create table if not exists public.checkins (
  id       bigserial primary key,
  cls      text not null,                       -- 班级：'1' / '18'
  student  text not null,                       -- 学号+姓名，如 '01 敖雪婷'（重名靠学号区分）
  content  text not null,                       -- 背诵内容：'words'(3500词) / 'sent'(写作100句)
  grp      int  not null,                       -- 第几组
  d        date not null default current_date,  -- 打卡日期
  ts       timestamptz not null default now(),  -- 打卡时刻
  constraint checkins_uniq unique (cls, student, content, grp)
);

create index if not exists checkins_cls_d_idx on public.checkins (cls, d);
create index if not exists checkins_stu_idx   on public.checkins (cls, student);

alter table public.checkins enable row level security;

-- 页面是公开的打卡页，用 anon key 直接读写；策略全开，靠约束保证不重复
drop policy if exists "checkins_read"   on public.checkins;
drop policy if exists "checkins_insert" on public.checkins;
drop policy if exists "checkins_delete" on public.checkins;
drop policy if exists "checkins_update" on public.checkins;

create policy "checkins_read"   on public.checkins for select using (true);
create policy "checkins_insert" on public.checkins for insert with check (true);
create policy "checkins_delete" on public.checkins for delete using (true);
-- update 策略不能少：页面用 on_conflict + merge-duplicates 做幂等写入，
-- 重复打卡时 PostgREST 走的是 UPDATE，缺这条会报 42501 被拒。
create policy "checkins_update" on public.checkins for update using (true) with check (true);

-- 让 PostgREST 立刻刷新 schema 缓存，避免页面报 PGRST205
notify pgrst, 'reload schema';
