const { createClient } = require('@supabase/supabase-js');

class TaskService {
  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (url && key) {
      this.supabase = createClient(url, key);
    }
  }

  async getTasks(userId) {
    if (!this.supabase) return [];
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase getTasks error:', error.message);
      return [];
    }
    return data;
  }

  async saveTasks(userId, tasks) {
    if (!this.supabase) return false;
    
    // Simple approach: Delete old and insert new, or use upsert
    // For a to-do list, individual upsert is usually better
    const formattedTasks = tasks.map(t => ({
      ...t,
      user_id: userId,
      // Ensure specific fields exist
      id: t.id || Math.random().toString(36).substr(2, 9)
    }));

    const { error } = await this.supabase
      .from('tasks')
      .upsert(formattedTasks, { onConflict: 'id' });

    if (error) {
       console.error('Supabase saveTasks error:', error.message);
       return false;
    }
    return true;
  }

  async deleteTask(id) {
    if (!this.supabase) return false;
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    return !error;
  }
}

module.exports = new TaskService();
