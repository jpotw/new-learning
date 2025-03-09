import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Create a Supabase client for server-side usage
// This function is cached to avoid creating a new client on every server component render
export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key must be provided');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      // Use cookies for server-side auth
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  });
});

// Helper function to get the current user on the server
export async function getServerUser() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to check if a user is authenticated on the server
export async function isAuthenticated() {
  const user = await getServerUser();
  return !!user;
} 