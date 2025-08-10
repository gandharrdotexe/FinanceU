const Goal = require('../models/goalModel');
const User = require('../models/userModel');
const { calculateXPForAction, calculateLevel } = require('../utils/gamification');
const { evaluateAndAwardBadges } = require('../utils/gamification');

// Get user goals
const getUserGoals = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get goals',
      error: error.message
    });
  }
};

// Create new goal
const createGoal = async (req, res) => {
  try {
    const { title, description, targetAmount, deadline, category } = req.body;

    const goal = new Goal({
      userId: req.user._id,
      title,
      description,
      targetAmount,
      deadline,
      category
    });

    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message
    });
  }
};

// Update goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message
    });
  }
};

// Add milestone to goal
const addMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;

    const goal = await Goal.findOne({ _id: id, userId: req.user._id });
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Add milestone
    goal.milestones.push({
      amount,
      date: new Date(),
      note,
      achieved: true
    });

    // Update current amount
    goal.currentAmount += amount;

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
      
      // Award XP for achieving goal
      const user = await User.findById(req.user._id);
      user.gamification.totalXP += calculateXPForAction('achieve_goal');
      user.gamification.level = calculateLevel(user.gamification.totalXP);
      await user.save();

      // Auto-award any eligible badges tied to goals
      await evaluateAndAwardBadges(user._id);
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Milestone added successfully',
      goal,
      xpEarned: goal.status === 'completed' ? calculateXPForAction('achieve_goal') : 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add milestone',
      error: error.message
    });
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
};

module.exports = {
  getUserGoals,
  createGoal,
  updateGoal,
  addMilestone,
  deleteGoal
};
