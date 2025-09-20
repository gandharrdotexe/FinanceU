const mongoose = require('mongoose');
const { awardAnswerBadges } = require('../utils/gamification');
const User = require('../models/userModel');
const Answer = require('../models/answerModel');
const Question = require('../models/questionModel');
const Badge = require('../models/badgeModel');
require('dotenv').config();

// Test the answer badge system
const testAnswerBadges = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test user
    const testUser = new User({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    });
    await testUser.save();
    console.log('Created test user:', testUser.username);

    // Create a test question
    const testQuestion = new Question({
      title: 'Test Question',
      content: 'This is a test question',
      anonymousUsername: 'AnonymousUser1'
    });
    await testQuestion.save();
    console.log('Created test question');

    // Test 1: First Answer Badge
    console.log('\n=== Test 1: First Answer ===');
    const firstAnswer = new Answer({
      questionId: testQuestion._id,
      userId: testUser._id,
      content: 'This is my first answer',
      anonymousUsername: 'AnonymousUser1'
    });
    await firstAnswer.save();
    
    const result1 = await awardAnswerBadges(testUser._id, 'answer_question');
    console.log('First answer result:', {
      xpGained: result1.xpGained,
      badgesAwarded: result1.badgesAwarded.length,
      newLevel: result1.newLevel,
      totalXP: result1.totalXP
    });

    // Test 2: Multiple Answers
    console.log('\n=== Test 2: Multiple Answers ===');
    for (let i = 2; i <= 6; i++) {
      const answer = new Answer({
        questionId: testQuestion._id,
        userId: testUser._id,
        content: `This is answer number ${i}`,
        anonymousUsername: 'AnonymousUser1'
      });
      await answer.save();
      
      const result = await awardAnswerBadges(testUser._id, 'answer_question');
      console.log(`Answer ${i}:`, {
        xpGained: result.xpGained,
        badgesAwarded: result.badgesAwarded.length,
        newLevel: result.newLevel
      });
    }

    // Test 3: Accepted Answer
    console.log('\n=== Test 3: Accepted Answer ===');
    firstAnswer.isAccepted = true;
    await firstAnswer.save();
    
    const acceptedResult = await awardAnswerBadges(testUser._id, 'accepted_answer');
    console.log('Accepted answer result:', {
      xpGained: acceptedResult.xpGained,
      badgesAwarded: acceptedResult.badgesAwarded.length,
      newLevel: acceptedResult.newLevel
    });

    // Check final user state
    const finalUser = await User.findById(testUser._id);
    console.log('\n=== Final User State ===');
    console.log('Total XP:', finalUser.gamification.totalXP);
    console.log('Level:', finalUser.gamification.level);
    console.log('Badges:', finalUser.gamification.badges);

    // Check all badges in database
    const allBadges = await Badge.find({ category: 'social' });
    console.log('\n=== Available Social Badges ===');
    allBadges.forEach(badge => {
      console.log(`- ${badge.name}: ${badge.description} (${badge.rarity})`);
    });

    // Cleanup
    await User.findByIdAndDelete(testUser._id);
    await Question.findByIdAndDelete(testQuestion._id);
    await Answer.deleteMany({ userId: testUser._id });
    console.log('\nTest completed and cleaned up!');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the test
if (require.main === module) {
  testAnswerBadges();
}

module.exports = { testAnswerBadges };
