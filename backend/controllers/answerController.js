const Answer = require('../models/answerModel');
const Question = require('../models/questionModel');
const User = require('../models/userModel');
const { generateAnonymousUsername } = require('../utils/usernameGenerator');
const { awardAnswerBadges } = require('../utils/gamification');

const answerController = {
  // Create a new answer
  async createAnswer(req, res) {
    try {
      const { questionId, content, userId } = req.body;

      if (!questionId || !content) {
        return res.status(400).json({ 
          error: 'Question ID and content are required' 
        });
      }

      // Verify question exists
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      // Generate anonymous username
      const anonymousUsername = generateAnonymousUsername();

      // Get user's trust badges if userId is provided
      let trustBadges = [];
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          trustBadges = user.trustBadges;
        }
      }

      const answer = new Answer({
        questionId,
        userId: userId || null, // Include userId if provided
        content: content.trim(),
        anonymousUsername,
        trustBadges
      });

      const savedAnswer = await answer.save();

      // Update question's answer count
      await Question.findByIdAndUpdate(
        questionId,
        { $inc: { answerCount: 1 } }
      );

      // Award badges and XP if userId is provided
      let gamificationResult = null;
      if (userId) {
        try {
          gamificationResult = await awardAnswerBadges(userId, 'answer_question');
        } catch (error) {
          console.error('Error awarding badges:', error);
          // Don't fail the answer creation if badge awarding fails
        }
      }

      res.status(201).json({
        message: 'Answer posted successfully',
        answer: savedAnswer,
        gamification: gamificationResult
      });
    } catch (error) {
      console.error('Error creating answer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get answers for a specific question
  async getAnswersByQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

      if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      const skip = (page - 1) * limit;

      // Ensure accepted answers appear first
      const sortCriteria = {};
      if (sortBy === 'accepted') {
        sortCriteria.isAccepted = -1;
        sortCriteria.upvotes = -1;
        sortCriteria.createdAt = -1;
      } else {
        sortCriteria[sortBy] = sortOrder;
      }

      const answers = await Answer.find({ questionId })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const totalAnswers = await Answer.countDocuments({ questionId });
      const totalPages = Math.ceil(totalAnswers / limit);

      res.json({
        answers,
        pagination: {
          currentPage: page,
          totalPages,
          totalAnswers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching answers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a single answer by ID
  async getAnswerById(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid answer ID' });
      }

      const answer = await Answer.findById(id)
        .populate('questionId', 'title')
        .select('-__v');

      if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
      }

      res.json({ answer });
    } catch (error) {
      console.error('Error fetching answer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user's answer statistics
  async getUserAnswerStats(req, res) {
    try {
      const { userId } = req.params;

      if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const [
        totalAnswers,
        acceptedAnswers,
        helpfulAnswers,
        answersToday
      ] = await Promise.all([
        Answer.countDocuments({ userId }),
        Answer.countDocuments({ userId, isAccepted: true }),
        Answer.countDocuments({ userId, upvotes: { $gte: 5 } }),
        Answer.countDocuments({
          userId,
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        })
      ]);

      res.json({
        totalAnswers,
        acceptedAnswers,
        helpfulAnswers,
        answersToday,
        acceptanceRate: totalAnswers > 0 ? (acceptedAnswers / totalAnswers * 100).toFixed(1) : 0,
        helpfulRate: totalAnswers > 0 ? (helpfulAnswers / totalAnswers * 100).toFixed(1) : 0
      });
    } catch (error) {
      console.error('Error fetching user answer stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mark answer as accepted
  async acceptAnswer(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid answer ID' });
      }

      const answer = await Answer.findById(id);
      if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
      }

      // Unmark any previously accepted answer for this question
      await Answer.updateMany(
        { questionId: answer.questionId },
        { isAccepted: false }
      );

      // Mark this answer as accepted
      answer.isAccepted = true;
      await answer.save();

      // Award badges for accepted answer if user exists
      let gamificationResult = null;
      if (answer.userId) {
        try {
          gamificationResult = await awardAnswerBadges(answer.userId, 'accepted_answer');
        } catch (error) {
          console.error('Error awarding badges for accepted answer:', error);
          // Don't fail the acceptance if badge awarding fails
        }
      }

      res.json({
        message: 'Answer marked as accepted',
        answer,
        gamification: gamificationResult
      });
    } catch (error) {
      console.error('Error accepting answer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Vote on an answer
  async voteAnswer(req, res) {
    try {
      const { id } = req.params;
      const { voteType } = req.body;
      const userId = req.user?.id; // From auth middleware

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid answer ID' });
      }

      if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({ error: 'Invalid vote type' });
      }

      const answer = await Answer.findById(id);
      if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
      }

      // If user is logged in, check if they already voted
      if (userId) {
        const hasUpvoted = answer.upvotedBy.includes(userId);
        const hasDownvoted = answer.downvotedBy.includes(userId);

        if (voteType === 'upvote') {
          if (hasUpvoted) {
            // Remove upvote
            answer.upvotedBy.pull(userId);
            answer.upvotes = Math.max(0, answer.upvotes - 1);
          } else {
            // Add upvote, remove downvote if exists
            if (hasDownvoted) {
              answer.downvotedBy.pull(userId);
              answer.downvotes = Math.max(0, answer.downvotes - 1);
            }
            answer.upvotedBy.push(userId);
            answer.upvotes += 1;
          }
        } else if (voteType === 'downvote') {
          if (hasDownvoted) {
            // Remove downvote
            answer.downvotedBy.pull(userId);
            answer.downvotes = Math.max(0, answer.downvotes - 1);
          } else {
            // Add downvote, remove upvote if exists
            if (hasUpvoted) {
              answer.upvotedBy.pull(userId);
              answer.upvotes = Math.max(0, answer.upvotes - 1);
            }
            answer.downvotedBy.push(userId);
            answer.downvotes += 1;
          }
        }
      } else {
        // Anonymous voting (simpler logic)
        if (voteType === 'upvote') {
          answer.upvotes += 1;
        } else {
          answer.downvotes += 1;
        }
      }

      // Calculate vote count
      answer.voteCount = answer.upvotes - answer.downvotes;
      await answer.save();

      res.json({
        message: 'Vote recorded successfully',
        voteCount: answer.voteCount,
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
        upvotedBy: answer.upvotedBy,
        downvotedBy: answer.downvotedBy
      });
    } catch (error) {
      console.error('Error voting on answer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mark answer as helpful
  async markAnswerHelpful(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // From auth middleware

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid answer ID' });
      }

      const answer = await Answer.findById(id);
      if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
      }

      if (userId) {
        const isAlreadyHelpful = answer.helpfulBy.includes(userId);
        
        if (isAlreadyHelpful) {
          // Remove helpful mark
          answer.helpfulBy.pull(userId);
          answer.isHelpful = answer.helpfulBy.length > 0;
        } else {
          // Add helpful mark
          answer.helpfulBy.push(userId);
          answer.isHelpful = true;
        }
      } else {
        // Anonymous helpful marking
        answer.isHelpful = !answer.isHelpful;
      }

      await answer.save();

      res.json({
        message: 'Answer helpful status updated',
        isHelpful: answer.isHelpful,
        helpfulBy: answer.helpfulBy
      });
    } catch (error) {
      console.error('Error marking answer as helpful:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = answerController;