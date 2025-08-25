import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key length:', supabaseAnonKey.length);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Testing Supabase connection...');
  (async () => {
    try {
      const { data, error } = await supabase.from('events').select('count').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection successful');
      }
    } catch (err) {
      console.error('Supabase connection test error:', err);
    }
  })();
}
