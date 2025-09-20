const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for anonymous answers
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  anonymousUsername: {
    type: String,
    required: true
  },
  trustBadges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: Date
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  voteCount: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    type: Boolean,
    default: false
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

answerSchema.index({ questionId: 1 });
answerSchema.index({ userId: 1 });
answerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Answer', answerSchema);