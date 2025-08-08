const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user progress
router.get('/progress', auth, (req, res) => {
  res.json({ success: true, message: 'Get progress endpoint' });
});

// Get leaderboard
router.get('/leaderboard', auth, (req, res) => {
  res.json({ success: true, message: 'Get leaderboard endpoint' });
});

// Get achievements
router.get('/achievements', auth, (req, res) => {
  res.json({ success: true, message: 'Get achievements endpoint' });
});

module.exports = router;
