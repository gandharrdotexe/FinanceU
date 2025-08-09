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
  
  const checkBadgeEligibility = async (user, action) => {
    const badges = [];
    
    // Module completion badges
    if (action === 'complete_module') {
      const completedCount = user.progress.modulesCompleted.length;
      // Seeded badge name for first module completion
      if (completedCount === 1) badges.push('First Steps');
      if (completedCount === 5) badges.push('learning_streak');
      if (completedCount === 10) badges.push('knowledge_master');
    }
    
    // Budget badges
    if (action === 'create_budget') {
      badges.push('budget_beginner');
    }
    
    // Streak badges
    if (action === 'daily_login' && user.gamification.streak >= 7) {
      badges.push('week_warrior');
    }
    
    return badges;
  };

  module.exports = {
    calculateLevel, calculateXPForAction, checkBadgeEligibility
  };