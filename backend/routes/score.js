const express = require('express');
const router = express.Router();
const GoogleFitService = require('../services/googleFit');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const service = new GoogleFitService(req.session.tokens);
  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);

  try {
    const [steps, sleep, heartRate] = await Promise.all([
      service.getSteps(startOfDay, now),
      service.getSleep(startOfDay - (24 * 60 * 60 * 1000), now),
      service.getHeartRate(startOfDay, now)
    ]);

    // Simple Scoring Logic
    const stepScore = Math.min((steps / 10000) * 100, 100);
    const sleepScore = Math.min((sleep / 8) * 100, 100);
    const hrScore = heartRate >= 60 && heartRate <= 80 ? 100 : 70; // Mock calculation

    const finalScore = Math.round(
      (stepScore * 0.4) + (sleepScore * 0.3) + (hrScore * 0.3)
    );

    res.json({
      score: finalScore,
      breakdown: {
        steps: Math.round(stepScore),
        sleep: Math.round(sleepScore),
        heartRate: hrScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
