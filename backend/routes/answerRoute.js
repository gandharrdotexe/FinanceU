const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const auth = require('../middleware/auth');

// POST /api/answers - Create a new answer
router.post('/', answerController.createAnswer);

// GET /api/answers/question/:questionId - Get answers for a specific question
router.get('/question/:questionId', answerController.getAnswersByQuestion);

// GET /api/answers/stats/:userId - Get user's answer statistics
router.get('/stats/:userId', answerController.getUserAnswerStats);

// POST /api/answers/:id/vote - Vote on an answer
router.post('/:id/vote', auth, answerController.voteAnswer);

// PUT /api/answers/:id/helpful - Mark answer as helpful
router.put('/:id/helpful', auth, answerController.markAnswerHelpful);

// GET /api/answers/:id - Get a specific answer by ID
router.get('/:id', answerController.getAnswerById);

// PUT /api/answers/:id/accept - Mark answer as accepted
router.put('/:id/accept', answerController.acceptAnswer);

module.exports = router;