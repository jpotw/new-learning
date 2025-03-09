import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface Summary {
  id: string;
  title: string;
  content: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

export function useSummaries(documentId?: string) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSummaries();
  }, [documentId]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      let query = supabase.from('summaries').select('*');
      
      if (documentId) {
        query = query.eq('documentId', documentId);
      }

      const { data, error } = await query.order('createdAt', { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summaries');
    } finally {
      setLoading(false);
    }
  };

  const updateSummary = async (id: string, updates: Partial<Summary>) => {
    try {
      const { error } = await supabase
        .from('summaries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchSummaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update summary');
      throw err;
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('summaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSummaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete summary');
      throw err;
    }
  };

  return {
    summaries,
    loading,
    error,
    updateSummary,
    deleteSummary,
    refreshSummaries: fetchSummaries,
  };
} 