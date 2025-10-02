-- Migration to add is_deleted_instance column to existing tasks table
-- Run this in your Supabase SQL editor

-- Add the is_deleted_instance column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_deleted_instance BOOLEAN DEFAULT FALSE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_instance ON tasks(is_deleted_instance);
