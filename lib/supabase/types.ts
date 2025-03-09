import { Database as DatabaseTypes } from '@/db/types';
import { SupabaseClient, User } from '@supabase/supabase-js';

// Export the Database type from the generated types
export type Database = DatabaseTypes;

// Export a typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

// Export the User type for convenience
export type SupabaseUser = User;

// Export a session type
export interface Session {
  user: SupabaseUser | null;
  isLoading: boolean;
  error: Error | null;
} 