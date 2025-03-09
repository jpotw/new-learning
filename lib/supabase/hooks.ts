import { useEffect, useState } from 'react';
import { supabase } from './client';
import { Session, SupabaseUser } from './types';

/**
 * Custom hook to access the Supabase client in components
 * @returns The Supabase client
 */
export const useSupabase = () => {
  return supabase;
};

/**
 * Custom hook to access the current user session
 * @returns Session object containing user, loading state, and error
 */
export const useSession = (): Session => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          setUser(data.session.user);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    // Call getSession immediately
    getSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Clean up the subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, error };
}; 