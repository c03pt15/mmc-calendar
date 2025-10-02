-- Migration to add advanced recurring pattern fields to existing tasks table
-- Run this in your Supabase SQL editor

-- Add the new recurring pattern fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_interval INTEGER DEFAULT 1;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_unit TEXT DEFAULT 'week';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_days INTEGER[];

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_interval ON tasks(recurring_interval);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_unit ON tasks(recurring_unit);
