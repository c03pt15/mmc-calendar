-- Create activities table to store activity history
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'task_created', 'task_updated', 'status_changed'
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  task_title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  user_id VARCHAR(50) NOT NULL, -- team member ID who performed the action
  user_name VARCHAR(100) NOT NULL, -- team member name
  old_status VARCHAR(50), -- for status changes
  new_status VARCHAR(50), -- for status changes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_task_id ON activities(task_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow all users to read activities
CREATE POLICY "Allow all users to read activities" ON activities
  FOR SELECT USING (true);

-- Allow all users to insert activities
CREATE POLICY "Allow all users to insert activities" ON activities
  FOR INSERT WITH CHECK (true);

-- Allow all users to update activities (for future features)
CREATE POLICY "Allow all users to update activities" ON activities
  FOR UPDATE USING (true);

-- Allow all users to delete activities (for cleanup)
CREATE POLICY "Allow all users to delete activities" ON activities
  FOR DELETE USING (true);
