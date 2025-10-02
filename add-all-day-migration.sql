-- Add is_all_day field to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT FALSE;

-- Create an index for better performance on all-day queries
CREATE INDEX IF NOT EXISTS idx_tasks_all_day ON tasks(is_all_day);
