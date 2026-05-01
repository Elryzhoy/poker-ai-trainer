import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Using mock client.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;

// Mock data for development
export const mockData = {
  users: [
    { id: '1', email: 'test@example.com', name: 'Test User', subscription: 'free' }
  ],
  handHistories: [],
  trainingSessions: [],
  rangeTraining: []
};

export default supabase;
