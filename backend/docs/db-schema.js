// User Schema
const userSchema = {
    _id: ObjectId,
    email: String,
    username: String,
    password: String, // hashed
    profile: {
      name: String,
      college: String,
      year: Number,
      avatar: String
    },
    financialProfile: {
      monthlyIncome: Number,
      monthlyExpenses: Number,
      financialGoals: [String],
      riskTolerance: String // low, medium, high
    },
    gamification: {
      totalXP: Number,
      level: Number,
      badges: [String],
      streak: Number,
      lastActiveDate: Date
    },
    progress: {
      modulesCompleted: [ObjectId],
      currentModule: ObjectId,
      overallProgress: Number
    },
    createdAt: Date,
    updatedAt: Date
  };
  
  // Learning Module Schema
  const moduleSchema = {
    _id: ObjectId,
    title: String,
    description: String,
    category: String, // budgeting, investing, saving, etc.
    difficulty: String, // beginner, intermediate, advanced
    estimatedTime: Number, // in minutes
    xpReward: Number,
    order: Number,
    content: {
      sections: [{
        type: String, // text, video, interactive, quiz
        title: String,
        content: String, // HTML content or component reference
        interactiveData: Object // for calculators, simulations
      }],
      quiz: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
      }]
    },
    prerequisites: [ObjectId], // other modules needed first
    isActive: Boolean,
    createdAt: Date
  };
  
  // User Progress Schema
  const progressSchema = {
    _id: ObjectId,
    userId: ObjectId,
    moduleId: ObjectId,
    status: String, // not_started, in_progress, completed
    startedAt: Date,
    completedAt: Date,
    timeSpent: Number, // in minutes
    quizScore: Number,
    attempts: Number,
    bookmarked: Boolean
  };
  
  // Budget Schema
  const budgetSchema = {
    _id: ObjectId,
    userId: ObjectId,
    month: String, // YYYY-MM format
    income: [{
      source: String, // allowance, part-time, scholarship
      amount: Number,
      frequency: String // monthly, weekly, one-time
    }],
    expenses: [{
      category: String, // food, books, entertainment, transport
      budgeted: Number,
      actual: Number,
      transactions: [{
        description: String,
        amount: Number,
        date: Date
      }]
    }],
    goals: [{
      name: String,
      targetAmount: Number,
      savedAmount: Number,
      deadline: Date,
      priority: String // high, medium, low
    }],
    createdAt: Date,
    updatedAt: Date
  };
  
  // Achievement/Badge Schema
  const badgeSchema = {
    _id: ObjectId,
    name: String,
    description: String,
    icon: String,
    category: String,
    criteria: Object, // conditions to earn badge
    rarity: String, // common, rare, epic, legendary
    xpBonus: Number
  };
  
  // User Badge Schema (earned badges)
  const userBadgeSchema = {
    _id: ObjectId,
    userId: ObjectId,
    badgeId: ObjectId,
    earnedAt: Date,
    progress: Object // for progressive badges
  };
  
  // Financial Goal Schema
  const goalSchema = {
    _id: ObjectId,
    userId: ObjectId,
    title: String,
    description: String,
    targetAmount: Number,
    currentAmount: Number,
    deadline: Date,
    category: String, // laptop, trip, emergency-fund
    status: String, // active, completed, paused
    milestones: [{
      amount: Number,
      date: Date,
      note: String
    }],
    createdAt: Date,
    updatedAt: Date
  };
  
  // Chat/AI Interaction Schema
  const chatSchema = {
    _id: ObjectId,
    userId: ObjectId,
    conversation: [{
      role: String, // user, assistant
      message: String,
      timestamp: Date,
      context: Object // user's financial data context
    }],
    sessionId: String,
    topic: String, // budgeting, investing, etc.
    createdAt: Date
  };