const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Sync Service
 * Manages the high-speed caching of Google Fit data into Supabase
 */
class SyncService {
  static async getCachedSummary(userId, dateStr) {
    try {
      const { data } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .maybeSingle();
      return data;
    } catch (e) {
      return null;
    }
  }

  static async cacheDailyData(userId, dateStr, data) {
    try {
      await supabase.from('daily_summaries').upsert({
        user_id: userId,
        date: dateStr,
        ...data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,date' });
    } catch (e) {
      console.error("Cache Write Error:", e.message);
    }
  }

  static async getSyncStats(userId, count = 30) {
    const { data } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(count);
    return data || [];
  }
}

module.exports = SyncService;
