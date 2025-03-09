// Export client-side utilities
export { supabase, createSupabaseClient } from './client';

// Export server-side utilities
export { 
  createServerSupabaseClient,
  getServerUser,
  isAuthenticated
} from './server';

// Export hooks
export { useSupabase, useSession } from './hooks';

// Export types
export type { 
  Database,
  TypedSupabaseClient,
  SupabaseUser,
  Session
} from './types'; 