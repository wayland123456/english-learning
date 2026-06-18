-- ============================================
-- 旅行攻略表
-- ============================================
CREATE TABLE IF NOT EXISTS travel_guides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    country_id TEXT NOT NULL,
    attractions TEXT[] DEFAULT '{}',
    phrases TEXT[] DEFAULT '{}',
    foods TEXT[] DEFAULT '{}',
    gifts TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 旅行日记表
-- ============================================
CREATE TABLE IF NOT EXISTS travel_diary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    destination TEXT NOT NULL,
    activities TEXT[] DEFAULT '{}',
    weather TEXT,
    mood TEXT,
    vocab TEXT[] DEFAULT '{}',
    entry_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_travel_guides_username ON travel_guides(username);
CREATE INDEX IF NOT EXISTS idx_travel_diary_username ON travel_diary(username);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE travel_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_diary ENABLE ROW LEVEL SECURITY;

-- 策略说明：
--   学生只能通过网站代码（已做 username 过滤）访问自己的数据
--   教师通过 teacher.html 查看全班数据
--   使用 public 访问策略，应用层负责权限控制
CREATE POLICY "Enable all for public" ON travel_guides
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for public" ON travel_diary
    FOR ALL
    USING (true)
    WITH CHECK (true);
