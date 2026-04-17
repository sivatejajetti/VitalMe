const express = require('express');
const router = express.Router();
const GoogleFitService = require('../services/googleFit');
const authMiddleware = require('../middleware/authMiddleware');
const LogService = require('../services/logService');
const cache = require('../utils/cache');

router.use(authMiddleware);

// GET /api/analytics/history?days=7 or 30
router.get('/history', async (req, res) => {
  const userId = req.session.userId;
  const daysCount = parseInt(req.query.days) || 7;
  const dateStrNow = new Date().toISOString().split('T')[0];
  const cacheKey = `history_${userId}_${daysCount}_${dateStrNow}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`[CACHE HIT] Returning history for ${userId} (${daysCount} days)`);
    return res.json(cachedData);
  }

  const service = new GoogleFitService(req.session.tokens);
  
  try {
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const results = [];
    
    // Fetch manual logs from Cloud (Supabase) for the range
    const allLogs = await LogService.getWeeklyLogs(userId); 
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const startTime = d.getTime();
      const endTime = startTime + (24 * 60 * 60 * 1000);
      
      const dayName = daysName[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      
      // Merge Google Fit + Manual Logs
      results.push({
        day: daysCount > 7 ? `${d.getDate()}/${d.getMonth() + 1}` : dayName,
        date: dateStr,
        steps: await service.getSteps(startTime, endTime),
        sleep: await service.getSleep(startTime, endTime),
        calories: await service.getCalories(startTime, endTime),
        heartRate: await service.getHeartRate(startTime, endTime),
        pushups: allLogs.find(l => l.date === dateStr && l.activity_type === 'pushups')?.value || 0,
        water: allLogs.find(l => l.date === dateStr && l.activity_type === 'water')?.value || 0,
        mood: allLogs.find(l => l.date === dateStr && l.activity_type === 'mood')?.value || 3,
        workout: allLogs.find(l => l.date === dateStr && l.activity_type === 'workout')?.value || 0
      });
    }
    
    // Cache the result
    cache.set(cacheKey, results);
    res.json(results);
  } catch (error) {
    console.error('History Analytics Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/summary', async (req, res) => {
  res.json({
    bestDay: "Tuesday",
    worstDay: "Sunday",
    averages: { steps: 8400, sleep: 7.2, calories: 2100 }
  });
});

module.exports = router;
