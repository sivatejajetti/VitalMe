const express = require('express');
const router = express.Router();
const GoogleFitService = require('../services/googleFit');
const LogService = require('../services/logService');
const SyncService = require('../services/syncService');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const userId = req.session.userId;
  const service = new GoogleFitService(req.session.tokens);
  
  try {
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const results = [];
    const now = new Date();

    // 1. Fetch manual logs (already fast via Supabase)
    const allLogs = await LogService.getWeeklyLogs(userId); 

    // 2. Optimized 14-day loop with Cloud Caching
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Check Warp Cache First
      let bioData = await SyncService.getCachedSummary(userId, dateStr);
      
      // If no cache, or if it's TODAY (we need fresh data for today), fetch from Google
      if (!bioData || i === 0) {
        d.setHours(0, 0, 0, 0);
        const start = d.getTime();
        const end = start + (24 * 60 * 60 * 1000);

        bioData = {
          steps: await service.getSteps(start, end),
          sleep: parseFloat(await service.getSleep(start, end)),
          calories: await service.getCalories(start, end),
          heart_rate: await service.getHeartRate(start, end)
        };

        // Save to Warp Cache for next time
        await SyncService.cacheDailyData(userId, dateStr, bioData);
      }
      
      results.push({
        day: daysName[new Date(dateStr).getDay()],
        date: dateStr,
        ...bioData,
        pushups: allLogs.find(l => l.date === dateStr && l.activity_type === 'pushups')?.value || 0,
        water: allLogs.find(l => l.date === dateStr && l.activity_type === 'water')?.value || 0,
        mood: allLogs.find(l => l.date === dateStr && l.activity_type === 'mood')?.value || 3,
        workout: allLogs.find(l => l.date === dateStr && l.activity_type === 'workout')?.value || 0
      });
    }
    
    res.json(results.reverse());
  } catch (error) {
    console.error('Fast History Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
