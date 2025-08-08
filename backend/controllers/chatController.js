const { generateFinancialAdvice, analyzeBudgetWithAI, generatePersonalizedLearningPath } = require('../utils/aiHelper');
const Chat = require('../models/ChatModel.js');
const User = require('../models/User.js');

// Send message to AI chatbot
const sendMessage = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user._id;

    // Get user's financial context
    const user = await User.findById(userId);
    const userContext = {
      monthlyIncome: user.financialProfile?.monthlyIncome,
      monthlyExpenses: user.financialProfile?.monthlyExpenses,
      financialGoals: user.financialProfile?.financialGoals,
      riskTolerance: user.financialProfile?.riskTolerance
    };

    // Generate AI response
    const aiResponse = await generateFinancialAdvice(userContext, message);

    // Save conversation to database
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({
        userId,
        conversation: [],
        sessionId: `session_${Date.now()}`,
        topic: 'general'
      });
    }

    chat.conversation.push(
      { role: 'user', message, timestamp: new Date() },
      { role: 'assistant', message: aiResponse, timestamp: new Date() }
    );

    await chat.save();

    res.json({
      success: true,
      message: aiResponse,
      conversationId: chat._id
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });
    
    res.json({
      success: true,
      conversation: chat ? chat.conversation : []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: error.message
    });
  }
};

// Analyze user's budget with AI
const analyzeBudget = async (req, res) => {
  try {
    const { budgetData } = req.body;
    
    const analysis = await analyzeBudgetWithAI(budgetData);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze budget',
      error: error.message
    });
  }
};

// Get personalized learning recommendations
const getLearningPath = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('progress.modulesCompleted');
    
    const recommendations = await generatePersonalizedLearningPath(
      user.financialProfile,
      user.progress.modulesCompleted
    );

    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate learning path',
      error: error.message
    });
  }
};

// Clear chat history
const clearChatHistory = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ userId: req.user._id });
    
    res.json({
      success: true,
      message: 'Chat history cleared'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: error.message
    });
  }
};

// Get quick financial tips
const getQuickTips = async (req, res) => {
  try {
    // These can be pre-generated or cached for better performance during demo
    const quickTips = [
      "💡 Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
      "🎯 Start with small investments - even ₹500/month in SIP makes a difference",
      "📱 Use UPI apps wisely - track every digital payment",
      "🚨 Build an emergency fund equal to 3-6 months of expenses",
      "📚 Take advantage of student discounts on financial products"
    ];

    const randomTip = quickTips[Math.floor(Math.random() * quickTips.length)];
    
    res.json({
      success: true,
      tip: randomTip
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get tip',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  analyzeBudget,
  getLearningPath,
  clearChatHistory,
  getQuickTips
}; 