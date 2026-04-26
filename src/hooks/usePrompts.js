import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// The shared `prompts` table on the website Supabase stores rows as
// { cat, title, scenes:[{label, prompt}] }, but the PWA's UI expects
// { category, title, text }. Map at the boundary so the UI never sees
// undefined fields (which previously crashed Dashboard with
// `category.toLowerCase()` on undefined → blank screen).
function adaptRow(row) {
  if (!row) return row;
  const scenes = Array.isArray(row.scenes) ? row.scenes : [];
  const text = scenes.length
    ? scenes.map(s => (s?.label ? `${s.label}\n${s.prompt ?? ''}` : (s?.prompt ?? ''))).join('\n\n')
    : (row.text ?? '');
  return {
    ...row,
    category: row.category ?? row.cat ?? 'Uncategorized',
    text,
  };
}

export function usePrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchPrompts();

    // Set up realtime subscription
    const subscription = supabase
      .channel('prompts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prompts' }, payload => {
        console.log('Realtime change received!', payload);
        if (payload.eventType === 'INSERT') {
          setPrompts(current => [adaptRow(payload.new), ...current]);
        } else if (payload.eventType === 'DELETE') {
          setPrompts(current => current.filter(p => p.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setPrompts(current => current.map(p => p.id === payload.new.id ? adaptRow(payload.new) : p));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts((data || []).map(adaptRow));
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPrompt = async (newPrompt) => {
    // Optimistic UI update (optional, but good for speed)
    const tempId = Date.now().toString();
    const optimisticPrompt = { id: tempId, ...newPrompt, created_at: new Date().toISOString() };
    setPrompts([optimisticPrompt, ...prompts]);

    try {
      const { error } = await supabase
        .from('prompts')
        .insert([newPrompt]);
        
      if (error) {
        // Revert on error
        setPrompts(prompts.filter(p => p.id !== tempId));
        console.error('Error saving prompt:', error);
      }
    } catch (error) {
      console.error('Error in addPrompt:', error);
    }
  };

  const deletePrompt = async (id) => {
    // Optimistic update
    const previousPrompts = [...prompts];
    setPrompts(prompts.filter(p => p.id !== id));

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);
        
      if (error) {
        // Revert on error
        setPrompts(previousPrompts);
        console.error('Error deleting prompt:', error);
      }
    } catch (error) {
      console.error('Error in deletePrompt:', error);
    }
  };

  return { prompts, addPrompt, deletePrompt, loading };
}
