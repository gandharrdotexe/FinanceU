const express = require('express');
const auth = require('../middleware/auth');
const { 
  getUserProgress, 
  getLeaderboard, 
  getUserAchievements, 
  checkBadges 
} = require('../controllers/gamificationController');
const { evaluateAndAwardBadges } = require('../utils/gamification');

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
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure gamification object exists for older records
    user.gamification = user.gamification || {};
    if (typeof user.gamification.streak !== 'number') user.gamification.streak = 0;

    const now = new Date();
    const lastActive = user.gamification.lastActiveDate ? new Date(user.gamification.lastActiveDate) : null;

    // Normalize to calendar day difference (UTC) to avoid time-of-day issues
    const toUtcDateOnly = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const todayUtc = toUtcDateOnly(now);
    
    if (lastActive) {
      const lastUtc = toUtcDateOnly(lastActive);
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysDiff = Math.floor((todayUtc - lastUtc) / msPerDay);

      if (daysDiff === 1) {
        user.gamification.streak += 1;
      } else if (daysDiff > 1) {
        user.gamification.streak = 1;
      }
      // Same calendar day: no change
    } else {
      // First login ever
      user.gamification.streak = 1;
    }

    user.gamification.lastActiveDate = now;
    await user.save();

    // Auto-award badges tied to streaks
    const newBadges = await evaluateAndAwardBadges(user._id);

    res.json({
      success: true,
      streak: user.gamification.streak,
      lastActiveDate: user.gamification.lastActiveDate,
      newBadges
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
