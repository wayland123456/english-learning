-- ============================================
-- 创建 app_config 表（教师保存 Gemini API Key，学生共享）
-- 在 Supabase SQL Editor 中执行此 SQL
-- https://supabase.com/dashboard/project/gqlwspxcyhjtzhikcexj/sql/new
-- ============================================

CREATE TABLE IF NOT EXISTS app_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 允许所有操作（anon key 已验证，应用层控制教师/学生权限）
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on app_config" ON app_config
  FOR ALL
  USING (true)
  WITH CHECK (true);
