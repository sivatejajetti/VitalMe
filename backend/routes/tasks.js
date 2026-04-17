const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');
const authMiddleware = require('../middleware/authMiddleware');
const GoogleFitService = require('../services/googleFit');

router.use(authMiddleware);

// Get user tasks
router.get('/', async (req, res) => {
  try {
    const fitness = new GoogleFitService(req.session.tokens);
    const profile = await fitness.getUserProfile();
    
    if (!profile.googleId) return res.status(401).json({ error: "Could not identify user" });
    
    const tasks = await taskService.getTasks(profile.googleId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync/Save tasks
router.post('/sync', async (req, res) => {
  try {
    const { tasks } = req.body;
    const fitness = new GoogleFitService(req.session.tokens);
    const profile = await fitness.getUserProfile();
    
    if (!profile.googleId) return res.status(401).json({ error: "Could not identify user" });
    
    const success = await taskService.saveTasks(profile.googleId, tasks);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete specific task
router.delete('/:id', async (req, res) => {
  try {
    const success = await taskService.deleteTask(req.params.id);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
