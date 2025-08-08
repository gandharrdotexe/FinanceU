// routes/chat.js - AI Chat routes with Gemini
const express = require('express');
const auth = require('../middleware/auth');
const { 
  sendMessage, 
  getChatHistory, 
  analyzeBudget, 
  getLearningPath, 
  clearChatHistory, 
  getQuickTips 
} = require('../controllers/chatController');

const router = express.Router();

// Send message to AI chatbot
router.post('/message', auth, sendMessage);

// Get chat history
router.get('/history', auth, getChatHistory);

// Analyze user's budget with AI
router.post('/analyze-budget', auth, analyzeBudget);

// Get personalized learning recommendations
router.get('/learning-path', auth, getLearningPath);

// Clear chat history
router.delete('/history', auth, clearChatHistory);

// Get quick financial tips
router.get('/quick-tips', auth, getQuickTips);

module.exports = router;