-- ==========================================
-- Supabase Migration - דשבורד ניהול פרויקטים
-- ==========================================
-- הריצו את הסקריפט הזה ב-Supabase SQL Editor

-- טבלת פרויקטים
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6'
);

-- הכנסת 7 הפרויקטים
INSERT INTO projects (id, name, color) VALUES
  ('darom-galilot', 'דרום גלילות', '#3B82F6'),
  ('beit-halohem', 'בית הלוחם', '#EF4444'),
  ('kanyon-ir-yamim', 'קניון עיר ימים', '#10B981'),
  ('ramot-hana', 'רמות חנה', '#F59E0B'),
  ('kirui-ayalon', 'קירוי איילון', '#8B5CF6'),
  ('lev-neve-sharet', 'לב נווה שרת', '#EC4899'),
  ('kikar-noga', 'כיכר נגה', '#06B6D4');

-- טבלת משימות
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  assignee TEXT NOT NULL DEFAULT '',
  due_date DATE,
  notes TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- טבלת תוכנית עבודה חודשית
CREATE TABLE monthly_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  activity TEXT NOT NULL,
  responsible TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- טבלת אבני דרך
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- טבלת חשבונות
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  consultant_name TEXT NOT NULL,
  submission_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'paid')),
  notes TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- אינדקסים לביצועים
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_monthly_plan_items_project_id ON monthly_plan_items(project_id);
CREATE INDEX idx_monthly_plan_items_period ON monthly_plan_items(project_id, year, month);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);

-- הפעלת RLS (Row Level Security) - פתוח לכולם (ללא אימות)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- מדיניות גישה פתוחה (anon key)
CREATE POLICY "Allow all access to projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to monthly_plan_items" ON monthly_plan_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to milestones" ON milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
