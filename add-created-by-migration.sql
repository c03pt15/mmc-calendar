-- Migration to add created_by column to existing tasks table
-- Run this in your Supabase SQL editor

-- Add the created_by column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by INTEGER;

-- Add index for better performance on created_by queries
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Update existing tasks to have created_by set to assignee (as a fallback)
UPDATE tasks SET created_by = assignee WHERE created_by IS NULL;
