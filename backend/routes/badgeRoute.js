// routes/badgeRoute.js - Badge routes
const express = require('express');
const { 
  getAllBadges, 
  getBadgeById, 
  getBadgesByCategory, 
  getBadgesByRarity,
  getBadgeByName,
  getBadgesByNames
} = require('../controllers/badgeController');

const router = express.Router();

// Get all badges (with optional filtering)
router.get('/', getAllBadges);

// Get badges by category
router.get('/category/:category', getBadgesByCategory);

// Get badges by rarity
router.get('/rarity/:rarity', getBadgesByRarity);

// Get badge by name
router.get('/name/:name', getBadgeByName);

// Get badges by array of names
router.post('/names', getBadgesByNames);

// Get badge by ID (must be last to avoid conflicts)
router.get('/:id', getBadgeById);

module.exports = router;