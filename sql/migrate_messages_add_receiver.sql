-- ============================================
-- 消息表升级：支持教师主动发消息给学生
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1. 新增字段：接收者用户名
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS receiver_username TEXT;

-- 2. 新增字段：接收者显示名
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS receiver_display_name TEXT;

-- 3. 删除旧 RLS 策略（如果存在）
DROP POLICY IF EXISTS "Students can view own messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;

-- 4. 创建新 RLS 策略：允许所有用户查看消息
--    （学生需要看到老师发给自己的消息）
CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  TO anon
  USING (true);

-- 5. 确认其他策略存在（如不存在则创建）
CREATE POLICY IF NOT EXISTS "Students can insert messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Teacher can update messages"
  ON messages FOR UPDATE
  TO anon
  USING (true);

-- 完成提示
SELECT '消息表升级完成！receiver_username 和 receiver_display_name 字段已添加。' AS result;
