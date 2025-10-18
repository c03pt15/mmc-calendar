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
  is_deleted_instance BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  reminders JSONB DEFAULT '[]'::jsonb,
  reminder_times TEXT[] DEFAULT '{}',
  reminder_custom_time TIMESTAMP WITH TIME ZONE,
  created_by INTEGER,
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
CREATE INDEX IF NOT EXISTS idx_tasks_instance_key ON tasks(instance_key);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_instance ON tasks(is_recurring_instance);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_interval ON tasks(recurring_interval);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_unit ON tasks(recurring_unit);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_instance ON tasks(is_deleted_instance);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tasks_reminders ON tasks USING GIN (reminders);
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_times ON tasks USING GIN (reminder_times);
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_custom_time ON tasks(reminder_custom_time);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust based on your security needs)
-- CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
