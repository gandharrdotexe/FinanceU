const express = require('express');
const auth = require('../middleware/auth');
const { 
  getUserGoals, 
  createGoal, 
  updateGoal, 
  addMilestone, 
  deleteGoal 
} = require('../controllers/goalController');

const router = express.Router();

// Get user goals
router.get('/', auth, getUserGoals);

// Create new goal
router.post('/', auth, createGoal);

// Update goal
router.put('/:id', auth, updateGoal);

// Add milestone to goal
router.post('/:id/milestone', auth, addMilestone);

// Delete goal
router.delete('/:id', auth, deleteGoal);

module.exports = router;
