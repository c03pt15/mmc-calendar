-- SQL Script to FORCE DELETE tasks by Title
-- -------------------------------------------------------------

-- 1. DELETE the tasks first
DELETE FROM tasks 
WHERE title ILIKE '%Test%';

-- 2. VERIFY they are gone
-- This query runs AFTER the delete. 
-- The result below should be EMPTY (0 rows). 
-- If you see no rows, it worked!
SELECT id, title, status, is_recurring 
FROM tasks 
WHERE title ILIKE '%Test%';
