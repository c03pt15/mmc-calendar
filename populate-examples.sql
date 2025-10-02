-- Clear existing data
DELETE FROM tasks;

-- Reset the sequence to start from 1
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;

-- Insert example tasks for all team members (October & November 2025)
-- Courtney Wright (id: 1) - Social and Digital Engagement Lead
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, tags, created_by) VALUES
('Q4 Social Media Strategy', 'Develop comprehensive social media strategy for Q4 2025', 'Social', 'socialMedia', 15, 9, 2025, '10:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', ARRAY['strategy', 'q4', 'social'], 1),
('Instagram Content Calendar', 'Plan and schedule Instagram posts for October', 'Social', 'socialMedia', 22, 9, 2025, '14:30', 1, 'in-progress', 'bg-green-100 text-green-800 border-green-200', ARRAY['content', 'instagram', 'calendar'], 1),
('LinkedIn Campaign Launch', 'Launch new LinkedIn campaign for brand awareness', 'Campaign', 'campaigns', 5, 10, 2025, '09:00', 1, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', ARRAY['campaign', 'linkedin', 'launch'], 1);

-- Ghislain Girard (id: 2) - Manager, Web Operations
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, tags, created_by) VALUES
('Website Performance Audit', 'Conduct comprehensive website performance analysis', 'Blog', 'blogPosts', 8, 9, 2025, '11:00', 2, 'completed', 'bg-blue-100 text-blue-800 border-blue-200', ARRAY['audit', 'performance', 'website'], 2),
('SEO Optimization Project', 'Implement SEO improvements across all web properties', 'Blog', 'blogPosts', 18, 9, 2025, '13:00', 2, 'in-progress', 'bg-blue-100 text-blue-800 border-blue-200', ARRAY['seo', 'optimization', 'technical'], 2),
('Technical Documentation', 'Update technical documentation for web operations', 'Blog', 'blogPosts', 25, 10, 2025, '15:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', ARRAY['documentation', 'technical', 'maintenance'], 2);

-- Joy Pavelich (id: 3) - Executive Vice-President, Strategy and Operations
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, tags, created_by) VALUES
('Q4 Strategy Review', 'Conduct comprehensive Q4 strategy review meeting', 'Campaign', 'campaigns', 12, 9, 2025, '09:30', 3, 'review', 'bg-purple-100 text-purple-800 border-purple-200', ARRAY['strategy', 'review', 'q4'], 3),
('Q4 Budget Planning', 'Plan and allocate Q4 marketing budget', 'Campaign', 'campaigns', 28, 9, 2025, '14:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', ARRAY['budget', 'planning', 'q4'], 3),
('Team Performance Review', 'Conduct quarterly team performance reviews', 'Campaign', 'campaigns', 10, 10, 2025, '16:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', ARRAY['performance', 'review', 'team'], 3);

-- Krystle Kung (id: 4) - Manager, Digital Marketing
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, tags, created_by) VALUES
('Email Campaign: Holiday Launch', 'Design and execute holiday product launch email campaign', 'Email', 'emailMarketing', 3, 10, 2025, '10:30', 4, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', ARRAY['email', 'holiday', 'launch'], 4),
('Marketing Analytics Report', 'Compile monthly marketing analytics and insights', 'Blog', 'blogPosts', 20, 9, 2025, '11:30', 4, 'in-progress', 'bg-blue-100 text-blue-800 border-blue-200', ARRAY['analytics', 'report', 'marketing'], 4),
('Customer Journey Mapping', 'Create detailed customer journey maps for digital touchpoints', 'Campaign', 'campaigns', 14, 10, 2025, '13:45', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', ARRAY['journey', 'mapping', 'customer'], 4);

-- Lori-Anne Thibault (id: 5) - Bilingual Communications Specialist
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, tags, created_by) VALUES
('French Content Translation', 'Translate all marketing materials to French', 'Blog', 'blogPosts', 6, 9, 2025, '09:15', 5, 'completed', 'bg-blue-100 text-blue-800 border-blue-200', ARRAY['translation', 'french', 'content'], 5),
('Bilingual Email Templates', 'Create bilingual email templates for customer communications', 'Email', 'emailMarketing', 16, 10, 2025, '14:15', 5, 'in-progress', 'bg-orange-100 text-orange-800 border-orange-200', ARRAY['bilingual', 'email', 'templates'], 5),
('Social Media French Content', 'Develop French social media content calendar', 'Social', 'socialMedia', 24, 10, 2025, '10:45', 5, 'planned', 'bg-green-100 text-green-800 border-green-200', ARRAY['french', 'social', 'content'], 5);

-- Meg McLean (id: 6) - Social and Digital Engagement Lead
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, tags, created_by) VALUES
('TikTok Strategy Development', 'Develop comprehensive TikTok marketing strategy', 'Social', 'socialMedia', 9, 9, 2025, '12:00', 6, 'review', 'bg-green-100 text-green-800 border-green-200', ARRAY['tiktok', 'strategy', 'social'], 6),
('Influencer Partnership Program', 'Launch new influencer partnership program', 'Campaign', 'campaigns', 19, 10, 2025, '15:00', 6, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', ARRAY['influencer', 'partnership', 'launch'], 6),
('Social Media Crisis Management', 'Update social media crisis management protocols', 'Social', 'socialMedia', 1, 11, 2025, '11:30', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', ARRAY['crisis', 'management', 'social'], 6);

-- Additional mixed tasks for variety (October & November 2025)
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, tags, created_by) VALUES
('Content Calendar Review', 'Monthly review of all content calendars', 'Blog', 'blogPosts', 30, 9, 2025, '16:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', ARRAY['content', 'calendar', 'review'], 2),
('Email A/B Testing', 'Conduct A/B testing for email subject lines', 'Email', 'emailMarketing', 7, 10, 2025, '10:00', 4, 'in-progress', 'bg-orange-100 text-orange-800 border-orange-200', ARRAY['ab-testing', 'email', 'optimization'], 4),
('Brand Guidelines Update', 'Update brand guidelines for digital assets', 'Campaign', 'campaigns', 13, 10, 2025, '14:30', 3, 'review', 'bg-purple-100 text-purple-800 border-purple-200', ARRAY['brand', 'guidelines', 'update'], 3),
('Customer Feedback Analysis', 'Analyze customer feedback from social media', 'Social', 'socialMedia', 21, 9, 2025, '13:15', 1, 'completed', 'bg-green-100 text-green-800 border-green-200', ARRAY['feedback', 'analysis', 'customer'], 1),
('Newsletter Design Refresh', 'Redesign monthly newsletter template', 'Email', 'emailMarketing', 4, 10, 2025, '11:45', 5, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', ARRAY['newsletter', 'design', 'refresh'], 5);
