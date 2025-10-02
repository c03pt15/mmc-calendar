-- Add is_modified_instance column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_modified_instance BOOLEAN DEFAULT FALSE;

-- Add index for better performance when querying modified instances
CREATE INDEX IF NOT EXISTS idx_tasks_modified_instance ON tasks(is_modified_instance);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_modified ON tasks(parent_task_id, is_modified_instance);
