import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCommandCenter() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();

    const subscription = supabase
      .channel('command_center_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'command_center' }, payload => {
        if (payload.eventType === 'INSERT') {
          setTasks(current => [payload.new, ...current]);
        } else if (payload.eventType === 'DELETE') {
          setTasks(current => current.filter(t => t.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setTasks(current => current.map(t => t.id === payload.new.id ? payload.new : t));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('command_center')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task) => {
    const tempId = Date.now().toString();
    const optimisticTask = { id: tempId, ...task, created_at: new Date().toISOString(), status: 'pending' };
    setTasks(current => [optimisticTask, ...current]);

    try {
      const { error } = await supabase
        .from('command_center')
        .insert([task]);

      if (error) {
        setTasks(current => current.filter(t => t.id !== tempId));
        console.error('Error adding task:', error);
      }
    } catch (error) {
      console.error('Error in addTask:', error);
    }
  };

  const updateTaskStatus = async (id, status) => {
    const previousTasks = [...tasks];
    setTasks(current => current.map(t => t.id === id ? { ...t, status, completed_at: status === 'done' ? new Date().toISOString() : null } : t));

    try {
      const updates = { status };
      if (status === 'done') updates.completed_at = new Date().toISOString();

      const { error } = await supabase
        .from('command_center')
        .update(updates)
        .eq('id', id);

      if (error) {
        setTasks(previousTasks);
        console.error('Error updating task:', error);
      }
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
    }
  };

  const deleteTask = async (id) => {
    const previousTasks = [...tasks];
    setTasks(current => current.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from('command_center')
        .delete()
        .eq('id', id);

      if (error) {
        setTasks(previousTasks);
        console.error('Error deleting task:', error);
      }
    } catch (error) {
      console.error('Error in deleteTask:', error);
    }
  };

  return { tasks, addTask, updateTaskStatus, deleteTask, loading };
}
