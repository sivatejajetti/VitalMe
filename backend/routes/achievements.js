const express = require('express');
const router = express.Router();
const LogService = require('../services/logService');
const GoogleFitService = require('../services/googleFit');
const SyncService = require('../services/syncService');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const userId = req.session.userId;
  const service = new GoogleFitService(req.session.tokens);
  
  try {
    const today = new Date();
    const monthlyLogs = await LogService.getWeeklyLogs(userId); 

    let marathonCount = 0;
    let ironRepsCount = 0;
    let hydroGodCount = 0;
    let maxStepsOneDay = 0;

    // PERFORM OPTIMIZED 30-DAY DEEP SCAN
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // 1. Get Cached Bio Data
      let bioData = await SyncService.getCachedSummary(userId, dateStr);
      
      // Fetch if missing or if it's today
      if (!bioData || i === 0) {
        const start = new Date(d).setHours(0,0,0,0);
        const end = new Date(d).setHours(23,59,59,999);
        bioData = {
          steps: await service.getSteps(start, end),
          calories: await service.getCalories(start, end),
          heart_rate: await service.getHeartRate(start, end)
        };
        await SyncService.cacheDailyData(userId, dateStr, bioData);
      }

      // 2. Scan for Achievements
      if (bioData.steps >= 12000) marathonCount++;
      if (bioData.steps > maxStepsOneDay) maxStepsOneDay = bioData.steps;

      const dayPushups = monthlyLogs.filter(l => l.date === dateStr && l.activity_type === 'pushups').reduce((s, c) => s + c.value, 0);
      const dayWater = monthlyLogs.filter(l => l.date === dateStr && l.activity_type === 'water').reduce((s, c) => s + c.value, 0);

      if (dayPushups >= 100) ironRepsCount++;
      if (dayWater >= 12) hydroGodCount++;
    }

    const achievements = [
      {
        id: "marathoner",
        title: "Elite Marathoner",
        description: "Hit 12,000+ steps in a single day",
        icon: "👟",
        collected: marathonCount,
        achieved: marathonCount > 0,
        progress: Math.min(100, Math.round((maxStepsOneDay / 12000) * 100))
      },
      {
        id: "iron_reps",
        title: "Titan of Iron",
        description: "100+ pushups logged in 24 hours",
        icon: "🦾",
        collected: ironRepsCount,
        achieved: ironRepsCount > 0,
        progress: ironRepsCount > 0 ? 100 : 0
      },
      {
        id: "hydro_god",
        title: "Ocean Lung",
        description: "Drank 12+ glasses of water in a day",
        icon: "💧",
        collected: hydroGodCount,
        achieved: hydroGodCount > 0,
        progress: hydroGodCount > 0 ? 100 : 0
      },
      {
        id: "vital_recruit",
        title: "Vital Citizen",
        description: "Active Google Fit Integration",
        icon: "🛡️",
        collected: 1,
        achieved: true,
        progress: 100
      }
    ];

    res.json(achievements);
  } catch (error) {
    console.error('Legendary Achievement Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
