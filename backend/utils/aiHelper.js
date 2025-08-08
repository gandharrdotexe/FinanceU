const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateFinancialAdvice = async (userContext, question) => {
  const prompt = `
    You are a friendly financial advisor for college students in India. 
    
    Student Context:
    - Monthly Income: ₹${userContext.monthlyIncome || 'Not specified'}
    - Monthly Expenses: ₹${userContext.monthlyExpenses || 'Not specified'}
    - Financial Goals: ${userContext.financialGoals?.join(', ') || 'None specified'}
    - Risk Tolerance: ${userContext.riskTolerance || 'Not specified'}
    
    Question: ${question}
    
    Please provide practical, actionable advice in simple language. Keep it under 150 words.
    Focus on Indian financial products and student-specific scenarios like:
    - SIP investments, PPF, ELSS
    - Student bank accounts and credit cards
    - UPI and digital payments
    - Emergency fund building for students
    
    Be encouraging and use simple examples they can relate to.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm having trouble connecting right now. Please try asking your question again in a moment.";
  }
};

// Advanced Gemini functions for financial analysis
const analyzeBudgetWithAI = async (budgetData) => {
  const prompt = `
    Analyze this student's budget and provide 3 key insights and suggestions:
    
    Income: ₹${budgetData.totalIncome}
    Expenses: ${JSON.stringify(budgetData.expenses)}
    Savings Rate: ${budgetData.savingsRate}%
    
    Provide specific, actionable advice for improving their financial health.
    Focus on student-friendly suggestions.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Unable to analyze budget at the moment. Please try again later.";
  }
};

const generatePersonalizedLearningPath = async (userProfile, completedModules) => {
  const prompt = `
    Create a personalized learning path for this student:
    
    Profile: ${JSON.stringify(userProfile)}
    Completed Modules: ${completedModules.length} modules done
    
    Suggest the next 3 most relevant financial literacy topics they should learn.
    Consider their income level, goals, and current knowledge.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Unable to generate learning path. Please try the default sequence.";
  }
};

module.exports ={
    generateFinancialAdvice, generatePersonalizedLearningPath, analyzeBudgetWithAI
  };