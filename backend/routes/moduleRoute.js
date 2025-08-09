const express = require('express');
const auth = require('../middleware/auth');
const { 
  getAllModules, 
  getModule, 
  startModule, 
  completeModule, 
  submitQuiz 
} = require('../controllers/moduleController');

const router = express.Router();

// Get all modules
router.get('/', auth, getAllModules);

// Get specific module
router.get('/:id', auth, getModule);

// Start a module
router.post('/:id/start', auth, startModule);

// Mark module as completed
router.post('/:id/complete', auth, completeModule);

// Submit quiz
router.post('/:id/quiz', auth, submitQuiz);

module.exports = router;
