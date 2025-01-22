import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl?.startsWith('https://') && 
  supabaseAnonKey
);

// Create client only if configuration is valid
export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl : 'https://example.supabase.co',
  supabaseAnonKey || ''
);