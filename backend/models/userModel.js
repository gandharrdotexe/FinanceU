const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    name: String,
    college: String,
    year: Number,
    avatar: String
  },
  gamification: {
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [String],
    streak: { type: Number, default: 0 },
    lastActiveDate: Date
  },
  progress: {
    modulesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    currentModule: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    overallProgress: { type: Number, default: 0 }
  },
  financialProfile: {
    monthlyIncome: Number,
    monthlyExpenses: Number,
    financialGoals: [String],
    riskTolerance: String // low, medium, high
  },
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);