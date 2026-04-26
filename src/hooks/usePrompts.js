import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Each row in the website Supabase `prompts` table is a multi-scene story:
//   { id, cat, title, scenes:[{ label, prompt }, ...] }
// The PWA's UI is one card per row with a single Copy button. To make
// each scene independently copyable, expand one DB row into N
// "scene-rows" — one per scene — at the boundary. Composite ids keep
// React keys unique while still letting realtime DELETE/UPDATE find
// every scene-row that came from the same parent.
function expandRow(row) {
  if (!row) return [];
  const category = row.category ?? row.cat ?? 'Uncategorized';
  const scenes = Array.isArray(row.scenes) ? row.scenes : [];

  if (scenes.length === 0) {
    return [{
      ...row,
      id: row.id,
      parentId: row.id,
      category,
      title: row.title ?? 'Untitled',
      text: row.text ?? '',
    }];
  }

  return scenes.map((scene, idx) => {
    const label = scene?.label?.trim() || `Clip ${idx + 1}`;
    const baseTitle = row.title ?? 'Untitled';
    return {
      id: `${row.id}__${idx}`,
      parentId: row.id,
      sceneIndex: idx,
      category,
      title: `${baseTitle} — ${label}`,
      text: scene?.prompt ?? '',
      created_at: row.created_at,
    };
  });
}

export function usePrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();

    const subscription = supabase
      .channel('prompts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prompts' }, payload => {
        if (payload.eventType === 'INSERT') {
          setPrompts(current => [...expandRow(payload.new), ...current]);
        } else if (payload.eventType === 'DELETE') {
          const removedId = payload.old?.id;
          setPrompts(current => current.filter(p => p.parentId !== removedId));
        } else if (payload.eventType === 'UPDATE') {
          const updatedId = payload.new?.id;
          setPrompts(current => {
            const without = current.filter(p => p.parentId !== updatedId);
            return [...expandRow(payload.new), ...without];
          });
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
      setPrompts((data || []).flatMap(expandRow));
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPrompt = async (newPrompt) => {
    const tempId = Date.now().toString();
    const optimistic = {
      id: tempId,
      parentId: tempId,
      category: newPrompt.category ?? 'Uncategorized',
      title: newPrompt.title ?? 'Untitled',
      text: newPrompt.text ?? '',
      created_at: new Date().toISOString(),
    };
    setPrompts(current => [optimistic, ...current]);

    try {
      const { error } = await supabase.from('prompts').insert([newPrompt]);
      if (error) {
        setPrompts(current => current.filter(p => p.id !== tempId));
        console.error('Error saving prompt:', error);
      }
    } catch (error) {
      console.error('Error in addPrompt:', error);
    }
  };

  // The trash icon is rendered on each scene-row, but a "prompt" in the DB
  // is the whole multi-scene parent. Deleting one scene means deleting the
  // whole parent row (and all its sibling scene-rows from the UI).
  const deletePrompt = async (sceneRowId) => {
    const target = prompts.find(p => p.id === sceneRowId);
    const parentId = target?.parentId ?? sceneRowId;

    const previousPrompts = [...prompts];
    setPrompts(current => current.filter(p => p.parentId !== parentId));

    try {
      const { error } = await supabase.from('prompts').delete().eq('id', parentId);
      if (error) {
        setPrompts(previousPrompts);
        console.error('Error deleting prompt:', error);
      }
    } catch (error) {
      console.error('Error in deletePrompt:', error);
    }
  };

  return { prompts, addPrompt, deletePrompt, loading };
}
