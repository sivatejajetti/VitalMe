const express = require('express');
const router = express.Router();
const GoogleFitService = require('../services/googleFit');
const authMiddleware = require('../middleware/authMiddleware');
const UserService = require('../services/userService');

router.use(authMiddleware);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  const userId = req.session.userId;
  const service = new GoogleFitService(req.session.tokens);
  
  try {
    // 1. Get Google data as fallback
    const googleProfile = await service.getUserProfile();
    const googleWeight = await service.getLatestWeight();
    const googleHeight = await service.getLatestHeight();
    
    // 2. Get Cloud data (Supabase)
    const cloudProfile = await UserService.getProfile(userId);
    
    // 3. Intelligent Merge: Manual edits (Cloud) win over Google
    res.json({
      name: cloudProfile?.display_name || googleProfile.name,
      picture: googleProfile.photo || null,
      height: cloudProfile?.height || googleHeight,
      weight: cloudProfile?.weight || googleWeight,
      age: cloudProfile?.age || googleProfile.age,
      gender: cloudProfile?.gender || googleProfile.gender,
    });
  } catch (error) {
    console.error('Profile Fetch Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/user/profile
router.post('/profile', async (req, res) => {
  const userId = req.session.userId;
  try {
    const updated = await UserService.updateProfile(userId, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
