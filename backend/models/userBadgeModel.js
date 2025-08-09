const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  progress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    // For progressive badges, store current progress
    // Example: { currentValue: 5, targetValue: 10 }
  }
}, {
  timestamps: true
});

// Compound index to ensure one user badge record per user per badge
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Indexes for efficient queries
userBadgeSchema.index({ userId: 1 });
userBadgeSchema.index({ badgeId: 1 });
userBadgeSchema.index({ earnedAt: -1 });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = UserBadge; 