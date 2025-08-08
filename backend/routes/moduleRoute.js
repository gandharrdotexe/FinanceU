const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all modules
router.get('/', auth, (req, res) => {
  res.json({ success: true, message: 'Get modules endpoint' });
});

// Get specific module
router.get('/:id', auth, (req, res) => {
  res.json({ success: true, message: 'Get specific module endpoint' });
});

// Mark module as completed
router.post('/:id/complete', auth, (req, res) => {
  res.json({ success: true, message: 'Mark module complete endpoint' });
});

module.exports = router;
