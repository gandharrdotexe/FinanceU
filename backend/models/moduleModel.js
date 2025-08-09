const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['budgeting', 'investing', 'saving', 'debt', 'taxes', 'insurance', 'retirement']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 1
  },
  xpReward: {
    type: Number,
    required: true,
    min: 0
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  content: {
    sections: [{
      type: {
        type: String,
        required: true,
        enum: ['text', 'video', 'interactive', 'quiz']
      },
      title: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      interactiveData: {
        type: mongoose.Schema.Types.Mixed
      }
    }],
    quiz: [{
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String,
        required: true
      }],
      correctAnswer: {
        type: Number,
        required: true,
        min: 0
      },
      explanation: {
        type: String,
        required: true
      }
    }]
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
moduleSchema.index({ category: 1, difficulty: 1 });
moduleSchema.index({ order: 1 });
moduleSchema.index({ isActive: 1 });

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module; 