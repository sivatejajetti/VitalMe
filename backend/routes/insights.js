const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { weeklyData } = req.body;
  if (!weeklyData) return res.status(400).json({ error: "Missing weekly health data" });

  const insights = await AIService.generateInsights(weeklyData);
  res.json({ insights });
});

module.exports = router;
