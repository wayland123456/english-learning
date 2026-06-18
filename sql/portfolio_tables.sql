-- ============================================
-- 旅行攻略表 + RLS
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

ALTER TABLE travel_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for public" ON travel_guides
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_travel_guides_username ON travel_guides(username);

-- ============================================
-- 旅行日记表 + RLS
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

ALTER TABLE travel_diary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for public" ON travel_diary
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_travel_diary_username ON travel_diary(username);
