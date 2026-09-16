-- ============================================
-- 2026-09-16 安全修复：锁死 app_config 表
-- 原因：原策略为 "Allow all on app_config" FOR ALL USING (true)，
--       导致任何人用公开的 anon key 就能读取表内全部内容。
--       实测 GET /rest/v1/app_config?select=key,value 返回 200 并回吐出
--       明文 sk- 开头的 DashScope 密钥，已造成实际盗刷（累计 400+ 元）。
--
-- 修复后：模型厂商密钥一律只放 Edge Function Secrets，
--         前端不再从数据库读取任何密钥。
--
-- 在 Supabase SQL Editor 中执行：
-- https://supabase.com/dashboard/project/gqlwspxcyhjtzhikcexj/sql/new
-- ============================================

-- 1) 清掉表里残留的模型密钥（含历史遗留的其它 Key 名）
DELETE FROM app_config
WHERE key IN ('qwen_api_key', 'gemini_api_key', 'dashscope_api_key', 'api_key');

-- 2) 删除那条"对所有人开放"的策略
DROP POLICY IF EXISTS "Allow all on app_config" ON app_config;
DROP POLICY IF EXISTS "allow all" ON app_config;
DROP POLICY IF EXISTS "public read" ON app_config;
DROP POLICY IF EXISTS "allow read" ON app_config;

-- 3) 保持 RLS 开启，且不再新增任何 anon / authenticated 可用策略。
--    没有策略 = 默认拒绝，只有 service_role（服务端）能绕过 RLS 访问。
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- 4) 再从权限层面收一道，防止将来有人误加策略
REVOKE ALL ON TABLE app_config FROM anon;
REVOKE ALL ON TABLE app_config FROM authenticated;

-- ============================================
-- 验证（期望：用 anon key 请求返回空数组 [] ）
--   curl "https://gqlwspxcyhjtzhikcexj.supabase.co/rest/v1/app_config?select=key,value" \
--        -H "apikey: <你的 publishable key>"
-- 若仍返回密钥，说明还有其它策略或视图在放行，请检查：
--   SELECT * FROM pg_policies WHERE tablename = 'app_config';
-- ============================================
