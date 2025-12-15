-- SQL Script to clean up deleted tasks from Supabase

-- 1. Inspect tasks that are marked as 'deleted'
-- Run this first to see what will be affected
SELECT id, title, status, is_deleted_instance, created_by 
FROM tasks 
WHERE status = 'deleted';

-- 2. Inspect specific tasks appearing in search (replace 'Test' with your search term)
SELECT id, title, status, is_recurring, is_deleted_instance, parent_task_id 
FROM tasks 
WHERE title ILIKE '%Test%';


-- 3. OPTION 1: Delete only non-recurring deleted tasks (SAFE)
-- These are tasks that were "soft-deleted" but are not markers for recurring task exceptions.
-- It is generally safe to remove these.
DELETE FROM tasks 
WHERE status = 'deleted' 
AND (is_deleted_instance IS NULL OR is_deleted_instance = false);


-- 4. OPTION 2: Delete ALL tasks marked as 'deleted' (USE WITH CAUTION)
-- WARNING: This includes "deleted instance markers" (is_deleted_instance = true).
-- These markers are used to hide specific occurrences of a recurring task (e.g. you deleted just the Monday meeting).
-- IF YOU DELETE THESE MARKERS, THE DELETED OCCURRENCES WILL REAPPEAR ON YOUR CALENDAR.
-- Uncomment the line below only if you understand this consequence.

-- DELETE FROM tasks WHERE status = 'deleted';
