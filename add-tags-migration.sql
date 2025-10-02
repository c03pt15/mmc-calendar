-- Migration to add tags column to existing tasks table
-- Run this in your Supabase SQL editor

-- Add the tags column as an array of text
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add index for better performance on tags queries
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN (tags);
