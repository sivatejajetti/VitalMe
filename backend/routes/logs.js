const express = require('express');
const router = express.Router();
const LogService = require('../services/logService');
const authMiddleware = require('../middleware/authMiddleware');
const cache = require('../utils/cache');

router.use(authMiddleware);

// POST /api/logs
router.post('/', async (req, res) => {
  const { type, value } = req.body;
  const userId = req.session.userId || (req.user ? req.user.id : null);
  console.log(`[API REQUEST] POST /api/logs/ - User ID: ${userId}`);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: No session found" });
  }

  try {
    const log = await LogService.logActivity(userId, type, value);
    
    // 🔥 CACHE PURGE: Force analytics to update instantly
    const dateStr = new Date().toISOString().split('T')[0];
    cache.del(`history_${userId}_7_${dateStr}`);
    cache.del(`history_${userId}_30_${dateStr}`);
    console.log(`[CACHE PURGE] Cleared history history for ${userId}`);

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/logs/today
router.get('/today', async (req, res) => {
  const userId = req.session.userId || (req.user ? req.user.id : null);
  console.log(`[API REQUEST] GET /api/logs/today - User ID: ${userId}`);
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: No session found" });
  }

  try {
    const pushups = await LogService.getActivityForToday(userId, 'pushups');
    const water = await LogService.getActivityForToday(userId, 'water');
    const mood = await LogService.getActivityForToday(userId, 'mood');
    const workout = await LogService.getActivityForToday(userId, 'workout');
    
    res.json({ pushups, water, mood: mood || 3, workout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/today/:type', async (req, res) => {
  const userId = req.session.userId || (req.user ? req.user.id : null);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { type } = req.params;
  try {
    const value = await LogService.getActivityForToday(userId, type);
    res.json({ value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
