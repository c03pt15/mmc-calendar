-- Add reminder fields to tasks table
-- This migration adds support for task reminders

-- Add reminder fields to the tasks table
ALTER TABLE tasks 
ADD COLUMN reminders JSONB DEFAULT '[]'::jsonb,
ADD COLUMN reminder_times TEXT[] DEFAULT '{}',
ADD COLUMN reminder_custom_time TIMESTAMP WITH TIME ZONE;

-- Add comments for the new columns
COMMENT ON COLUMN tasks.reminders IS 'Array of reminder objects with type and custom_time properties';
COMMENT ON COLUMN tasks.reminder_times IS 'Array of predefined reminder time types (15min, 30min, 1hour, etc.)';
COMMENT ON COLUMN tasks.reminder_custom_time IS 'Custom reminder date and time';

-- Create an index for better performance on reminder queries
CREATE INDEX IF NOT EXISTS idx_tasks_reminders ON tasks USING GIN (reminders);
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_times ON tasks USING GIN (reminder_times);
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_custom_time ON tasks(reminder_custom_time);

-- Update existing tasks to have empty reminder arrays
UPDATE tasks SET reminders = '[]'::jsonb WHERE reminders IS NULL;
UPDATE tasks SET reminder_times = '{}' WHERE reminder_times IS NULL;
