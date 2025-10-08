-- Clear all tasks and activities from the database
-- This will remove all data but keep the table structure

-- Clear existing data
DELETE FROM activities;
DELETE FROM tasks;

-- Reset sequences to start from 1
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE activities_id_seq RESTART WITH 1;

-- Optional: Show confirmation
SELECT 'Database cleared successfully' as status;
