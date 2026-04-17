const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

class LogService {
  static async logActivity(userId, activityType, value) {
    const date = new Date().toISOString().split('T')[0];
    const numericValue = parseInt(value, 10);

    console.log(`[PULSE LOG] Session sync - User: ${userId}, Type: ${activityType}, Value: ${numericValue}`);
    
    // 1. Fetch any existing logs for today (Array-based for resilience)
    const { data: records, error: fetchError } = await supabase
      .from('activity_logs')
      .select('value')
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .eq('date', date);

    if (fetchError) {
      console.error(`[CLOUD FETCH ERROR]:`, fetchError.message);
      throw fetchError;
    }

    // 2. Sum up existing value
    const existingValue = (records && records.length > 0) ? records[0].value : 0;
    const newValue = existingValue + numericValue;
    
    console.log(`[SUMMATION] Existing: ${existingValue} + New: ${numericValue} = ${newValue}`);

    // 3. UPSERT the new SUM
    const { data, error } = await supabase
      .from('activity_logs')
      .upsert(
        { user_id: userId, activity_type: activityType, value: newValue, date: date },
        { onConflict: 'user_id,activity_type,date' }
      )
      .select();

    if (error) {
      console.error(`[CLOUD SYNC ERROR]:`, error.message);
      throw error;
    }
    
    return data ? data[0] : null;
  }

  static async getWeeklyLogs(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', dateStr)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getActivityForToday(userId, activityType) {
    const date = new Date().toISOString().split('T')[0];
    console.log(`[FETCH] Getting ${activityType} for user ${userId} on ${date}`);

    const { data, error } = await supabase
      .from('activity_logs')
      .select('value')
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      console.error(`[FETCH ERROR] Failed to get ${activityType}:`, error.message);
      throw error;
    }

    const val = data ? data.value : 0;
    console.log(`[FETCH SUCCESS] ${activityType} value: ${val}`);
    return val;
  }
}

module.exports = LogService;
