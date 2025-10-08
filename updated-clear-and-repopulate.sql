-- Clear all existing data and repopulate with comprehensive sample data
-- This script showcases all the new features: activities, tags, recurring tasks, multi-day tasks, all-day tasks, etc.

-- Clear existing data
DELETE FROM activities;
DELETE FROM tasks;

-- Reset sequences
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE activities_id_seq RESTART WITH 1;

-- Insert comprehensive sample tasks for all team members (October & November 2025)
-- Courtney Wright (id: 1) - Social and Digital Engagement Lead
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('Q4 Social Media Strategy', 'Develop comprehensive social media strategy for Q4 2025 including platform-specific content plans', 'Social', 'socialMedia', 15, 9, 2025, '10:00', 1, 'in-progress', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['strategy', 'q4', 'social', 'planning'], 1, false, false, null, null, false, null, null, null),
('Instagram Content Calendar', 'Plan and schedule Instagram posts for October with visual content strategy', 'Social', 'socialMedia', 22, 9, 2025, '14:30', 1, 'completed', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['content', 'instagram', 'calendar', 'visual'], 1, false, false, null, null, false, null, null, null),
('LinkedIn Campaign Launch', 'Launch new LinkedIn campaign for brand awareness with targeted audience segments', 'Campaign', 'campaigns', 5, 10, 2025, '09:00', 1, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['campaign', 'linkedin', 'launch', 'brand'], 1, false, false, null, null, false, null, null, null),
('Social Media Analytics Review', 'Monthly review of social media performance metrics and engagement rates', 'Social', 'socialMedia', 1, 10, 2025, '11:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'low', ARRAY['analytics', 'review', 'metrics', 'monthly'], 1, false, false, null, null, false, null, null, null),
('Social Media Workshop Series', 'Multi-day workshop series on social media best practices for the team', 'Social', 'socialMedia', 20, 10, 2025, '09:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['workshop', 'training', 'social', 'team'], 1, false, true, '2025-10-20', '2025-10-22', false, null, null, null);

-- Ghislain Girard (id: 2) - Manager, Web Operations
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('Website Performance Audit', 'Conduct comprehensive website performance analysis including Core Web Vitals', 'Blog', 'blogPosts', 8, 9, 2025, '11:00', 2, 'completed', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['audit', 'performance', 'website', 'technical'], 2, false, false, null, null, false, null, null, null),
('SEO Optimization Project', 'Implement SEO improvements across all web properties with focus on mobile-first indexing', 'Blog', 'blogPosts', 18, 9, 2025, '13:00', 2, 'in-progress', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['seo', 'optimization', 'technical', 'mobile'], 2, false, false, null, null, false, null, null, null),
('Technical Documentation', 'Update technical documentation for web operations and deployment procedures', 'Blog', 'blogPosts', 25, 10, 2025, '15:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'low', ARRAY['documentation', 'technical', 'maintenance', 'procedures'], 2, false, false, null, null, false, null, null, null),
('Content Management System Migration', 'Migrate to new CMS platform with improved workflow and collaboration features', 'Blog', 'blogPosts', 12, 10, 2025, '09:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['migration', 'cms', 'workflow', 'collaboration'], 2, false, false, null, null, false, null, null, null),
('Website Redesign Project', 'Complete website redesign with new branding and improved user experience', 'Blog', 'blogPosts', 25, 10, 2025, '09:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['redesign', 'branding', 'ux', 'website'], 2, false, true, '2025-10-25', '2025-10-29', false, null, null, null);

-- Joy Pavelich (id: 3) - Executive Vice-President, Strategy and Operations
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('Q4 Strategy Review', 'Conduct comprehensive Q4 strategy review meeting with department heads', 'Campaign', 'campaigns', 12, 9, 2025, '09:30', 3, 'review', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['strategy', 'review', 'q4', 'leadership'], 3, false, false, null, null, false, null, null, null),
('Q4 Budget Planning', 'Plan and allocate Q4 marketing budget across all channels and initiatives', 'Campaign', 'campaigns', 28, 9, 2025, '14:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['budget', 'planning', 'q4', 'allocation'], 3, false, false, null, null, false, null, null, null),
('Team Performance Review', 'Conduct quarterly team performance reviews and goal setting for Q1 2026', 'Campaign', 'campaigns', 10, 10, 2025, '16:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['performance', 'review', 'team', 'goals'], 3, false, false, null, null, false, null, null, null),
('Annual Planning Retreat', 'Multi-day strategic planning retreat for 2026 initiatives and priorities', 'Campaign', 'campaigns', 15, 10, 2025, '09:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['planning', 'retreat', 'strategic', 'annual'], 3, false, true, '2025-10-15', '2025-10-17', false, null, null, null);

-- Krystle Kung (id: 4) - Manager, Digital Marketing
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('Email Campaign: Holiday Launch', 'Design and execute holiday product launch email campaign with A/B testing', 'Email', 'emailMarketing', 3, 10, 2025, '10:30', 4, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['email', 'holiday', 'launch', 'ab-testing'], 4, false, false, null, null, false, null, null, null),
('Marketing Analytics Report', 'Compile monthly marketing analytics and insights with ROI analysis', 'Blog', 'blogPosts', 20, 9, 2025, '11:30', 4, 'in-progress', 'bg-blue-100 text-blue-800 border-blue-200', 'low', ARRAY['analytics', 'report', 'marketing', 'roi'], 4, false, false, null, null, false, null, null, null),
('Customer Journey Mapping', 'Create detailed customer journey maps for digital touchpoints and optimization', 'Campaign', 'campaigns', 14, 10, 2025, '13:45', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['journey', 'mapping', 'customer', 'optimization'], 4, false, false, null, null, false, null, null, null),
('Marketing Automation Setup', 'Implement marketing automation workflows for lead nurturing and segmentation', 'Email', 'emailMarketing', 8, 10, 2025, '14:00', 4, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['automation', 'workflows', 'leads', 'segmentation'], 4, false, false, null, null, false, null, null, null),
('Marketing Conference Attendance', 'Attend annual marketing conference for networking and learning', 'Campaign', 'campaigns', 5, 11, 2025, '09:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['conference', 'networking', 'learning', 'marketing'], 4, false, true, '2025-11-05', '2025-11-07', false, null, null, null);

-- Lori-Anne Thibault (id: 5) - Bilingual Communications Specialist
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('French Content Translation', 'Translate all marketing materials to French with cultural adaptation', 'Blog', 'blogPosts', 6, 9, 2025, '09:15', 5, 'completed', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['translation', 'french', 'content', 'cultural'], 5, false, false, null, null, false, null, null, null),
('Bilingual Email Templates', 'Create bilingual email templates for customer communications and support', 'Email', 'emailMarketing', 16, 10, 2025, '14:15', 5, 'in-progress', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['bilingual', 'email', 'templates', 'support'], 5, false, false, null, null, false, null, null, null),
('Social Media French Content', 'Develop French social media content calendar with localized messaging', 'Social', 'socialMedia', 24, 10, 2025, '10:45', 5, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['french', 'social', 'content', 'localized'], 5, false, false, null, null, false, null, null, null),
('Multilingual Website Audit', 'Audit website for multilingual compliance and accessibility standards', 'Blog', 'blogPosts', 30, 10, 2025, '11:00', 5, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['multilingual', 'audit', 'accessibility', 'compliance'], 5, false, false, null, null, false, null, null, null);

-- Meg McLean (id: 6) - Social and Digital Engagement Lead
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('TikTok Strategy Development', 'Develop comprehensive TikTok marketing strategy with Gen Z focus', 'Social', 'socialMedia', 9, 9, 2025, '12:00', 6, 'review', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['tiktok', 'strategy', 'social', 'gen-z'], 6, false, false, null, null, false, null, null, null),
('Influencer Partnership Program', 'Launch new influencer partnership program with micro and macro influencers', 'Campaign', 'campaigns', 19, 10, 2025, '15:00', 6, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['influencer', 'partnership', 'launch', 'micro-macro'], 6, false, false, null, null, false, null, null, null),
('Social Media Crisis Management', 'Update social media crisis management protocols and response procedures', 'Social', 'socialMedia', 1, 11, 2025, '11:30', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['crisis', 'management', 'social', 'protocols'], 6, false, false, null, null, false, null, null, null),
('Community Management Training', 'Train team on community management best practices and engagement strategies', 'Social', 'socialMedia', 7, 10, 2025, '13:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['training', 'community', 'management', 'engagement'], 6, false, false, null, null, false, null, null, null);

-- Additional mixed tasks for variety and collaboration
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('Content Calendar Review', 'Monthly review of all content calendars across platforms and channels', 'Blog', 'blogPosts', 30, 9, 2025, '16:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['content', 'calendar', 'review', 'cross-platform'], 2, false, false, null, null, false, null, null, null),
('Email A/B Testing', 'Conduct A/B testing for email subject lines and content optimization', 'Email', 'emailMarketing', 7, 10, 2025, '10:00', 4, 'in-progress', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['ab-testing', 'email', 'optimization', 'subject-lines'], 4, false, false, null, null, false, null, null, null),
('Brand Guidelines Update', 'Update brand guidelines for digital assets and social media usage', 'Campaign', 'campaigns', 13, 10, 2025, '14:30', 3, 'review', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['brand', 'guidelines', 'update', 'digital-assets'], 3, false, false, null, null, false, null, null, null),
('Customer Feedback Analysis', 'Analyze customer feedback from social media and support channels', 'Social', 'socialMedia', 21, 9, 2025, '13:15', 1, 'completed', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['feedback', 'analysis', 'customer', 'support'], 1, false, false, null, null, false, null, null, null),
('Newsletter Design Refresh', 'Redesign monthly newsletter template with improved mobile experience', 'Email', 'emailMarketing', 4, 10, 2025, '11:45', 5, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['newsletter', 'design', 'refresh', 'mobile'], 5, false, false, null, null, false, null, null, null);

-- Add comprehensive recurring tasks showcasing all new features
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('Weekly Team Standup', 'Daily team standup meeting for project updates and blockers', 'Campaign', 'campaigns', 15, 9, 2025, '09:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['standup', 'meeting', 'weekly', 'team'], 3, false, false, null, null, true, 1, 'week', '2025-12-31'),
('Monthly Social Media Report', 'Generate monthly social media analytics report with insights', 'Social', 'socialMedia', 1, 9, 2025, '10:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['report', 'analytics', 'monthly', 'insights'], 1, false, false, null, null, true, 1, 'month', '2025-12-31'),
('Daily Content Review', 'Review and approve daily social media content before publishing', 'Social', 'socialMedia', 20, 9, 2025, '16:00', 6, 'in-progress', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['content', 'review', 'daily', 'approval'], 6, false, false, null, null, true, 1, 'day', '2025-12-31'),
('Weekly SEO Performance Check', 'Monitor SEO performance metrics and keyword rankings', 'Blog', 'blogPosts', 5, 9, 2025, '11:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['seo', 'performance', 'weekly', 'keywords'], 2, false, false, null, null, true, 1, 'week', '2025-12-31'),
('Monthly Marketing Budget Review', 'Review monthly marketing spend and ROI analysis', 'Campaign', 'campaigns', 1, 9, 2025, '14:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['budget', 'review', 'monthly', 'roi'], 3, false, false, null, null, true, 1, 'month', '2025-12-31');

-- Add all-day tasks to showcase the all-day feature
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date, is_recurring, recurring_interval, recurring_unit, recurring_end_date) VALUES
('Company Holiday - Thanksgiving', 'Thanksgiving holiday break - office closed', 'Vacation', 'vacations', 28, 10, 2025, null, 1, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['holiday', 'thanksgiving', 'break'], 1, true, false, null, null, false, null, null, null),
('Personal Development Day', 'Personal development and training day', 'Vacation', 'vacations', 15, 11, 2025, null, 2, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['personal', 'development', 'training'], 2, true, false, null, null, false, null, null, null),
('Winter Holiday Break', 'Winter holiday break - office closed', 'Vacation', 'vacations', 23, 12, 2025, null, 3, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['holiday', 'winter', 'break'], 3, true, false, null, null, false, null, null, null),
('Team Building Day', 'Annual team building day with activities and workshops', 'Event', 'team', 18, 10, 2025, null, 4, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['team', 'building', 'activities', 'workshops'], 4, true, false, null, null, false, null, null, null),
('Client Appreciation Day', 'Client appreciation day with special events and recognition', 'Event', 'client', 25, 11, 2025, null, 5, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['client', 'appreciation', 'events', 'recognition'], 5, true, false, null, null, false, null, null, null);

-- Insert sample activities to showcase the activity tracking feature
INSERT INTO activities (type, task_id, task_title, user_id, user_name, message, created_at) VALUES
('task_created', 1, 'Q4 Social Media Strategy', '1', 'Courtney Wright', 'Created new task: Q4 Social Media Strategy', NOW() - INTERVAL '2 days'),
('task_updated', 2, 'Instagram Content Calendar', '1', 'Courtney Wright', 'Updated status to completed', NOW() - INTERVAL '1 day'),
('task_created', 3, 'LinkedIn Campaign Launch', '1', 'Courtney Wright', 'Created new task: LinkedIn Campaign Launch', NOW() - INTERVAL '3 hours'),
('task_created', 4, 'Website Performance Audit', '2', 'Ghislain Girard', 'Created new task: Website Performance Audit', NOW() - INTERVAL '1 day'),
('task_updated', 4, 'Website Performance Audit', '2', 'Ghislain Girard', 'Updated status to completed', NOW() - INTERVAL '30 minutes'),
('task_created', 5, 'SEO Optimization Project', '2', 'Ghislain Girard', 'Created new task: SEO Optimization Project', NOW() - INTERVAL '2 hours'),
('task_created', 6, 'Q4 Strategy Review', '3', 'Joy Pavelich', 'Created new task: Q4 Strategy Review', NOW() - INTERVAL '1 day'),
('task_updated', 6, 'Q4 Strategy Review', '3', 'Joy Pavelich', 'Updated status to review', NOW() - INTERVAL '4 hours'),
('task_created', 7, 'Email Campaign: Holiday Launch', '4', 'Krystle Kung', 'Created new task: Email Campaign: Holiday Launch', NOW() - INTERVAL '2 days'),
('task_created', 8, 'French Content Translation', '5', 'Lori-Anne Thibault', 'Created new task: French Content Translation', NOW() - INTERVAL '1 day'),
('task_updated', 8, 'French Content Translation', '5', 'Lori-Anne Thibault', 'Updated status to completed', NOW() - INTERVAL '2 hours'),
('task_created', 9, 'TikTok Strategy Development', '6', 'Meg McLean', 'Created new task: TikTok Strategy Development', NOW() - INTERVAL '3 days'),
('task_updated', 9, 'TikTok Strategy Development', '6', 'Meg McLean', 'Updated status to review', NOW() - INTERVAL '1 day'),
('task_created', 10, 'Weekly Team Standup', '3', 'Joy Pavelich', 'Created recurring task: Weekly Team Standup', NOW() - INTERVAL '5 days'),
('task_created', 11, 'Monthly Social Media Report', '1', 'Courtney Wright', 'Created recurring task: Monthly Social Media Report', NOW() - INTERVAL '4 days'),
('task_created', 12, 'Daily Content Review', '6', 'Meg McLean', 'Created recurring task: Daily Content Review', NOW() - INTERVAL '3 days'),
('task_updated', 12, 'Daily Content Review', '6', 'Meg McLean', 'Updated status to in-progress', NOW() - INTERVAL '1 hour'),
('task_created', 13, 'Weekly SEO Performance Check', '2', 'Ghislain Girard', 'Created recurring task: Weekly SEO Performance Check', NOW() - INTERVAL '2 days'),
('task_created', 14, 'Monthly Marketing Budget Review', '3', 'Joy Pavelich', 'Created recurring task: Monthly Marketing Budget Review', NOW() - INTERVAL '1 day'),
('task_created', 15, 'Content Calendar Review', '2', 'Ghislain Girard', 'Created new task: Content Calendar Review', NOW() - INTERVAL '1 hour'),
('task_created', 16, 'Company Holiday - Thanksgiving', '1', 'Courtney Wright', 'Created all-day task: Company Holiday - Thanksgiving', NOW() - INTERVAL '2 hours'),
('task_created', 17, 'Team Building Day', '4', 'Krystle Kung', 'Created all-day task: Team Building Day', NOW() - INTERVAL '1 hour'),
('task_created', 18, 'Client Appreciation Day', '5', 'Lori-Anne Thibault', 'Created all-day task: Client Appreciation Day', NOW() - INTERVAL '30 minutes');

-- Show completion message
SELECT 'Updated test data populated successfully with all new features!' as status;
