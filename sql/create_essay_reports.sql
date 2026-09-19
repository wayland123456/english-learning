-- ============================================================
-- 英语作文报告分享表（2026-09-19）
-- 用途：作文批改报告「分享」功能 —— 报告数据存这张表，
--       分享链接只带 8 位短 ID：share.html?r=<id>
-- 使用：Supabase Dashboard → SQL Editor → 粘贴运行本脚本
-- 注意：必须允许 anon 插入/读取（学生未登录也能分享与查看）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.essay_reports (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.essay_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "essay_reports_anon_insert" ON public.essay_reports;
CREATE POLICY "essay_reports_anon_insert"
  ON public.essay_reports FOR INSERT
  TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "essay_reports_anon_select" ON public.essay_reports;
CREATE POLICY "essay_reports_anon_select"
  ON public.essay_reports FOR SELECT
  TO anon USING (true);

-- 可选：自动清理 180 天前的旧报告，防止表无限膨胀
-- （需要 pg_cron 扩展；如果没启用可忽略此段）
-- SELECT cron.schedule('cleanup-essay-reports', '0 4 * * *',
--   $$DELETE FROM public.essay_reports WHERE created_at < now() - interval '180 days'$$);
