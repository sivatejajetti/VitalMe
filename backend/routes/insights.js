const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');
const { getValidAccessToken } = require('../utils/googleAuthHelper');

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { weeklyData } = req.body;
  if (!weeklyData) return res.status(400).json({ error: "Missing weekly health data" });

  try {
    const accessToken = await getValidAccessToken(req);
    const insights = await AIService.generateInsights(weeklyData, accessToken);
    res.json({ insights });
  } catch (error) {
    console.warn("Insights route: OAuth token fetch failed, falling back to server API key. Detail:", error.message);
    const insights = await AIService.generateInsights(weeklyData, null);
    res.json({ insights });
  }
});

module.exports = router;
