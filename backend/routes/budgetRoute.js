const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user budget
router.get('/', auth, (req, res) => {
  res.json({ success: true, message: 'Get budget endpoint' });
});

// Create/update budget
router.post('/', auth, (req, res) => {
  res.json({ success: true, message: 'Create/update budget endpoint' });
});

// Get budget analytics
router.get('/analytics', auth, (req, res) => {
  res.json({ success: true, message: 'Budget analytics endpoint' });
});

module.exports = router;
