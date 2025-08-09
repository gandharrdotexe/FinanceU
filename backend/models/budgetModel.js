const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/ // YYYY-MM format
  },
  income: [{
    source: {
      type: String,
      required: true,
      enum: ['allowance', 'part-time', 'scholarship', 'freelance', 'other']
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    frequency: {
      type: String,
      required: true,
      enum: ['monthly', 'weekly', 'one-time']
    }
  }],
  expenses: [{
    category: {
      type: String,
      required: true,
      enum: ['food', 'books', 'entertainment', 'transport', 'housing', 'utilities', 'healthcare', 'clothing', 'other']
    },
    budgeted: {
      type: Number,
      required: true,
      min: 0
    },
    actual: {
      type: Number,
      default: 0,
      min: 0
    },
    transactions: [{
      description: {
        type: String,
        required: true,
        trim: true
      },
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        required: true,
        default: Date.now
      }
    }]
  }],
  goals: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    deadline: {
      type: Date,
      required: true
    },
    priority: {
      type: String,
      required: true,
      enum: ['high', 'medium', 'low']
    }
  }]
}, {
  timestamps: true
});

// Compound index to ensure one budget per user per month
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

// Indexes for efficient queries
budgetSchema.index({ userId: 1 });
budgetSchema.index({ month: 1 });

// Virtual for total income
budgetSchema.virtual('totalIncome').get(function() {
  return this.income.reduce((total, item) => {
    if (item.frequency === 'monthly') {
      return total + item.amount;
    } else if (item.frequency === 'weekly') {
      return total + (item.amount * 4); // Approximate monthly
    } else {
      return total + item.amount;
    }
  }, 0);
});

// Virtual for total budgeted expenses
budgetSchema.virtual('totalBudgeted').get(function() {
  return this.expenses.reduce((total, expense) => total + expense.budgeted, 0);
});

// Virtual for total actual expenses
budgetSchema.virtual('totalActual').get(function() {
  return this.expenses.reduce((total, expense) => total + expense.actual, 0);
});

// Virtual for remaining budget
budgetSchema.virtual('remainingBudget').get(function() {
  return this.totalIncome - this.totalActual;
});

// Ensure virtuals are included when converting to JSON
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget; 