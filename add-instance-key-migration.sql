-- Migration to add instance_key column to existing tasks table
-- Run this in your Supabase SQL editor

-- Add the instance_key column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS instance_key TEXT;

-- Add an index for better performance on instance_key queries
CREATE INDEX IF NOT EXISTS idx_tasks_instance_key ON tasks(instance_key);
