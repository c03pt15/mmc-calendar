-- Migration to support multiple assignees for tasks
-- This changes the assignee field from INTEGER to INTEGER[]

-- First, add a new column for multiple assignees
ALTER TABLE tasks ADD COLUMN assignees INTEGER[];

-- Copy existing assignee data to the new assignees array
UPDATE tasks SET assignees = ARRAY[assignee] WHERE assignee IS NOT NULL;

-- Make assignees NOT NULL and set default to empty array for any remaining NULL values
UPDATE tasks SET assignees = ARRAY[]::INTEGER[] WHERE assignees IS NULL;
ALTER TABLE tasks ALTER COLUMN assignees SET NOT NULL;

-- Create an index for the new assignees array column
CREATE INDEX IF NOT EXISTS idx_tasks_assignees ON tasks USING GIN (assignees);

-- Drop the old assignee column (commented out for safety - uncomment after testing)
-- ALTER TABLE tasks DROP COLUMN assignee;

-- Note: The old assignee column is kept for now to ensure backward compatibility
-- You can drop it after confirming everything works correctly
