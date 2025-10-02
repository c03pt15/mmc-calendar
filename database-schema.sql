-- Create the tasks table for MMC Calendar
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  date INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  time TEXT,
  assignee INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  color TEXT,
  priority TEXT DEFAULT 'medium',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT,
  recurring_interval INTEGER DEFAULT 1,
  recurring_unit TEXT DEFAULT 'week',
  recurring_days INTEGER[],
  recurring_end_date DATE,
  parent_task_id INTEGER,
  depends_on_task_id INTEGER,
  comments TEXT,
  instance_key TEXT,
  is_recurring_instance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(year, month, date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(is_recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_dependencies ON tasks(depends_on_task_id);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust based on your security needs)
-- CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
