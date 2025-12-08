-- Sample User Activity Data for Quasar Application
-- This script provides sample data for user activity tracking
-- Run this after the main seeders have been executed

-- Note: Replace the UUIDs below with actual user IDs from your database
-- You can get user IDs by running: SELECT id, username FROM users;

-- Sample User IDs (replace these with actual UUIDs from your database)
-- These are example UUIDs - you'll need to update them
DO $$
DECLARE
    admin_user_id UUID := '550e8400-e29b-41d4-a716-446655440001';
    regular_user_id UUID := '550e8400-e29b-41d4-a716-446655440002';
    jane_user_id UUID := '550e8400-e29b-41d4-a716-446655440003';
    mike_user_id UUID := '550e8400-e29b-41d4-a716-446655440004';
    
    session_1 VARCHAR := 'session_admin_001_' || extract(epoch from now());
    session_2 VARCHAR := 'session_user_001_' || extract(epoch from now());
    session_3 VARCHAR := 'session_jane_001_' || extract(epoch from now());
    session_4 VARCHAR := 'session_mike_001_' || extract(epoch from now());
BEGIN

-- Insert sample user sessions
INSERT INTO user_sessions (
    id, user_id, session_token, status, ip_address, user_agent, 
    device_type, browser, operating_system, login_at, last_activity_at, 
    expires_at, is_remember_me, created_at, updated_at, version
) VALUES 
-- Admin user sessions
(gen_random_uuid(), admin_user_id, session_1, 'active', '192.168.1.100', 
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 'desktop', 'Chrome', 'Windows 10', 
 now() - interval '2 hours', now() - interval '30 minutes', 
 now() + interval '22 hours', false, 
 now() - interval '2 hours', now() - interval '30 minutes', 1),

-- Regular user sessions  
(gen_random_uuid(), regular_user_id, session_2, 'active', '10.0.0.50',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 'desktop', 'Chrome', 'macOS', 
 now() - interval '1 hour', now() - interval '10 minutes',
 now() + interval '23 hours', true,
 now() - interval '1 hour', now() - interval '10 minutes', 1),

-- Jane's session
(gen_random_uuid(), jane_user_id, session_3, 'expired', '172.16.0.25',
 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
 'mobile', 'Safari', 'iOS', 
 now() - interval '1 day', now() - interval '23 hours',
 now() - interval '22 hours', false,
 now() - interval '1 day', now() - interval '23 hours', 1),

-- Mike's session
(gen_random_uuid(), mike_user_id, session_4, 'logged_out', '203.0.113.45',
 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 'desktop', 'Chrome', 'Linux',
 now() - interval '3 hours', now() - interval '2 hours',
 now() + interval '21 hours', false,
 now() - interval '3 hours', now() - interval '2 hours', 1);

-- Insert sample user activities
INSERT INTO user_activities (
    id, user_id, session_id, activity_type, activity_description,
    resource_type, resource_id, ip_address, user_agent, request_path,
    request_method, response_status, duration_ms, metadata,
    is_successful, created_at, updated_at, version
) VALUES 

-- Admin Panel Login Activities
(gen_random_uuid(), admin_user_id, session_1, 'login', 'Admin logged into admin panel',
 'auth', admin_user_id, '192.168.1.100',
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/admin/auth/login', 'POST', 200, 450,
 '{"adminPanel": true, "loginMethod": "email", "deviceType": "desktop", "browser": "Chrome", "operatingSystem": "Windows 10"}',
 true, now() - interval '2 hours', now() - interval '2 hours', 1),

-- Admin Dashboard View
(gen_random_uuid(), admin_user_id, session_1, 'page_view', 'Admin viewed dashboard',
 'admin', null, '192.168.1.100',
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/admin/dashboard', 'GET', 200, 850,
 '{"pageTitle": "Admin Dashboard", "adminPanel": true, "timeOnPage": 45000}',
 true, now() - interval '2 hours' + interval '2 minutes', now() - interval '2 hours' + interval '2 minutes', 1),

-- Admin User Management
(gen_random_uuid(), admin_user_id, session_1, 'admin_action', 'Admin viewed user list',
 'user', null, '192.168.1.100',
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/admin/users', 'GET', 200, 650,
 '{"adminPanel": true, "action": "view_users", "targetResource": "user", "resultsCount": 25}',
 true, now() - interval '2 hours' + interval '5 minutes', now() - interval '2 hours' + interval '5 minutes', 1),

-- Admin Analytics View
(gen_random_uuid(), admin_user_id, session_1, 'admin_action', 'Admin viewed analytics',
 'analytics', null, '192.168.1.100',
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/admin/analytics', 'GET', 200, 1200,
 '{"adminPanel": true, "action": "view_analytics", "targetResource": "system", "dateRange": "last_30_days"}',
 true, now() - interval '2 hours' + interval '10 minutes', now() - interval '2 hours' + interval '10 minutes', 1),

-- Regular User Activities
(gen_random_uuid(), regular_user_id, session_2, 'login', 'User logged in',
 'auth', regular_user_id, '10.0.0.50',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/auth/login', 'POST', 200, 320,
 '{"loginMethod": "email", "deviceType": "desktop", "browser": "Chrome", "operatingSystem": "macOS", "isRememberMe": true}',
 true, now() - interval '1 hour', now() - interval '1 hour', 1),

-- User Dashboard View
(gen_random_uuid(), regular_user_id, session_2, 'page_view', 'User viewed dashboard',
 'dashboard', null, '10.0.0.50',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/dashboard', 'GET', 200, 750,
 '{"pageTitle": "Dashboard", "timeOnPage": 120000, "referrer": null}',
 true, now() - interval '1 hour' + interval '1 minute', now() - interval '1 hour' + interval '1 minute', 1),

-- User Profile Update
(gen_random_uuid(), regular_user_id, session_2, 'profile_update', 'User updated profile',
 'user-profile', regular_user_id, '10.0.0.50',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/profile', 'PUT', 200, 580,
 '{"fieldsUpdated": ["firstName", "bio"], "previousValues": {"bio": "Old bio"}}',
 true, now() - interval '1 hour' + interval '15 minutes', now() - interval '1 hour' + interval '15 minutes', 1),

-- User Search Activity
(gen_random_uuid(), regular_user_id, session_2, 'search', 'User performed search',
 'search', null, '10.0.0.50',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/search', 'GET', 200, 420,
 '{"query": "user management", "resultsCount": 15, "filters": {"category": "users", "status": "active"}}',
 true, now() - interval '1 hour' + interval '25 minutes', now() - interval '1 hour' + interval '25 minutes', 1),

-- File Upload Activity
(gen_random_uuid(), regular_user_id, session_2, 'file_upload', 'User uploaded file',
 'file', null, '10.0.0.50',
 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/files/upload', 'POST', 201, 2500,
 '{"fileName": "document.pdf", "fileSize": 2048576, "fileType": "application/pdf"}',
 true, now() - interval '1 hour' + interval '35 minutes', now() - interval '1 hour' + interval '35 minutes', 1),

-- Jane's Mobile Activities (Expired Session)
(gen_random_uuid(), jane_user_id, session_3, 'login', 'Jane logged in from mobile',
 'auth', jane_user_id, '172.16.0.25',
 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
 '/auth/login', 'POST', 200, 680,
 '{"loginMethod": "email", "deviceType": "mobile", "browser": "Safari", "operatingSystem": "iOS"}',
 true, now() - interval '1 day', now() - interval '1 day', 1),

-- Jane's Page Views
(gen_random_uuid(), jane_user_id, session_3, 'page_view', 'Jane viewed profile page',
 'profile', null, '172.16.0.25',
 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
 '/profile', 'GET', 200, 950,
 '{"pageTitle": "User Profile", "timeOnPage": 60000, "deviceType": "mobile"}',
 true, now() - interval '1 day' + interval '5 minutes', now() - interval '1 day' + interval '5 minutes', 1),

-- Mike's Activities (Logged Out Session)
(gen_random_uuid(), mike_user_id, session_4, 'login', 'Mike logged in',
 'auth', mike_user_id, '203.0.113.45',
 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/auth/login', 'POST', 200, 380,
 '{"loginMethod": "email", "deviceType": "desktop", "browser": "Chrome", "operatingSystem": "Linux"}',
 true, now() - interval '3 hours', now() - interval '3 hours', 1),

-- Mike's API Calls
(gen_random_uuid(), mike_user_id, session_4, 'api_call', 'API endpoint called',
 'api', null, '203.0.113.45',
 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/api/users', 'GET', 200, 150,
 '{"endpoint": "/api/users", "responseSize": 5420}',
 true, now() - interval '3 hours' + interval '10 minutes', now() - interval '3 hours' + interval '10 minutes', 1),

-- Mike's Settings Update
(gen_random_uuid(), mike_user_id, session_4, 'settings_update', 'Mike updated settings',
 'settings', mike_user_id, '203.0.113.45',
 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/settings', 'PUT', 200, 420,
 '{"settingsUpdated": ["theme", "notifications"], "newValues": {"theme": "dark", "notifications": true}}',
 true, now() - interval '3 hours' + interval '20 minutes', now() - interval '3 hours' + interval '20 minutes', 1),

-- Mike's Logout
(gen_random_uuid(), mike_user_id, session_4, 'logout', 'Mike logged out',
 'auth', mike_user_id, '203.0.113.45',
 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/auth/logout', 'POST', 200, 120,
 '{"logoutMethod": "manual"}',
 true, now() - interval '2 hours', now() - interval '2 hours', 1),

-- Additional Admin Panel Activities
(gen_random_uuid(), admin_user_id, session_1, 'admin_action', 'Admin created new user',
 'user', null, '192.168.1.100',
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/admin/users/create', 'POST', 201, 890,
 '{"adminPanel": true, "action": "create_user", "targetResource": "user", "newUserEmail": "newuser@example.com"}',
 true, now() - interval '1 hour' + interval '30 minutes', now() - interval '1 hour' + interval '30 minutes', 1),

-- Admin Export Activity
(gen_random_uuid(), admin_user_id, session_1, 'export', 'Admin exported user data',
 'user', null, '192.168.1.100',
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
 '/admin/users/export', 'GET', 200, 3200,
 '{"adminPanel": true, "exportFormat": "csv", "recordCount": 150, "fileSize": 45000}',
 true, now() - interval '1 hour' + interval '45 minutes', now() - interval '1 hour' + interval '45 minutes', 1);

END $$;

-- Verify the data was inserted
SELECT 
    'User Activities' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_activity,
    MAX(created_at) as latest_activity
FROM user_activities
UNION ALL
SELECT 
    'User Sessions' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_activity,
    MAX(created_at) as latest_activity
FROM user_sessions;

-- Show activity breakdown by type
SELECT 
    activity_type,
    COUNT(*) as count,
    COUNT(CASE WHEN is_successful THEN 1 END) as successful_count
FROM user_activities 
GROUP BY activity_type 
ORDER BY count DESC;
