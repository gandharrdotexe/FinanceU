const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['learning', 'budgeting', 'saving', 'investing', 'streak', 'achievement', 'special', 'social']
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed,
    required: true
    // This can store various conditions like:
    // { modulesCompleted: 5, streakDays: 7, savingsAmount: 1000, etc. }
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'rare', 'epic', 'legendary']
  },
  xpBonus: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
badgeSchema.index({ category: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ isActive: 1 });

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge; 