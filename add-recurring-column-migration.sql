-- Add missing recurring column to tasks table
-- This migration adds the recurring column that the application expects

-- Add recurring column if it doesn't exist
DO $$ 
BEGIN
    -- Add recurring column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'recurring') THEN
        ALTER TABLE tasks ADD COLUMN recurring BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add recurring_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'recurring_type') THEN
        ALTER TABLE tasks ADD COLUMN recurring_type TEXT DEFAULT '';
    END IF;
END $$;

-- Add comments for the new columns
COMMENT ON COLUMN tasks.recurring IS 'Legacy recurring field for backward compatibility';
COMMENT ON COLUMN tasks.recurring_type IS 'Legacy recurring type field for backward compatibility';

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_legacy ON tasks(recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_type ON tasks(recurring_type);

-- Update existing tasks to have default values
UPDATE tasks SET recurring = FALSE WHERE recurring IS NULL;
UPDATE tasks SET recurring_type = '' WHERE recurring_type IS NULL;
