const Module = require('../models/moduleModel');
const Progress = require('../models/progressModel');
const User = require('../models/userModel');
const { calculateXPForAction, calculateLevel } = require('../utils/gamification');

// Get all modules with user progress
const getAllModules = async (req, res) => {
  try {
    const modules = await Module.find({ isActive: true }).sort({ order: 1 });
    
    // Get user progress for each module
    const moduleProgress = await Progress.find({ 
      userId: req.user._id 
    });

    const modulesWithProgress = modules.map(module => {
      const progress = moduleProgress.find(p => 
        p.moduleId.toString() === module._id.toString()
      );
      
      return {
        ...module.toObject(),
        userProgress: progress ? {
          status: progress.status,
          timeSpent: progress.timeSpent,
          quizScore: progress.quizScore,
          attempts: progress.attempts,
          bookmarked: progress.bookmarked
        } : {
          status: 'not_started',
          timeSpent: 0,
          quizScore: null,
          attempts: 0,
          bookmarked: false
        }
      };
    });

    res.json({
      success: true,
      modules: modulesWithProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get modules',
      error: error.message
    });
  }
};

// Get specific module
const getModule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get user progress for this module
    const progress = await Progress.findOne({
      userId: req.user._id,
      moduleId: id
    });

    res.json({
      success: true,
      module: {
        ...module.toObject(),
        userProgress: progress || {
          status: 'not_started',
          timeSpent: 0,
          quizScore: null,
          attempts: 0,
          bookmarked: false
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get module',
      error: error.message
    });
  }
};

// Start a module
const startModule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if module exists
    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Create or update progress
    let progress = await Progress.findOne({
      userId: req.user._id,
      moduleId: id
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        moduleId: id,
        status: 'in_progress',
        startedAt: new Date()
      });
    } else {
      progress.status = 'in_progress';
      if (!progress.startedAt) {
        progress.startedAt = new Date();
      }
    }

    await progress.save();

    // Update user's current module
    await User.findByIdAndUpdate(req.user._id, {
      'progress.currentModule': id
    });

    res.json({
      success: true,
      message: 'Module started successfully',
      progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start module',
      error: error.message
    });
  }
};

// Complete a module
const completeModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { quizScore, timeSpent } = req.body;
    
    // Get module for XP reward
    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Update progress
    let progress = await Progress.findOne({
      userId: req.user._id,
      moduleId: id
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        moduleId: id
      });
    }

    progress.status = 'completed';
    progress.completedAt = new Date();
    progress.quizScore = quizScore;
    progress.timeSpent = timeSpent || progress.timeSpent;
    progress.attempts += 1;

    await progress.save();

    // Update user progress and XP
    const user = await User.findById(req.user._id);
    
    // Add to completed modules if not already there
    if (!user.progress.modulesCompleted.includes(id)) {
      user.progress.modulesCompleted.push(id);
      user.gamification.totalXP += module.xpReward;
      
      // Add bonus XP for perfect quiz
      if (quizScore === 100) {
        user.gamification.totalXP += calculateXPForAction('perfect_quiz');
      }
      
      user.gamification.level = calculateLevel(user.gamification.totalXP);
    }

    // Calculate overall progress
    const totalModules = await Module.countDocuments({ isActive: true });
    user.progress.overallProgress = (user.progress.modulesCompleted.length / totalModules) * 100;

    await user.save();

    res.json({
      success: true,
      message: 'Module completed successfully',
      progress,
      xpEarned: module.xpReward + (quizScore === 100 ? 25 : 0),
      newLevel: user.gamification.level
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete module',
      error: error.message
    });
  }
};

// Submit quiz
const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params; // moduleId
    const { answers } = req.body; // array of answer indices
    
    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Calculate score
    const quiz = module.content.quiz;
    let correctAnswers = 0;
    
    const results = quiz.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctAnswers / quiz.length) * 100);

    // Update progress
    await Progress.findOneAndUpdate(
      { userId: req.user._id, moduleId: id },
      { 
        quizScore: score,
        $inc: { attempts: 1 }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      score,
      correctAnswers,
      totalQuestions: quiz.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

module.exports = {
  getAllModules,
  getModule,
  startModule,
  completeModule,
  submitQuiz
};
