const User = require('../models/userModel');
const { calculateLevel } = require('../utils/gamification');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('progress.modulesCompleted')
      .populate('progress.currentModule')
      .select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, college, year, avatar } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.profile.name = name;
    if (college) user.profile.college = college;
    if (year) user.profile.year = year;
    if (avatar) user.profile.avatar = avatar;
    
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Update financial profile
const updateFinancialProfile = async (req, res) => {
  try {
    const { monthlyIncome, monthlyExpenses, financialGoals, riskTolerance } = req.body;
    
    const user = await User.findById(req.user._id);
    
    user.financialProfile = {
      monthlyIncome,
      monthlyExpenses,
      financialGoals,
      riskTolerance
    };
    
    await user.save();

    res.json({
      success: true,
      message: 'Financial profile updated successfully',
      financialProfile: user.financialProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update financial profile',
      error: error.message
    });
  }
};

// Get user dashboard data
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('progress.modulesCompleted')
      .populate('progress.currentModule');

    const Module = require('../models/moduleModel');
    const Budget = require('../models/budgetModel');
    const Goal = require('../models/goalModel');

    // Get total modules for progress calculation
    const totalModules = await Module.countDocuments({ isActive: true });
    
    // Get current month budget
    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentBudget = await Budget.findOne({
      userId: req.user._id,
      month: currentMonth
    });

    // Get active goals
    const activeGoals = await Goal.find({
      userId: req.user._id,
      status: 'active'
    }).limit(3);

    const dashboardData = {
      user: {
        name: user.profile.name,
        level: user.gamification.level,
        totalXP: user.gamification.totalXP,
        streak: user.gamification.streak,
        xpToNextLevel: ((user.gamification.level) * 100) - user.gamification.totalXP
      },
      progress: {
        modulesCompleted: user.progress.modulesCompleted.length,
        totalModules,
        overallProgress: user.progress.overallProgress,
        currentModule: user.progress.currentModule
      },
      badges: user.gamification.badges,
      budget: currentBudget ? {
        totalIncome: currentBudget.totalIncome,
        totalActual: currentBudget.totalActual,
        remainingBudget: currentBudget.remainingBudget
      } : null,
      goals: activeGoals.map(goal => ({
        title: goal.title,
        progressPercentage: goal.progressPercentage,
        daysRemaining: goal.daysRemaining
      }))
    };

    res.json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateFinancialProfile,
  getDashboard
};
