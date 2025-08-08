// test/gemini-test.js - Quick test for Gemini integration
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const testGeminiConnection = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Give me one financial tip for college students in India.";
    
    console.log('Testing Gemini API connection...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('✅ Gemini API working!');
    console.log('Response:', response.text());
    
    return true;
  } catch (error) {
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.error('❌ Gemini API quota exceeded. This is normal for free tier.');
      console.error('💡 Solutions:');
      console.error('   1. Wait a few minutes and try again');
      console.error('   2. Upgrade to a paid plan');
      console.error('   3. Use a different API key');
      console.error('   4. Check your usage at: https://aistudio.google.com/app/apikey');
    } else {
      console.error('❌ Gemini API test failed:', error.message);
    }
    return false;
  }
};

// Run test if called directly
if (require.main === module) {
  testGeminiConnection();
}

module.exports = { testGeminiConnection };

// To run this test:
// node test/gemini-test.js 