const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');
const { getValidAccessToken } = require('../utils/googleAuthHelper');

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { message, healthData, history } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const accessToken = await getValidAccessToken(req);
    const reply = await AIService.chat(message, healthData || {}, history || [], accessToken);
    res.json({ reply });
  } catch (error) {
    console.warn("Chat route: OAuth token fetch failed, falling back to server API key. Detail:", error.message);
    const reply = await AIService.chat(message, healthData || {}, history || [], null);
    res.json({ reply });
  }
});

module.exports = router;
