-- Add multi-day fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_multiday BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_date DATE;

-- Create indexes for better performance on multi-day queries
CREATE INDEX IF NOT EXISTS idx_tasks_multiday ON tasks(is_multiday);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_end_date ON tasks(end_date);
