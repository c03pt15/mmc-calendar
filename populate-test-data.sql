-- Clear existing data and populate with comprehensive test data for 6 months
-- This script showcases all features: activities, tags, recurring tasks, multi-day tasks, etc.

-- Clear existing data
DELETE FROM activities;
DELETE FROM tasks;

-- Reset sequences
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE activities_id_seq RESTART WITH 1;

-- Insert comprehensive test tasks for the next 6 months (January 2025 - June 2025)
-- Courtney Wright (id: 1) - Social and Digital Engagement Lead
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Q1 Social Media Strategy Planning', 'Develop comprehensive Q1 social media strategy with platform-specific content plans', 'Social', 'socialMedia', 8, 0, 2025, '10:00', 1, 'in-progress', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['strategy', 'q1', 'social', 'planning'], 1, false, false, null, null),
('Instagram Content Calendar Q1', 'Plan and schedule Instagram posts for Q1 with visual content strategy', 'Social', 'socialMedia', 15, 0, 2025, '14:30', 1, 'completed', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['content', 'instagram', 'calendar', 'visual'], 1, false, false, null, null),
('LinkedIn Campaign Launch', 'Launch new LinkedIn campaign for brand awareness with targeted audience segments', 'Campaign', 'campaigns', 22, 0, 2025, '09:00', 1, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['campaign', 'linkedin', 'launch', 'brand'], 1, false, false, null, null),
('Social Media Analytics Review', 'Monthly review of social media performance metrics and engagement rates', 'Social', 'socialMedia', 31, 0, 2025, '11:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'low', ARRAY['analytics', 'review', 'metrics', 'monthly'], 1, false, false, null, null),

-- February 2025
('Valentine''s Day Campaign', 'Multi-day Valentine''s Day social media campaign with romantic content', 'Social', 'socialMedia', 10, 1, 2025, '09:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['valentine', 'campaign', 'romantic', 'social'], 1, true, true, '2025-02-10', '2025-02-14'),
('Social Media Workshop Series', 'Multi-day workshop series on social media best practices for the team', 'Social', 'socialMedia', 20, 1, 2025, '09:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['workshop', 'training', 'social', 'team'], 1, true, true, '2025-02-20', '2025-02-22'),

-- March 2025
('Spring Content Strategy', 'Develop spring-themed content strategy across all social platforms', 'Social', 'socialMedia', 5, 2, 2025, '10:30', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['spring', 'content', 'strategy', 'seasonal'], 1, false, false, null, null),
('Social Media Crisis Management Training', 'All-day training session on crisis management protocols', 'Social', 'socialMedia', 15, 2, 2025, '09:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['crisis', 'management', 'training', 'protocols'], 1, true, false, null, null),

-- April 2025
('Easter Campaign Planning', 'Plan and execute Easter-themed social media campaign', 'Social', 'socialMedia', 1, 3, 2025, '14:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['easter', 'campaign', 'holiday', 'social'], 1, false, false, null, null),
('Q1 Performance Review', 'Comprehensive review of Q1 social media performance and ROI analysis', 'Social', 'socialMedia', 30, 3, 2025, '16:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['review', 'q1', 'performance', 'roi'], 1, false, false, null, null),

-- May 2025
('Mother''s Day Campaign', 'Multi-day Mother''s Day social media campaign with family-focused content', 'Social', 'socialMedia', 8, 4, 2025, '09:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['mothers-day', 'campaign', 'family', 'social'], 1, true, true, '2025-05-08', '2025-05-12'),
('Social Media Tools Evaluation', 'Evaluate and test new social media management tools', 'Social', 'socialMedia', 20, 4, 2025, '11:30', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'low', ARRAY['tools', 'evaluation', 'management', 'technology'], 1, false, false, null, null),

-- June 2025
('Summer Content Strategy', 'Develop summer-themed content strategy and vacation planning', 'Social', 'socialMedia', 5, 5, 2025, '10:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['summer', 'content', 'strategy', 'vacation'], 1, false, false, null, null),
('Mid-Year Social Media Audit', 'Comprehensive audit of all social media accounts and performance', 'Social', 'socialMedia', 25, 5, 2025, '09:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['audit', 'mid-year', 'performance', 'comprehensive'], 1, true, true, '2025-05-25', '2025-05-28');

-- Ghislain Girard (id: 2) - Manager, Web Operations
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Website Performance Audit Q1', 'Conduct comprehensive website performance analysis including Core Web Vitals', 'Blog', 'blogPosts', 10, 0, 2025, '11:00', 2, 'completed', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['audit', 'performance', 'website', 'technical'], 2, false, false, null, null),
('SEO Optimization Project', 'Implement SEO improvements across all web properties with focus on mobile-first indexing', 'Blog', 'blogPosts', 18, 0, 2025, '13:00', 2, 'in-progress', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['seo', 'optimization', 'technical', 'mobile'], 2, false, false, null, null),
('Technical Documentation Update', 'Update technical documentation for web operations and deployment procedures', 'Blog', 'blogPosts', 25, 0, 2025, '15:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'low', ARRAY['documentation', 'technical', 'maintenance', 'procedures'], 2, false, false, null, null),

-- February 2025
('Content Management System Migration', 'Migrate to new CMS platform with improved workflow and collaboration features', 'Blog', 'blogPosts', 12, 1, 2025, '09:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['migration', 'cms', 'workflow', 'collaboration'], 2, false, false, null, null),
('Website Redesign Project', 'Complete website redesign with new branding and improved user experience', 'Blog', 'blogPosts', 25, 1, 2025, '09:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['redesign', 'branding', 'ux', 'website'], 2, true, true, '2025-02-25', '2025-02-28'),

-- March 2025
('Mobile-First Design Implementation', 'Implement mobile-first design principles across all web properties', 'Blog', 'blogPosts', 8, 2, 2025, '10:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['mobile', 'design', 'responsive', 'implementation'], 2, false, false, null, null),
('Web Security Audit', 'Comprehensive security audit of all web properties and infrastructure', 'Blog', 'blogPosts', 22, 2, 2025, '14:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['security', 'audit', 'infrastructure', 'protection'], 2, true, false, null, null),

-- April 2025
('Performance Optimization Sprint', 'Multi-day sprint to optimize website performance and loading times', 'Blog', 'blogPosts', 5, 3, 2025, '09:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['performance', 'optimization', 'sprint', 'technical'], 2, true, true, '2025-04-05', '2025-04-08'),
('Q1 Technical Review', 'Comprehensive review of Q1 technical achievements and challenges', 'Blog', 'blogPosts', 28, 3, 2025, '16:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['review', 'q1', 'technical', 'achievements'], 2, false, false, null, null),

-- May 2025
('API Integration Project', 'Integrate new APIs for improved functionality and user experience', 'Blog', 'blogPosts', 12, 4, 2025, '11:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['api', 'integration', 'functionality', 'technical'], 2, false, false, null, null),
('Web Analytics Implementation', 'Implement advanced web analytics and tracking systems', 'Blog', 'blogPosts', 26, 4, 2025, '13:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['analytics', 'tracking', 'implementation', 'data'], 2, false, false, null, null),

-- June 2025
('Summer Website Maintenance', 'Comprehensive summer maintenance and updates for all web properties', 'Blog', 'blogPosts', 15, 5, 2025, '09:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['maintenance', 'summer', 'updates', 'technical'], 2, true, true, '2025-06-15', '2025-06-18'),
('Mid-Year Technical Assessment', 'Mid-year assessment of technical infrastructure and performance', 'Blog', 'blogPosts', 30, 5, 2025, '15:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['assessment', 'mid-year', 'infrastructure', 'performance'], 2, false, false, null, null);

-- Joy Pavelich (id: 3) - Manager, Client Success
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Client Onboarding Process Review', 'Review and optimize client onboarding process for improved experience', 'Client', 'clientSuccess', 5, 0, 2025, '10:00', 3, 'completed', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['onboarding', 'process', 'optimization', 'client'], 3, false, false, null, null),
('Q1 Client Success Strategy', 'Develop comprehensive Q1 client success strategy and implementation plan', 'Client', 'clientSuccess', 12, 0, 2025, '14:00', 3, 'in-progress', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['strategy', 'q1', 'client', 'success'], 3, false, false, null, null),
('Client Feedback Analysis', 'Analyze client feedback and implement improvements based on insights', 'Client', 'clientSuccess', 20, 0, 2025, '11:30', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['feedback', 'analysis', 'improvements', 'insights'], 3, false, false, null, null),

-- February 2025
('Client Success Workshop', 'Multi-day workshop on client success best practices and relationship building', 'Client', 'clientSuccess', 8, 1, 2025, '09:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['workshop', 'best-practices', 'relationships', 'success'], 3, true, true, '2025-02-08', '2025-02-10'),
('Client Retention Analysis', 'Analyze client retention rates and develop improvement strategies', 'Client', 'clientSuccess', 18, 1, 2025, '15:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['retention', 'analysis', 'strategies', 'improvement'], 3, false, false, null, null),

-- March 2025
('Client Success Metrics Review', 'Review and analyze client success metrics for Q1 performance', 'Client', 'clientSuccess', 10, 2, 2025, '13:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['metrics', 'review', 'q1', 'performance'], 3, false, false, null, null),
('Client Appreciation Event', 'All-day client appreciation event to strengthen relationships', 'Client', 'clientSuccess', 25, 2, 2025, '09:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['appreciation', 'event', 'relationships', 'clients'], 3, true, false, null, null),

-- April 2025
('Client Success Training Program', 'Multi-day training program for client success team on new methodologies', 'Client', 'clientSuccess', 3, 3, 2025, '09:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['training', 'program', 'methodologies', 'team'], 3, true, true, '2025-04-03', '2025-04-05'),
('Q1 Client Success Review', 'Comprehensive review of Q1 client success achievements and challenges', 'Client', 'clientSuccess', 29, 3, 2025, '16:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['review', 'q1', 'achievements', 'challenges'], 3, false, false, null, null),

-- May 2025
('Client Success Process Optimization', 'Optimize client success processes for improved efficiency and outcomes', 'Client', 'clientSuccess', 14, 4, 2025, '10:30', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['process', 'optimization', 'efficiency', 'outcomes'], 3, false, false, null, null),
('Client Success Technology Implementation', 'Implement new technology tools for enhanced client success management', 'Client', 'clientSuccess', 28, 4, 2025, '14:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['technology', 'implementation', 'tools', 'management'], 3, false, false, null, null),

-- June 2025
('Mid-Year Client Success Assessment', 'Comprehensive mid-year assessment of client success program effectiveness', 'Client', 'clientSuccess', 12, 5, 2025, '11:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['assessment', 'mid-year', 'effectiveness', 'program'], 3, false, false, null, null),
('Client Success Team Retreat', 'Multi-day team retreat for client success team building and strategy planning', 'Client', 'clientSuccess', 24, 5, 2025, '09:00', 3, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['retreat', 'team-building', 'strategy', 'planning'], 3, true, true, '2025-06-24', '2025-06-26');

-- Krystle Kung (id: 4) - Manager, Marketing Operations
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Marketing Automation Setup', 'Set up and configure marketing automation workflows for improved lead nurturing', 'Marketing', 'marketingOps', 7, 0, 2025, '10:00', 4, 'completed', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['automation', 'workflows', 'lead-nurturing', 'setup'], 4, false, false, null, null),
('Q1 Marketing Campaign Planning', 'Plan and develop comprehensive Q1 marketing campaigns across all channels', 'Marketing', 'marketingOps', 14, 0, 2025, '14:00', 4, 'in-progress', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['campaigns', 'q1', 'planning', 'channels'], 4, false, false, null, null),
('Marketing Analytics Implementation', 'Implement advanced marketing analytics and tracking systems', 'Marketing', 'marketingOps', 21, 0, 2025, '11:30', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['analytics', 'tracking', 'implementation', 'marketing'], 4, false, false, null, null),

-- February 2025
('Marketing Technology Stack Review', 'Review and evaluate current marketing technology stack for optimization', 'Marketing', 'marketingOps', 11, 1, 2025, '09:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['technology', 'stack', 'review', 'optimization'], 4, false, false, null, null),
('Marketing Process Optimization', 'Optimize marketing processes for improved efficiency and ROI', 'Marketing', 'marketingOps', 19, 1, 2025, '15:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['process', 'optimization', 'efficiency', 'roi'], 4, false, false, null, null),

-- March 2025
('Marketing Campaign Performance Analysis', 'Analyze performance of Q1 marketing campaigns and identify optimization opportunities', 'Marketing', 'marketingOps', 6, 2, 2025, '13:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['performance', 'analysis', 'q1', 'optimization'], 4, false, false, null, null),
('Marketing Team Training', 'All-day training session for marketing team on new tools and methodologies', 'Marketing', 'marketingOps', 20, 2, 2025, '09:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['training', 'team', 'tools', 'methodologies'], 4, true, false, null, null),

-- April 2025
('Marketing Automation Optimization', 'Multi-day optimization of marketing automation workflows and processes', 'Marketing', 'marketingOps', 2, 3, 2025, '09:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['automation', 'optimization', 'workflows', 'processes'], 4, true, true, '2025-04-02', '2025-04-04'),
('Q1 Marketing Performance Review', 'Comprehensive review of Q1 marketing performance and ROI analysis', 'Marketing', 'marketingOps', 30, 3, 2025, '16:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['review', 'q1', 'performance', 'roi'], 4, false, false, null, null),

-- May 2025
('Marketing Technology Integration', 'Integrate new marketing technology tools for enhanced campaign management', 'Marketing', 'marketingOps', 9, 4, 2025, '10:30', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['technology', 'integration', 'tools', 'management'], 4, false, false, null, null),
('Marketing Data Analysis', 'Comprehensive analysis of marketing data and performance metrics', 'Marketing', 'marketingOps', 23, 4, 2025, '14:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['data', 'analysis', 'metrics', 'performance'], 4, false, false, null, null),

-- June 2025
('Mid-Year Marketing Assessment', 'Comprehensive mid-year assessment of marketing operations and effectiveness', 'Marketing', 'marketingOps', 11, 5, 2025, '11:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['assessment', 'mid-year', 'operations', 'effectiveness'], 4, false, false, null, null),
('Marketing Strategy Planning', 'Multi-day planning session for H2 marketing strategy and implementation', 'Marketing', 'marketingOps', 27, 5, 2025, '09:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['strategy', 'planning', 'h2', 'implementation'], 4, true, true, '2025-06-27', '2025-06-29');

-- Lori-Anne Thibault (id: 5) - Manager, Content & Communications
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Content Strategy Development', 'Develop comprehensive content strategy for Q1 with focus on audience engagement', 'Content', 'contentCreation', 9, 0, 2025, '10:00', 5, 'completed', 'bg-pink-100 text-pink-800 border-pink-200', 'high', ARRAY['strategy', 'content', 'q1', 'engagement'], 5, false, false, null, null),
('Content Calendar Planning', 'Plan and schedule content calendar for Q1 with diverse content types', 'Content', 'contentCreation', 16, 0, 2025, '14:00', 5, 'in-progress', 'bg-pink-100 text-pink-800 border-pink-200', 'medium', ARRAY['calendar', 'planning', 'q1', 'diverse'], 5, false, false, null, null),
('Content Performance Analysis', 'Analyze content performance metrics and identify optimization opportunities', 'Content', 'contentCreation', 23, 0, 2025, '11:30', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'medium', ARRAY['performance', 'analysis', 'metrics', 'optimization'], 5, false, false, null, null),

-- February 2025
('Content Creation Workshop', 'Multi-day workshop on content creation best practices and techniques', 'Content', 'contentCreation', 6, 1, 2025, '09:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'high', ARRAY['workshop', 'creation', 'best-practices', 'techniques'], 5, true, true, '2025-02-06', '2025-02-08'),
('Content Quality Assurance', 'Implement content quality assurance processes and standards', 'Content', 'contentCreation', 17, 1, 2025, '15:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'medium', ARRAY['quality', 'assurance', 'processes', 'standards'], 5, false, false, null, null),

-- March 2025
('Content Distribution Strategy', 'Develop and implement content distribution strategy across all channels', 'Content', 'contentCreation', 7, 2, 2025, '13:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'high', ARRAY['distribution', 'strategy', 'channels', 'implementation'], 5, false, false, null, null),
('Content Team Training', 'All-day training session for content team on new tools and methodologies', 'Content', 'contentCreation', 21, 2, 2025, '09:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'medium', ARRAY['training', 'team', 'tools', 'methodologies'], 5, true, false, null, null),

-- April 2025
('Content Optimization Project', 'Multi-day project to optimize existing content for better performance', 'Content', 'contentCreation', 4, 3, 2025, '09:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'high', ARRAY['optimization', 'project', 'performance', 'existing'], 5, true, true, '2025-04-04', '2025-04-06'),
('Q1 Content Performance Review', 'Comprehensive review of Q1 content performance and engagement metrics', 'Content', 'contentCreation', 29, 3, 2025, '16:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'high', ARRAY['review', 'q1', 'performance', 'engagement'], 5, false, false, null, null),

-- May 2025
('Content Technology Integration', 'Integrate new content management and creation tools for enhanced productivity', 'Content', 'contentCreation', 13, 4, 2025, '10:30', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'medium', ARRAY['technology', 'integration', 'tools', 'productivity'], 5, false, false, null, null),
('Content Analytics Implementation', 'Implement advanced content analytics and tracking systems', 'Content', 'contentCreation', 27, 4, 2025, '14:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'high', ARRAY['analytics', 'implementation', 'tracking', 'systems'], 5, false, false, null, null),

-- June 2025
('Mid-Year Content Assessment', 'Comprehensive mid-year assessment of content strategy and performance', 'Content', 'contentCreation', 10, 5, 2025, '11:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'high', ARRAY['assessment', 'mid-year', 'strategy', 'performance'], 5, false, false, null, null),
('Content Strategy Planning', 'Multi-day planning session for H2 content strategy and implementation', 'Content', 'contentCreation', 26, 5, 2025, '09:00', 5, 'planned', 'bg-pink-100 text-pink-800 border-pink-200', 'high', ARRAY['strategy', 'planning', 'h2', 'implementation'], 5, true, true, '2025-06-26', '2025-06-28');

-- Meg McLean (id: 6) - Manager, Strategic Planning
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Strategic Planning Session', 'Comprehensive strategic planning session for Q1 and beyond', 'Strategy', 'strategicPlanning', 3, 0, 2025, '10:00', 6, 'completed', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['strategic', 'planning', 'q1', 'comprehensive'], 6, false, false, null, null),
('Business Performance Analysis', 'Analyze business performance metrics and identify growth opportunities', 'Strategy', 'strategicPlanning', 11, 0, 2025, '14:00', 6, 'in-progress', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['performance', 'analysis', 'growth', 'opportunities'], 6, false, false, null, null),
('Strategic Initiative Planning', 'Plan and develop strategic initiatives for improved business outcomes', 'Strategy', 'strategicPlanning', 19, 0, 2025, '11:30', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'medium', ARRAY['initiatives', 'planning', 'outcomes', 'strategic'], 6, false, false, null, null),

-- February 2025
('Strategic Workshop Series', 'Multi-day workshop series on strategic planning and execution', 'Strategy', 'strategicPlanning', 4, 1, 2025, '09:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['workshop', 'series', 'planning', 'execution'], 6, true, true, '2025-02-04', '2025-02-06'),
('Market Analysis and Research', 'Conduct comprehensive market analysis and competitive research', 'Strategy', 'strategicPlanning', 15, 1, 2025, '15:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'medium', ARRAY['market', 'analysis', 'research', 'competitive'], 6, false, false, null, null),

-- March 2025
('Strategic Metrics Review', 'Review and analyze strategic metrics for Q1 performance assessment', 'Strategy', 'strategicPlanning', 8, 2, 2025, '13:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['metrics', 'review', 'q1', 'assessment'], 6, false, false, null, null),
('Strategic Planning Retreat', 'All-day strategic planning retreat for team alignment and vision setting', 'Strategy', 'strategicPlanning', 22, 2, 2025, '09:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['retreat', 'planning', 'alignment', 'vision'], 6, true, false, null, null),

-- April 2025
('Strategic Implementation Project', 'Multi-day project to implement strategic initiatives and measure progress', 'Strategy', 'strategicPlanning', 1, 3, 2025, '09:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['implementation', 'project', 'initiatives', 'progress'], 6, true, true, '2025-04-01', '2025-04-03'),
('Q1 Strategic Review', 'Comprehensive review of Q1 strategic achievements and challenges', 'Strategy', 'strategicPlanning', 30, 3, 2025, '16:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['review', 'q1', 'achievements', 'challenges'], 6, false, false, null, null),

-- May 2025
('Strategic Technology Assessment', 'Assess and evaluate strategic technology tools and platforms', 'Strategy', 'strategicPlanning', 6, 4, 2025, '10:30', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'medium', ARRAY['technology', 'assessment', 'tools', 'platforms'], 6, false, false, null, null),
('Strategic Process Optimization', 'Optimize strategic processes for improved efficiency and outcomes', 'Strategy', 'strategicPlanning', 20, 4, 2025, '14:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['process', 'optimization', 'efficiency', 'outcomes'], 6, false, false, null, null),

-- June 2025
('Mid-Year Strategic Assessment', 'Comprehensive mid-year assessment of strategic initiatives and performance', 'Strategy', 'strategicPlanning', 9, 5, 2025, '11:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['assessment', 'mid-year', 'initiatives', 'performance'], 6, false, false, null, null),
('Strategic Planning Summit', 'Multi-day strategic planning summit for H2 strategy development', 'Strategy', 'strategicPlanning', 25, 5, 2025, '09:00', 6, 'planned', 'bg-indigo-100 text-indigo-800 border-indigo-200', 'high', ARRAY['summit', 'planning', 'h2', 'development'], 6, true, true, '2025-06-25', '2025-06-27');

-- Insert comprehensive test activities
INSERT INTO activities (type, task_id, task_title, user_id, user_name, message, created_at) VALUES
-- Courtney Wright activities
('task_created', 1, 'Q1 Social Media Strategy Planning', '1', 'Courtney Wright', 'Created new task: Q1 Social Media Strategy Planning', NOW() - INTERVAL '30 days'),
('task_updated', 1, 'Q1 Social Media Strategy Planning', '1', 'Courtney Wright', 'Updated status to in-progress', NOW() - INTERVAL '25 days'),
('task_created', 2, 'Instagram Content Calendar Q1', '1', 'Courtney Wright', 'Created new task: Instagram Content Calendar Q1', NOW() - INTERVAL '28 days'),
('task_updated', 2, 'Instagram Content Calendar Q1', '1', 'Courtney Wright', 'Updated status to completed', NOW() - INTERVAL '20 days'),
('task_created', 3, 'LinkedIn Campaign Launch', '1', 'Courtney Wright', 'Created new task: LinkedIn Campaign Launch', NOW() - INTERVAL '25 days'),
('task_created', 4, 'Social Media Analytics Review', '1', 'Courtney Wright', 'Created new task: Social Media Analytics Review', NOW() - INTERVAL '22 days'),

-- Ghislain Girard activities
('task_created', 5, 'Website Performance Audit Q1', '2', 'Ghislain Girard', 'Created new task: Website Performance Audit Q1', NOW() - INTERVAL '30 days'),
('task_updated', 5, 'Website Performance Audit Q1', '2', 'Ghislain Girard', 'Updated status to completed', NOW() - INTERVAL '25 days'),
('task_created', 6, 'SEO Optimization Project', '2', 'Ghislain Girard', 'Created new task: SEO Optimization Project', NOW() - INTERVAL '28 days'),
('task_updated', 6, 'SEO Optimization Project', '2', 'Ghislain Girard', 'Updated status to in-progress', NOW() - INTERVAL '20 days'),
('task_created', 7, 'Technical Documentation Update', '2', 'Ghislain Girard', 'Created new task: Technical Documentation Update', NOW() - INTERVAL '25 days'),

-- Joy Pavelich activities
('task_created', 8, 'Client Onboarding Process Review', '3', 'Joy Pavelich', 'Created new task: Client Onboarding Process Review', NOW() - INTERVAL '30 days'),
('task_updated', 8, 'Client Onboarding Process Review', '3', 'Joy Pavelich', 'Updated status to completed', NOW() - INTERVAL '25 days'),
('task_created', 9, 'Q1 Client Success Strategy', '3', 'Joy Pavelich', 'Created new task: Q1 Client Success Strategy', NOW() - INTERVAL '28 days'),
('task_updated', 9, 'Q1 Client Success Strategy', '3', 'Joy Pavelich', 'Updated status to in-progress', NOW() - INTERVAL '20 days'),
('task_created', 10, 'Client Feedback Analysis', '3', 'Joy Pavelich', 'Created new task: Client Feedback Analysis', NOW() - INTERVAL '25 days'),

-- Krystle Kung activities
('task_created', 11, 'Marketing Automation Setup', '4', 'Krystle Kung', 'Created new task: Marketing Automation Setup', NOW() - INTERVAL '30 days'),
('task_updated', 11, 'Marketing Automation Setup', '4', 'Krystle Kung', 'Updated status to completed', NOW() - INTERVAL '25 days'),
('task_created', 12, 'Q1 Marketing Campaign Planning', '4', 'Krystle Kung', 'Created new task: Q1 Marketing Campaign Planning', NOW() - INTERVAL '28 days'),
('task_updated', 12, 'Q1 Marketing Campaign Planning', '4', 'Krystle Kung', 'Updated status to in-progress', NOW() - INTERVAL '20 days'),
('task_created', 13, 'Marketing Analytics Implementation', '4', 'Krystle Kung', 'Created new task: Marketing Analytics Implementation', NOW() - INTERVAL '25 days'),

-- Lori-Anne Thibault activities
('task_created', 14, 'Content Strategy Development', '5', 'Lori-Anne Thibault', 'Created new task: Content Strategy Development', NOW() - INTERVAL '30 days'),
('task_updated', 14, 'Content Strategy Development', '5', 'Lori-Anne Thibault', 'Updated status to completed', NOW() - INTERVAL '25 days'),
('task_created', 15, 'Content Calendar Planning', '5', 'Lori-Anne Thibault', 'Created new task: Content Calendar Planning', NOW() - INTERVAL '28 days'),
('task_updated', 15, 'Content Calendar Planning', '5', 'Lori-Anne Thibault', 'Updated status to in-progress', NOW() - INTERVAL '20 days'),
('task_created', 16, 'Content Performance Analysis', '5', 'Lori-Anne Thibault', 'Created new task: Content Performance Analysis', NOW() - INTERVAL '25 days'),

-- Meg McLean activities
('task_created', 17, 'Strategic Planning Session', '6', 'Meg McLean', 'Created new task: Strategic Planning Session', NOW() - INTERVAL '30 days'),
('task_updated', 17, 'Strategic Planning Session', '6', 'Meg McLean', 'Updated status to completed', NOW() - INTERVAL '25 days'),
('task_created', 18, 'Business Performance Analysis', '6', 'Meg McLean', 'Created new task: Business Performance Analysis', NOW() - INTERVAL '28 days'),
('task_updated', 18, 'Business Performance Analysis', '6', 'Meg McLean', 'Updated status to in-progress', NOW() - INTERVAL '20 days'),
('task_created', 19, 'Strategic Initiative Planning', '6', 'Meg McLean', 'Created new task: Strategic Initiative Planning', NOW() - INTERVAL '25 days'),

-- Recent activities
('task_created', 20, 'Valentine''s Day Campaign', '1', 'Courtney Wright', 'Created new task: Valentine''s Day Campaign', NOW() - INTERVAL '2 hours'),
('task_created', 21, 'Content Management System Migration', '2', 'Ghislain Girard', 'Created new task: Content Management System Migration', NOW() - INTERVAL '1 hour'),
('task_created', 22, 'Client Success Workshop', '3', 'Joy Pavelich', 'Created new task: Client Success Workshop', NOW() - INTERVAL '30 minutes'),
('task_created', 23, 'Marketing Technology Stack Review', '4', 'Krystle Kung', 'Created new task: Marketing Technology Stack Review', NOW() - INTERVAL '15 minutes'),
('task_created', 24, 'Content Creation Workshop', '5', 'Lori-Anne Thibault', 'Created new task: Content Creation Workshop', NOW() - INTERVAL '10 minutes'),
('task_created', 25, 'Strategic Workshop Series', '6', 'Meg McLean', 'Created new task: Strategic Workshop Series', NOW() - INTERVAL '5 minutes');

-- Show completion message
SELECT 'Test data populated successfully for 6 months (January 2025 - June 2025)' as status;