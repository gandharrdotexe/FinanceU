const express = require('express');
const auth = require('../middleware/auth');
const { 
  getUserProgress, 
  getLeaderboard, 
  getUserAchievements, 
  checkBadges 
} = require('../controllers/gamificationController');

const router = express.Router();

// Get user progress
router.get('/progress', auth, getUserProgress);

// Get leaderboard
router.get('/leaderboard', auth, getLeaderboard);

// Get achievements
router.get('/achievements', auth, getUserAchievements);

// Check for new badges
router.post('/check-badges', auth, checkBadges);

// Update user streak (called on login/daily activity)
router.post('/update-streak', auth, async (req, res) => {
  try {
    const User = require('../models/userModel');
    const user = await User.findById(req.user._id);
    
    const today = new Date();
    const lastActive = user.gamification.lastActiveDate;
    
    if (lastActive) {
      const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        user.gamification.streak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        user.gamification.streak = 1;
      }
      // Same day = no change
    } else {
      // First login
      user.gamification.streak = 1;
    }
    
    user.gamification.lastActiveDate = today;
    await user.save();

    res.json({
      success: true,
      streak: user.gamification.streak
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update streak',
      error: error.message
    });
  }
});

module.exports = router;
