-- Migration to add recurring instance columns to existing tasks table
-- Run this in your Supabase SQL editor

-- Add the instance_key column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS instance_key TEXT;

-- Add the is_recurring_instance column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring_instance BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_instance_key ON tasks(instance_key);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_instance ON tasks(is_recurring_instance);
