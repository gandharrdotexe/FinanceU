const User = require('../models/userModel');
const Badge = require('../models/badgeModel');
const UserBadge = require('../models/userBadgeModel');
const Module = require('../models/moduleModel');
const { checkBadgeEligibility, calculateXPForAction, evaluateAndAwardBadges } = require('../utils/gamification');

// Get user progress and stats
const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('progress.modulesCompleted');

    const totalModules = await Module.countDocuments({ isActive: true });
    const completedModules = user.progress.modulesCompleted.length;

    const progressData = {
      totalXP: user.gamification.totalXP,
      level: user.gamification.level,
      streak: user.gamification.streak,
      badges: user.gamification.badges,
      modulesCompleted: completedModules,
      totalModules,
      overallProgress: user.progress.overallProgress,
      xpToNextLevel: ((user.gamification.level) * 100) - user.gamification.totalXP
    };

    res.json({
      success: true,
      progress: progressData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress',
      error: error.message
    });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'xp', limit = 10 } = req.query;
    
    let sortField;
    switch (type) {
      case 'xp':
        sortField = { 'gamification.totalXP': -1 };
        break;
      case 'modules':
        sortField = { 'progress.overallProgress': -1 };
        break;
      case 'streak':
        sortField = { 'gamification.streak': -1 };
        break;
      default:
        sortField = { 'gamification.totalXP': -1 };
    }

    const leaderboard = await User.find({})
      .select('username profile.name gamification.totalXP gamification.level gamification.streak progress.overallProgress')
      .sort(sortField)
      .limit(parseInt(limit));

    // Find current user's rank
    const userRank = await User.countDocuments({
      'gamification.totalXP': { $gt: req.user.gamification.totalXP }
    }) + 1;

    res.json({
      success: true,
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        name: user.profile.name,
        totalXP: user.gamification.totalXP,
        level: user.gamification.level,
        streak: user.gamification.streak,
        progress: user.progress.overallProgress
      })),
      userRank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
};

// Get user achievements/badges
const getUserAchievements = async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ userId: req.user._id })
      .populate('badgeId')
      .sort({ earnedAt: -1 });

    const allBadges = await Badge.find({ isActive: true });

    const achievements = {
      earned: userBadges.map(ub => ({
        ...ub.badgeId.toObject(),
        earnedAt: ub.earnedAt,
        progress: ub.progress
      })),
      available: allBadges.filter(badge => 
        !userBadges.some(ub => ub.badgeId._id.toString() === badge._id.toString())
      )
    };

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements',
      error: error.message
    });
  }
};

// Check and award badges
const checkBadges = async (req, res) => {
  try {
    const { action } = req.body;
    
    const user = await User.findById(req.user._id);

    // First, run the centralized evaluator
    const autoAwarded = await evaluateAndAwardBadges(user._id);

    // Then, include any quick action-based badges for backward compatibility
    const eligibleByAction = await checkBadgeEligibility(user, action);
    const additionallyAwarded = [];
    for (const badgeName of eligibleByAction) {
      const badge = await Badge.findOne({ name: badgeName });
      if (!badge) continue;
      const exists = await UserBadge.findOne({ userId: user._id, badgeId: badge._id });
      if (exists) continue;
      const ub = new UserBadge({ userId: user._id, badgeId: badge._id, earnedAt: new Date() });
      try { await ub.save(); } catch (_) {}
      user.gamification.totalXP += badge.xpBonus;
      user.gamification.level = calculateXPForAction ? user.gamification.level : user.gamification.level; // no-op
      if (!user.gamification.badges.includes(badge.name)) {
        user.gamification.badges.push(badge.name);
      }
      additionallyAwarded.push(badge);
    }
    if (additionallyAwarded.length > 0) {
      await user.save();
    }

    const newBadges = [...autoAwarded, ...additionallyAwarded];

    res.json({
      success: true,
      newBadges,
      totalXP: user.gamification.totalXP
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check badges',
      error: error.message
    });
  }
};

module.exports = {
  getUserProgress,
  getLeaderboard,
  getUserAchievements,
  checkBadges
};
