const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', auth, (req, res) => {
  res.json({ success: true, message: 'User profile endpoint' });
});

// Update user profile
router.put('/profile', auth, (req, res) => {
  res.json({ success: true, message: 'Update profile endpoint' });
});

module.exports = router;
