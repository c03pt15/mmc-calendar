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
('Security Audit and Updates', 'Comprehensive security audit and implementation of security updates', 'Blog', 'blogPosts', 8, 2, 2025, '10:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['security', 'audit', 'updates', 'protection'], 2, false, false, null, null),
('Mobile Optimization Project', 'Optimize website for mobile devices and improve mobile user experience', 'Blog', 'blogPosts', 22, 2, 2025, '14:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['mobile', 'optimization', 'ux', 'responsive'], 2, false, false, null, null),

-- April 2025
('Analytics Implementation', 'Implement advanced analytics tracking and reporting systems', 'Blog', 'blogPosts', 5, 3, 2025, '11:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['analytics', 'tracking', 'reporting', 'data'], 2, false, false, null, null),
('Q1 Technical Review', 'Review Q1 technical performance and identify improvement areas', 'Blog', 'blogPosts', 28, 3, 2025, '16:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['review', 'q1', 'technical', 'performance'], 2, false, false, null, null),

-- May 2025
('Database Optimization', 'Optimize database performance and implement caching strategies', 'Blog', 'blogPosts', 12, 4, 2025, '09:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['database', 'optimization', 'performance', 'caching'], 2, false, false, null, null),
('Backup System Implementation', 'Implement comprehensive backup and disaster recovery systems', 'Blog', 'blogPosts', 26, 4, 2025, '13:30', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['backup', 'disaster-recovery', 'security', 'reliability'], 2, false, false, null, null),

-- June 2025
('Mid-Year Technical Assessment', 'Comprehensive technical assessment and infrastructure review', 'Blog', 'blogPosts', 10, 5, 2025, '10:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['assessment', 'mid-year', 'technical', 'infrastructure'], 2, true, true, '2025-06-10', '2025-06-12'),
('Performance Monitoring Setup', 'Set up advanced performance monitoring and alerting systems', 'Blog', 'blogPosts', 24, 5, 2025, '14:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['monitoring', 'performance', 'alerting', 'systems'], 2, false, false, null, null);

-- Joy Pavelich (id: 3) - Executive Vice-President, Strategy and Operations
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Q1 Strategy Review', 'Conduct comprehensive Q1 strategy review meeting with department heads', 'Campaign', 'campaigns', 12, 0, 2025, '09:30', 3, 'review', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['strategy', 'review', 'q1', 'leadership'], 3, false, false, null, null),
('Q1 Budget Planning', 'Plan and allocate Q1 marketing budget across all channels and initiatives', 'Campaign', 'campaigns', 28, 0, 2025, '14:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['budget', 'planning', 'q1', 'allocation'], 3, false, false, null, null),

-- February 2025
('Team Performance Review', 'Conduct quarterly team performance reviews and goal setting for Q2', 'Campaign', 'campaigns', 10, 1, 2025, '16:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['performance', 'review', 'team', 'goals'], 3, false, false, null, null),
('Strategic Planning Retreat', 'Multi-day strategic planning retreat for 2025 initiatives and priorities', 'Campaign', 'campaigns', 15, 1, 2025, '09:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['planning', 'retreat', 'strategic', 'annual'], 3, true, true, '2025-02-15', '2025-02-17'),

-- March 2025
('Q2 Strategy Development', 'Develop comprehensive Q2 strategy and operational plans', 'Campaign', 'campaigns', 5, 2, 2025, '10:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['strategy', 'q2', 'development', 'operational'], 3, false, false, null, null),
('Stakeholder Meeting', 'All-day stakeholder meeting to discuss strategic direction and priorities', 'Campaign', 'campaigns', 20, 2, 2025, '09:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['stakeholder', 'meeting', 'strategic', 'direction'], 3, true, false, null, null),

-- April 2025
('Q1 Results Analysis', 'Analyze Q1 results and performance against strategic objectives', 'Campaign', 'campaigns', 8, 3, 2025, '11:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['analysis', 'q1', 'results', 'performance'], 3, false, false, null, null),
('Resource Allocation Review', 'Review and optimize resource allocation across all departments', 'Campaign', 'campaigns', 25, 3, 2025, '14:30', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['resources', 'allocation', 'optimization', 'departments'], 3, false, false, null, null),

-- May 2025
('Mid-Year Strategic Review', 'Comprehensive mid-year strategic review and course correction', 'Campaign', 'campaigns', 15, 4, 2025, '09:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['mid-year', 'strategic', 'review', 'course-correction'], 3, true, true, '2025-05-15', '2025-05-17'),
('Team Building Event', 'Organize team building event to strengthen cross-department collaboration', 'Campaign', 'campaigns', 30, 4, 2025, '10:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'low', ARRAY['team-building', 'collaboration', 'event', 'culture'], 3, true, false, null, null),

-- June 2025
('Q3 Planning Session', 'Plan and prepare for Q3 strategic initiatives and priorities', 'Campaign', 'campaigns', 12, 5, 2025, '10:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['planning', 'q3', 'strategic', 'initiatives'], 3, false, false, null, null),
('Annual Strategy Review', 'Comprehensive annual strategy review and planning for next year', 'Campaign', 'campaigns', 28, 5, 2025, '09:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['annual', 'strategy', 'review', 'planning'], 3, true, true, '2025-06-28', '2025-06-30');

-- Krystle Kung (id: 4) - Manager, Digital Marketing
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('Email Campaign: New Year Launch', 'Design and execute New Year product launch email campaign with A/B testing', 'Email', 'emailMarketing', 3, 0, 2025, '10:30', 4, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['email', 'new-year', 'launch', 'ab-testing'], 4, false, false, null, null),
('Marketing Analytics Report Q1', 'Compile Q1 marketing analytics and insights with ROI analysis', 'Blog', 'blogPosts', 20, 0, 2025, '11:30', 4, 'in-progress', 'bg-blue-100 text-blue-800 border-blue-200', 'low', ARRAY['analytics', 'report', 'marketing', 'roi'], 4, false, false, null, null),

-- February 2025
('Customer Journey Mapping', 'Create detailed customer journey maps for digital touchpoints and optimization', 'Campaign', 'campaigns', 14, 1, 2025, '13:45', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['journey', 'mapping', 'customer', 'optimization'], 4, false, false, null, null),
('Marketing Automation Setup', 'Implement marketing automation workflows for lead nurturing and segmentation', 'Email', 'emailMarketing', 8, 1, 2025, '14:00', 4, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'high', ARRAY['automation', 'workflows', 'leads', 'segmentation'], 4, false, false, null, null),

-- March 2025
('Marketing Conference Attendance', 'Attend annual marketing conference for networking and learning', 'Campaign', 'campaigns', 5, 2, 2025, '09:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['conference', 'networking', 'learning', 'marketing'], 4, true, true, '2025-03-05', '2025-03-07'),
('Email Template Redesign', 'Redesign all email templates with improved mobile experience', 'Email', 'emailMarketing', 18, 2, 2025, '11:45', 4, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['email', 'templates', 'redesign', 'mobile'], 4, false, false, null, null),

-- April 2025
('Lead Generation Campaign', 'Launch comprehensive lead generation campaign across all digital channels', 'Campaign', 'campaigns', 10, 3, 2025, '09:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['lead-generation', 'campaign', 'digital', 'channels'], 4, false, false, null, null),
('Marketing Technology Audit', 'Audit and evaluate current marketing technology stack', 'Campaign', 'campaigns', 28, 3, 2025, '14:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['technology', 'audit', 'marketing', 'evaluation'], 4, false, false, null, null),

-- May 2025
('Email Segmentation Strategy', 'Develop advanced email segmentation strategy for better targeting', 'Email', 'emailMarketing', 8, 4, 2025, '10:00', 4, 'planned', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['email', 'segmentation', 'targeting', 'strategy'], 4, false, false, null, null),
('Marketing ROI Analysis', 'Comprehensive analysis of marketing ROI across all channels', 'Campaign', 'campaigns', 22, 4, 2025, '15:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['roi', 'analysis', 'marketing', 'channels'], 4, false, false, null, null),

-- June 2025
('Mid-Year Marketing Review', 'Comprehensive mid-year marketing performance review and strategy adjustment', 'Campaign', 'campaigns', 15, 5, 2025, '09:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['mid-year', 'marketing', 'review', 'strategy'], 4, true, true, '2025-06-15', '2025-06-17'),
('Digital Marketing Training', 'Organize digital marketing training session for the team', 'Campaign', 'campaigns', 30, 5, 2025, '10:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['training', 'digital', 'marketing', 'team'], 4, true, false, null, null);

-- Lori-Anne Thibault (id: 5) - Bilingual Communications Specialist
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('French Content Translation Q1', 'Translate all Q1 marketing materials to French with cultural adaptation', 'Blog', 'blogPosts', 6, 0, 2025, '09:15', 5, 'completed', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['translation', 'french', 'content', 'cultural'], 5, false, false, null, null),
('Bilingual Email Templates', 'Create bilingual email templates for customer communications and support', 'Email', 'emailMarketing', 16, 0, 2025, '14:15', 5, 'in-progress', 'bg-orange-100 text-orange-800 border-orange-200', 'medium', ARRAY['bilingual', 'email', 'templates', 'support'], 5, false, false, null, null),

-- February 2025
('Social Media French Content', 'Develop French social media content calendar with localized messaging', 'Social', 'socialMedia', 24, 1, 2025, '10:45', 5, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['french', 'social', 'content', 'localized'], 5, false, false, null, null),
('Multilingual Website Audit', 'Audit website for multilingual compliance and accessibility standards', 'Blog', 'blogPosts', 30, 1, 2025, '11:00', 5, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['multilingual', 'audit', 'accessibility', 'compliance'], 5, false, false, null, null),

-- March 2025
('French Market Research', 'Conduct market research for French-speaking markets and cultural insights', 'Campaign', 'campaigns', 12, 2, 2025, '13:00', 5, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['research', 'french', 'market', 'cultural'], 5, false, false, null, null),
('Bilingual Content Strategy', 'Develop comprehensive bilingual content strategy for all platforms', 'Blog', 'blogPosts', 28, 2, 2025, '15:30', 5, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['bilingual', 'content', 'strategy', 'platforms'], 5, false, false, null, null),

-- April 2025
('French Social Media Campaign', 'Launch French social media campaign with culturally adapted content', 'Social', 'socialMedia', 8, 3, 2025, '09:00', 5, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['french', 'social', 'campaign', 'cultural'], 5, false, false, null, null),
('Translation Quality Review', 'Review and improve translation quality across all materials', 'Blog', 'blogPosts', 22, 3, 2025, '14:00', 5, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['translation', 'quality', 'review', 'materials'], 5, false, false, null, null),

-- May 2025
('French Market Expansion', 'Plan and execute French market expansion strategy', 'Campaign', 'campaigns', 10, 4, 2025, '10:00', 5, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['french', 'market', 'expansion', 'strategy'], 5, false, false, null, null),
('Bilingual Customer Support', 'Implement bilingual customer support system and training', 'Campaign', 'campaigns', 25, 4, 2025, '11:30', 5, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['bilingual', 'support', 'customer', 'training'], 5, false, false, null, null),

-- June 2025
('Mid-Year Translation Review', 'Comprehensive review of all translated materials and quality assessment', 'Blog', 'blogPosts', 12, 5, 2025, '09:00', 5, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'high', ARRAY['mid-year', 'translation', 'review', 'quality'], 5, true, true, '2025-06-12', '2025-06-14'),
('French Market Performance Analysis', 'Analyze French market performance and identify growth opportunities', 'Campaign', 'campaigns', 28, 5, 2025, '14:00', 5, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['french', 'market', 'performance', 'analysis'], 5, false, false, null, null);

-- Meg McLean (id: 6) - Social and Digital Engagement Lead
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('TikTok Strategy Development', 'Develop comprehensive TikTok marketing strategy with Gen Z focus', 'Social', 'socialMedia', 9, 0, 2025, '12:00', 6, 'review', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['tiktok', 'strategy', 'social', 'gen-z'], 6, false, false, null, null),
('Influencer Partnership Program', 'Launch new influencer partnership program with micro and macro influencers', 'Campaign', 'campaigns', 19, 0, 2025, '15:00', 6, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['influencer', 'partnership', 'launch', 'micro-macro'], 6, false, false, null, null),

-- February 2025
('Social Media Crisis Management', 'Update social media crisis management protocols and response procedures', 'Social', 'socialMedia', 1, 1, 2025, '11:30', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['crisis', 'management', 'social', 'protocols'], 6, false, false, null, null),
('Community Management Training', 'Train team on community management best practices and engagement strategies', 'Social', 'socialMedia', 7, 1, 2025, '13:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['training', 'community', 'management', 'engagement'], 6, false, false, null, null),

-- March 2025
('Social Media Analytics Dashboard', 'Develop comprehensive social media analytics dashboard and reporting', 'Social', 'socialMedia', 14, 2, 2025, '10:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['analytics', 'dashboard', 'social', 'reporting'], 6, false, false, null, null),
('User Generated Content Campaign', 'Launch user-generated content campaign to increase engagement', 'Social', 'socialMedia', 28, 2, 2025, '14:30', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['ugc', 'content', 'campaign', 'engagement'], 6, false, false, null, null),

-- April 2025
('Social Media A/B Testing', 'Implement comprehensive A/B testing for social media content and strategies', 'Social', 'socialMedia', 5, 3, 2025, '11:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['ab-testing', 'social', 'content', 'strategies'], 6, false, false, null, null),
('Social Media Compliance Review', 'Review and update social media compliance policies and procedures', 'Social', 'socialMedia', 20, 3, 2025, '15:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['compliance', 'social', 'policies', 'procedures'], 6, false, false, null, null),

-- May 2025
('Social Media Innovation Lab', 'All-day innovation lab to explore new social media trends and technologies', 'Social', 'socialMedia', 15, 4, 2025, '09:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['innovation', 'lab', 'social', 'trends'], 6, true, false, null, null),
('Cross-Platform Content Strategy', 'Develop unified content strategy across all social media platforms', 'Social', 'socialMedia', 30, 4, 2025, '13:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['cross-platform', 'content', 'strategy', 'unified'], 6, false, false, null, null),

-- June 2025
('Mid-Year Social Media Review', 'Comprehensive mid-year social media performance review and strategy adjustment', 'Social', 'socialMedia', 18, 5, 2025, '10:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['mid-year', 'social', 'review', 'strategy'], 6, true, true, '2025-06-18', '2025-06-20'),
('Social Media Team Retreat', 'Organize social media team retreat for strategy planning and team building', 'Social', 'socialMedia', 30, 5, 2025, '09:00', 6, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['retreat', 'social', 'team', 'planning'], 6, true, true, '2025-06-30', '2025-07-02');

-- Add comprehensive recurring tasks showcasing all new features
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_recurring, recurring_pattern, recurring_interval, recurring_unit, recurring_days, recurring_end_date) VALUES
-- Daily recurring tasks
('Daily Social Media Monitoring', 'Monitor social media mentions and engagement across all platforms', 'Social', 'socialMedia', 1, 0, 2025, '09:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['monitoring', 'daily', 'social', 'engagement'], 1, true, 'daily', 1, 'day', null, '2025-06-30'),
('Daily Content Review', 'Review and approve daily social media content before publishing', 'Social', 'socialMedia', 1, 0, 2025, '16:00', 6, 'in-progress', 'bg-green-100 text-green-800 border-green-200', 'high', ARRAY['content', 'review', 'daily', 'approval'], 6, true, 'daily', 1, 'day', null, '2025-06-30'),

-- Weekly recurring tasks
('Weekly Team Standup', 'Weekly team standup meeting for project updates and blockers', 'Campaign', 'campaigns', 1, 0, 2025, '09:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['standup', 'meeting', 'weekly', 'team'], 3, true, 'weekly', 1, 'week', ARRAY[1], '2025-06-30'),
('Weekly SEO Performance Check', 'Monitor SEO performance metrics and keyword rankings', 'Blog', 'blogPosts', 1, 0, 2025, '11:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['seo', 'performance', 'weekly', 'keywords'], 2, true, 'weekly', 1, 'week', ARRAY[1], '2025-06-30'),
('Weekly Marketing Analytics Review', 'Review weekly marketing performance and adjust strategies', 'Campaign', 'campaigns', 1, 0, 2025, '14:00', 4, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['analytics', 'weekly', 'marketing', 'performance'], 4, true, 'weekly', 1, 'week', ARRAY[1], '2025-06-30'),

-- Monthly recurring tasks
('Monthly Social Media Report', 'Generate monthly social media analytics report with insights', 'Social', 'socialMedia', 1, 0, 2025, '10:00', 1, 'planned', 'bg-green-100 text-green-800 border-green-200', 'medium', ARRAY['report', 'analytics', 'monthly', 'insights'], 1, true, 'monthly', 1, 'month', null, '2025-06-30'),
('Monthly Marketing Budget Review', 'Review monthly marketing spend and ROI analysis', 'Campaign', 'campaigns', 1, 0, 2025, '14:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['budget', 'review', 'monthly', 'roi'], 3, true, 'monthly', 1, 'month', null, '2025-06-30'),
('Monthly Content Calendar Review', 'Review and plan monthly content calendar across all channels', 'Blog', 'blogPosts', 1, 0, 2025, '11:00', 2, 'planned', 'bg-blue-100 text-blue-800 border-blue-200', 'medium', ARRAY['content', 'calendar', 'monthly', 'channels'], 2, true, 'monthly', 1, 'month', null, '2025-06-30'),

-- Custom recurring tasks
('Bi-weekly Team Check-in', 'Bi-weekly check-in meeting with team leads', 'Campaign', 'campaigns', 1, 0, 2025, '15:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'medium', ARRAY['check-in', 'bi-weekly', 'team', 'leads'], 3, true, 'weekly', 2, 'week', ARRAY[1,3], '2025-06-30'),
('Quarterly Strategy Review', 'Quarterly strategic review and planning session', 'Campaign', 'campaigns', 1, 0, 2025, '09:00', 3, 'planned', 'bg-purple-100 text-purple-800 border-purple-200', 'high', ARRAY['strategy', 'quarterly', 'review', 'planning'], 3, true, 'monthly', 3, 'month', null, '2025-06-30');

-- Add vacation/leave entries to showcase the vacation category
INSERT INTO tasks (title, description, type, category, date, month, year, time, assignee, status, color, priority, tags, created_by, is_all_day, is_multiday, start_date, end_date) VALUES
-- January 2025
('New Year Holiday', 'New Year holiday break', 'Vacation', 'vacations', 1, 0, 2025, '09:00', 1, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['holiday', 'new-year', 'break'], 1, true, true, '2025-01-01', '2025-01-02'),
('Personal Development Day', 'Personal development and training day', 'Vacation', 'vacations', 15, 0, 2025, '09:00', 2, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['personal', 'development', 'training'], 2, true, false, null, null),

-- February 2025
('Family Day Holiday', 'Family Day holiday', 'Vacation', 'vacations', 17, 1, 2025, '09:00', 3, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['holiday', 'family-day', 'break'], 3, true, false, null, null),
('Winter Break', 'Winter vacation break', 'Vacation', 'vacations', 20, 1, 2025, '09:00', 4, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['winter', 'vacation', 'break'], 4, true, true, '2025-02-20', '2025-02-22'),

-- March 2025
('Spring Break', 'Spring vacation break', 'Vacation', 'vacations', 10, 2, 2025, '09:00', 5, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['spring', 'vacation', 'break'], 5, true, true, '2025-03-10', '2025-03-14'),
('Personal Time Off', 'Personal time off for rest and relaxation', 'Vacation', 'vacations', 25, 2, 2025, '09:00', 6, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['personal', 'time-off', 'rest'], 6, true, false, null, null),

-- April 2025
('Easter Holiday', 'Easter holiday break', 'Vacation', 'vacations', 18, 3, 2025, '09:00', 1, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['holiday', 'easter', 'break'], 1, true, true, '2025-04-18', '2025-04-21'),
('Professional Development', 'Professional development and learning day', 'Vacation', 'vacations', 30, 3, 2025, '09:00', 2, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['professional', 'development', 'learning'], 2, true, false, null, null),

-- May 2025
('Victoria Day Holiday', 'Victoria Day holiday', 'Vacation', 'vacations', 19, 4, 2025, '09:00', 3, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['holiday', 'victoria-day', 'break'], 3, true, false, null, null),
('Summer Planning Retreat', 'Personal summer planning and goal setting retreat', 'Vacation', 'vacations', 26, 4, 2025, '09:00', 4, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['summer', 'planning', 'retreat', 'goals'], 4, true, true, '2025-05-26', '2025-05-28'),

-- June 2025
('Summer Vacation', 'Summer vacation break', 'Vacation', 'vacations', 15, 5, 2025, '09:00', 5, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['summer', 'vacation', 'break'], 5, true, true, '2025-06-15', '2025-06-20'),
('Mid-Year Break', 'Mid-year break for rest and reflection', 'Vacation', 'vacations', 30, 5, 2025, '09:00', 6, 'planned', 'bg-gray-100 text-gray-800 border-gray-200', 'low', ARRAY['mid-year', 'break', 'rest', 'reflection'], 6, true, true, '2025-06-30', '2025-07-02');

-- Insert comprehensive activities to showcase the activity tracking feature
INSERT INTO activities (type, task_id, task_title, user_id, user_name, message, created_at) VALUES
-- January 2025 activities
('task_created', 1, 'Q1 Social Media Strategy Planning', '1', 'Courtney Wright', 'Created new task: Q1 Social Media Strategy Planning', NOW() - INTERVAL '15 days'),
('task_updated', 2, 'Instagram Content Calendar Q1', '1', 'Courtney Wright', 'Updated status to completed', NOW() - INTERVAL '10 days'),
('task_created', 3, 'LinkedIn Campaign Launch', '1', 'Courtney Wright', 'Created new task: LinkedIn Campaign Launch', NOW() - INTERVAL '5 days'),
('task_created', 4, 'Website Performance Audit Q1', '2', 'Ghislain Girard', 'Created new task: Website Performance Audit Q1', NOW() - INTERVAL '12 days'),
('task_updated', 4, 'Website Performance Audit Q1', '2', 'Ghislain Girard', 'Updated status to completed', NOW() - INTERVAL '8 days'),
('task_created', 5, 'SEO Optimization Project', '2', 'Ghislain Girard', 'Created new task: SEO Optimization Project', NOW() - INTERVAL '6 days'),
('task_created', 6, 'Q1 Strategy Review', '3', 'Joy Pavelich', 'Created new task: Q1 Strategy Review', NOW() - INTERVAL '14 days'),
('task_updated', 6, 'Q1 Strategy Review', '3', 'Joy Pavelich', 'Updated status to review', NOW() - INTERVAL '3 days'),
('task_created', 7, 'Email Campaign: New Year Launch', '4', 'Krystle Kung', 'Created new task: Email Campaign: New Year Launch', NOW() - INTERVAL '13 days'),
('task_created', 8, 'French Content Translation Q1', '5', 'Lori-Anne Thibault', 'Created new task: French Content Translation Q1', NOW() - INTERVAL '11 days'),
('task_updated', 8, 'French Content Translation Q1', '5', 'Lori-Anne Thibault', 'Updated status to completed', NOW() - INTERVAL '7 days'),
('task_created', 9, 'TikTok Strategy Development', '6', 'Meg McLean', 'Created new task: TikTok Strategy Development', NOW() - INTERVAL '9 days'),
('task_updated', 9, 'TikTok Strategy Development', '6', 'Meg McLean', 'Updated status to review', NOW() - INTERVAL '2 days'),

-- Recurring task activities
('task_created', 10, 'Daily Social Media Monitoring', '1', 'Courtney Wright', 'Created recurring task: Daily Social Media Monitoring', NOW() - INTERVAL '20 days'),
('task_created', 11, 'Weekly Team Standup', '3', 'Joy Pavelich', 'Created recurring task: Weekly Team Standup', NOW() - INTERVAL '18 days'),
('task_created', 12, 'Monthly Social Media Report', '1', 'Courtney Wright', 'Created recurring task: Monthly Social Media Report', NOW() - INTERVAL '16 days'),
('task_updated', 12, 'Daily Content Review', '6', 'Meg McLean', 'Updated status to in-progress', NOW() - INTERVAL '1 hour'),

-- Recent activities
('task_created', 13, 'Valentine''s Day Campaign', '1', 'Courtney Wright', 'Created new task: Valentine''s Day Campaign', NOW() - INTERVAL '2 hours'),
('task_created', 14, 'Content Management System Migration', '2', 'Ghislain Girard', 'Created new task: Content Management System Migration', NOW() - INTERVAL '1 hour'),
('task_created', 15, 'Strategic Planning Retreat', '3', 'Joy Pavelich', 'Created new task: Strategic Planning Retreat', NOW() - INTERVAL '30 minutes'),
('task_created', 16, 'Marketing Automation Setup', '4', 'Krystle Kung', 'Created new task: Marketing Automation Setup', NOW() - INTERVAL '15 minutes'),
('task_created', 17, 'Bilingual Email Templates', '5', 'Lori-Anne Thibault', 'Created new task: Bilingual Email Templates', NOW() - INTERVAL '10 minutes'),
('task_created', 18, 'Influencer Partnership Program', '6', 'Meg McLean', 'Created new task: Influencer Partnership Program', NOW() - INTERVAL '5 minutes');

-- Show completion message
SELECT 'Test data populated successfully for 6 months (January 2025 - June 2025)' as status;
