const express = require('express');
const auth = require('../middleware/auth');
const { 
  getCurrentBudget, 
  createOrUpdateBudget, 
  addExpense, 
  getBudgetAnalytics 
} = require('../controllers/budgetController');

const router = express.Router();

// Get user budget
router.get('/', auth, getCurrentBudget);

// Create/update budget
router.post('/', auth, createOrUpdateBudget);

// Add expense transaction
router.post('/expense', auth, addExpense);

// Get budget analytics
router.get('/analytics', auth, getBudgetAnalytics);

// Get specific month budget
router.get('/:month', auth, async (req, res) => {
  try {
    const { month } = req.params;
    const Budget = require('../models/budgetModel');
    
    const budget = await Budget.findOne({
      userId: req.user._id,
      month
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found for specified month'
      });
    }

    res.json({
      success: true,
      budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get budget',
      error: error.message
    });
  }
});

module.exports = router;
