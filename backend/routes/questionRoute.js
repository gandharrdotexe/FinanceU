const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');

// POST /api/questions - Create a new question
router.post('/', questionController.createQuestion);

// GET /api/questions - Get all questions with pagination and filtering
router.get('/', questionController.getQuestions);

// GET /api/questions/search - Search questions
router.get('/search', questionController.searchQuestions);

// GET /api/questions/tags/popular - Get popular tags
router.get('/tags/popular', questionController.getPopularTags);

// POST /api/questions/:id/vote - Vote on a question
router.post('/:id/vote', auth, questionController.voteQuestion);

// PUT /api/questions/:id/resolve - Mark question as resolved
router.put('/:id/resolve', questionController.markQuestionResolved);

// GET /api/questions/:id - Get a specific question by ID
router.get('/:id', questionController.getQuestionById);

module.exports = router;