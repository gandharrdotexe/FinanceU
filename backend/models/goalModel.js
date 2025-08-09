const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['laptop', 'trip', 'emergency-fund', 'car', 'house', 'education', 'business', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  milestones: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      required: true
    },
    note: {
      type: String,
      trim: true
    },
    achieved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
goalSchema.index({ userId: 1 });
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ category: 1 });
goalSchema.index({ deadline: 1 });

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
});

// Virtual for amount remaining
goalSchema.virtual('amountRemaining').get(function() {
  return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Virtual for monthly savings needed
goalSchema.virtual('monthlySavingsNeeded').get(function() {
  const daysRemaining = this.daysRemaining;
  if (daysRemaining <= 0) return 0;
  const monthsRemaining = daysRemaining / 30.44; // Average days per month
  return this.amountRemaining / monthsRemaining;
});

// Ensure virtuals are included when converting to JSON
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal; 