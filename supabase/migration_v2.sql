-- ==========================================
-- Migration V2 - לוח שבועי + גאנט שבועות
-- ==========================================
-- הריצו את הסקריפט הזה ב-Supabase SQL Editor

-- טבלת אירועים שבועיים (תוכנית עבודה חודשית)
CREATE TABLE weekly_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_weekly_events_project ON weekly_events(project_id);
CREATE INDEX idx_weekly_events_date ON weekly_events(project_id, event_date);

ALTER TABLE weekly_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to weekly_events" ON weekly_events FOR ALL USING (true) WITH CHECK (true);

-- הוספת עמודת קטגוריה לטבלת אבני דרך (גאנט)
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';
