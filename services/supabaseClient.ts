import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = window.env?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseKey = window.env?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key must be defined in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
