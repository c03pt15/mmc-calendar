-- Add new columns for advanced recurring patterns
-- Run this in your Supabase SQL Editor

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS recurring_occurrence TEXT,
ADD COLUMN IF NOT EXISTS recurring_month INTEGER;

-- Add comments to document the columns
COMMENT ON COLUMN tasks.recurring_occurrence IS 'For advanced patterns: first, second, third, fourth, or last';
COMMENT ON COLUMN tasks.recurring_month IS 'For yearly advanced patterns: target month (0-11)';
