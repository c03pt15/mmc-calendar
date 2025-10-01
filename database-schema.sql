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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance on date queries
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(year, month, date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (adjust based on your security needs)
-- CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
