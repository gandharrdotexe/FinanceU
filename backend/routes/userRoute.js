const express = require('express');
const auth = require('../middleware/auth');
const { 
  getUserProfile, 
  updateUserProfile, 
  updateFinancialProfile, 
  getDashboard 
} = require('../controllers/userController');

const router = express.Router();

// Get user profile
router.get('/profile', auth, getUserProfile);

// Update user profile
router.put('/profile', auth, updateUserProfile);

// Update financial profile
router.put('/financial-profile', auth, updateFinancialProfile);

// Get dashboard data
router.get('/dashboard', auth, getDashboard);

module.exports = router;
