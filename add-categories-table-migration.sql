-- Migration to add categories table for custom categories
-- Run this in your Supabase SQL editor

-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  color_class TEXT NOT NULL, -- e.g., 'bg-blue-100 text-blue-800 border-blue-200'
  type TEXT NOT NULL, -- e.g., 'Blog', 'Social', 'Campaign', etc.
  is_custom BOOLEAN DEFAULT TRUE,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON categories(created_by);
CREATE INDEX IF NOT EXISTS idx_categories_is_custom ON categories(is_custom);

-- Add RLS (Row Level Security) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all users to read categories
CREATE POLICY "Allow all users to read categories" ON categories
  FOR SELECT USING (true);

-- Allow all users to insert categories
CREATE POLICY "Allow all users to insert categories" ON categories
  FOR INSERT WITH CHECK (true);

-- Allow all users to update categories
CREATE POLICY "Allow all users to update categories" ON categories
  FOR UPDATE USING (true);

-- Allow all users to delete categories (for cleanup)
CREATE POLICY "Allow all users to delete categories" ON categories
  FOR DELETE USING (true);

-- Insert default categories
INSERT INTO categories (name, display_name, color_class, type, is_custom, created_by) VALUES
('blogPosts', 'Blog Posts', 'bg-blue-100 text-blue-800 border-blue-200', 'Blog', false, 1),
('socialMedia', 'Social Media', 'bg-green-100 text-green-800 border-green-200', 'Social', false, 1),
('campaigns', 'Campaigns', 'bg-purple-100 text-purple-800 border-purple-200', 'Campaign', false, 1),
('emailMarketing', 'Email Marketing', 'bg-orange-100 text-orange-800 border-orange-200', 'Email', false, 1),
('vacations', 'Vacations', 'bg-gray-100 text-gray-800 border-gray-200', 'Vacation', false, 1)
ON CONFLICT (name) DO NOTHING;
