// Gemini API endpoint
const GEMINI_API_URL = 'https://assignment-backend-one-khaki.vercel.app/api/gemini/generate';
 
export const EXPERT_OPTIONS = [
  { value: 'research', label: 'Research Assistant' },
  { value: 'real-estate', label: 'Real Estate Expert' },
  { value: 'crypto', label: 'Crypto Expert' },
  { value: 'investment', label: 'Investment Expert' },
  { value: 'stock', label: 'Stock Market Expert' },
  { value: 'retirement-tax', label: 'Retirement & Tax Expert' },
  { value: 'default', label: 'General Assistant' }
];
 
const makeGeminiRequest = async (prompt, context = null, expert) => {
  try {
    const payload = {
      prompt: prompt,
      options: {
        expert: expert
      }
    };
   
    if (context) {
      payload.context = context;
    }
   
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
   
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
   
    return await response.json();
  } catch (error) {
    console.error('Error making Gemini API request:', error);
    throw error;
  }
};
 
export const sendMessageToAI = async (prompt, context = null, expert = 'default') => {
  const data = await makeGeminiRequest(prompt, context, expert);
  return { message: data.content,
    sources: data.sources
   };
};
 
export const getStockAnalysis = async (prompt) => {
  return makeGeminiRequest(
    prompt || 'current stock status of india',
    null,
    'stock'
  );
};
 
// Since we're using Gemini API, we'll implement these as stubs that return empty data
// or use Gemini's capabilities to generate appropriate responses
 
export const getChatHistory = async () => {
  // Return empty history since we're not storing chat history on the server
  return [];
};
 
export const clearChatHistory = async () => {
  // No-op since we're not storing chat history on the server
  return { success: true };
};
 
export const analyzeBudgetWithAI = async (budgetData) => {
  // Use Gemini to analyze budget
  const prompt = `Please analyze this budget data and provide insights: ${JSON.stringify(budgetData)}`;
  const data = await makeGeminiRequest(prompt, null, 'investment');
  return { analysis: data.content };
};
 
export const getLearningPath = async () => {
  // Get a learning path from Gemini
  const prompt = 'Provide a structured learning path for personal finance topics';
  const data = await makeGeminiRequest(prompt, null, 'research');
  return { path: data.content };
};
 
export const getQuickTip = async () => {
  // Get a quick financial tip from Gemini
  const prompt = 'Provide a quick personal finance tip';
  const data = await makeGeminiRequest(prompt, null, 'investment');
  return { tip: data.content };
};