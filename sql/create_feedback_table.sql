-- ============================================
-- 学习反馈问卷数据表
-- 用于存储学生提交的问卷反馈
-- ============================================

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    student_username TEXT NOT NULL,
    student_name TEXT NOT NULL,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    resource_rating INTEGER CHECK (resource_rating >= 1 AND resource_rating <= 5),
    speaking_rating INTEGER CHECK (speaking_rating >= 1 AND speaking_rating <= 5),
    listening_rating INTEGER CHECK (listening_rating >= 1 AND listening_rating <= 5),
    vocabulary_rating INTEGER CHECK (vocabulary_rating >= 1 AND vocabulary_rating <= 5),
    grammar_rating INTEGER CHECK (grammar_rating >= 1 AND grammar_rating <= 5),
    sentence_rating INTEGER CHECK (sentence_rating >= 1 AND sentence_rating <= 5),
    writing_rating INTEGER CHECK (writing_rating >= 1 AND writing_rating <= 5),
    ui_design INTEGER NOT NULL CHECK (ui_design >= 1 AND ui_design <= 5),
    ease_use INTEGER NOT NULL CHECK (ease_use >= 1 AND ease_use <= 5),
    mobile_exp INTEGER NOT NULL CHECK (mobile_exp >= 1 AND mobile_exp <= 5),
    issue_freq INTEGER NOT NULL CHECK (issue_freq >= 1 AND issue_freq <= 5),
    effect_vocab INTEGER NOT NULL CHECK (effect_vocab >= 1 AND effect_vocab <= 5),
    effect_sentence INTEGER NOT NULL CHECK (effect_sentence >= 1 AND effect_sentence <= 5),
    effect_listening INTEGER NOT NULL CHECK (effect_listening >= 1 AND effect_listening <= 5),
    effect_speaking INTEGER NOT NULL CHECK (effect_speaking >= 1 AND effect_speaking <= 5),
    fav_module TEXT,
    improvement TEXT,
    continue_use TEXT NOT NULL CHECK (continue_use IN ('yes', 'maybe', 'no')),
    other_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_feedback_student ON feedback(student_username);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- 设置RLS（行级安全）策略，允许匿名插入
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 允许任何人插入反馈
CREATE POLICY "Allow anonymous insert" ON feedback
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 允许任何人查看反馈（教师后台需要）
CREATE POLICY "Allow select all" ON feedback
    FOR SELECT TO anon, authenticated
    USING (true);
