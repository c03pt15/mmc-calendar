-- Add support for reminder names
-- This migration adds columns to support reminder names for subtask-like functionality

-- Add columns for reminder names (only if they don't exist)
DO $$ 
BEGIN
    -- Add reminder_names column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'reminder_names') THEN
        ALTER TABLE tasks ADD COLUMN reminder_names JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add reminder_custom_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'reminder_custom_name') THEN
        ALTER TABLE tasks ADD COLUMN reminder_custom_name TEXT DEFAULT '';
    END IF;
    
    -- Add custom_reminders column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'custom_reminders') THEN
        ALTER TABLE tasks ADD COLUMN custom_reminders JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add comments for the new columns
COMMENT ON COLUMN tasks.reminder_names IS 'Object mapping reminder types to their names (e.g., {"15min": "Check materials", "1hour": "Review presentation"})';
COMMENT ON COLUMN tasks.reminder_custom_name IS 'Name for custom reminder time';
COMMENT ON COLUMN tasks.custom_reminders IS 'Array of additional custom reminders with time and name properties';

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_names ON tasks USING GIN (reminder_names);
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_custom_name ON tasks(reminder_custom_name);
CREATE INDEX IF NOT EXISTS idx_tasks_custom_reminders ON tasks USING GIN (custom_reminders);

-- Update existing tasks to have empty reminder names
UPDATE tasks SET reminder_names = '{}'::jsonb WHERE reminder_names IS NULL;
UPDATE tasks SET reminder_custom_name = '' WHERE reminder_custom_name IS NULL;
UPDATE tasks SET custom_reminders = '[]'::jsonb WHERE custom_reminders IS NULL;
