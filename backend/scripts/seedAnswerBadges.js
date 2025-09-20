const mongoose = require('mongoose');
const Badge = require('../models/badgeModel');
require('dotenv').config();

// Answer-related badges
const answerBadges = [
  {
    name: 'First Answer',
    description: 'Posted your first answer to help someone',
    icon: '🎯',
    category: 'social',
    criteria: { firstAnswer: true },
    rarity: 'common',
    xpBonus: 25,
    isActive: true
  },
  {
    name: 'Helpful Helper',
    description: 'Posted 5 helpful answers',
    icon: '🤝',
    category: 'social',
    criteria: { totalAnswers: 5 },
    rarity: 'common',
    xpBonus: 50,
    isActive: true
  },
  {
    name: 'Answer Expert',
    description: 'Posted 25 answers',
    icon: '🧠',
    category: 'social',
    criteria: { totalAnswers: 25 },
    rarity: 'rare',
    xpBonus: 100,
    isActive: true
  },
  {
    name: 'Answer Master',
    description: 'Posted 100 answers',
    icon: '👑',
    category: 'social',
    criteria: { totalAnswers: 100 },
    rarity: 'epic',
    xpBonus: 250,
    isActive: true
  },
  {
    name: 'Accepted Solution',
    description: 'Had your answer accepted as the solution',
    icon: '✅',
    category: 'social',
    criteria: { acceptedAnswers: 1 },
    rarity: 'rare',
    xpBonus: 100,
    isActive: true
  },
  {
    name: 'Trusted Expert',
    description: 'Had 5 answers accepted as solutions',
    icon: '🏆',
    category: 'social',
    criteria: { acceptedAnswers: 5 },
    rarity: 'epic',
    xpBonus: 200,
    isActive: true
  },
  {
    name: 'Community Champion',
    description: 'Had 25 answers accepted as solutions',
    icon: '🥇',
    category: 'social',
    criteria: { acceptedAnswers: 25 },
    rarity: 'legendary',
    xpBonus: 500,
    isActive: true
  },
  {
    name: 'Helpful Community Member',
    description: 'Posted 3 helpful answers (5+ upvotes each)',
    icon: '⭐',
    category: 'social',
    criteria: { helpfulAnswers: 3 },
    rarity: 'rare',
    xpBonus: 75,
    isActive: true
  },
  {
    name: 'Answer Enthusiast',
    description: 'Posted 5 answers in one day',
    icon: '⚡',
    category: 'social',
    criteria: { answersInOneDay: 5 },
    rarity: 'rare',
    xpBonus: 100,
    isActive: true
  },
  {
    name: 'Daily Helper',
    description: 'Posted 3 answers in one day',
    icon: '📝',
    category: 'social',
    criteria: { answersInOneDay: 3 },
    rarity: 'common',
    xpBonus: 50,
    isActive: true
  }
];

const seedAnswerBadges = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustwise');
    console.log('Connected to MongoDB');

    // Clear existing answer-related badges
    await Badge.deleteMany({ category: 'social' });
    console.log('Cleared existing social badges');

    // Insert new answer badges
    const createdBadges = await Badge.insertMany(answerBadges);
    console.log(`Created ${createdBadges.length} answer-related badges:`);
    
    createdBadges.forEach(badge => {
      console.log(`- ${badge.name} (${badge.rarity}) - ${badge.description}`);
    });

    console.log('\nAnswer badge seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding answer badges:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeding function
if (require.main === module) {
  seedAnswerBadges();
}

module.exports = { seedAnswerBadges, answerBadges };
