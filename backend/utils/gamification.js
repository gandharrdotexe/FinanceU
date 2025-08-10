const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1; // 100 XP per level
};

const calculateXPForAction = (action) => {
  const xpMap = {
    'complete_module': 50,
    'perfect_quiz': 25,
    'daily_login': 5,
    'first_budget': 30,
    'achieve_goal': 100,
    'share_achievement': 10
  };
  return xpMap[action] || 0;
};

// Backward-compatible, action-based quick checks (kept in case some callers rely on it)
const checkBadgeEligibility = async (user, action) => {
  const badges = [];
  if (action === 'complete_module') {
    const completedCount = user.progress.modulesCompleted.length;
    if (completedCount === 1) badges.push('First Steps');
  }
  if (action === 'create_budget') {
    // Will be covered by general evaluator, but keep a minimal hint badge if needed
  }
  if (action === 'daily_login' && (user.gamification.streak || 0) >= 7) {
    // Will be covered by general evaluator
  }
  return badges;
};

// Centralized badge evaluator/awarder using Badge.criteria
const User = require('../models/userModel');
const Badge = require('../models/badgeModel');
const UserBadge = require('../models/userBadgeModel');
const Module = require('../models/moduleModel');
const Progress = require('../models/progressModel');
const Budget = require('../models/budgetModel');
const Goal = require('../models/goalModel');
const { calculateBudgetHealth } = require('./calculations');

const areMonthsConsecutive = (prevYYYYMM, nextYYYYMM) => {
  const [py, pm] = prevYYYYMM.split('-').map((v) => parseInt(v, 10));
  const [ny, nm] = nextYYYYMM.split('-').map((v) => parseInt(v, 10));
  const prevTotal = py * 12 + (pm - 1);
  const nextTotal = ny * 12 + (nm - 1);
  return nextTotal - prevTotal === 1;
};

const startOfTodayUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const endOfTodayUtc = () => {
  const s = startOfTodayUtc();
  return new Date(s.getTime() + 24 * 60 * 60 * 1000);
};

const evaluateAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const [allBadges, existingUserBadges, totalModules] = await Promise.all([
    Badge.find({ isActive: true }),
    UserBadge.find({ userId: user._id }),
    Module.countDocuments({ isActive: true })
  ]);

  const alreadyEarnedIds = new Set(existingUserBadges.map((ub) => String(ub.badgeId)));
  const alreadyEarnedNames = new Set(user.gamification?.badges || []);

  const completedModuleIds = (user.progress?.modulesCompleted || []).map((id) => String(id));
  const completedModulesCount = completedModuleIds.length;
  const budgetsCreatedCountPromise = Budget.countDocuments({ userId: user._id });
  const perfectQuizzesCountPromise = Progress.countDocuments({ userId: user._id, quizScore: 100 });
  const goalsAchievedCountPromise = Goal.countDocuments({ userId: user._id, status: 'completed' });
  const modulesCompletedTodayPromise = Progress.countDocuments({
    userId: user._id,
    status: 'completed',
    completedAt: { $gte: startOfTodayUtc(), $lt: endOfTodayUtc() }
  });
  const investingCompletedCountPromise = (async () => {
    if (completedModuleIds.length === 0) return 0;
    const investingModules = await Module.find({ _id: { $in: completedModuleIds }, category: 'investing' })
      .select('_id');
    return investingModules.length;
  })();
  const budgetsPromise = Budget.find({ userId: user._id }).sort({ month: 1 });

  const [
    budgetsCreatedCount,
    perfectQuizzesCount,
    goalsAchievedCount,
    modulesCompletedToday,
    investingCompletedCount,
    budgets
  ] = await Promise.all([
    budgetsCreatedCountPromise,
    perfectQuizzesCountPromise,
    goalsAchievedCountPromise,
    modulesCompletedTodayPromise,
    investingCompletedCountPromise,
    budgetsPromise
  ]);

  // Compute current consecutive positive savings months ending with most recent budget
  let consecutiveSavingsMonths = 0;
  if (budgets.length > 0) {
    // Filter to only months in ascending order and compute savings positivity
    const byMonth = budgets.map((b) => ({
      month: b.month, // 'YYYY-MM'
      positive: (() => {
        const health = calculateBudgetHealth(b.income || [], b.expenses || []);
        return health.savings > 0;
      })()
    }));
    // Walk from the end backwards as long as months are consecutive and positive
    for (let i = byMonth.length - 1; i >= 0; i -= 1) {
      const item = byMonth[i];
      if (!item.positive) break;
      if (consecutiveSavingsMonths === 0) {
        consecutiveSavingsMonths = 1;
      } else {
        const prev = byMonth[i];
        const next = byMonth[i + 1];
        if (next && areMonthsConsecutive(prev.month, next.month)) {
          consecutiveSavingsMonths += 1;
        } else if (!next) {
          // Last item was the latest month, continue
        } else {
          break;
        }
      }
    }
  }

  const loginStreak = user.gamification?.streak || 0;
  const allModulesCompleted = totalModules > 0 && completedModulesCount === totalModules;

  const newlyAwarded = [];

  for (const badge of allBadges) {
    if (alreadyEarnedIds.has(String(badge._id)) || alreadyEarnedNames.has(badge.name)) continue;

    const c = badge.criteria || {};
    let meets = true;
    let recognizedCount = 0;

    if (Object.prototype.hasOwnProperty.call(c, 'modulesCompleted')) {
      meets = meets && completedModulesCount >= Number(c.modulesCompleted);
      recognizedCount += 1;
    }
    if (Object.prototype.hasOwnProperty.call(c, 'budgetsCreated')) {
      meets = meets && budgetsCreatedCount >= Number(c.budgetsCreated);
      recognizedCount += 1;
    }
    if (Object.prototype.hasOwnProperty.call(c, 'loginStreak')) {
      meets = meets && loginStreak >= Number(c.loginStreak);
      recognizedCount += 1;
    }
    if (Object.prototype.hasOwnProperty.call(c, 'perfectQuizzes')) {
      meets = meets && perfectQuizzesCount >= Number(c.perfectQuizzes);
      recognizedCount += 1;
    }
    if (Object.prototype.hasOwnProperty.call(c, 'goalsAchieved')) {
      meets = meets && goalsAchievedCount >= Number(c.goalsAchieved);
      recognizedCount += 1;
    }
    if (Object.prototype.hasOwnProperty.call(c, 'modulesInOneDay')) {
      meets = meets && modulesCompletedToday >= Number(c.modulesInOneDay);
      recognizedCount += 1;
    }
    if (Object.prototype.hasOwnProperty.call(c, 'investmentModulesCompleted')) {
      meets = meets && investingCompletedCount >= Number(c.investmentModulesCompleted);
      recognizedCount += 1;
    }
    if (Object.prototype.hasOwnProperty.call(c, 'allModulesCompleted') && c.allModulesCompleted === true) {
      meets = meets && allModulesCompleted;
      recognizedCount += 1;
    }
    if (Object.prototype.hasOwnProperty.call(c, 'consecutiveSavingsMonths')) {
      meets = meets && consecutiveSavingsMonths >= Number(c.consecutiveSavingsMonths);
      recognizedCount += 1;
    }

    // If we didn't recognize any of the provided criteria keys, do NOT award this badge
    if (recognizedCount === 0) continue;
    if (!meets) continue;

    // Award badge
    const userBadge = new UserBadge({
      userId: user._id,
      badgeId: badge._id,
      earnedAt: new Date()
    });
    try {
      await userBadge.save();
    } catch (e) {
      // Unique index might race; skip on duplicate
    }

    // Add XP and record badge on user
    user.gamification = user.gamification || {};
    user.gamification.totalXP = (user.gamification.totalXP || 0) + (badge.xpBonus || 0);
    user.gamification.level = calculateLevel(user.gamification.totalXP);
    user.gamification.badges = Array.isArray(user.gamification.badges) ? user.gamification.badges : [];
    if (!user.gamification.badges.includes(badge.name)) {
      user.gamification.badges.push(badge.name);
    }

    newlyAwarded.push(badge);
  }

  if (newlyAwarded.length > 0) {
    await user.save();
  }

  return newlyAwarded;
};

module.exports = {
  calculateLevel,
  calculateXPForAction,
  checkBadgeEligibility,
  evaluateAndAwardBadges
};