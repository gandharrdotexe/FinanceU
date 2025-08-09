const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  quizScore: {
    type: Number,
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  bookmarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user per module
progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

// Indexes for efficient queries
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ moduleId: 1, status: 1 });

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress; 