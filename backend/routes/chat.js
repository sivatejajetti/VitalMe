const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { message, healthData, history } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const reply = await AIService.chat(message, healthData || {}, history || []);
  res.json({ reply });
});

module.exports = router;
