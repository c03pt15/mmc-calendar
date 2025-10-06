import { createClient } from '@supabase/supabase-js';

// Use Vercel API route as proxy instead of direct Supabase URL
const supabaseUrl = import.meta.env.VITE_PROXY_URL || 'https://mmc-calendar.atlasveterans.ca/api/debug';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are defined
if (!supabaseUrl) {
  throw new Error('Missing VITE_PROXY_URL environment variable. Please check your .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.');
}

// Create Supabase client with proxy URL
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For debugging - log which URL we're using
console.log('Using Supabase proxy URL:', supabaseUrl);
