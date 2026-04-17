const express = require('express');
const router = express.Router();
const GoogleFitService = require('../services/googleFit');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/all', async (req, res) => {
  const service = new GoogleFitService(req.session.tokens);
  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);

  try {
    const [steps, sleep, heartRate, calories] = await Promise.all([
      service.getSteps(startOfDay, now),
      service.getSleep(startOfDay - (24 * 60 * 60 * 1000), now), // Look back 24h for sleep
      service.getHeartRate(startOfDay, now),
      service.getCalories(startOfDay, now)
    ]);

    res.json({ steps, sleep, heartRate, calories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/steps', async (req, res) => {
  const service = new GoogleFitService(req.session.tokens);
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const steps = await service.getSteps(startOfDay, Date.now());
  res.json({ steps });
});

router.get('/sleep', async (req, res) => {
  const service = new GoogleFitService(req.session.tokens);
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const sleep = await service.getSleep(startOfDay - (24 * 60 * 60 * 1000), Date.now());
  res.json({ sleep });
});

router.get('/heartrate', async (req, res) => {
  const service = new GoogleFitService(req.session.tokens);
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const heartRate = await service.getHeartRate(startOfDay, Date.now());
  res.json({ heartRate });
});

router.get('/calories', async (req, res) => {
  const service = new GoogleFitService(req.session.tokens);
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const calories = await service.getCalories(startOfDay, Date.now());
  res.json({ calories });
});

module.exports = router;
