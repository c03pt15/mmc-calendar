-- Simple test data for MMC Calendar
-- Run this in your Supabase SQL Editor

-- Clear existing data
DELETE FROM activities;
DELETE FROM tasks;

-- Reset sequences
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE activities_id_seq RESTART WITH 1;

-- Insert basic test tasks
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Team Meeting', 'Weekly team standup meeting', 'meeting', 'team', 8, 0, 2025, '10:00', 1, 'completed', 'bg-blue-100 text-blue-800', 'high', ARRAY['meeting', 'team'], 1, false, false, null, null),
('Content Planning', 'Plan content for January', 'task', 'content', 15, 0, 2025, '14:00', 2, 'in-progress', 'bg-green-100 text-green-800', 'medium', ARRAY['content', 'planning'], 1, false, false, null, null),
('Client Review', 'Monthly client review meeting', 'meeting', 'client', 22, 0, 2025, '11:00', 3, 'planned', 'bg-orange-100 text-orange-800', 'high', ARRAY['client', 'review'], 1, false, false, null, null),

-- February 2025
('Valentine Campaign', 'Create Valentine''s Day campaign', 'task', 'marketing', 10, 1, 2025, '09:00', 1, 'planned', 'bg-pink-100 text-pink-800', 'medium', ARRAY['campaign', 'valentine'], 1, false, false, null, null),
('Website Update', 'Update website content', 'task', 'technical', 18, 1, 2025, '15:00', 2, 'in-progress', 'bg-purple-100 text-purple-800', 'low', ARRAY['website', 'update'], 1, false, false, null, null),

-- March 2025
('Spring Planning', 'Plan spring marketing strategy', 'task', 'strategy', 5, 2, 2025, '10:30', 3, 'planned', 'bg-green-100 text-green-800', 'high', ARRAY['spring', 'strategy'], 1, false, false, null, null),
('Team Retreat', 'Annual team retreat', 'event', 'team', 20, 2, 2025, '09:00', 1, 'planned', 'bg-blue-100 text-blue-800', 'medium', ARRAY['retreat', 'team'], 1, true, true, '2025-03-20', '2025-03-22'),

-- Multi-day task
('Website Redesign', 'Complete website redesign project', 'project', 'design', 1, 0, 2025, '09:00', 2, 'in-progress', 'bg-purple-100 text-purple-800', 'high', ARRAY['website', 'redesign'], 1, false, true, '2025-01-01', '2025-01-15'),

-- All-day task
('Company Holiday', 'New Year holiday', 'holiday', 'company', 1, 0, 2025, null, 1, 'completed', 'bg-gray-100 text-gray-800', 'low', ARRAY['holiday', 'company'], 1, true, false, null, null);

-- Insert test activities
INSERT INTO activities (type, task_id, task_title, user_id, user_name, message, created_at) VALUES
('task_created', 1, 'Team Meeting', '1', 'Courtney Wright', 'Created new task: Team Meeting', NOW() - INTERVAL '30 days'),
('task_updated', 1, 'Team Meeting', '1', 'Courtney Wright', 'Updated status to completed', NOW() - INTERVAL '25 days'),
('task_created', 2, 'Content Planning', '2', 'Ghislain Girard', 'Created new task: Content Planning', NOW() - INTERVAL '28 days'),
('task_updated', 2, 'Content Planning', '2', 'Ghislain Girard', 'Updated status to in-progress', NOW() - INTERVAL '20 days'),
('task_created', 3, 'Client Review', '3', 'Joy Pavelich', 'Created new task: Client Review', NOW() - INTERVAL '25 days'),
('task_created', 4, 'Valentine Campaign', '1', 'Courtney Wright', 'Created new task: Valentine Campaign', NOW() - INTERVAL '2 hours'),
('task_created', 5, 'Website Update', '2', 'Ghislain Girard', 'Created new task: Website Update', NOW() - INTERVAL '1 hour'),
('task_created', 6, 'Spring Planning', '3', 'Joy Pavelich', 'Created new task: Spring Planning', NOW() - INTERVAL '30 minutes'),
('task_created', 7, 'Team Retreat', '1', 'Courtney Wright', 'Created new task: Team Retreat', NOW() - INTERVAL '15 minutes'),
('task_created', 8, 'Website Redesign', '2', 'Ghislain Girard', 'Created new task: Website Redesign', NOW() - INTERVAL '10 minutes'),
('task_created', 9, 'Company Holiday', '1', 'Courtney Wright', 'Created new task: Company Holiday', NOW() - INTERVAL '5 minutes');

-- Show completion message
SELECT 'Simple test data populated successfully!' as status;
