const Question = require('../models/questionModel');
const { generateAnonymousUsername } = require('../utils/usernameGenerator');

const questionController = {
  // Create a new question
  async createQuestion(req, res) {
    try {
      const { title, content, tags } = req.body;

      if (!title || !content) {
        return res.status(400).json({ 
          error: 'Title and content are required' 
        });
      }

      // Generate anonymous username
      const anonymousUsername = generateAnonymousUsername();

      const question = new Question({
        title: title.trim(),
        content: content.trim(),
        tags: tags ? tags.map(tag => tag.trim().toLowerCase()) : [],
        anonymousUsername
      });

      const savedQuestion = await question.save();

      res.status(201).json({
        message: 'Question posted successfully',
        question: savedQuestion
      });
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all questions with pagination
  async getQuestions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const search = req.query.search;
      const tags = req.query.tags ? req.query.tags.split(',') : [];

      let query = {};

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      // Tag filter
      if (tags.length > 0) {
        query.tags = { $in: tags };
      }

      const questions = await Question.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const totalQuestions = await Question.countDocuments(query);
      const totalPages = Math.ceil(totalQuestions / limit);

      res.json({
        questions,
        pagination: {
          currentPage: page,
          totalPages,
          totalQuestions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a single question by ID
  async getQuestionById(req, res) {
    try {
      const { id } = req.params;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      // Increment views
      const question = await Question.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      ).select('-__v');

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json({ question });
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Search questions
  async searchQuestions(req, res) {
    try {
      const { q, tags, page = 1, limit = 10 } = req.query;

      if (!q && (!tags || tags.length === 0)) {
        return res.status(400).json({ error: 'Search query or tags required' });
      }

      let query = {};

      if (q) {
        query.$text = { $search: q };
      }

      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
        query.tags = { $in: tagArray };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const questions = await Question.find(query)
        .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');

      const totalResults = await Question.countDocuments(query);

      res.json({
        questions,
        totalResults,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / parseInt(limit))
      });
    } catch (error) {
      console.error('Error searching questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Vote on a question
  async voteQuestion(req, res) {
    try {
      const { id } = req.params;
      const { voteType } = req.body;
      const userId = req.user?.id; // From auth middleware

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({ error: 'Invalid vote type' });
      }

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      // If user is logged in, check if they already voted
      if (userId) {
        const hasUpvoted = question.upvotedBy.includes(userId);
        const hasDownvoted = question.downvotedBy.includes(userId);

        if (voteType === 'upvote') {
          if (hasUpvoted) {
            // Remove upvote
            question.upvotedBy.pull(userId);
            question.upvotes = Math.max(0, question.upvotes - 1);
          } else {
            // Add upvote, remove downvote if exists
            if (hasDownvoted) {
              question.downvotedBy.pull(userId);
              question.downvotes = Math.max(0, question.downvotes - 1);
            }
            question.upvotedBy.push(userId);
            question.upvotes += 1;
          }
        } else if (voteType === 'downvote') {
          if (hasDownvoted) {
            // Remove downvote
            question.downvotedBy.pull(userId);
            question.downvotes = Math.max(0, question.downvotes - 1);
          } else {
            // Add downvote, remove upvote if exists
            if (hasUpvoted) {
              question.upvotedBy.pull(userId);
              question.upvotes = Math.max(0, question.upvotes - 1);
            }
            question.downvotedBy.push(userId);
            question.downvotes += 1;
          }
        }
      } else {
        // Anonymous voting (simpler logic)
        if (voteType === 'upvote') {
          question.upvotes += 1;
        } else {
          question.downvotes += 1;
        }
      }

      // Calculate vote count
      question.voteCount = question.upvotes - question.downvotes;
      await question.save();

      res.json({
        message: 'Vote recorded successfully',
        voteCount: question.voteCount,
        upvotes: question.upvotes,
        downvotes: question.downvotes,
        upvotedBy: question.upvotedBy,
        downvotedBy: question.downvotedBy
      });
    } catch (error) {
      console.error('Error voting on question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get popular tags
  async getPopularTags(req, res) {
    try {
      const tags = await Question.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      res.json(tags);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Mark question as resolved
  async markQuestionResolved(req, res) {
    try {
      const { id } = req.params;
      const { answerId } = req.body;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid question ID' });
      }

      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      // Mark the question as resolved
      question.isResolved = true;
      question.acceptedAnswer = answerId;
      await question.save();

      res.json({
        message: 'Question marked as resolved',
        question
      });
    } catch (error) {
      console.error('Error marking question as resolved:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = questionController;