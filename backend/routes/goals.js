const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

let userGoalsMock = {
  steps: 10000,
  water: 2500,
  workouts: 4,
  mood: "Happy"
};

router.post('/', (req, res) => {
  const { steps, water, workouts, mood } = req.body;
  userGoalsMock = { ...userGoalsMock, steps, water, workouts, mood };
  res.json({ message: "Goals updated", goals: userGoalsMock });
});

router.get('/', (req, res) => {
  res.json(userGoalsMock);
});

module.exports = router;
