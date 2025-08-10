const Budget = require('../models/budgetModel');
const User = require('../models/userModel');
const { calculateBudgetHealth } = require('../utils/calculations');
const { calculateXPForAction, calculateLevel, evaluateAndAwardBadges } = require('../utils/gamification');

// Get current month budget
const getCurrentBudget = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
    
    let budget = await Budget.findOne({
      userId: req.user._id,
      month: currentMonth
    });

    if (!budget) {
      // Create default budget structure
      budget = new Budget({
        userId: req.user._id,
        month: currentMonth,
        income: [],
        expenses: [],
        goals: []
      });
      await budget.save();
    }

    // Calculate budget health
    const healthData = calculateBudgetHealth(budget.income, budget.expenses);

    res.json({
      success: true,
      budget: {
        ...budget.toObject(),
        health: healthData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get budget',
      error: error.message
    });
  }
};

// Create or update budget
const createOrUpdateBudget = async (req, res) => {
  try {
    const { month, income, expenses, goals } = req.body;
    const budgetMonth = month || new Date().toISOString().substring(0, 7);

    let budget = await Budget.findOne({
      userId: req.user._id,
      month: budgetMonth
    });

    if (budget) {
      // Update existing budget
      if (income) budget.income = income;

      // Merge expenses by category to preserve existing transactions
      if (expenses) {
        const existingExpenses = Array.isArray(budget.expenses) ? budget.expenses : [];
        const mergedExpenses = expenses.map((incomingExpense) => {
          const existing = existingExpenses.find((e) => e.category === incomingExpense.category);
          return {
            category: incomingExpense.category,
            budgeted: incomingExpense.budgeted,
            // Prefer provided actual, otherwise keep existing actual (or 0)
            actual: typeof incomingExpense.actual === 'number' ? incomingExpense.actual : (existing?.actual ?? 0),
            // Always preserve existing transactions unless explicitly provided
            transactions: existing?.transactions || []
          };
        });
        budget.expenses = mergedExpenses;
      }

      if (goals) budget.goals = goals;
    } else {
      // Create new budget
      budget = new Budget({
        userId: req.user._id,
        month: budgetMonth,
        income: income || [],
        expenses: expenses || [],
        goals: goals || []
      });
    }

    await budget.save();

    // Award XP for first budget
    if (budget.isNew) {
      const user = await User.findById(req.user._id);
      user.gamification.totalXP += calculateXPForAction('first_budget');
      user.gamification.level = calculateLevel(user.gamification.totalXP);
      await user.save();
    }

    // Evaluate badges after any budget change (new or update)
    await evaluateAndAwardBadges(req.user._id);

    // Calculate budget health
    const healthData = calculateBudgetHealth(budget.income, budget.expenses);

    res.json({
      success: true,
      message: budget.isNew ? 'Budget created successfully' : 'Budget updated successfully',
      budget: {
        ...budget.toObject(),
        health: healthData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save budget',
      error: error.message
    });
  }
};

// Add expense transaction
const addExpense = async (req, res) => {
  try {
    const { category, description, amount } = req.body;
    const currentMonth = new Date().toISOString().substring(0, 7);

    const budget = await Budget.findOne({
      userId: req.user._id,
      month: currentMonth
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No budget found for current month'
      });
    }

    // Find the expense category
    const expenseCategory = budget.expenses.find(exp => exp.category === category);
    
    if (!expenseCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense category'
      });
    }

    // Add transaction
    expenseCategory.transactions.push({
      description,
      amount,
      date: new Date()
    });

    // Update actual amount
    expenseCategory.actual += amount;

    await budget.save();

    res.json({
      success: true,
      message: 'Expense added successfully',
      budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add expense',
      error: error.message
    });
  }
};

// Get budget analytics
const getBudgetAnalytics = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    // Get last N months of budgets
    const budgets = await Budget.find({
      userId: req.user._id
    }).sort({ month: -1 }).limit(parseInt(months));

    const analytics = budgets.map(budget => {
      const health = calculateBudgetHealth(budget.income, budget.expenses);
      return {
        month: budget.month,
        totalIncome: health.totalIncome,
        totalExpenses: health.totalExpenses,
        savings: health.savings,
        savingsRate: health.savingsRate,
        healthScore: health.healthScore
      };
    });

    // Calculate trends
    const trends = {
      avgSavingsRate: analytics.reduce((sum, a) => sum + a.savingsRate, 0) / analytics.length,
      improvingTrend: analytics.length > 1 ? 
        analytics[0].savingsRate > analytics[analytics.length - 1].savingsRate : false
    };

    res.json({
      success: true,
      analytics,
      trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get budget analytics',
      error: error.message
    });
  }
};

module.exports = {
  getCurrentBudget,
  createOrUpdateBudget,
  addExpense,
  getBudgetAnalytics
};
